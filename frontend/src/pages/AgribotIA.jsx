import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Bot, Send, Upload, Camera, Zap, Leaf, Bug,
  Droplets, TrendingUp, Loader2,
  Brain, Sparkles, Globe, Calculator,
  Plus, MessageSquare, Trash2, Copy, Check, Video,
  Mic, MicOff, Volume2, VolumeX, Image
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

// Language code to BCP47 mapping for SpeechSynthesis/Recognition
const LANG_MAP = {
  fr: { speech: "fr-FR", name: "Francais" }, en: { speech: "en-US", name: "English" },
  es: { speech: "es-ES", name: "Espanol" }, de: { speech: "de-DE", name: "Deutsch" },
  ar: { speech: "ar-SA", name: "Arabic" }, zh: { speech: "zh-CN", name: "Chinese" },
  sw: { speech: "sw-KE", name: "Swahili" }, ha: { speech: "ha-NG", name: "Hausa" },
  yo: { speech: "yo-NG", name: "Yoruba" }, wo: { speech: "wo-SN", name: "Wolof" },
  am: { speech: "am-ET", name: "Amharic" }, zu: { speech: "zu-ZA", name: "Zulu" },
  ig: { speech: "ig-NG", name: "Igbo" }, ln: { speech: "ln-CD", name: "Lingala" },
  mg: { speech: "mg-MG", name: "Malagasy" },
};

const getLangName = (code) => LANG_MAP[code]?.name || code;
const getSpeechLang = (code) => LANG_MAP[code]?.speech || code;

