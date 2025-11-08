import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm LifeSaver AI, your emergency assistant. How can I help you today? You can describe any emergency situation, and I'll provide clear, step-by-step guidance.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response", {
        description: "Please try again"
      });
      const errorMessage = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Someone fainted",
    "I had an accident",
    "I'm lost",
    "Heart attack symptoms",
    "Severe bleeding",
    "Choking emergency",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="glass px-6 py-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            data-testid="back-button"
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg btn-transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LifeSaver AI</h1>
              <p className="text-xs text-gray-500">Emergency Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 chat-message ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl h-10 w-10 flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <div
                data-testid={`message-${message.role}-${index}`}
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "glass text-gray-900"
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="bg-blue-600 p-2 rounded-xl h-10 w-10 flex-shrink-0 flex items-center justify-center">
                  <span className="text-white font-semibold">You</span>
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl h-10 w-10 flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="glass rounded-2xl px-6 py-4">
                <Loader2 className="w-5 h-5 text-gray-600 spinner" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3 font-medium">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  data-testid={`quick-action-${index}`}
                  onClick={() => setInput(action)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 btn-transition"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="glass border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            data-testid="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your emergency situation..."
            className="flex-1 bg-white border border-gray-300 rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            data-testid="send-button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 btn-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 spinner" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;