import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Bot, Send, Upload, Camera, FileText, Zap, Leaf, Bug,
  Droplets, Thermometer, TrendingUp, AlertTriangle,
  Download, FileSpreadsheet, File, Image, Loader2,
  Brain, Sparkles, Globe, Calculator, Target,
  Plus, MessageSquare, Trash2, ChevronDown, Copy, Check
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

const API = process.env.REACT_APP_BACKEND_URL;

// Markdown-like text renderer
const RenderMessage = ({ content }) => {
  if (!content) return null;
  const parts = content.split(/(\*\*.*?\*\*|\n|```[\s\S]*?```)/g);
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        if (part.startsWith("```") && part.endsWith("```"))
          return <pre key={i} className="bg-slate-800 text-slate-100 p-3 rounded-lg my-2 text-xs overflow-x-auto">{part.slice(3, -3)}</pre>;
        if (part === "\n") return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

const AgribotIA = () => {
  const { language } = useLanguage();
  // Chat state
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("agricam_conversations");
    return saved ? JSON.parse(saved) : [{ id: "default", title: "Nouvelle conversation", messages: [
      { role: "assistant", content: "Bonjour ! Je suis **AGRI GENIUS**, votre expert agricole intelligent. Je peux analyser vos images, predire les rendements, detecter les maladies et vous conseiller. Comment puis-je vous aider ?", ts: Date.now() }
    ]}];
  });
  const [activeConvId, setActiveConvId] = useState(() => {
    const saved = localStorage.getItem("agricam_active_conv");
    return saved || "default";
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConv?.messages || [];

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem("agricam_conversations", JSON.stringify(conversations));
    localStorage.setItem("agricam_active_conv", activeConvId);
  }, [conversations, activeConvId]);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const updateConvMessages = (convId, newMessages) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: newMessages } : c));
  };

  const updateConvTitle = (convId, firstMsg) => {
    const title = firstMsg.length > 40 ? firstMsg.substring(0, 40) + "..." : firstMsg;
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c));
  };

  const newConversation = () => {
    const id = `conv_${Date.now()}`;
    const conv = { id, title: "Nouvelle conversation", messages: [
      { role: "assistant", content: "Comment puis-je vous aider ?", ts: Date.now() }
    ]};
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(id);
  };

  const deleteConversation = (id) => {
    if (conversations.length <= 1) return;
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConvId === id) setActiveConvId(remaining[0].id);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    const userMsg = { role: "user", content: input || "Analysez cette image", hasImage: !!selectedFile, ts: Date.now() };
    const newMsgs = [...messages, userMsg];
    updateConvMessages(activeConvId, newMsgs);

    // Set title from first user message
    if (messages.filter(m => m.role === "user").length === 0) {
      updateConvTitle(activeConvId, input || "Analyse d'image");
    }

    setLoading(true);
    setInput("");

    try {
      let imageBase64 = null;
      if (selectedFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result.split(",")[1]);
          reader.readAsDataURL(selectedFile);
        });
      }

      const response = await api.post("/agribot-ai/chat", {
        message: input || "Analysez cette image en detail: identifiez les cultures, detectez les maladies, evaluez la sante des plantes et donnez vos recommandations.",
        image_base64: imageBase64,
        context: `Respond in language: ${language}`
      });

      const data = response.data;
      let content = data.response || "Desole, je n'ai pas pu traiter votre demande.";
      let isError = false;
      // Handle budget exceeded
      if (data.success === false && data.error && data.error.includes("Budget")) {
        content = "Le quota d'utilisation de l'IA a ete atteint. L'administrateur doit recharger le solde. Allez dans Profil > Cle Universelle > Ajouter du solde.";
        isError = true;
      }
      const assistantMsg = { role: "assistant", content, ts: Date.now(), isError };
      updateConvMessages(activeConvId, [...newMsgs, assistantMsg]);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch {
      const errMsg = { role: "assistant", content: "Erreur de connexion. Veuillez reessayer.", ts: Date.now(), isError: true };
      updateConvMessages(activeConvId, [...newMsgs, errMsg]);
      toast.error("Erreur de communication avec AgriBot IA");
    } finally {
      setLoading(false);
    }
  };

  const handleToolAction = async (action) => {
    setShowTools(false);
    setLoading(true);
    const toolMsg = { role: "user", content: `[${action.label}]`, ts: Date.now(), isTool: true };
    const newMsgs = [...messages, toolMsg];
    updateConvMessages(activeConvId, newMsgs);

    try {
      let response;
      if (action.type === "predict-yield") {
        response = await api.post("/agribot-ai/predict-yield", { crop_type: "mais", surface_ha: 5, country: "Cameroun", soil_quality: "moyen", irrigation: false });
        const p = response.data.prediction || response.data;
        const content = `**Prediction de Rendement**\n\nCulture: Mais\nSurface: 5 ha\nPays: Cameroun\n\nRendement estime: **${p.estimated_yield_kg_ha || "N/A"} kg/ha**\nProduction totale: **${p.total_production_tonnes || "N/A"} tonnes**\nConfiance: ${p.confidence_level || "85%"}`;
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
      } else if (action.type === "ecological") {
        response = await api.post("/agribot-ai/ecological-advice", { problem: "agriculture tropicale", crop_type: "general" });
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content: response.data.advice || response.data.response || JSON.stringify(response.data), ts: Date.now() }]);
      } else if (action.type === "soil") {
        response = await api.post("/agribot-ai/analyze-soil", { sensor_data: { nitrogen: 45, phosphorus: 30, potassium: 50, ph: 6.5, humidity: 60 } });
        const s = response.data;
        const content = `**Analyse de Sol**\n\nAzote (N): ${s.nitrogen_level || "Moyen"}\nPhosphore (P): ${s.phosphorus_level || "Bas"}\nPotassium (K): ${s.potassium_level || "Moyen"}\npH: ${s.ph_level || "6.5"}\nHumidite: ${s.humidity_level || "60%"}\n\n${s.recommendations || "Recommandation: Ajouter un engrais NPK 15-15-15"}`;
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
      } else if (action.type === "disease") {
        response = await api.post("/agribot-ai/predict-disease-spread", { disease_name: "mildiou", current_zone: "Centre Cameroun", crop_type: "mais" });
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content: response.data.prediction || response.data.response || JSON.stringify(response.data), ts: Date.now() }]);
      } else {
        response = await api.post("/agribot-ai/chat", { message: action.prompt || action.label });
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content: response.data.response || "Resultat genere.", ts: Date.now() }]);
      }
    } catch {
      updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content: "Erreur lors de l'execution. Reessayez.", ts: Date.now(), isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const tools = [
    { type: "predict-yield", label: "Prediction Rendement", icon: TrendingUp, color: "text-emerald-600" },
    { type: "soil", label: "Analyse Sol NPK", icon: Droplets, color: "text-amber-600" },
    { type: "disease", label: "Prediction Maladies", icon: Bug, color: "text-red-600" },
    { type: "ecological", label: "Conseils Ecologiques", icon: Leaf, color: "text-green-600" },
    { type: "chat", label: "Calendrier Plantation", icon: Calculator, prompt: "Quel est le meilleur calendrier de plantation pour le mais au Cameroun ?", color: "text-blue-600" },
    { type: "chat", label: "Rotation des Cultures", icon: Globe, prompt: "Quelle rotation de cultures recommandez-vous pour enrichir le sol en Afrique tropicale ?", color: "text-violet-600" },
  ];

  const quickPrompts = [
    "Comment traiter le mildiou sur le cacao ?",
    "Quelle rotation pour enrichir le sol ?",
    "Agriculture bio en zone tropicale ?",
    "Calendrier de plantation du mais ?",
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-slate-200 bg-white" data-testid="agribot-ia-page">
      {/* Sidebar - Conversation history */}
      <div className={cn(
        "border-r border-slate-200 bg-slate-50 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-64 min-w-[256px]" : "w-0 min-w-0 overflow-hidden"
      )}>
        <div className="p-3 border-b border-slate-200">
          <Button onClick={newConversation} className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm gap-2" data-testid="new-conv-btn">
            <Plus className="h-4 w-4" /> Nouvelle conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer text-sm transition-colors",
                conv.id === activeConvId ? "bg-emerald-100 text-emerald-800" : "hover:bg-slate-100 text-slate-600"
              )}
              onClick={() => setActiveConvId(conv.id)}
              data-testid={`conv-${conv.id}`}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{conv.title}</span>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Brain className="h-3.5 w-3.5" />
            <span>AGRI GENIUS</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="toggle-sidebar">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">AGRI GENIUS</h2>
                <p className="text-xs text-slate-400">Expert agricole intelligent</p>
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">En ligne</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" data-testid="chat-messages">
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
            {messages.length <= 1 && !loading && (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">AGRI GENIUS</h3>
                <p className="text-sm text-slate-500 mb-6">Votre assistant agricole intelligent</p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickPrompts.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="p-3 text-left text-xs border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-colors text-slate-600"
                      data-testid={`quick-prompt-${i}`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500 mb-1" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")} data-testid={`msg-${idx}`}>
                {/* Avatar */}
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  msg.role === "user" ? "bg-blue-500" : "bg-gradient-to-br from-emerald-500 to-teal-600"
                )}>
                  {msg.role === "user" ? <span className="text-white text-xs font-bold">U</span> : <Bot className="h-4 w-4 text-white" />}
                </div>

                {/* Message bubble */}
                <div className={cn("group max-w-[75%] min-w-0", msg.role === "user" ? "text-right" : "text-left")}>
                  <div className={cn(
                    "inline-block rounded-2xl px-4 py-3 text-left",
                    msg.role === "user" ? "bg-blue-500 text-white rounded-tr-md" : "bg-slate-100 text-slate-800 rounded-tl-md",
                    msg.isError && "bg-red-50 text-red-700 border border-red-200"
                  )}>
                    {msg.hasImage && (
                      <div className="flex items-center gap-1.5 text-xs mb-2 opacity-80">
                        <Image className="h-3 w-3" /> Image jointe
                      </div>
                    )}
                    <RenderMessage content={msg.content} />
                  </div>
                  <div className={cn("flex items-center gap-2 mt-1", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <span className="text-[10px] text-slate-400">{new Date(msg.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.role === "assistant" && !msg.isError && (
                      <button
                        onClick={() => copyMessage(msg.content, idx)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                        data-testid={`copy-msg-${idx}`}
                      >
                        {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-slate-500">AgriBot analyse...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Tools Panel */}
        {showTools && (
          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs font-medium text-slate-500 mb-2">Outils IA</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {tools.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => handleToolAction(tool)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center"
                    data-testid={`tool-${tool.type}-${i}`}
                  >
                    <tool.icon className={cn("h-4 w-4", tool.color)} />
                    <span className="text-[10px] text-slate-600 leading-tight">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{selectedFile?.name}</p>
                <p className="text-xs text-slate-400">{(selectedFile?.size / 1024).toFixed(0)} Ko</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*,.pdf,.doc,.docx,.csv" className="hidden" />
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600" onClick={() => fileInputRef.current?.click()} data-testid="upload-btn">
                <Upload className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-xl", showTools ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-emerald-600")} onClick={() => setShowTools(!showTools)} data-testid="tools-btn">
                <Zap className="h-5 w-5" />
              </Button>
              <textarea
                ref={inputRef}
                placeholder="Posez votre question agricole..."
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-slate-800 placeholder-slate-400 py-2 min-h-[36px] max-h-[120px]"
                rows={1}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={loading || (!input.trim() && !selectedFile)}
                className={cn(
                  "h-9 w-9 rounded-xl transition-colors",
                  input.trim() || selectedFile ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-200 text-slate-400"
                )}
                size="icon"
                data-testid="send-btn"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">AgriBot IA peut faire des erreurs. Verifiez les informations importantes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgribotIA;
