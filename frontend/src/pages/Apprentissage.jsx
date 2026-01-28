import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  GraduationCap,
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Target,
  Leaf,
  Droplets,
  Bug,
  Sparkles,
  Trophy,
  Star,
  Lock
} from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  debutant: "bg-emerald-100 text-emerald-700",
  intermediaire: "bg-amber-100 text-amber-700",
  avance: "bg-red-100 text-red-700"
};

const CATEGORY_ICONS = {
  fondamentaux: GraduationCap,
  irrigation: Droplets,
  maladies: Bug,
  fertilisation: Leaf,
  technologie: Sparkles
};

const Apprentissage = () => {
  const [modules, setModules] = useState([]);
  const [myProgress, setMyProgress] = useState({ progress: [], completed_count: 0, total_modules: 0, completion_percentage: 0 });
  const [selectedModule, setSelectedModule] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, progressRes] = await Promise.all([
        api.get("/learning/modules"),
        api.get("/learning/my-progress")
      ]);
      setModules(modulesRes.data);
      setMyProgress(progressRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur de chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const openModule = (module) => {
    setSelectedModule(module);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const submitQuiz = async () => {
    if (!selectedModule?.quiz) return;

    let correct = 0;
    selectedModule.quiz.forEach((q, index) => {
      if (parseInt(quizAnswers[index]) === q.correct) {
        correct++;
      }
    });

    const score = Math.round((correct / selectedModule.quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      await api.post(`/learning/progress/${selectedModule.id}`, null, {
        params: {
          completed: score >= 70,
          quiz_score: score
        }
      });
      fetchData();
      
      if (score >= 70) {
        toast.success("Félicitations! Module complété avec succès! 🎉");
      } else {
        toast.info("Essayez encore! Il faut 70% pour valider le module.");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const isModuleCompleted = (moduleId) => {
    return myProgress.progress?.some(p => p.module_id === moduleId && p.completed);
  };

  const getModuleScore = (moduleId) => {
    const progress = myProgress.progress?.find(p => p.module_id === moduleId);
    return progress?.quiz_score;
  };

  const filteredModules = activeCategory === "all" 
    ? modules 
    : modules.filter(m => m.category === activeCategory);

  const categories = ["all", ...new Set(modules.map(m => m.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-emerald-600" />
            Centre d'Apprentissage
          </h1>
          <p className="text-slate-500 mt-1">
            Formations en agriculture de précision et technologies agricoles
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Progression globale</p>
                <p className="text-3xl font-bold mt-1">{myProgress.completion_percentage}%</p>
              </div>
              <Trophy className="h-12 w-12 text-emerald-200" />
            </div>
            <Progress value={myProgress.completion_percentage} className="mt-4 bg-emerald-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Modules complétés</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {myProgress.completed_count}/{myProgress.total_modules}
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Temps total estimé</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {modules.reduce((acc, m) => acc + m.duration_minutes, 0)} min
                </p>
              </div>
              <Clock className="h-12 w-12 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Certificats obtenus</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {myProgress.completed_count}
                </p>
              </div>
              <Award className="h-12 w-12 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-slate-100">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === "all" ? "Tous" : cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const completed = isModuleCompleted(module.id);
          const score = getModuleScore(module.id);
          const CategoryIcon = CATEGORY_ICONS[module.category] || BookOpen;

          return (
            <Card 
              key={module.id} 
              className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${
                completed ? "border-emerald-200 bg-emerald-50/30" : ""
              }`}
              onClick={() => openModule(module)}
              data-testid={`module-${module.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    completed ? "bg-emerald-500" : "bg-slate-100 group-hover:bg-emerald-100"
                  }`}>
                    {completed ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <CategoryIcon className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={DIFFICULTY_COLORS[module.difficulty]}>
                      {module.difficulty}
                    </Badge>
                    {score !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        Score: {score}%
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3 line-clamp-2">{module.title}</CardTitle>
                <CardDescription className="line-clamp-2">{module.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between pt-0">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>{module.duration_minutes} min</span>
                </div>
                <Button size="sm" variant={completed ? "outline" : "default"} className="gap-1">
                  {completed ? "Revoir" : "Commencer"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Module Dialog */}
      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              {selectedModule?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <Badge className={DIFFICULTY_COLORS[selectedModule?.difficulty]}>
                {selectedModule?.difficulty}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedModule?.duration_minutes} minutes
              </span>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {!showQuiz ? (
              <div className="space-y-6">
                {/* Module Content */}
                <div className="prose prose-slate prose-emerald max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedModule?.content
                        ?.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-slate-900 mt-6 mb-4">$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-slate-800 mt-5 mb-3">$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-slate-700 mt-4 mb-2">$1</h3>')
                        .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
                        .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        || ''
                    }}
                  />
                </div>

                {/* Quiz Button */}
                {selectedModule?.quiz && selectedModule.quiz.length > 0 && (
                  <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Quiz de validation
                          </h3>
                          <p className="text-sm text-emerald-600 mt-1">
                            {selectedModule.quiz.length} questions - Obtenez 70% pour valider le module
                          </p>
                        </div>
                        <Button onClick={startQuiz} className="bg-emerald-600 hover:bg-emerald-700">
                          <Play className="h-4 w-4 mr-2" />
                          Commencer le quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quiz */}
                {!quizSubmitted ? (
                  <>
                    {selectedModule?.quiz?.map((question, qIndex) => (
                      <Card key={qIndex} className="border-slate-200">
                        <CardContent className="p-6">
                          <p className="font-medium text-slate-900 mb-4">
                            {qIndex + 1}. {question.question}
                          </p>
                          <RadioGroup
                            value={quizAnswers[qIndex]?.toString()}
                            onValueChange={(value) => setQuizAnswers(prev => ({ ...prev, [qIndex]: value }))}
                          >
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
                                <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer flex-1">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    ))}

                    <Button 
                      onClick={submitQuiz} 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={Object.keys(quizAnswers).length < selectedModule?.quiz?.length}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Soumettre les réponses
                    </Button>
                  </>
                ) : (
                  /* Quiz Results */
                  <Card className={`${quizScore >= 70 ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                    <CardContent className="p-8 text-center">
                      <div className={`h-20 w-20 mx-auto rounded-full flex items-center justify-center ${
                        quizScore >= 70 ? "bg-emerald-500" : "bg-amber-500"
                      }`}>
                        {quizScore >= 70 ? (
                          <Trophy className="h-10 w-10 text-white" />
                        ) : (
                          <Target className="h-10 w-10 text-white" />
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold mt-4 ${quizScore >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                        {quizScore >= 70 ? "Félicitations!" : "Continuez vos efforts!"}
                      </h3>
                      <p className="text-4xl font-bold mt-2">{quizScore}%</p>
                      <p className={`mt-2 ${quizScore >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                        {quizScore >= 70 
                          ? "Module validé avec succès! Vous avez obtenu un certificat."
                          : "Il faut obtenir 70% minimum pour valider. Révisez le contenu et réessayez!"}
                      </p>
                      <div className="flex gap-4 justify-center mt-6">
                        <Button variant="outline" onClick={() => setShowQuiz(false)}>
                          Revoir le cours
                        </Button>
                        {quizScore < 70 && (
                          <Button onClick={startQuiz} className="bg-amber-600 hover:bg-amber-700">
                            Réessayer le quiz
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Apprentissage;
