import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  Leaf,
  Droplets,
  Bug,
  Thermometer,
  Calendar,
  HelpCircle,
  MessageSquare,
  History,
  Trash2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  FileText,
  Camera,
  ShoppingBag
} from "lucide-react";
import api from "../services/api";
import { analyzeFile } from "../services/api";
import { toast } from "sonner";

const QUICK_QUESTIONS = [
  { text: "Comment irriguer le maïs?", icon: Droplets, category: "irrigation" },
  { text: "Quelles maladies affectent le blé?", icon: Bug, category: "maladies" },
  { text: "Calendrier de semis pour l'Afrique de l'Ouest", icon: Calendar, category: "calendrier" },
  { text: "Comment améliorer la fertilité du sol?", icon: Leaf, category: "fertilisation" },
  { text: "Température idéale pour le cacao", icon: Thermometer, category: "cultures" },
  { text: "Comment lutter contre les pucerons?", icon: Bug, category: "parasites" },
];

const KNOWLEDGE_TOPICS = [
  {
    title: "Cultures",
    icon: Leaf,
    topics: ["Maïs", "Blé", "Riz", "Manioc", "Cacao", "Café", "Palmier à huile", "Coton", "Arachide"]
  },
  {
    title: "Irrigation",
    icon: Droplets,
    topics: ["Goutte-à-goutte", "Aspersion", "Gravitaire", "Calcul des besoins", "Automatisation"]
  },
  {
    title: "Maladies",
    icon: Bug,
    topics: ["Mildiou", "Rouille", "Fusariose", "Oïdium", "Charançon", "Chenille légionnaire"]
  },
  {
    title: "Fertilisation",
    icon: Sparkles,
    topics: ["Azote (N)", "Phosphore (P)", "Potassium (K)", "Compost", "Engrais organiques"]
  }
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Bonjour! Je suis **AgriBot**, votre assistant agricole expert développé par African AI Solutions. 🌾\n\nJe peux vous aider avec:\n- Conseils sur les cultures (maïs, blé, cacao, etc.)\n- **Diagnostic de maladies** (uploadez une photo!)\n- Irrigation et fertilisation\n- Recommandations de fournisseurs\n- Protection de l'environnement\n\n📷 **Nouveau:** Uploadez une image de vos plantes pour détecter les maladies!\n\nComment puis-je vous aider aujourd'hui?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/chatbot/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: `📎 Fichier uploadé: ${file.name}`,
      isFile: true,
      fileName: file.name,
      fileType: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAnalyzing(true);

    try {
      const question = file.type.startsWith('image/') 
        ? "Analyse cette image de culture. Identifie la plante, détecte les maladies potentielles, recommande des traitements écologiques et suggère des fournisseurs de la plateforme AGRICAM IA."
        : "Analyse ce document agricole et fournis des insights utiles.";

      const response = await analyzeFile(file, question);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.data.analysis || "Analyse terminée",
        isAnalysis: true,
        analysisType: response.data.type,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setPreviewImage(null);
      toast.success("Analyse terminée!");
    } catch (error) {
      console.error("Error analyzing file:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Désolé, je n'ai pas pu analyser ce fichier. Essayez avec une image JPEG ou PNG.",
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Erreur d'analyse");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/chatbot/message", {
        message: text.trim(),
        context: null
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.data.response,
        source: response.data.source,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      fetchHistory();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Erreur de communication avec AgriBot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: "bot",
      text: "Chat réinitialisé. Comment puis-je vous aider?",
      timestamp: new Date().toISOString()
    }]);
    toast.success("Conversation réinitialisée");
  };

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="h-7 w-7 text-emerald-600" />
            AgriBot - Assistant Agricole IA
          </h1>
          <p className="text-slate-500 mt-1">
            Posez vos questions sur l'agriculture, les cultures et les maladies
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Propulsé par GPT-5.2
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AgriBot</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      En ligne - Prêt à vous aider
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-emerald-600 text-white rounded-br-md"
                          : message.isError
                          ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-md"
                          : "bg-slate-100 text-slate-800 rounded-bl-md"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === "bot" && (
                          <Bot className={`h-5 w-5 mt-0.5 flex-shrink-0 ${message.isError ? "text-red-500" : "text-emerald-600"}`} />
                        )}
                        <div>
                          <div
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                          />
                          {message.source && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Source: {message.source}
                            </Badge>
                          )}
                        </div>
                        {message.type === "user" && (
                          <User className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                        <span className="text-sm text-slate-600">AgriBot réfléchit...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question agricole..."
                  className="flex-1"
                  disabled={isLoading}
                  data-testid="chatbot-input"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="chatbot-send-btn"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-600" />
                Questions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {QUICK_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => sendMessage(question.text)}
                    disabled={isLoading}
                  >
                    <question.icon className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0" />
                    <span className="text-xs">{question.text}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Base de Connaissances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cultures" className="w-full">
                <TabsList className="grid grid-cols-2 mb-3">
                  <TabsTrigger value="cultures" className="text-xs">Cultures</TabsTrigger>
                  <TabsTrigger value="techniques" className="text-xs">Techniques</TabsTrigger>
                </TabsList>
                <TabsContent value="cultures" className="space-y-2">
                  {KNOWLEDGE_TOPICS.slice(0, 1).map((topic) => (
                    <div key={topic.title} className="flex flex-wrap gap-1">
                      {topic.topics.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="cursor-pointer hover:bg-emerald-50 text-xs"
                          onClick={() => sendMessage(`Parle-moi de la culture du ${t}`)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="techniques" className="space-y-2">
                  {KNOWLEDGE_TOPICS.slice(1, 3).map((topic) => (
                    <div key={topic.title} className="mb-2">
                      <p className="text-xs font-medium text-slate-600 mb-1">{topic.title}</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.topics.slice(0, 4).map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="cursor-pointer hover:bg-emerald-50 text-xs"
                            onClick={() => sendMessage(`Explique-moi ${t}`)}
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                Historique Récent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucun historique
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
                        onClick={() => sendMessage(item.message)}
                      >
                        <p className="text-xs text-slate-700 truncate">{item.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(item.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
