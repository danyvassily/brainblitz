document.addEventListener("alpine:init", () => {
  Alpine.data("gameState", () => ({
    score: 0,
    currentLevel: 1,
    isPlaying: false,
    currentQuestion: null,
    showFeedback: false,
    feedbackMessage: "",
    feedbackClass: "",
    token: Alpine.$persist(null).as("gameToken"),
    username: "",
    password: "",
    showRegister: false,
    socket: null,
    timeLeft: 0,
    categories: [],
    selectedCategory: null,
    selectedCategoryName: "",
    gameMode: null,
    isConnected: false,

    init() {
      if (this.token) {
        this.initializeSocket();
      }
    },

    initializeSocket() {
      console.log("Initialisation de Socket.IO...");
      this.socket = io("http://localhost:3001", {
        auth: {
          token: this.token,
        },
        withCredentials: true,
        transports: ["websocket"],
      });

      this.setupSocketListeners();
    },

    setupSocketListeners() {
      if (!this.socket) return;

      this.socket.on("connect", () => {
        console.log("✅ Connecté au serveur Socket.IO");
        this.isConnected = true;
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion Socket.IO:", error);
        this.isConnected = false;
        if (error.message === "Authentication error") {
          this.token = null;
        }
      });

      this.socket.on("disconnect", () => {
        console.log("❌ Déconnecté du serveur Socket.IO");
        this.isConnected = false;
      });

      this.socket.on("categories", (data) => {
        console.log("📚 Catégories reçues:", data);
        this.categories = data;
      });

      this.socket.on("category_selected", (data) => {
        console.log("✅ Catégorie sélectionnée:", data);
        this.selectedCategoryName = data.name;
      });

      this.socket.on("question", (data) => {
        console.log("❓ Question reçue:", data);
        console.log("État du jeu:", {
          isPlaying: this.isPlaying,
          currentLevel: this.currentLevel,
          gameContainer: document.getElementById("game-container"),
          data: data,
        });

        if (!this.isPlaying) {
          console.log("Forçage de isPlaying à true");
          this.isPlaying = true;
        }

        this.currentQuestion = {
          ...data,
          startTime: Date.now(),
        };
        this.currentLevel = data.questionNumber;
        this.timeLeft = data.timeLeft;
        this.showFeedback = false;

        this.$nextTick(() => {
          const gameContainer = document.getElementById("game-container");
          console.log("Container après nextTick:", gameContainer);

          if (!gameContainer) {
            console.error("❌ game-container non trouvé!");
            console.log("DOM actuel:", document.body.innerHTML);
            return;
          }

          try {
            const questionHTML = this.generateQuestionHTML(data);
            console.log("HTML généré:", questionHTML);

            if (!questionHTML) {
              console.error("❌ Erreur: HTML de question non généré");
              gameContainer.innerHTML =
                '<div class="text-red-600">Erreur: Impossible de charger la question</div>';
              return;
            }

            gameContainer.innerHTML = questionHTML;
            this.attachAnswerListeners();

            // Vérifier que les boutons sont bien attachés
            const buttons = gameContainer.querySelectorAll("[data-choice]");
            console.log("Nombre de boutons de réponse:", buttons.length);
          } catch (error) {
            console.error(
              "❌ Erreur lors de la génération de la question:",
              error
            );
            gameContainer.innerHTML =
              '<div class="text-red-600">Erreur: ' + error.message + "</div>";
          }
        });
      });

      this.socket.on("time_update", (data) => {
        this.timeLeft = data.timeLeft;
        if (data.timeLeft <= 5000) {
          this.playSoundEffect("timeUpSound");
        }
      });

      this.socket.on("answer_result", (data) => {
        console.log("📝 Résultat reçu:", data);
        this.showFeedback = true;
        this.score = data.score;
        if (data.correct) {
          this.feedbackMessage = "Bonne réponse !";
          this.feedbackClass = "bg-green-50 text-green-600";
          this.playSoundEffect("correctSound");
        } else {
          this.feedbackMessage = `Incorrect. La bonne réponse était : ${data.correctAnswer}`;
          this.feedbackClass = "bg-red-50 text-red-600";
          this.playSoundEffect("incorrectSound");
        }
      });

      this.socket.on("game_over", (data) => {
        console.log("🏁 Fin du jeu:", data);
        this.isPlaying = false;
        this.playSoundEffect("gameOverSound");
        const gameContainer = document.getElementById("game-container");
        if (gameContainer) {
          gameContainer.innerHTML = this.generateGameOverHTML(data);
        }
      });

      this.socket.on("game_error", (error) => {
        console.error("❌ Erreur de jeu:", error);
        alert(error.message);
      });

      this.socket.on("player_joined", (data) => {
        console.log("👥 Joueur rejoint:", data);
        // Mettre à jour l'interface pour le mode multijoueur
      });
    },

    selectCategory(categoryId) {
      console.log("Sélection de la catégorie:", categoryId);
      this.selectedCategory = categoryId;
      this.socket.emit("select_category", categoryId);
    },

    startGame(mode) {
      console.log("Démarrage du jeu en mode:", mode);
      this.gameMode = mode;
      this.isPlaying = true;
      this.score = 0;
      this.currentLevel = 1;
      this.showFeedback = false;

      // S'assurer que le conteneur de jeu est visible
      const gameContainer = document.getElementById("game-container");
      if (gameContainer) {
        gameContainer.innerHTML =
          '<div class="text-center">Chargement de la question...</div>';
      }

      console.log("État avant émission:", {
        mode,
        categoryId: this.selectedCategory,
        isPlaying: this.isPlaying,
      });

      this.socket.emit("start_game", {
        mode: mode,
        categoryId: this.selectedCategory,
      });
    },

    submitAnswer(answer) {
      console.log("Soumission de la réponse:", answer);
      this.socket.emit("submit_answer", answer);
    },

    generateQuestionHTML(data) {
      console.log("Génération HTML pour la question:", data);
      if (!data || !data.question || !data.choices) {
        console.error("❌ Données de question invalides:", data);
        return '<div class="text-red-600">Erreur: Question invalide</div>';
      }

      const html = `
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-slate-800">${data.question}</h2>
          <div class="space-y-3">
            ${data.choices
              .map(
                (choice, index) => `
              <button 
                type="button"
                data-choice="${choice}"
                class="w-full p-4 text-left bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                ${choice}
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      `;
      console.log("HTML généré:", html);
      return html;
    },

    generateGameOverHTML(data) {
      const totalTime = Date.now() - this.currentQuestion?.startTime || 0;
      const minutes = Math.floor(totalTime / 60000);
      const seconds = Math.floor((totalTime % 60000) / 1000);

      return `
        <div class="text-center space-y-6">
          <h2 class="text-2xl font-bold text-slate-800">Quiz terminé !</h2>
          
          <div class="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <div class="text-lg">
              <p class="font-semibold text-xl mb-2">Résultats :</p>
              <p class="text-green-600">
                ✅ Score final : <span class="font-bold">${data.score}/${
        data.totalQuestions
      }</span>
              </p>
              <p class="text-blue-600">
                ⏱️ Temps total : <span class="font-bold">${minutes}min ${seconds}s</span>
              </p>
              <p class="text-slate-600 mt-2">
                ${Math.round(
                  (data.score / data.totalQuestions) * 100
                )}% de bonnes réponses
              </p>
            </div>
            
            ${
              data.reason === "time_up"
                ? '<p class="text-red-600 font-semibold">⚠️ Temps écoulé !</p>'
                : '<p class="text-green-600 font-semibold">🎉 Félicitations !</p>'
            }
          </div>

          <div class="space-y-3 mt-6">
            <button 
              type="button"
              onclick="document.querySelector('[x-data]').__x.$data.startGame()"
              class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              🔄 Rejouer ce quiz
            </button>
            <button 
              type="button"
              onclick="document.querySelector('[x-data]').__x.$data.selectedCategory = null"
              class="w-full px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              📚 Choisir une autre catégorie
            </button>
          </div>
        </div>
      `;
    },

    attachAnswerListeners() {
      const buttons = document.querySelectorAll("[data-choice]");
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const choice = button.getAttribute("data-choice");
          this.submitAnswer(choice);
        });
      });
    },

    formatTime(ms) {
      if (!ms) return "0:00";
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },

    async login() {
      try {
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        if (!response.ok) {
          throw new Error("Identifiants invalides");
        }

        const data = await response.json();
        this.token = data.token;
        this.username = "";
        this.password = "";

        // Initialiser Socket.IO après la connexion
        this.initializeSocket();
      } catch (error) {
        console.error("❌ Erreur de connexion:", error);
        alert(error.message);
      }
    },

    async register() {
      try {
        const response = await fetch("http://localhost:3001/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'inscription");
        }

        const data = await response.json();
        this.token = data.token;
        this.username = "";
        this.password = "";
        this.showRegister = false;

        // Initialiser Socket.IO après l'inscription
        this.initializeSocket();
      } catch (error) {
        console.error("❌ Erreur d'inscription:", error);
        alert(error.message);
      }
    },

    logout() {
      if (this.socket) {
        this.socket.disconnect();
      }
      this.token = null;
      this.isPlaying = false;
      this.score = 0;
      this.currentLevel = 1;
      this.selectedCategory = null;
      this.selectedCategoryName = "";
      this.categories = [];
      this.isConnected = false;
    },

    playSoundEffect(soundId) {
      const sound = document.getElementById(soundId);
      if (sound) {
        // Réinitialiser le son et le volume
        sound.currentTime = 0;
        sound.volume = 0.5; // Volume à 50%

        // Jouer le son avec gestion des erreurs
        sound.play().catch((e) => {
          console.warn("Erreur de lecture du son:", e);
          // Tentative de lecture après interaction utilisateur
          document.addEventListener(
            "click",
            () => {
              sound
                .play()
                .catch((e) => console.warn("Nouvelle erreur de lecture:", e));
            },
            { once: true }
          );
        });
      } else {
        console.warn("Son non trouvé:", soundId);
      }
    },

    // Fonction pour tester les sons
    testSounds() {
      console.log("Test des sons...");
      const sounds = [
        "correctSound",
        "incorrectSound",
        "timeUpSound",
        "gameOverSound",
      ];
      let delay = 0;

      sounds.forEach((soundId) => {
        setTimeout(() => {
          console.log("Lecture du son:", soundId);
          this.playSoundEffect(soundId);
        }, delay);
        delay += 1000; // Attendre 1 seconde entre chaque son
      });
    },
  }));
});
