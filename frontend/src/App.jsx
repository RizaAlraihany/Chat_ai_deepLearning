import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Send,
  User,
  Bot,
  Settings,
  LogOut,
  MessageSquare,
  BookOpen,
  FileText,
  Home,
  Menu,
  X,
  Clock,
  CheckCircle,
} from "lucide-react";

// --- KONFIGURASI KONEKSI KE LARAVEL ---
const API_BASE_URL = "http://localhost:8000/api";

// Setup axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Axios interceptor untuk handle error globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error);

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.reload();
    }

    return Promise.reject(error);
  },
);

// --- COMPONENTS ---

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const baseStyle =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    />
  </div>
);

// --- PAGES ---

// LANDING PAGE
const LandingPage = ({ onNavigate }) => (
  <div className="min-h-screen bg-white">
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Student Assistant
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onNavigate("login")}>
            Masuk
          </Button>
          <Button onClick={() => onNavigate("register")}>Daftar</Button>
        </div>
      </div>
    </nav>

    <main className="max-w-6xl mx-auto px-6">
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Platform Pembelajaran
          <br />
          <span className="text-blue-600">Berbasis AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Asisten virtual untuk membantu mahasiswa dalam proses pembelajaran,
          diskusi materi, dan penyelesaian tugas.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => onNavigate("register")}
            className="text-lg px-8 py-3"
          >
            Mulai Sekarang
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pb-20">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bantuan Materi
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Dapatkan penjelasan materi kuliah dengan bahasa yang mudah dipahami
            dan contoh aplikatif.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Diskusi Tugas
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Konsultasikan tugas dan project dengan asisten AI yang tersedia 24/7
            untuk membantumu.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belajar Efektif
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Platform yang dirancang untuk meningkatkan efektivitas belajar
            dengan metode interaktif.
          </p>
        </div>
      </div>
    </main>

    <footer className="border-t border-gray-200 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
        © 2026 Student Assistant. Platform pembelajaran berbasis AI untuk
        mahasiswa.
      </div>
    </footer>
  </div>
);

