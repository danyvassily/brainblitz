const crypto = require("crypto");
const quizCategories = require("../data/quizCategories");

class GameController {
  constructor() {
    this.lobbies = new Map();
    this.timers = new Map();
  }

  createLobby(socket, mode) {
    const lobbyId = crypto.randomBytes(4).toString("hex");
    const joinLink = `${
      process.env.BASE_URL || "http://localhost:3000"
    }/join/${lobbyId}`;

    this.lobbies.set(lobbyId, {
      id: lobbyId,
      host: socket.username,
      players: [socket.username],
      mode: mode,
      currentQuestion: 0,
      scores: new Map([[socket.username, 0]]),
      status: "waiting",
      category: null,
      questions: [],
      startTime: null,
    });

    return { lobbyId, joinLink };
  }

  startGame(io, socket, category, mode = "solo") {
    console.log("🎮 Démarrage du jeu:", {
      mode,
      category,
      username: socket.username,
    });

    const lobbyId =
      mode === "solo"
        ? `solo_${socket.username}`
        : Array.from(socket.rooms).find((room) => room !== socket.id);
    console.log("📍 LobbyId:", lobbyId);

    // Créer un nouveau lobby si c'est en mode solo
    if (mode === "solo") {
      this.lobbies.set(lobbyId, {
        id: lobbyId,
        host: socket.username,
        players: [socket.username],
        mode: "solo",
        currentQuestion: 0,
        scores: new Map([[socket.username, 0]]),
        status: "playing",
        category: null,
        questions: [],
        startTime: null,
      });
      socket.join(lobbyId);
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      console.error("❌ Lobby non trouvé:", lobbyId);
      socket.emit("game_error", {
        message: "Erreur lors de la création du lobby",
      });
      return;
    }

    // Récupérer les questions de la catégorie
    const categoryData = quizCategories[category];
    if (!categoryData || !categoryData.questions) {
      console.error("❌ Catégorie ou questions non trouvées:", category);
      socket.emit("game_error", { message: "Catégorie non trouvée" });
      return;
    }

    console.log("📚 Questions chargées:", categoryData.questions.length);

    lobby.questions = [...categoryData.questions];
    lobby.category = category;
    lobby.status = "playing";
    lobby.startTime = Date.now();
    lobby.currentQuestion = 0;

    // Émettre l'événement game_started
    socket.emit("game_started", {
      id: lobbyId,
      category: category,
      mode: mode,
      totalQuestions: categoryData.questions.length,
    });

    console.log("🎯 Envoi de la première question...");

    // Démarrer le jeu
    this.sendQuestion(io, lobbyId);
    this.startTimer(io, lobbyId);
  }

  startTimer(io, lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    const questionTime = 30000; // 30 secondes par question
    let timeLeft = questionTime;

    // Arrêter le timer précédent s'il existe
    if (this.timers.has(lobbyId)) {
      clearInterval(this.timers.get(lobbyId));
    }

    const timer = setInterval(() => {
      timeLeft -= 1000;

      // Envoyer la mise à jour du temps
      io.to(lobbyId).emit("time_update", { timeLeft });

      // Si le temps est écoulé
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.handleTimeUp(io, lobbyId);
      }
    }, 1000);

    this.timers.set(lobbyId, timer);
  }

  handleTimeUp(io, lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    // Passer à la question suivante
    lobby.currentQuestion++;

    if (lobby.currentQuestion >= lobby.questions.length) {
      this.endGame(io, lobbyId, "time_up");
    } else {
      this.sendQuestion(io, lobbyId);
      this.startTimer(io, lobbyId);
    }
  }

  sendQuestion(io, lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      console.error("❌ Lobby non trouvé lors de l'envoi de la question");
      return;
    }

    if (lobby.currentQuestion >= lobby.questions.length) {
      console.log("🏁 Fin du jeu - Plus de questions");
      this.endGame(io, lobbyId, "completed");
      return;
    }

    const question = lobby.questions[lobby.currentQuestion];
    console.log("❓ Envoi de la question:", {
      questionNumber: lobby.currentQuestion + 1,
      totalQuestions: lobby.questions.length,
      question: question.question,
    });

    io.to(lobbyId).emit("question", {
      question: question.question,
      choices: question.choices,
      questionNumber: lobby.currentQuestion + 1,
      totalQuestions: lobby.questions.length,
      timeLeft: 30000, // 30 secondes par question
    });
  }

  handleAnswer(io, socket, answer, lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    const question = lobby.questions[lobby.currentQuestion];
    const isCorrect = answer === question.correctAnswer;

    if (isCorrect) {
      const currentScore = lobby.scores.get(socket.username) || 0;
      lobby.scores.set(socket.username, currentScore + 1);
    }

    // Arrêter le timer pour cette question
    if (this.timers.has(lobbyId)) {
      clearInterval(this.timers.get(lobbyId));
      this.timers.delete(lobbyId);
    }

    // Envoyer le résultat au joueur
    socket.emit("answer_result", {
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      score: lobby.scores.get(socket.username),
    });

    // Passer à la question suivante
    lobby.currentQuestion++;

    // Attendre un peu avant d'envoyer la prochaine question
    setTimeout(() => {
      if (lobby.currentQuestion >= lobby.questions.length) {
        this.endGame(io, lobbyId, "completed");
      } else {
        this.sendQuestion(io, lobbyId);
        this.startTimer(io, lobbyId);
      }
    }, 2000);
  }

  endGame(io, lobbyId, reason = "completed") {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    // Arrêter le timer
    if (this.timers.has(lobbyId)) {
      clearInterval(this.timers.get(lobbyId));
      this.timers.delete(lobbyId);
    }

    const results = Array.from(lobby.scores.entries()).map(
      ([username, score]) => ({
        username,
        score,
      })
    );

    io.to(lobbyId).emit("game_over", {
      scores: results,
      totalQuestions: lobby.questions.length,
      reason: reason,
      timeTaken: Date.now() - lobby.startTime,
    });

    // Nettoyer les ressources
    this.lobbies.delete(lobbyId);
  }

  joinLobby(io, socket, lobbyId) {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      socket.emit("game_error", { message: "Lobby non trouvé" });
      return false;
    }

    if (lobby.status !== "waiting") {
      socket.emit("game_error", { message: "La partie a déjà commencé" });
      return false;
    }

    lobby.players.push(socket.username);
    lobby.scores.set(socket.username, 0);

    socket.join(lobbyId);

    io.to(lobbyId).emit("player_joined", {
      username: socket.username,
      players: lobby.players,
    });

    return true;
  }
}

module.exports = new GameController();
