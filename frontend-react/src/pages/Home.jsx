import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Quiz Variés',
      description: 'Des milliers de questions dans différentes catégories',
      bgImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80',
    },
    {
      title: 'Compétition',
      description: 'Affrontez d\'autres joueurs en temps réel',
      bgImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80',
    },
    {
      title: 'Progression',
      description: 'Suivez votre évolution et améliorez vos scores',
      bgImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full">
        <div 
          className="relative aspect-[16/10] sm:aspect-[16/8] md:aspect-[16/6] w-full bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: `url("/images/quiz-hero-bg.png")`
          }}
        >
          {/* Overlay avec gradient pour une meilleure lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 md:from-black/30 md:to-black/50"></div>
          
          {/* Conteneur de contenu avec contraintes de hauteur */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 px-2 drop-shadow-lg">
                Testez vos connaissances avec BrainBlitz
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 px-2 drop-shadow-md max-w-3xl mx-auto">
                Le quiz game qui rend l&apos;apprentissage amusant et compétitif
              </p>
              <div className="px-2">
                <Link
                  to={user ? '/game-mode' : '/auth'}
                  className="btn bg-black text-white hover:bg-gray-100 hover:scale-105 transform transition-all duration-200 font-bold py-2 md:py-3 px-6 md:px-8 rounded-full text-base md:text-lg inline-block shadow-lg"
                >
                  {user ? 'Commencer à jouer' : 'Rejoindre la communauté'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl text-black font-bold text-center mb-12">
          Pourquoi choisir BrainBlitz ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card text-center hover:shadow-lg transition-shadow rounded-xl overflow-hidden relative h-64"
              style={{
                backgroundImage: `url(${feature.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 hover:bg-opacity-40 transition-all duration-300">
                <div className="relative h-full flex flex-col justify-center items-center p-6">
                  <h3 className="text-xl text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-200">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à relever le défi ?
          </h2>
          <p className="text-xl mb-8">
            Rejoignez des milliers de joueurs et commencez à jouer dès maintenant !
          </p>
          <Link
            to={user ? '/game-mode' : '/auth'}
            className="btn bg-red-500 text-black hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg"
          >
            {user ? 'Jouer maintenant' : 'Commencer l\'aventure'}
          </Link>
        </div>
      </div>
    </div>
  );
} 