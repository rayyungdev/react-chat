import React, { Component} from 'react';
import './App.css';
import './static/css/chat_interface.css';

var ID = function(){
  return '_' + Math.random().toString(36).substr(2, 9);
};

const html = React.createElement;
const textToHtml = (input) => {
  const text = input.replace('&#x27;', '\'');
  if (text && (text.indexOf('\n') !== -1 || text.indexOf('\\n') !== -1)) {
    return (
      html('div', {}, text.split(/\n|\\n/).map((paragraph, i) => {
        return (
          html('p', { key: i }, formatParagraph(paragraph)));
      })));
  } else {
    return (
      html('p', {}, formatParagraph(text)));
  }
};


const matchElement = (input, element, regex) => {
  const match = regex.exec(input);
  if (match) match['element'] = element;
  return match;
};

const matchAll = (input) => {
  const bold = matchElement(input, 'b', /\*\*([ a-z0-9!?.,*'`_]+)\*\*/gmi);
  const talic = matchElement(input, 'i', /\*([ a-z0-9!?.,'`_]+)\*/gmi);
  const underLine = matchElement(input, 'u', /_\*([ a-z0-9!?.,*'`_]+)\*_/gmi);
  const code = matchElement(input, 'code', /`([ a-z0-9!?.,*'_]+)`/gmi);  
  return [bold, talic, underLine, code].filter(e => { return e != null; });
};

const formatParagraph = (unformatted, formatted) => {
  const matches = matchAll(unformatted);
  if (matches.length > 0) {
    const targetMatch = matches.sort((a, b) => { return a['index'] - b['index']; })[0];
    const remaining = unformatted.substring(targetMatch['index'] + targetMatch[0].length, unformatted.length);
    const newElement = html(targetMatch['element'], { key: targetMatch.index }, formatParagraph(targetMatch[1]));
    const processed = [formatted, [unformatted.substring(0, targetMatch.index), newElement]];
    return formatParagraph(remaining, processed);
  } else {
    return formatted ? [formatted, unformatted] : unformatted;
  }
};

class SendButton extends Component{
    render(){
      return (<div className="send_message" onClick={this.props.handleClick}>
                <div className="text">send</div>
              </div>);
    }
}

class MessageTextBoxContainer extends Component{
  
  render(){
    return(
      <div className="message_input_wrapper">
        <input id="msg_input" className="message_input" placeholder="Type your messages here..." value={this.props.message} onChange={this.props.onChange} onKeyPress={this.props._handleKeyPress}/>
      </div>
    );
  }
}

class Avartar extends Component {
  render(){
    return(
      <div className="avatar"/>
    );
  }
}

// class BotMessageBox extends Component{
//   // constructor(props) {
//   //   super(props);
//   // }
//   render(){
//     return(
//       <li className="message left appeared">
//         <Avartar></Avartar>
//         <div className="text_wrapper">
//             <div className="text">{this.props.message}</div>
//         </div>
//       </li>
//     );
//   }
// }

class UserMessageBox extends Component{
  // constructor(props) {
  //   super(props);

  // }
  render(){
    const converted_text = textToHtml(this.props.message);

    return(
      <li className={`message ${this.props.appearance} appeared`}>
        <Avartar></Avartar>
        <div className="text_wrapper">
            <div className="text">{converted_text}</div>
        </div>
      </li>
    );
  }
}

class MessagesContainer extends Component{
  constructor(props) {
    super(props);
    this.createBotMessages = this.createBotMessages.bind(this);
  }

  scrollToBottom = () => {
    var el = this.refs.scroll;
    el.scrollTop = el.scrollHeight;
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  createBotMessages(){
    // let messages = this.props.messages;
    // let session = this.props.sessionID;

    // if (this.props.messages.length === 0 )
    // {
    //   fetch("/api/greeting",{
    //     crossDomain:true,
    //     method : "post",
    //     headers: { 
    //       'Content-Type': 'application/json'
    //     },
    //     body : JSON.stringify({
    //       "sessionID": session,
    //     })
    //   })
    //   .then(res => res.json())
    //   .then(
    //     (result) => {
    //       // console.log(result)
    //       this.setState({
    //         messages: [...messages, {"message":result["message"], "isbotmessage":true}]
    //       });
    //     },
    //     (error) => {
    //       //do nothing for now
    //     }
    //   );
    // }
    return this.props.messages.map((message, index) =>
       <UserMessageBox key={index} message={message["message"]} appearance={message["isbotmessage"] ? "left": "right"}/>
    );
  }

  render(){

    return(
      <ul className="messages" ref="scroll">
        {this.createBotMessages()}
      </ul>
    );
  }
}


class ChatApp extends Component {
  constructor(props){
    super(props);
    this.state = {"sessionID": ID(), "messages": [], "current_message":"", "ID" : this.props.domElement.getAttribute('userid'), "NAME": ""}
    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
  }
  
  addFirstMessage(){
    let messages = this.state.messages;
    let session = this.state.sessionID;
    
    if(messages.length===0){
      fetch("/api/greeting",{
      // fetch("http://34.148.112.183:8080/api/greeting",{
        crossDomain:true,
        method : "post",
        headers: { 
          'Content-Type': 'application/json'
        },
        body : JSON.stringify({
          "sessionID": session,
          "userID" : this.state.ID
        })
      })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log(result)
          this.setState({
            messages: [...messages, {"message":result["message"], "isbotmessage":true}],
            NAME: result["NAME"]
          });
        },
        (error) => {
          //do nothing for now
        }
      );}
  }

  addMessageBox(enter=true){
    let messages = this.state.messages;
    let current_message = this.state.current_message;
    let session = this.state.sessionID;
    let userid = this.state.ID;
    // console.log(this.state);

    if(current_message && enter){
      messages = [...messages, {"message":current_message}];
      fetch("/api/response",{
      // fetch("http://34.148.112.183:8080/api/response",{
        crossDomain:true,
        method : "post",
        headers: { 
          'Content-Type': 'application/json'
        },
        body : JSON.stringify({
          "sessionID": session,
          "message": current_message,
          "userID": userid, 
        })
      })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            messages: [...messages, {"message":result["message"], "isbotmessage":true}]
          });
        },
        (error) => {
          //do nothing for now
        }
      );
      current_message = ""
    }  
    this.setState({
      current_message: current_message,
      messages
    });

  }
  componentDidMount(){
    this.addFirstMessage();
  }
  handleClick(){
    this.addMessageBox();
  }

  onChange(e) {
    this.setState({
      current_message: e.target.value
    }); 
  }

    _handleKeyPress(e) {
    let enter_pressed = false;
    if(e.key === "Enter"){
      enter_pressed = true;
    }
    this.addMessageBox(enter_pressed)
  }

  render() {
    return (
      <div className="chat_window">
        <h2> {this.state.NAME} </h2>
        <MessagesContainer messages={this.state.messages}></MessagesContainer>
        <div className="bottom_wrapper clearfix">
          <MessageTextBoxContainer 
            _handleKeyPress={this._handleKeyPress} 
            onChange={this.onChange} 
            message={this.state.current_message}></MessageTextBoxContainer>
          <SendButton handleClick={this.handleClick}></SendButton>
        </div>
      </div>
    );
  }
}

export default ChatApp;
