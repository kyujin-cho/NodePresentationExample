import io from 'socket.io-client'
import React from 'react'

const socket = io.connect('http://localhost:1337')
class ChatApp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {messages: []}
    }
    componentDidMount() {
        socket.on('messages', messages => {
            this.setState({messages: messages})
            const list = document.getElementsByClassName("messageList")[0]
            list.scrollTop = list.scrollHeight
        })
        socket.on('newMessage', message => {
            console.log('got message:' + message.message)
            this.addMessage(message)
        })
        socket.emit('fetchMessages')
    }
    addMessage(message) { 
        this.setState({
            messages: this.state.messages.concat(message)
        })
    }
    render() {
        return (
            <div className="Comments">
                <MessageList messages={this.state.messages} />
                <SendMessage addMessage={this.addMessage.bind(this)}/>
            </div>
        )
    }
}

class MessageList extends React.Component {
    render() {
        let Messages = <div>Loading Messages...</div>
        if(this.props.messages) {
            Messages = this.props.messages.map((message, index) => {
                return <Message message={message} key={index} />
            })
        }
        return (
            <div className="messageList">
                {Messages}
            </div>
        )
    }
}

class Message extends React.Component {
    render() {
        const time = new Date(this.props.message.time)
        let timeString = ""
        if(time.getHours() <= 12)
            timeString = time.getHours() + ":" + time.getMinutes() + " AM"
        else
            timeString = time.getHours() - 12 + ":" + time.getMinutes() + " PM"
        
        return (
            <li className="mdl-list__item mdl-list__item--three-line">
                <span className="mdl-list__item-primary-content">
                    <i className="material-icons mdl-list__item-avatar">person</i>
                    <span>{this.props.message.name}</span>
                    <div className="mdl-grid">
                        <div className="mdl-cell mdl-cell--9-col">
                            <span className="mdl-list__item-text-body">{this.props.message.message}</span>
                        </div>
                        <div className="mdl-cell mdl-cell--3-col">
                            <span id="time-text">{timeString}</span>
                        </div>
                    </div>
                </span>
            </li>
        )
    }
}

class SendMessage extends React.Component {
    constructor(props) {
        super(props)
        this.addMessage = props.addMessage.bind(this)
    }
    async handleSubmit(e) {
        console.log('socket:' + socket.connected)
        e.preventDefault()
        const name = document.getElementsByName("name")[0]
        const message = document.getElementsByName("message")[0]
        if(!name.value || !message.value) {
            document.querySelector("#snackbar").MaterialSnackbar.showSnackbar({message: "이름 및 메세지를 입력해 주세요."})
            return;
        }
        const comment = {
            name : name.value, 
            message : message.value,
            time: new Date().getTime()
        }
        
        await socket.emit('message', comment)
        this.props.addMessage(comment)
        const list = document.getElementsByClassName("messageList")[0]
        list.scrollTop = list.scrollHeight
        message.value = ""
        message.focus()
    }

    render() {
        return (
            <form className="sendMessage">
                <div className="chat-card-wide mdl-card mdl-shadow--2dp">
                    <div className="mdl-card__title">
                        <input className="mdl-textfield__input" type="text" name="name" ref={ref => this.name = ref} placeholder="Name" required />
                    </div>
                    <div className="mdl-card__supporting-text">
                        <textarea className="mdl-textfield__input" name="message" name="message" ref={ref => this.message = ref} placeholder="Write message" required />
                    </div>
                    <div className="mdl-card__actions mdl-card--border">
                        <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onClick={this.handleSubmit.bind(this)}>
                            Send
                        </a>
                    </div>
                </div>
            </form>
        )
    }
}

export default ChatApp