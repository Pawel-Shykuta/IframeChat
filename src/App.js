import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const iframeRef = useRef(null)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const chatRef = useRef(null)

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current.contentWindow) return
      setChat(prev => [...prev, { sender: 'Iframe', text: event.data }])
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const sendMessage = () => {
    if (iframeRef.current && message.trim() !== '') {
      iframeRef.current.contentWindow.postMessage(message, '*')
      setChat(prev => [...prev, { sender: 'Parent', text: message }])
      setMessage('')
    }
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chat])

  return (
    <div className="parent-container">
      <h2>Parent</h2>

      <div className="chat-box" ref={chatRef}>
        {chat.map((el, index) => (
          <div
            key={index}
            className={`chat-message ${el.sender === "Parent" ? "parent-msg" : "iframe-msg"}`}
          >
            <strong>{el.sender}:</strong> {el.text}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type a message..." 
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <iframe
        title="Iframe"
        ref={iframeRef}
        srcDoc={`
          <html>
            <body>
              <h2>Iframe chat</h2>
                <div id="chat" style="border:1px solid #aaa; height:150px; overflow:auto; padding:5px; margin-bottom:10px;"></div>
                <input id="msg" type="text" placeholder="Write from iframe..." style="width:70%;"/>
                <button id="sendBtn">Send</button>

              <script>
                const chatBox = document.getElementById('chat')
                const input = document.getElementById('msg')
                const btn = document.getElementById('sendBtn')

                window.addEventListener('message', (event) =>{
                  const msg = document.createElement('div')  
                  msg.style.textAlign = "left";
                  msg.style.background = "#d1ffd1";
                  msg.style.margin = "2px";
                  msg.style.padding = "4px";
                  msg.style.borderRadius = "5px";
                  msg.innerHTML = "<b>Parent:</b> " + event.data;
                  chatBox.appendChild(msg);
                  chatBox.scrollTop = chatBox.scrollHeight;
                })

                btn.onclick = () =>{
                  if(input.value.trim() !== ''){
                    window.parent.postMessage(input.value,'*')
                    const msg = document.createElement('div')
                    msg.style.textAlign = "right";
                    msg.style.background = "#d1d1ff";
                    msg.style.margin = "2px";
                    msg.style.padding = "4px";
                    msg.style.borderRadius = "5px";
                    msg.innerHTML = "<b>Iframe:</b> " + input.value;
                    chatBox.appendChild(msg)
                    chatBox.scrollTop = chatBox.scrollHeight;
                    input.value = "";
                  }  
                }

                
              </script>
            </body>
          </html>
        `}
      />
    </div>
  )
}

export default App;
