import React, { Component } from 'react';
import './Chatbox.css'
import socketio from 'socket.io-client'

class Chatbox extends Component {
    // chatting_height = "50%" // 채팅방 크기 (전체 html 태그 기준 * 70% * 현재 퍼센트가 채팅방 높이가 됨)
    // this.state.chattings = document.getElementsByClassName("chatting")[0]
    // prev_time = [0,0,0,0,0,0,0]
    state = {}

    
    _check= (d)=>{ // check 함수는 도배 방지용으로 0.2초 안에 보낸 메시지가 있으면 자동으로 block 시킴 -> Mac 키보드 오류도 방지함
        let time = [d.getYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(),d.getMilliseconds()]
        const interval = 200
        for(let i = 0; i < 6 ; i++){
          if(time[i]>this.state.prevtime[i]){
            this.setState({
                prevtime : time
            })
            return true
          }
        }
        if(time[6]>this.state.prevtime[6]+interval){
          this.setState({
            prevtime : time
          })
          return true
        }
        console.log("blocked")
        return false
    }

    _send_click = ()=>{ // click 버튼 들어오면 chat message 로 socket에 메시지 보냄
        let d = new Date();
        if(this._check(d)){ // 도배 방지 체크
            const message = document.getElementById("message").value

            this.state.socket.emit('chat message',message)
            const li = document.createElement('li')
            li.className = "mine"
            li.innerText = "Me: " + message
            document.getElementById("message").value = ""
            this.state.chattings.appendChild(li)
            this.state.chattings.scrollTop = this.state.chattings.scrollHeight // 채팅 스크롤 맨 아래로 유지
        
          
        }
    }

    _send_enter = (event) => { // enter 버튼 들어오면 chat message 로 socket에 메시지 보냄
        if (event.keyCode === 13) {
          let d = new Date();

          if(this._check(d)){ // 도배 방지 체크 
            event.preventDefault();
            const message = document.getElementById("message").value
            this.state.socket.emit('chat message',message)
            const li = document.createElement('li')
            li.className = "mine"
            li.innerText = "Me: " + message
            document.getElementById("message").value = ""
            this.state.chattings.appendChild(li)

            this.state.chattings.scrollTop = this.state.chattings.scrollHeight // 채팅 스크롤 맨 아래로 유지
            
          }
        }
    };

    _preprocess = ()=>{
        const chatting_height = "50%" // 채팅방 크기 (전체 html 태그 기준 * 70% * 현재 퍼센트가 채팅방 높이가 됨)
        const chattingbox = document.getElementsByClassName("chatting")[0]
        const socket_client = socketio.connect("aria.sparcs.org:32888")
        let prev_time = [0,0,0,0,0,0,0]
        chattingbox.style.height = chatting_height

        this.setState({
            socket : socket_client,
            chattings : chattingbox,
            prevtime : prev_time
        })
        document.getElementById("message").addEventListener("keyup", this._send_enter)
        document.getElementById("send").addEventListener("click", this._send_click)
        socket_client.on('members',function(accessor){ // 변경된 members 정보를 socket 으로부터 받아서 div.members에 넣어줌
            console.log(accessor)
    
            if(document.getElementsByClassName("members")[0].childElementCount !== 0){
              console.log("일단")
              document.getElementsByClassName("members")[0].innerHTML = ""
            }
            for (let i=0 ; i<accessor.length; i++){
              console.log("count")
              const li = document.createElement('li')
              li.innerText = accessor[i]
              document.getElementsByClassName("members")[0].appendChild(li)
            }
        })

        socket_client.on('chat message',function(user, message){ // chat message를 socket 으로부터 받아서 ul.chatting 에 li child 로 넣어줌
            const li = document.createElement('li')
            li.innerText = user + ": " + message
            li.className = "recieved"
            chattingbox.appendChild(li)
            
            chattingbox.scrollTop = chattingbox.scrollHeight // 채팅 스크롤 맨 아래로 유지
        
        })
        
        socket_client.on('enter',function(username){ // 새로운 유저가 들어왔다는 것을 socket으로부터 받아서 ul.chatting 에 보어줌

            const li = document.createElement('li')
            li.className = "enter"
            li.innerText = username + " is entered"
            console.log("user add")
            chattingbox.appendChild(li)
            
            chattingbox.scrollTop = chattingbox.scrollHeight // 채팅 스크롤 맨 아래로 유지
        
        })

        socket_client.on('out',function(username){ // 유저가 나갔다는 것을 socket으로부터 받아서 ul.chatting 에 보어줌

            const li = document.createElement('li')
            li.className = "enter"
            li.innerText = username + " left the room"
            console.log("user left")
            chattingbox.appendChild(li)
            
            chattingbox.scrollTop = chattingbox.scrollHeight // 채팅 스크롤 맨 아래로 유지
        
        })

        socket_client.on('name',function(name){ // 로그인이 없는 상태이므로 접속하면 랜덤 유저이름을 socket에서 보내주고 그걸 받아서 보여줌
            document.getElementById("username").innerText = "Your name is " + name
        })
    }





    
    componentDidMount(){
        this._preprocess()
    }

    render() {
        return (
            <div className="content">
            <div className="aside">
                <ul className="members">
                </ul>
            </div>
            <div className="display">
                <ul className="chatting"></ul>
                <input type="text" id="message"/>
                <button id="send">Send</button>
                <button id="below">아래로</button>
            </div>
            </div>
        )
        
    }
}

export default Chatbox