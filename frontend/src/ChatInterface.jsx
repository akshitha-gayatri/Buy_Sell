import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import axios from 'axios';
import './ChatInterface.css';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return null;
      }

      const response = await axios.post('http://localhost:4345/api/chat/start', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);

      await loadChatHistory(newSessionId);

      return newSessionId;
    } catch (error) {
      console.error('Error starting chat session:', error);
      setError(error.response?.data?.message || 'Failed to start chat session');
      return null;
    }
  };

  const loadChatHistory = async (sid) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4345/api/chat/history/${sid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError(error.response?.data?.message || 'Failed to load chat history');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await startNewSession();
      if (!currentSessionId) return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const updatedMessages = [...messages, { role: 'user', content: message.trim() }];
      setMessages(updatedMessages);

      const response = await axios.post('http://localhost:4345/api/chat/message', {
        sessionId: currentSessionId,
        message: message.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message
      }]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);

      if (error.response) {
        setError(error.response.data.message || 'Failed to send message');
      } else if (error.request) {
        setError('No response received from server. Please check your connection.');
      } else {
        setError('Error in sending message: ' + error.message);
      }

      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewSession();
  }, []);

  return (
    <div className="chat-container">
      <div className="chat-modal">
        <div className="chat-header">
          <h3 className="chat-header-title">Chatbot</h3>
          <button onClick={() => window.location.reload()} className="chat-header-close">
            <X size={20} />
          </button>
        </div>

        <div className="chat-messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}
            >
              <div
                className={`${
                  msg.role === 'user'
                    ? 'chat-message-user-bubble'
                    : 'chat-message-assistant-bubble'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-loading">
              <div className="chat-loading-bubble">
                Typing...
              </div>
            </div>
          )}
          {error && (
            <div className="chat-error">
              <div className="chat-error-bubble">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="chat-send-button"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
