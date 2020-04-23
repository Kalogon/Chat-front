import React, { Component } from 'react';
import './App.css';
import Chatbox from "./components/Chatbox"

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Chatting room</h1>
          <h2 id="username"></h2>
        </div>
        <Chatbox></Chatbox>
      </div>
    );
  }
}

export default App;
