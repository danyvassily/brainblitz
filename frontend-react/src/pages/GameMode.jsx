import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { categoryService } from "../services/categoryService";

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Facile" },
  { value: "medium", label: "Moyen" },
  { value: "hard", label: "Difficile" },
];

export default function GameMode() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleStartGame = () => {
    if (!selectedMode || !selectedDifficulty || !selectedCategory) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un mode de jeu, une difficulté et une catégorie.",
        variant: "destructive",
      });
      return;
    }

    const selectedCategoryData = categories.find(cat => cat.value === selectedCategory);

    navigate("/game", {
      state: {
        mode: selectedMode,
        difficulty: selectedDifficulty,
        category: selectedCategory,
        questions: selectedCategoryData?.questions || []
      },
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mode Solo */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === "solo" ? "ring-2 ring-primary" : ""
        }`} onClick={() => setSelectedMode("solo")}>
          <CardHeader>
            <CardTitle>Mode Solo</CardTitle>
            <CardDescription>
              Testez vos connaissances en jouant seul contre le temps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="w-20 h-20 text-primary" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Mode Multijoueur */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === "multi" ? "ring-2 ring-primary" : ""
        }`} onClick={() => setSelectedMode("multi")}>
          <CardHeader>
            <CardTitle>Mode Multijoueur</CardTitle>
            <CardDescription>
              Affrontez d'autres joueurs en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="w-20 h-20 text-primary" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Mode Tournoi */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === "tournament" ? "ring-2 ring-primary" : ""
        }`} onClick={() => setSelectedMode("tournament")}>
          <CardHeader>
            <CardTitle>Mode Tournoi</CardTitle>
            <CardDescription>
              Participez à des tournois et grimpez dans le classement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="w-20 h-20 text-primary" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulté</label>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une difficulté" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Catégorie</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Chargement des catégories..." : "Sélectionnez une catégorie"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleStartGame}
          disabled={!selectedMode || !selectedDifficulty || !selectedCategory || loading}
        >
          Commencer la partie
        </Button>
      </div>
    </div>
  );
} 