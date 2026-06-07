import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, ArrowLeft, PanelRight, Plus, MessageSquare, X, Trash } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom"
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useAlert } from "../../context/AlertContext";
import Loader from "../loader/loader";
import { GlobalConfirmBox } from "../Global/GlobalConfirmBox";
import useDocumentTitle from "../../hooks/useDocumentTitle";

interface Message {
  role: string
  message_text: string
}

interface PolaritySnapshot {
  score: number;
  label: string;
}

const getWelcomeMessage = (name?: string): Message => ({
  role: "model",
  message_text: `Hello ${name || "there"}! I'm your AI mental health assistant. I'm here to listen and support you. How can I help you today?`
});

export function ChatInterface() {
  const { chat_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setAlert } = useAlert()
  const [loader, setLoader] = useState(false)
  const welcomeMessage = getWelcomeMessage(user?.name);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<{
    chat_id: number
    user_id: number
    created_at: string
  }[]>([])
  const [polarity, setPolarity] = useState<PolaritySnapshot | null>(null);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIndex = chats.findIndex((c) => c.chat_id === Number(chat_id));
  const displayId = chatIndex !== -1 ? chats.length - chatIndex : chat_id;

  useDocumentTitle(chat_id ? `Chat ${displayId} | AI Assistant | MindCare` : "AI Assistant | MindCare")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    text: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => { },
  })
  const closeConfirmDialog = () => setConfirmDialog(prev => ({ ...prev, open: false }));

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchPolarity = async () => {
      try {
        const res = await axios.get("/api/v1/mental_health/snapshot", { withCredentials: true });
        if (res.data?.data) {
          setPolarity(res.data.data);
        }
      } catch (error) {
        setPolarity(null);
      }
    };
    fetchPolarity();
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get("/api/v1/chats/all", { withCredentials: true })
        setChats(res.data?.data || [])
      } catch (error: any) {
        console.log(error.response?.data?.detail);
      }
    }
    fetchChatHistory()
  }, [chat_id])

  const handleCreateNewChat = async () => {
    try {
      setLoader(true)
      const [chatRes] = await Promise.all([
        axios.post("/api/v1/chats/", {}, { withCredentials: true }),
        axios.post("/api/v1/users/recent-activity/create", { activity_type: "Consulted with AI Assistant" }, { withCredentials: true })
      ])
      const chat_id = chatRes.data?.data.chat_id
      navigate(`/assistant/${chat_id}`)
    } catch (error: any) {
      console.log(error.response?.data?.detail);
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (chat_id) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`/api/v1/messages/${chat_id}/get`, { withCredentials: true })
          setMessages([welcomeMessage, ...(res.data?.data || [])])
        } catch (error: any) {
          setMessages([welcomeMessage])
        }
      }
      fetchMessages()
    } else {
      setMessages([welcomeMessage])
    }
  }, [chat_id])

  const handleDeleteChat = async (chat_id: number) => {
    try {
      setLoader(true)
      await axios.delete(`/api/v1/chats/${chat_id}/delete-by-id`, { withCredentials: true })
      setChats((prev) => prev.filter((c) => c.chat_id !== chat_id))
      if (Number(chat_id) === Number(chat_id)) {
        setMessages([welcomeMessage])
        navigate("/assistant")
      }
    } catch (error: any) {
      console.log(error.response?.data?.detail);
    } finally {
      setLoader(false)
    }
  }

  const handleSendChat = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      message_text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);


    const payload = {
      role: "user",
      message_text: input
    }

    try {
      let res
      if (!chat_id) {
        const [chatRes] = await Promise.all([
          axios.post("/api/v1/chats/", {}, { withCredentials: true }),
          axios.post("/api/v1/users/recent-activity/create", { activity_type: "Consulted with AI Assistant" }, { withCredentials: true })
        ])
        const chat_id = chatRes.data?.data.chat_id
        res = await axios.post(`/api/v1/messages/${chat_id}/message`, payload, { withCredentials: true })
        navigate(`/assistant/${chat_id}`)
      }
      else {
        res = await axios.post(`/api/v1/messages/${chat_id}/message`, payload, { withCredentials: true })
      }
      const aiMessage: Message = {
        role: res.data?.data.role,
        message_text: res.data?.data.message_text
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    } catch (error: any) {
      setAlert({ message: error.response.data?.detail || "An error occured", severity: "error" })
      setIsTyping(false)
    }

  };

  return (
    <motion.div
      animate={{ marginRight: isSideBarOpen ? "320px" : "0px" }}
      transition={{ duration: 0.3 }}
      className="h-screen background flex flex-col"
    >
      {loader && <Loader />}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card backdrop-blur-sm border-b border-border px-6 py-4 flex items-center gap-2 shadow-sm"
      >
        <button
          className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
          title="Dashboard"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-foreground">AI Assistant</h2>
            {polarity && (
              <p className="text-xs font-medium px-2 py-0.5 mt-1 rounded-full bg-primary/10 text-primary inline-block">
                Current Mood: {polarity.label} ({Math.round(polarity.score)}%)
              </p>
            )}
          </div>
        </div>
        <button
          className="ml-auto p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
          onClick={() => setIsSideBarOpen((prev) => !prev)}
        >
          <PanelRight className="w-6 h-6 text-primary" />
        </button>
      </motion.div>

      {/* SideBar */}

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isSideBarOpen ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 lg:inset-auto lg:right-0 lg:top-0 lg:h-full lg:w-80 bg-card border-l border-border shadow-xl flex flex-col"
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-border">
          <button
            className="pt-2 hover:scale-105 transition-transform cursor-pointer block lg:hidden"
            onClick={() => setIsSideBarOpen((prev) => !prev)}
          >
            <X className="w-6 h-6 text-primary" />
          </button>
          <motion.button
            className="mx-auto mt-20 mb-20 flex items-center gap-1 cursor-pointer text-primary hover:scale-105 transition-transform"
            onClick={() => handleCreateNewChat()}
          >
            <Plus className="p-1 w-8 h-8 bg-primary/10 rounded-xl" />
            <p className="text-lg"> New Chat </p>
          </motion.button>
        </div>

        {/* Chat History */}
        <div className="flex flex-col flex-1 overflow-y-auto p-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-2">
            Chat History
          </p>
          {chats.map((chat, index) => (
            <button
              key={chat.chat_id}
              onClick={() => navigate(`/assistant/${chat.chat_id}`)}
              className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors cursor-pointer text-left"
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground truncate flex-1 hover:scale-105 transition-transform">
                Chat {chats.length - index}
              </span>
              <Trash
                className="w-4 h-4 text-destructive opacity-0 group-hover:opacity-100 hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDialog({
                    open: true,
                    title: "Delete Chat",
                    text: "Are you sure you want to delete this chat?",
                    confirmText: "Delete",
                    cancelText: "Cancel",
                    onConfirm: () => {
                      closeConfirmDialog()
                      handleDeleteChat(chat.chat_id)
                    }
                  })
                }}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 flex flex-col">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "model" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-md px-5 py-3 rounded-2xl shadow-sm ${message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-card-foreground"
                    }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.message_text}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-card border border-border px-5 py-3 rounded-2xl shadow-sm">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card backdrop-blur-sm border-t border-border px-6 py-4"
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isTyping) {
                  handleSendChat();
                }
              }
            }}
            rows={1}
            placeholder={messages.length > 0 ? "Reply..." : "Share what's on your mind"}
            className="flex-1 px-5 py-3 bg-input-background rounded-2xl border border-border text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none overflow-y-auto"
          />
          <button
            onClick={() => handleSendChat()}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Confirm Dialog */}
      <GlobalConfirmBox
        open={confirmDialog.open}
        title={confirmDialog.title}
        text={confirmDialog.text}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </motion.div>
  );
}
