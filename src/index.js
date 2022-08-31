import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ChatApp from './App';
import * as serviceWorker from './serviceWorker';



const WidgetDivs = document.querySelectorAll('.chat_widget')

WidgetDivs.forEach(Div => {
    ReactDOM.render(
      <React.StrictMode>
        <ChatApp domElement = {Div}/>
      </React.StrictMode>,
      Div
    );
  })
// ReactDOM.render(
//     <React.StrictMode>
//         <ChatApp />
//     </React.StrictMode>,
//     document.getElementById('root')
//     );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