// AUTH PAGES
const AuthPage = ({ type, onAuthSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = type === "login" ? "/login" : "/register";
      const payload =
        type === "login"
          ? { email: formData.email, password: formData.password }
          : formData;

      const response = await axios.post(endpoint, payload);
      const token = response.data.access_token;
      const user = response.data.user;

      if (!token || !user) {
        throw new Error("Invalid response format from server");
      }

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      onAuthSuccess(user);
    } catch (err) {
      let errorMessage = "Gagal terhubung ke server. ";

      if (err.response) {
        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          if (errors) {
            errorMessage = Object.values(errors).flat().join(" ");
          } else {
            errorMessage = err.response.data.message || "Validasi gagal";
          }
        } else {
          errorMessage =
            err.response.data.message ||
            err.response.data.error ||
            `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage =
          "Server tidak merespons. Pastikan Laravel backend running di http://localhost:8000";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Student Assistant
          </h2>
          <p className="text-gray-600 mt-2">
            {type === "login"
              ? "Masuk ke akun Anda"
              : "Buat akun untuk memulai"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {type === "register" && (
              <Input
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            {type === "register" && (
              <Input
                label="Konfirmasi Password"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                required
              />
            )}

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Memproses..." : type === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {type === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() =>
                onNavigate(type === "login" ? "register" : "login")
              }
              className="text-blue-600 font-medium hover:underline"
            >
              {type === "login" ? "Daftar sekarang" : "Masuk di sini"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ADMIN PANEL
const AdminPanel = ({ user, onLogout }) => {
  const [settings, setSettings] = useState({
    system_instruction: "",
    temperature: 0.7,
    max_tokens: 2048,
    model_name: "gemini-2.5-flash",
  });
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/admin/settings");
        if (res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        setMsg({
          text: "Gagal memuat pengaturan. Menggunakan default.",
          type: "error",
        });
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      await axios.post("/admin/settings", settings);
      setMsg({
        text: "Konfigurasi berhasil disimpan",
        type: "success",
      });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({
        text:
          "Gagal menyimpan: " + (err.response?.data?.message || err.message),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500">Kelola konfigurasi sistem</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <Button variant="danger" onClick={onLogout} className="text-sm">
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Konfigurasi AI Assistant
          </h2>

          {msg.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={settings.model_name || ""}
                onChange={(e) =>
                  setSettings({ ...settings, model_name: e.target.value })
                }
                placeholder="gemini-2.5-flash"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Nama model Gemini yang akan digunakan
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persona AI
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                value={settings.system_instruction || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system_instruction: e.target.value,
                  })
                }
                placeholder="Contoh: Kamu adalah asisten pembelajaran yang membantu mahasiswa memahami materi dengan cara yang sederhana dan mudah dipahami..."
              ></textarea>
              <p className="text-xs text-gray-500 mt-1.5">
                Instruksi sistem yang menentukan perilaku AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                  <span>Presisi (0.0)</span>
                  <span>Kreatif (2.0)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max="8192"
                  value={settings.max_tokens}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_tokens: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Konfigurasi"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// CHAT APPLICATION
const ChatApp = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get("/conversations");
        setConversations(res.data);
      } catch (err) {
        console.error("Gagal load history:", err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (conv) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
    setError("");
    setSidebarOpen(false);
  };

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setError("");
    setSidebarOpen(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const tempUserMsg = {
      id: Date.now(),
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const res = await axios.post("/chat", {
        message: userMessage,
        conversation_id: activeConvId,
      });

      const { conversation_id, ai_response } = res.data;

      if (!ai_response) {
        throw new Error("No AI response received");
      }

      if (!activeConvId && conversation_id) {
        setActiveConvId(conversation_id);
        const refresh = await axios.get("/conversations");
        setConversations(refresh.data);
      }

      const aiMsg = {
        id: Date.now() + 1,
        role: "model",
        content: ai_response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      let errorMessage = "Maaf, terjadi kesalahan. ";

      if (err.response) {
        errorMessage +=
          err.response.data.message ||
          err.response.data.error ||
          `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage += "Server tidak merespons. Pastikan backend running.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);

      const errorMsg = {
        id: Date.now() + 1,
        role: "model",
        content: errorMessage,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-semibold text-gray-900">
                Student Assistant
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <Button onClick={startNewChat} className="w-full text-sm">
            <MessageSquare size={16} />
            Percakapan Baru
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 border-b border-gray-200">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
              <Home size={18} />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <BookOpen size={18} />
              Materi
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={18} />
              Tugas
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <MessageSquare size={18} />
              Diskusi
            </button>
          </div>
        </nav>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Riwayat Percakapan
          </h3>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeConvId === conv.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-gray-400" />
                  <span className="truncate">
                    {conv.title || "Percakapan Baru"}
                  </span>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">
                Belum ada riwayat percakapan
              </p>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={onLogout}
            className="w-full text-sm"
          >
            <LogOut size={16} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Asisten Pembelajaran
              </h1>
              <p className="text-xs text-gray-500">
                Tanyakan apa saja tentang materi atau tugas kuliah
              </p>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-3 text-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot size={32} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Halo! Ada yang bisa saya bantu?
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Saya siap membantu Anda dengan materi kuliah, diskusi tugas,
                  atau pertanyaan terkait pembelajaran.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                  <button
                    onClick={() =>
                      setInput(
                        "Jelaskan konsep Neural Network secara sederhana",
                      )
                    }
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Bantuan Materi
                    </p>
                    <p className="text-xs text-gray-600">
                      Jelaskan konsep pembelajaran dengan sederhana
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setInput(
                        "Bagaimana cara memulai project machine learning?",
                      )
                    }
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Diskusi Tugas
                    </p>
                    <p className="text-xs text-gray-600">
                      Konsultasi tentang project atau assignment
                    </p>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            code: ({ inline, children }) =>
                              inline ? (
                                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                  {children}
                                </code>
                              ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-1">
                                {children}
                              </h3>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 lg:px-6 py-4">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  disabled={isTyping}
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="h-12 w-12 rounded-xl p-0 flex items-center justify-center flex-shrink-0"
              >
                <Send size={20} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Platform pembelajaran berbasis AI untuk mahasiswa
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const isAdmin = parsedUser.role === "admin";
        setCurrentView(isAdmin ? "admin" : "app");
      } catch (e) {
        console.error("Failed to parse user data:", e);
        localStorage.clear();
      }
    }

    setInitializing(false);
  }, []);

  const handleNavigate = (view) => setCurrentView(view);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    const isAdmin = userData.role === "admin";
    setCurrentView(isAdmin ? "admin" : "app");
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
    } catch (e) {
      console.log("Logout error", e);
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    delete axios.defaults.headers.common["Authorization"];

    setUser(null);
    setCurrentView("landing");
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {currentView === "login" && (
        <AuthPage
          type="login"
          onAuthSuccess={handleAuthSuccess}
          onNavigate={handleNavigate}
        />
      )}
      {currentView === "register" && (
        <AuthPage
          type="register"
          onAuthSuccess={handleAuthSuccess}
          onNavigate={handleNavigate}
        />
      )}
      {currentView === "app" && user && (
        <ChatApp user={user} onLogout={handleLogout} />
      )}
      {currentView === "admin" && user && (
        <AdminPanel user={user} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;
