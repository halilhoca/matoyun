import React from 'react';
import { Plus, Minus, X, Divide, Grid3x3, Target, Trophy, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DashboardProps {
  onNavigate: (page: string) => void;
  progress: {
    totalCorrect: number;
    totalAttempts: number;
    streak: number;
    levelProgress: {
      addition: number;
      subtraction: number;
      multiplication: number;
      division: number;
    };
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, progress }) => {
  // Her işlem için ayrı istatistikleri al
  const [additionStats] = useLocalStorage('gameStats_addition', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  const [subtractionStats] = useLocalStorage('gameStats_subtraction', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  const [multiplicationStats] = useLocalStorage('gameStats_multiplication', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  const [divisionStats] = useLocalStorage('gameStats_division', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  
  const allStats = [additionStats, subtractionStats, multiplicationStats, divisionStats];
  const totalCorrectAnswers = allStats.reduce((sum, stat) => sum + stat.correctAnswers, 0);
  const totalQuestions = allStats.reduce((sum, stat) => sum + stat.totalQuestions, 0);
  const bestOverallStreak = Math.max(...allStats.map(stat => stat.bestStreak), 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0;
  
  const mathOperations = [
    {
      id: 'addition',
      title: 'Toplama',
      icon: Plus,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      description: 'Sayıları toplayarak matematik becerini geliştir!',
      progress: additionStats.correctAnswers
    },
    {
      id: 'subtraction',
      title: 'Çıkarma',
      icon: Minus,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      description: 'Çıkarma işlemlerinde ustalaş!',
      progress: subtractionStats.correctAnswers
    },
    {
      id: 'multiplication',
      title: 'Çarpma',
      icon: X,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      description: 'Çarpma tablosunu öğren ve pratik yap!',
      progress: multiplicationStats.correctAnswers
    },
    {
      id: 'division',
      title: 'Bölme',
      icon: Divide,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      description: 'Bölme işlemlerini kolaylaştır!',
      progress: divisionStats.correctAnswers
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-2 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Mobile-optimized Welcome Section */}
        <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
            Matematik Oyun Merkezi'ne Hoş Geldin! 🎉
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Eğlenceli oyunlarla matematik öğrenmeye hazır mısın? Hangi işlemle başlamak istiyorsun?
          </p>
        </div>

        {/* Mobile-optimized Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Doğru</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{totalCorrectAnswers}</p>
              </div>
              <Target className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Başarı Oranı</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{overallAccuracy}%</p>
              </div>
              <Trophy className="h-8 w-8 md:h-10 md:w-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Uzun Seri</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-600">{bestOverallStreak}</p>
              </div>
              <div className="text-orange-500 text-2xl md:text-3xl">🔥</div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Math Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mathOperations.map((operation) => {
            const IconComponent = operation.icon;
            return (
              <div
                key={operation.id}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95"
                onClick={() => onNavigate(operation.id)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`${operation.color} ${operation.hoverColor} p-4 rounded-full transition-colors`}>
                    <IconComponent className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">{operation.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 text-center">{operation.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (operation.progress / 20) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">{operation.progress} doğru cevap</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile-optimized Special Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={() => onNavigate('multiplicationTable')}
          >
            <div className="flex items-center space-x-4 text-white">
              <Grid3x3 className="h-10 w-10 md:h-12 md:w-12" />
              <div>
                <h3 className="text-lg md:text-xl font-bold">Çarpım Tablosu</h3>
                <p className="text-orange-100 text-sm md:text-base">1'den 10'a kadar çarpım tablosunu öğren!</p>
              </div>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={() => onNavigate('progress')}
          >
            <div className="flex items-center space-x-4 text-white">
              <BookOpen className="h-10 w-10 md:h-12 md:w-12" />
              <div>
                <h3 className="text-lg md:text-xl font-bold">İlerleme Raporu</h3>
                <p className="text-purple-100 text-sm md:text-base">Başarılarını ve gelişimini takip et!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Motivational Message */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Harika Gidiyorsun! 🌟</h2>
          <p className="text-sm md:text-lg text-blue-100">
            Matematik öğrenmek için her gün biraz pratik yapmayı unutma. Sen yapabilirsin!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;