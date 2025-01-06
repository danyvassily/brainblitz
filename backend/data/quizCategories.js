module.exports = {
  geographie: {
    name: "Géographie",
    description: "Testez vos connaissances en géographie mondiale",
    questions: [
      {
        question: "Quelle est la capitale de la France ?",
        choices: ["Londres", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris",
      },
      {
        question: "Quel est le plus grand pays du monde ?",
        choices: ["Chine", "États-Unis", "Canada", "Russie"],
        correctAnswer: "Russie",
      },
    ],
  },
  histoire: {
    name: "Histoire",
    description: "Explorez l'histoire du monde",
    questions: [
      {
        question: "En quelle année a eu lieu la Révolution française ?",
        choices: ["1789", "1792", "1799", "1804"],
        correctAnswer: "1789",
      },
      {
        question: "Qui était le premier président des États-Unis ?",
        choices: [
          "Thomas Jefferson",
          "John Adams",
          "George Washington",
          "Benjamin Franklin",
        ],
        correctAnswer: "George Washington",
      },
    ],
  },
  sciences: {
    name: "Sciences",
    description: "Testez vos connaissances scientifiques",
    questions: [
      {
        question: "Quel est le symbole chimique de l'or ?",
        choices: ["Ag", "Au", "Fe", "Cu"],
        correctAnswer: "Au",
      },
      {
        question: "Quelle est la planète la plus proche du Soleil ?",
        choices: ["Venus", "Mars", "Mercure", "Jupiter"],
        correctAnswer: "Mercure",
      },
    ],
  },
};
