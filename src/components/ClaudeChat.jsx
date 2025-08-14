import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import './ClaudeChat.css'

function ClaudeChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I can help you analyze your lead data, suggest targeting strategies, or answer questions about your markets. What would you like to know?'
    }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input
    }

    setMessages([...messages, newMessage])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'I understand your question. Let me analyze your lead data and provide insights...'
      }
      setMessages(prev => [...prev, response])
    }, 1000)
  }

  return (
    <div className="claude-chat">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-icon">
                {message.type === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask Claude about your leads..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="input"
          />
          <button className="btn btn-primary" onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClaudeChat