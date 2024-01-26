import './App.css';
import React from 'react';
import socket from './socket';

class NavContent extends React.Component {
  state = {
    position: "relative",
    margin: "20px",
  }

  render() {
    return (
      <div style={this.state}>
        {this.props.content}
      </div>
    );
  }
};

class NavHeader extends React.Component {
  state = {
    display: "inline-flex",
    position: "relative",
    top: "0",
    margin: 0,
    width: "100%",
    color: "white",
    backgroundColor: "black",
    boxShadow: "0px 6px 20px grey"
  };

  render() {

    // this.setState(this.props.style);

    return (
      <nav style={this.state}>
        {this.props.children}
      </nav>
    );
  }
};

class InputComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      styles1: {
        position: 'absolute',
        margin: "4px",
        padding: "10px",
        left: '10px',
        width: '60px',
        borderRadius: "20px",
        zIndex: '2'
      },
      styles2: {
        position: 'relative',
        margin: "2%",
        padding: "4%",
        width: '100%',
        borderRadius: "20px",
        zIndex: '1'
      },
      styles3: {
        position: 'absolute',
        margin: "4px",
        padding: "10px",
        right: '10px',
        width: '60px',
        borderRadius: "20px",
        zIndex: '2'
      },
      input_div: {
        display: "inline-flex",
        position: "relative",
        alignItems: 'center',
        alignSelf: 'center',
        width: "98%",
        height: "13%",
        border: "2px solid grey",
        borderRadius: "23px",
        backgroundColor: "black"
      },
      value: null,
    };

    this.handleChange = (e) => {
      let txtValue = e.target.value.toString();
      this.setState({ value: txtValue });

      props.typingCallback();

      e.preventDefault();
    };

    this.sendMsg = () => {
      let msg = this.state.value;
      if (msg != null) {
        props.callback(msg, true);
        console.log(msg);
        document.getElementById('txtInput').value = "";
      }
    };
  }

  render() {
    return (

      <div style={this.state.input_div}>
        <input type="button" value="Start" style={this.state.styles1} className="btnStartStop" onClick={this.props.connectionCallback} />

        <input id='txtInput' className='msgInput' type="text" placeholder="Write your message here" style={this.state.styles2} onChange={(e) => this.handleChange(e)} required />

        <input type="button" value="Send" style={this.state.styles3} onClick={this.sendMsg} className="btnSend" />
      </div>
    );
  }
}

function MsgComponent(props) {

  var identity = "Stranger";
  var align = "self-start";
  var color = "black";
  var borderRadius = "15px 15px 15px 0";
  var msgColor = "black";

  if ((props.type.toString()) == "sent") {
    identity = "Me";
    align = "self-end";
    msgColor = "black"
    color = "rgb(25, 100, 255)";
    borderRadius = "15px 15px 0 15px"
  }

  return (
    <div className="txtBox" style={
      {
        display: 'flex',
        flexDirection: 'column',
        alignItems: align
      }
    }>
      <div id={props.id} className="msg" style={{
        borderRadius: borderRadius,
        backgroundColor: msgColor
      }}>
        <span>
          {props.value}
        </span>
      </div>
      <p style={{ color: color }}>{identity}</p>
    </div>
  );
}

class BodyArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      styles: {
        display: "inline-flex",
        flexDirection: "column-reverse",
        position: "fixed",
        width: "100%",
        height: "calc(10%)",
        minHeight: "100%",
      },
      msg_box: {
        display: "flex",
        flexDirection: "column-reverse",
        position: "relative",
        height: "calc(100%)",
        width: "100%",
        overflow: "scroll",
        borderRadius: "0 0 8px 8px",
        backgroundImage: "linear-gradient(to bottom right, white, grey, rgb(73, 73, 73), rgb(27, 27, 27))",
        backgroundSize: "100%",
        backgroundRepeat: "no-repeat",
        backgroundttachment: "fixed",
        zIndex: 10
      },
      msgList: [
        {
          type: 'sent',
          value: 'om namah shivay kem chho badha om ganpate namah'
        },
        {
          type: 'received',
          value: 'bro'
        }
      ],
      roomId: null,
      socketRequested: false
    }


    this.setMsg = (inputMsg, flag = false) => {
      let msgType = 'received';

      if (flag) {
        socket.emit('message-sent', inputMsg, this.state.roomId);
        msgType = 'sent';
      }

      let messages = this.state.msgList;
      messages.unshift({
        type: msgType,
        value: inputMsg
      });
      this.setState({ msgList: messages });
    }

    this.toggleTyping = () => {
      let messages = this.state.msgList;

      if (messages[0]['value'] != ". . .") {
        this.setMsg(". . .");

        setTimeout(() => {
          messages = messages.slice(1);
          this.setState({ msgList: messages });
        }, 1500);
      }
    }

    this.startConnection = () => {
      socket.emit('start-connection');
    }

    this.typingCallback = () => {
      socket.emit('typing-event', this.state.roomId);
    }

  }



  render() {

    const messages = this.state.msgList;
    return (

      <div style={this.state.styles} >
        <InputComponent width1="15%" width2="60%" width3="15%" callback={this.setMsg} typingCallback={this.typingCallback} connectionCallback={this.startConnection} />

        <div className="msg_box" style={this.state.msg_box}>

          {
            messages.map((msgs) => {
              let id = null;
              if(msgs.value == ". . ."){
                id = "typing"
              }
              return <MsgComponent type={msgs.type} value={msgs.value} id={id}/>
            })
          }

          <div className='status' style={{
            position: 'fixed',
            top: 'calc(30px + 30px)',
            alignSelf: 'center',
            padding: '6px',
            border: '2px solid',
            display: "none"
          }}></div>

        </div>


        <NavHeader>
          <NavContent content="Vibe Chat" />
        </NavHeader>
      </div>
    );
  }



  componentDidMount() {
    const status = document.getElementsByClassName('status');

    socket.on("connect", () => {
      // socket.emit('start-connection');
      socket.on("waiting-for-connection", conn => {
        console.log("waiting for a Stranger to connect.......");
        status[0].style.display = "initial";
        status[0].textContent = 'waiting for a connection';
      });

      socket.on("connection-successful", (id) => {
        console.log("connection done: ", id);
        this.setState({ roomId: id });
        status[0].style.display = "initial";
        status[0].textContent = 'Stranger Connected'

        socket.on('typing', () => {
          this.toggleTyping();
          console.log("typed");
        });

        socket.on("message-received", (message) => {
          this.setMsg(message);
          console.log(message);
        });

        socket.on("stranger-disconnected", () => {
          this.setState({ roomId: null });
          status[0].style.display = "initial";
          status[0].textContent = 'Disconnected'
        });
      });
    });

  }
}

function App() {
  return (
    <BodyArea />
  );
}

export default App;
