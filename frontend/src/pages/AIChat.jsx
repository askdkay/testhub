import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import MessageInput from '../components/Chat/MessageInput';
import TypingIndicator from '../components/Chat/TypingIndicator';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  FiUser, FiCpu, FiBookOpen, FiClock,
  FiRefreshCw, FiTrash2, FiDownload,
  FiThumbsUp, FiThumbsDown, FiCopy,
  FiCheck, FiInfo, FiAlertCircle
} from 'react-icons/fi';

// Background Image
const BG_IMAGE = "";

function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Suggested questions
  const suggestedQuestions = [
    "SSC CGL exam pattern 2025",
    "UPSC syllabus for prelims",
    "How to prepare for IBPS PO?",
    "Important topics for Rajasthan CET",
    "Difference between Articles 32 and 226",
    "Solve: x² + 5x + 6 = 0",
    "Current affairs for banking exams",
    "Best books for reasoning"
  ];

  useEffect(() => {
    // Load chat history if logged in
    if (user) {
      loadHistory();
    } else {
      // Welcome message for guests
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "👋 **Welcome to Exam Guru AI!**\n\nI'm here to help you with all your exam preparation needs. Ask me about:\n\n• Exam patterns & syllabus\n• Subject explanations\n• Practice questions\n• Study tips\n• Current affairs\n\nWhat would you like to learn today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const res = await API.get('/ai/history');
      if (res.data.history.length > 0) {
        setMessages(res.data.history);
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "👋 **Welcome back!** Ready to continue your exam preparation?",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const endpoint = user ? '/ai/chat/auth' : '/ai/chat';
      const res = await API.post(endpoint, { message });

      if (res.data.success) {
        // Add AI response
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: res.data.message,
          timestamp: res.data.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(res.data.error);
        if (res.data.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error.response?.data?.error || 'Failed to get response');
      if (error.response?.data?.suggestions) {
        setSuggestions(error.response.data.suggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Clear conversation history?')) {
      try {
        await API.post('/ai/clear');
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "👋 **Chat cleared!** How can I help you with your exam preparation?",
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const handleCopyMessage = (id, content) => {
    navigator.clipboard.writeText(content.replace(/[#*`]/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = async (messageId, rating) => {
    // Implement feedback API
    console.log('Feedback:', { messageId, rating });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black/95 via-deep-black/90 to-deep-black/95 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10" />

      <Navbar />

      {/* Main Chat Container */}
      <div className="relative pt-20 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-glass-bg border-b border-glass-border px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FiCpu className="text-white text-xl" />
            </div>
            <div>
              <h2 className="font-semibold">Exam Guru AI</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FiBookOpen size={12} />
                Education Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              title="Clear chat"
            >
              <FiTrash2 size={18} className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              title="Download chat"
            >
              <FiDownload size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-orange-500/20' 
                      : 'bg-gradient-to-r from-orange-500 to-pink-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <FiUser size={16} className="text-orange-400" />
                    ) : (
                      <FiCpu size={16} className="text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30'
                        : 'bg-glass-bg border border-glass-border'
                    }`}>
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="text-gray-200 mb-2 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg my-2"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-black/30 px-1 py-0.5 rounded text-orange-400" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-orange-500 pl-4 italic my-2" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Message Footer */}
                    <div className="flex items-center gap-2 mt-1 px-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                      
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-all"
                          >
                            {copiedId === msg.id ? (
                              <FiCheck size={12} className="text-green-400" />
                            ) : (
                              <FiCopy size={12} />
                            )}
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 1)}
                            className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-green-400 transition-all"
                          >
                            <FiThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, -1)}
                            className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-red-400 transition-all"
                          >
                            <FiThumbsDown size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FiCpu size={16} className="text-white" />
                  </div>
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 max-w-md">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-red-400 mt-1" />
                    <div>
                      <p className="text-red-400 font-medium mb-1">Sorry, I can't answer that</p>
                      <p className="text-sm text-gray-300">{error}</p>
                      {suggestions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-2">Try asking about:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(suggestion)}
                                className="px-3 py-1 bg-white/5 rounded-full text-xs hover:bg-white/10 transition-all"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-glass-bg border-t border-glass-border p-4">
          <div className="max-w-4xl mx-auto">
            <MessageInput
              onSend={handleSendMessage}
              disabled={loading}
              placeholder={user ? "Ask me about exams..." : "Login for more conversations..."}
            />

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="px-3 py-1.5 bg-white/5 border border-glass-border rounded-lg text-xs hover:bg-white/10 hover:border-orange-500/50 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;