// Markdown renderer
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
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("agricam_conversations");
    return saved ? JSON.parse(saved) : [{ id: "default", title: "Nouvelle conversation", messages: [
      { role: "assistant", content: "Bonjour ! Je suis **AGRI GENIUS**, votre expert agricole intelligent. Comment puis-je vous aider ?", ts: Date.now() }
    ]}];
  });
  const [activeConvId, setActiveConvId] = useState(() => localStorage.getItem("agricam_active_conv") || "default");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showTools, setShowTools] = useState(false);
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConv?.messages || [];

  // Persist
  useEffect(() => {
    localStorage.setItem("agricam_conversations", JSON.stringify(conversations));
    localStorage.setItem("agricam_active_conv", activeConvId);
  }, [conversations, activeConvId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, loading]);

  // Init SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechLang(language);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join("");
        setInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => { recognitionRef.current?.abort(); };
  }, [language]);

  // Text-to-Speech
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Clean markdown
    const clean = text.replace(/\*\*/g, "").replace(/```[\s\S]*?```/g, "").replace(/#+\s/g, "").replace(/\n+/g, ". ").substring(0, 1000);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = getSpeechLang(language);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const langCode = getSpeechLang(language);
    const voice = voices.find(v => v.lang.startsWith(langCode.split("-")[0]));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  const toggleListening = () => {
    if (!recognitionRef.current) { toast.error("Reconnaissance vocale non supportee par ce navigateur"); return; }
    if (isListening) { recognitionRef.current.stop(); } 
    else {
      recognitionRef.current.lang = getSpeechLang(language);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const updateConvMessages = (convId, newMessages) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: newMessages } : c));
  };

  const newConversation = () => {
    const id = `conv_${Date.now()}`;
    setConversations(prev => [{ id, title: "Nouvelle conversation", messages: [
      { role: "assistant", content: "Comment puis-je vous aider ?", ts: Date.now() }
    ]}, ...prev]);
    setActiveConvId(id);
    setSidebarOpen(false);
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

    if (messages.filter(m => m.role === "user").length === 0) {
      const title = (input || "Analyse d'image").substring(0, 40);
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, title } : c));
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

      const langName = getLangName(language);
      const response = await api.post("/agribot-ai/chat", {
        message: input || "Analysez cette image en detail.",
        image_base64: imageBase64,
        context: `IMPORTANT: You MUST respond entirely in ${langName} (language code: ${language}). All text, titles, and explanations must be in ${langName}.`
      });

      const data = response.data;
      let content = data.response || "Desole, je n'ai pas pu traiter votre demande.";
      let isError = false;
      if (data.success === false && data.error?.includes("Budget")) {
        content = "Le quota IA est atteint. Allez dans Profil > Cle Universelle > Ajouter du solde.";
        isError = true;
      }
      const assistantMsg = { role: "assistant", content, ts: Date.now(), isError };
      updateConvMessages(activeConvId, [...newMsgs, assistantMsg]);
      setSelectedFile(null);
      setPreviewUrl(null);

      // Auto-speak the response
      if (autoSpeak && !isError) speakText(content);
    } catch {
      const errMsg = { role: "assistant", content: "Erreur de connexion. Veuillez reessayer.", ts: Date.now(), isError: true };
      updateConvMessages(activeConvId, [...newMsgs, errMsg]);
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
      const langName = getLangName(language);
      const langCtx = `IMPORTANT: Respond entirely in ${langName}.`;

      if (action.type === "predict-yield") {
        response = await api.post("/agribot-ai/predict-yield", { crop_type: "mais", surface_ha: 5, country: "Cameroun", soil_quality: "moyen", irrigation: false });
        const p = response.data.prediction || response.data;
        const content = `**Prediction de Rendement**\n\nCulture: Mais\nSurface: 5 ha\nRendement estime: **${p.estimated_yield_kg_ha || "N/A"} kg/ha**\nProduction totale: **${p.total_production_tonnes || "N/A"} tonnes**`;
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
        if (autoSpeak) speakText(content);
      } else if (action.type === "ecological") {
        response = await api.post("/agribot-ai/ecological-advice", { problem: "agriculture tropicale", crop_type: "general", context: langCtx });
        const content = response.data.advice || response.data.response || JSON.stringify(response.data);
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
        if (autoSpeak) speakText(content);
      } else if (action.type === "soil") {
        response = await api.post("/agribot-ai/analyze-soil", { sensor_data: { nitrogen: 45, phosphorus: 30, potassium: 50, ph: 6.5, humidity: 60 } });
        const s = response.data;
        const content = `**Analyse de Sol**\n\nAzote: ${s.nitrogen_level || "Moyen"}\nPhosphore: ${s.phosphorus_level || "Bas"}\nPotassium: ${s.potassium_level || "Moyen"}\npH: ${s.ph_level || "6.5"}`;
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
        if (autoSpeak) speakText(content);
      } else if (action.type === "disease") {
        response = await api.post("/agribot-ai/predict-disease-spread", { disease_name: "mildiou", current_zone: "Centre Cameroun", crop_type: "mais" });
        const content = response.data.prediction || response.data.response || JSON.stringify(response.data);
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
        if (autoSpeak) speakText(content);
      } else {
        response = await api.post("/agribot-ai/chat", { message: action.prompt || action.label, context: langCtx });
        const content = response.data.response || "Resultat genere.";
        updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content, ts: Date.now() }]);
        if (autoSpeak) speakText(content);
      }
    } catch {
      updateConvMessages(activeConvId, [...newMsgs, { role: "assistant", content: "Erreur. Reessayez.", ts: Date.now(), isError: true }]);
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
    if (file) { setSelectedFile(file); if (file.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(file)); }
  };

  const tools = [
    { type: "predict-yield", label: "Rendement", icon: TrendingUp, color: "text-emerald-400" },
    { type: "soil", label: "Analyse Sol", icon: Droplets, color: "text-amber-400" },
    { type: "disease", label: "Maladies", icon: Bug, color: "text-red-400" },
    { type: "ecological", label: "Ecologie", icon: Leaf, color: "text-green-400" },
    { type: "chat", label: "Plantation", icon: Calculator, prompt: "Quel est le meilleur calendrier de plantation pour le mais au Cameroun ?", color: "text-blue-400" },
    { type: "chat", label: "Rotation", icon: Globe, prompt: "Quelle rotation de cultures pour enrichir le sol en Afrique tropicale ?", color: "text-violet-400" },
  ];

  const quickPrompts = [
    "Comment traiter le mildiou sur le cacao ?",
    "Quelle rotation pour enrichir le sol ?",
    "Agriculture bio en zone tropicale ?",
    "Calendrier de plantation du mais ?",
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-slate-800/50 bg-[#0b1120]" data-testid="agribot-ia-page">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={cn(
        "border-r border-slate-800/50 bg-[#0a0f1e] flex flex-col transition-all duration-300 z-40",
        sidebarOpen ? "fixed inset-y-0 left-0 w-72 md:relative md:w-64 md:min-w-[256px]" : "w-0 min-w-0 overflow-hidden"
      )}>
        <div className="p-3 border-b border-slate-800/50">
          <Button onClick={newConversation} className="w-full bg-emerald-600 hover:bg-emerald-500 text-sm gap-2" data-testid="new-conv-btn">
            <Plus className="h-4 w-4" /> Nouvelle conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.map(conv => (
            <div key={conv.id}
              className={cn("group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer text-sm transition-colors",
                conv.id === activeConvId ? "bg-emerald-900/30 text-emerald-400" : "hover:bg-slate-800/50 text-slate-500"
              )}
              onClick={() => { setActiveConvId(conv.id); setSidebarOpen(false); }}
              data-testid={`conv-${conv.id}`}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{conv.title}</span>
              {conversations.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800/50 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <Brain className="h-3.5 w-3.5" /><span>AGRI GENIUS</span>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-slate-800/50 bg-[#0b1120]">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="toggle-sidebar" title="Historique des conversations">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="font-semibold text-white text-sm">AGRI GENIUS</h2>
              <p className="text-xs text-slate-500">Expert agricole intelligent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"
              className={cn("h-8 w-8 rounded-lg transition-colors", autoSpeak ? "text-emerald-400 bg-emerald-900/20" : "text-slate-500")}
              onClick={() => { setAutoSpeak(!autoSpeak); if (isSpeaking) stopSpeaking(); }}
              title={autoSpeak ? "Desactiver lecture vocale auto" : "Activer lecture vocale auto"}
              data-testid="auto-speak-toggle"
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Badge className="bg-emerald-900/30 text-emerald-400 text-xs ring-1 ring-emerald-500/20 hidden sm:flex">En ligne</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" data-testid="chat-messages">
          <div className="max-w-3xl mx-auto py-4 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6">
            {messages.length <= 1 && !loading && (
              <div className="text-center py-8 md:py-12">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Bot className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">AGRI GENIUS</h3>
                <p className="text-sm text-slate-500 mb-4 md:mb-6">Votre assistant agricole intelligent</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-md mx-auto">
                  {quickPrompts.map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="p-3 text-left text-xs border border-slate-800/50 rounded-xl hover:bg-emerald-900/10 hover:border-emerald-500/30 transition-colors text-slate-400"
                      data-testid={`quick-prompt-${i}`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500 mb-1" />{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex gap-2 md:gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")} data-testid={`msg-${idx}`}>
                <div className={cn("h-7 w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  msg.role === "user" ? "bg-blue-500" : "bg-gradient-to-br from-emerald-500 to-teal-600"
                )}>
                  {msg.role === "user" ? <span className="text-white text-xs font-bold">U</span> : <Bot className="h-4 w-4 text-white" />}
                </div>
                <div className={cn("group max-w-[85%] md:max-w-[75%] min-w-0", msg.role === "user" ? "text-right" : "text-left")}>
                  <div className={cn("inline-block rounded-2xl px-3 md:px-4 py-2 md:py-3 text-left",
                    msg.role === "user" ? "bg-blue-500 text-white rounded-tr-md" : "bg-slate-100 text-slate-800 rounded-tl-md",
                    msg.isError && "bg-red-50 text-red-700 border border-red-200"
                  )}>
                    {msg.hasImage && <div className="flex items-center gap-1.5 text-xs mb-2 opacity-80"><Image className="h-3 w-3" /> Image jointe</div>}
                    <RenderMessage content={msg.content} />
                  </div>
                  <div className={cn("flex items-center gap-2 mt-1", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <span className="text-[10px] text-slate-400">{new Date(msg.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.role === "assistant" && !msg.isError && (
                      <>
                        <button onClick={() => speakText(msg.content)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-400 transition-opacity"
                          title="Ecouter la reponse" data-testid={`speak-msg-${idx}`}>
                          <Volume2 className="h-3 w-3" />
                        </button>
                        <button onClick={() => copyMessage(msg.content, idx)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                          data-testid={`copy-msg-${idx}`}>
                          {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </>
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
                    <span className="text-xs text-slate-500">AGRI GENIUS analyse...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Tools Panel */}
        {showTools && (
          <div className="border-t border-slate-800/50 bg-[#0f1729] px-3 md:px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs font-medium text-slate-500 mb-2">Outils IA</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {tools.map((tool, i) => (
                  <button key={i} onClick={() => handleToolAction(tool)}
                    className="flex flex-col items-center gap-1 p-2 md:p-2.5 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 hover:bg-emerald-900/10 transition-colors text-center"
                    data-testid={`tool-${tool.type}-${i}`} title={tool.label}>
                    <tool.icon className={cn("h-4 w-4", tool.color)} />
                    <span className="text-[10px] text-slate-500 leading-tight">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="border-t border-slate-800/50 bg-[#0a0f1e] px-3 md:px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <img src={previewUrl} alt="Preview" className="h-14 w-14 md:h-16 md:w-16 object-cover rounded-lg border border-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selectedFile?.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile?.size / 1024).toFixed(0)} Ko</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-slate-800/50 bg-[#0b1120] p-2 md:p-4">
          <div className="max-w-3xl mx-auto">
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 mb-2 py-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <span className="text-xs text-emerald-400">AGRI GENIUS parle...</span>
                <button onClick={stopSpeaking} className="text-xs text-red-400 hover:text-red-300 underline">Arreter</button>
              </div>
            )}

            <div className="flex items-end gap-1 md:gap-2 bg-[#0f1729] border border-slate-800 rounded-2xl p-1.5 md:p-2 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*,.pdf,.doc,.docx,.csv" className="hidden" />
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl text-slate-500 hover:text-emerald-400" onClick={() => fileInputRef.current?.click()} title="Importer fichier" data-testid="upload-btn">
                <Upload className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl text-slate-500 hover:text-emerald-400 hidden sm:flex" title="Prendre photo"
                onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment"; inp.onchange = handleFileSelect; inp.click(); }}
                data-testid="camera-btn">
                <Camera className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="ghost" size="icon"
                className={cn("h-8 w-8 md:h-9 md:w-9 rounded-xl", showTools ? "text-emerald-400 bg-emerald-900/20" : "text-slate-500 hover:text-emerald-400")}
                onClick={() => setShowTools(!showTools)} data-testid="tools-btn" title="Outils IA">
                <Zap className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              {/* Microphone button */}
              <Button variant="ghost" size="icon"
                className={cn("h-8 w-8 md:h-9 md:w-9 rounded-xl transition-all",
                  isListening ? "text-red-400 bg-red-900/20 animate-pulse ring-2 ring-red-500/30" : "text-slate-500 hover:text-emerald-400"
                )}
                onClick={toggleListening} title={isListening ? "Arreter l'ecoute" : "Parler a AGRI GENIUS"}
                data-testid="mic-btn">
                {isListening ? <MicOff className="h-4 w-4 md:h-5 md:w-5" /> : <Mic className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>

              <textarea
                ref={inputRef}
                placeholder="Posez votre question ou parlez..."
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-white placeholder-slate-600 py-2 min-h-[36px] max-h-[120px]"
                rows={1} data-testid="chat-input"
              />
              <Button onClick={handleSend} disabled={loading || (!input.trim() && !selectedFile)}
                className={cn("h-8 w-8 md:h-9 md:w-9 rounded-xl transition-colors",
                  input.trim() || selectedFile ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-slate-800 text-slate-600"
                )}
                size="icon" data-testid="send-btn">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-1.5 md:mt-2">AGRI GENIUS - Expert agricole IA avec support vocal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgribotIA;
