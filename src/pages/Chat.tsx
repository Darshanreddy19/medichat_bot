import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, ArrowLeft, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  "What are common symptoms of diabetes?",
  "How to manage high blood pressure?",
  "Tell me about asthma treatments",
  "What medications for COPD?",
  "Prevention tips for heart disease",
  "Tests needed for thyroid problems",
];

const followUpPrompts = [
  "What medications are used?",
  "What tests should I get?",
  "How can I prevent this?",
  "What are the warning signs?",
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 **Hey there, health explorer!**\n\nWelcome to **MediChat AI** — your personal health detective! 🔍\n\nWhether you're worried about symptoms, curious about medications, or want to know what's going on with your body, I'm here to help! Here's what I can do:\n\n✅ **Identify** what health condition you might be facing\n💊 **Suggest** exact medications with proper dosages\n🌿 **Share** natural remedies that complement treatment\n🧪 **Recommend** tests you might need\n🛡️ **Guide** you on prevention strategies\n\n**Just describe your symptoms or ask about any health condition!**\n\nRemember: I'm a helper, not a doctor. Always consult a healthcare pro! 👨‍⚕️",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [availableDiseases, setAvailableDiseases] = useState<Array<{key: string, title: string}>>([]);
  const [showDiseaseList, setShowDiseaseList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Fetch available diseases on mount
    fetch('/api/diseases')
      .then(res => res.json())
      .then(data => {
        if (data.diseases) {
          setAvailableDiseases(data.diseases);
        }
      })
      .catch(err => console.error('Failed to load diseases', err));
  }, []);

  // send query to backend and append response
  const sendQueryToServer = async (query: string) => {
    setIsTyping(true);
    setShowFollowUps(false);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
      // Show follow-up prompts after disease-specific responses
      if (data.response && data.response.includes('##')) {
        setTimeout(() => setShowFollowUps(true), 500);
      }
    } catch (err) {
      console.error('chat request failed', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I am having trouble reaching the server.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = input;
    setInput("");
    setShowDiseaseList(false);
    sendQueryToServer(query);
  };

  const handleQuickPrompt = (prompt: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setShowDiseaseList(false);
    sendQueryToServer(prompt);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-lg font-bold text-primary mt-3 mb-1">
            {line.slice(3)}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3 key={i} className="text-base font-semibold text-primary/80 mt-2 mb-1">
            {line.slice(4)}
          </h3>
        );
      if (line.startsWith("- ")) {
        const text = line.slice(2);
        return (
          <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
            {renderInline(text)}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">
            {renderInline(line.replace(/^\d+\.\s*/, ""))}
          </li>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      );
    });
  };

  const renderInline = (text: string) => {
    // Handle **bold**, *italic*, and ⚠️
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      if (part.startsWith("*") && part.endsWith("*"))
        return (
          <em key={i} className="text-muted-foreground italic">
            {part.slice(1, -1)}
          </em>
        );
      return part;
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm">MediChat AI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 bg-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass-card rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose-medical">{renderContent(msg.content)}</div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 bg-secondary">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Quick questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <motion.button
                key={prompt}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickPrompt(prompt)}
                className="glass-card px-3 py-2 text-xs text-foreground/80 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
          <div className="mt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDiseaseList(!showDiseaseList)}
              className="glass-card px-3 py-2 text-xs text-primary font-medium hover:border-primary/50 transition-colors cursor-pointer"
            >
              {showDiseaseList ? "Hide" : "Browse"} All Conditions ({availableDiseases.length})
            </motion.button>
          </div>
        </div>
      )}

      {/* Disease Browser */}
      {showDiseaseList && messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-3 max-w-4xl mx-auto w-full"
        >
          <div className="glass-card p-4 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDiseases.map((disease) => (
                <motion.button
                  key={disease.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickPrompt(`Tell me about ${disease.title}`)}
                  className="text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-primary/10 hover:border-primary/30 border border-transparent text-xs transition-all"
                >
                  {disease.title}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Follow-up Prompts */}
      {showFollowUps && messages.length > 1 && !isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="px-4 pb-2 max-w-4xl mx-auto w-full"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Follow-up questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {followUpPrompts.map((prompt) => (
              <motion.button
                key={prompt}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickPrompt(prompt)}
                className="glass-card px-3 py-1.5 text-xs text-foreground/80 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 px-4 py-4 glass-card rounded-none border-x-0 border-b-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Tell me your symptoms or ask me anything about your health... 🏥"
            className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground disabled:opacity-50 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          💡 I identify conditions, suggest medications with dosages & natural remedies. 🔒 Your privacy matters. Always confirm with a real doctor! 👨‍⚕️
        </p>
      </div>
    </div>
  );
};

export default Chat;
