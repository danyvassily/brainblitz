import { useLocation, useNavigate } from "react-router-dom";
import { PageTransition } from "../components/transitions/page-transition";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";

const getScoreMessage = (percentage) => {
  if (percentage >= 90) return "Excellent ! Vous êtes un expert !";
  if (percentage >= 70) return "Très bien ! Continuez comme ça !";
  if (percentage >= 50) return "Pas mal ! Vous pouvez encore vous améliorer.";
  return "Continuez à vous entraîner !";
};

const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
  };
  return labels[difficulty] || difficulty;
};

const getModeLabel = (mode) => {
  const labels = {
    solo: "Solo",
    multi: "Multijoueur",
    tournament: "Tournoi"
  };
  return labels[mode] || mode;
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, category = "", difficulty = "", mode = "" } = location.state || {};
  
  const percentage = Math.round((score / total) * 100);
  const message = getScoreMessage(percentage);

  if (!location.state) {
    navigate("/game-mode");
    return null;
  }

  return (
    <PageTransition>
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Résultats</CardTitle>
            <CardDescription className="text-center">
              Voici le résumé de votre partie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl font-bold mb-2">
                {score}/{total}
              </div>
              <div className="text-2xl font-medium text-primary">
                {percentage}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center text-xl"
            >
              {message}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Mode de jeu</span>
                <span>{getModeLabel(mode)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Catégorie</span>
                <span>{category}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Difficulté</span>
                <span>{getDifficultyLabel(difficulty)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Questions</span>
                <span>{total} questions</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Bonnes réponses</span>
                <span>{score} réponses</span>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full"
              onClick={() => navigate("/game-mode")}
            >
              Nouvelle partie
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Retour à l'accueil
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
} 