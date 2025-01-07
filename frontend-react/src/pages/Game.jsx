import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTransition } from "../components/transitions/page-transition";
import { QuestionCard } from "../components/game/question-card";
import { GameTimer } from "../components/game/game-timer";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_QUESTIONS = 10; // Nombre fixe de questions par partie
const TOTAL_TIME = 180000; // 3 minutes en millisecondes
const TIME_PER_QUESTION = TOTAL_TIME / TOTAL_QUESTIONS; // Temps par question

// Fonction de mélange de Fisher-Yates
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [remainingTime, setRemainingTime] = useState(TOTAL_TIME);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (!location.state?.mode || !location.state?.questions) {
      navigate("/game-mode");
      return;
    }

    // Transformer les questions pour correspondre au format attendu
    const formattedQuestions = location.state.questions.map(q => ({
      question: q.question,
      answers: shuffleArray(q.choices), // Mélanger les choix de réponses
      correctAnswer: q.correctAnswer
    }));

    // Mélanger toutes les questions et en prendre exactement 10
    const shuffledQuestions = shuffleArray(formattedQuestions);
    setQuestions(shuffledQuestions.slice(0, TOTAL_QUESTIONS));
  }, [location.state, navigate]);

  const endGame = useCallback(() => {
    if (isGameOver) return; // Éviter les appels multiples
    setIsGameOver(true);
    
    // Attendre un court instant pour permettre l'affichage de la dernière réponse
    setTimeout(() => {
      navigate("/results", {
        state: {
          score,
          total: TOTAL_QUESTIONS,
          category: location.state?.category,
          difficulty: location.state?.difficulty,
          mode: location.state?.mode,
          timeUp: remainingTime <= 0
        }
      });
    }, 2000);
  }, [navigate, score, location.state, remainingTime, isGameOver]);

  // Timer global de 3 minutes
  useEffect(() => {
    if (questions.length === 0 || isGameOver) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1000) { // Dernière seconde
          clearInterval(timer);
          if (!isAnswered) {
            // Afficher la bonne réponse de la question actuelle
            toast({
              title: "Temps écoulé !",
              description: `La bonne réponse était : ${questions[currentQuestionIndex].correctAnswer}`,
              variant: "destructive",
            });
          }
          endGame();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, isGameOver, endGame, toast, currentQuestionIndex, isAnswered]);

  const handleAnswerSelect = (answer) => {
    if (isAnswered || isGameOver || remainingTime <= 0) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
      toast({
        title: "Bonne réponse !",
        description: "Continuez comme ça !",
        variant: "success",
      });
    } else {
      toast({
        title: "Mauvaise réponse",
        description: `La bonne réponse était : ${questions[currentQuestionIndex].correctAnswer}`,
        variant: "destructive",
      });
    }

    // Si c'est la dernière question, terminer le jeu
    if (currentQuestionIndex === questions.length - 1) {
      endGame();
    } else {
      setTimeout(nextQuestion, 2000);
    }
  };

  const handleTimeUp = () => {
    if (!isAnswered && !isGameOver && remainingTime > 0) {
      setIsAnswered(true);
      toast({
        title: "Temps écoulé pour cette question !",
        description: `La bonne réponse était : ${questions[currentQuestionIndex].correctAnswer}`,
        variant: "destructive",
      });
      
      // Si c'est la dernière question, terminer le jeu
      if (currentQuestionIndex === questions.length - 1) {
        endGame();
      } else {
        setTimeout(nextQuestion, 2000);
      }
    }
  };

  const nextQuestion = () => {
    if (isGameOver || remainingTime <= 0) return;
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      endGame();
    }
  };

  if (questions.length === 0) {
    return (
      <PageTransition className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement des questions...</h2>
          <Progress value={100} className="h-2" />
        </div>
      </PageTransition>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  return (
    <PageTransition className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              Question {currentQuestionIndex + 1} sur {TOTAL_QUESTIONS}
            </h2>
            <div className="text-lg font-medium space-x-4">
              <span>Score: {score}/{TOTAL_QUESTIONS}</span>
              <span className={`${remainingTime <= 30000 ? 'text-red-500' : 'text-primary'}`}>
                Temps: {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <GameTimer
          duration={TIME_PER_QUESTION}
          onTimeUp={handleTimeUp}
          isAnswered={isAnswered}
          isGameOver={isGameOver}
        />

        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestionIndex}
            question={currentQuestion.question}
            answers={currentQuestion.answers}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            isAnswered={isAnswered}
            correctAnswer={currentQuestion.correctAnswer}
            isDisabled={isGameOver || remainingTime <= 0}
          />
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/game-mode")}
          >
            Quitter la partie
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
} 