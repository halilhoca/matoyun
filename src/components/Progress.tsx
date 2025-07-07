import React, { useState } from 'react';
import { ArrowLeft, Trophy, Target, TrendingUp, Star, Award, Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ProgressProps {
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
  onNavigate: (page: string) => void;
  onResetProgress?: () => void;
}

const Progress: React.FC<ProgressProps> = ({ progress, onNavigate, onResetProgress }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const accuracy = progress.totalAttempts > 0 ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100) : 0;
  
  // Her işlem için ayrı istatistikleri al (şimdi setter'ları da dahil)
  const [additionStats, setAdditionStats] = useLocalStorage('gameStats_addition', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  const [subtractionStats, setSubtractionStats] = useLocalStorage('gameStats_subtraction', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  const [multiplicationStats, setMultiplicationStats] = useLocalStorage('gameStats_multiplication', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  const [divisionStats, setDivisionStats] = useLocalStorage('gameStats_division', { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 });
  
  // Başarıları al (şimdi setter'ları da dahil)
  const [additionAchievements, setAdditionAchievements] = useLocalStorage('achievements_addition', [] as string[]);
  const [subtractionAchievements, setSubtractionAchievements] = useLocalStorage('achievements_subtraction', [] as string[]);
  const [multiplicationAchievements, setMultiplicationAchievements] = useLocalStorage('achievements_multiplication', [] as string[]);
  const [divisionAchievements, setDivisionAchievements] = useLocalStorage('achievements_division', [] as string[]);
  
  const allStats = [additionStats, subtractionStats, multiplicationStats, divisionStats];
  const allAchievements = [...additionAchievements, ...subtractionAchievements, ...multiplicationAchievements, ...divisionAchievements];
  
  // Toplam istatistikler
  const totalScore = allStats.reduce((sum, stat) => sum + stat.score, 0);
  const totalCorrectAnswers = allStats.reduce((sum, stat) => sum + stat.correctAnswers, 0);
  const totalQuestions = allStats.reduce((sum, stat) => sum + stat.totalQuestions, 0);
  const bestOverallStreak = Math.max(...allStats.map(stat => stat.bestStreak), 0);
  const totalGamesPlayed = allStats.reduce((sum, stat) => sum + stat.totalGamesPlayed, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0;

  const operations = [
    { key: 'addition', name: 'Toplama', icon: '➕', color: 'green', stats: additionStats },
    { key: 'subtraction', name: 'Çıkarma', icon: '➖', color: 'red', stats: subtractionStats },
    { key: 'multiplication', name: 'Çarpma', icon: '✖️', color: 'blue', stats: multiplicationStats },
    { key: 'division', name: 'Bölme', icon: '➗', color: 'purple', stats: divisionStats }
  ];

  const getBadges = () => {
    const badges = [];
    
    // Accuracy badges
    if (overallAccuracy >= 90) badges.push({ name: 'Mükemmel Atıcı', icon: '🎯', description: '%90+ doğruluk' });
    else if (overallAccuracy >= 80) badges.push({ name: 'İyi Atıcı', icon: '🏹', description: '%80+ doğruluk' });
    else if (overallAccuracy >= 70) badges.push({ name: 'Gelişen Atıcı', icon: '🎪', description: '%70+ doğruluk' });
    
    // Streak badges
    if (bestOverallStreak >= 20) badges.push({ name: 'Süper Seri', icon: '🔥', description: '20+ seri' });
    else if (bestOverallStreak >= 10) badges.push({ name: 'Ateşli', icon: '⚡', description: '10+ seri' });
    else if (bestOverallStreak >= 5) badges.push({ name: 'Sıcak', icon: '🌟', description: '5+ seri' });
    
    // Total correct badges
    if (totalCorrectAnswers >= 100) badges.push({ name: 'Matematik Ustası', icon: '👑', description: '100+ doğru' });
    else if (totalCorrectAnswers >= 50) badges.push({ name: 'Matematik Kahramanı', icon: '🦸', description: '50+ doğru' });
    else if (totalCorrectAnswers >= 25) badges.push({ name: 'Matematik Öğrencisi', icon: '🎓', description: '25+ doğru' });
    else if (totalCorrectAnswers >= 10) badges.push({ name: 'Başlangıç', icon: '🌱', description: '10+ doğru' });
    
    // Oyun sayısı rozetleri
    if (totalGamesPlayed >= 50) badges.push({ name: 'Oyun Bağımlısı', icon: '🎮', description: '50+ oyun' });
    else if (totalGamesPlayed >= 20) badges.push({ name: 'Düzenli Oyuncu', icon: '🎯', description: '20+ oyun' });
    else if (totalGamesPlayed >= 10) badges.push({ name: 'Aktif Oyuncu', icon: '⭐', description: '10+ oyun' });
    
    // Başarı rozetlerini ekle
    if (allAchievements.length >= 10) badges.push({ name: 'Başarı Avcısı', icon: '🏆', description: '10+ başarı' });
    else if (allAchievements.length >= 5) badges.push({ name: 'Başarı Toplayıcısı', icon: '🥇', description: '5+ başarı' });
    
    return badges;
  };

  const badges = getBadges();

  // İlerleme sıfırlama fonksiyonu
  const resetAllProgress = () => {
    const initialStats = { score: 0, correctAnswers: 0, totalQuestions: 0, streak: 0, bestStreak: 0, totalGamesPlayed: 0 };
    const initialAchievements: string[] = [];

    // Tüm istatistikleri sıfırla
    setAdditionStats(initialStats);
    setSubtractionStats(initialStats);
    setMultiplicationStats(initialStats);
    setDivisionStats(initialStats);

    // Tüm başarıları sıfırla
    setAdditionAchievements(initialAchievements);
    setSubtractionAchievements(initialAchievements);
    setMultiplicationAchievements(initialAchievements);
    setDivisionAchievements(initialAchievements);

    // Ana ilerleme verilerini de sıfırla (eğer varsa)
    localStorage.removeItem('mathGameProgress');
    
    // Parent component'in reset fonksiyonunu da çağır
    if (onResetProgress) {
      onResetProgress();
    }

    setShowResetConfirm(false);
    
    // Kullanıcıya bilgi ver
    alert('Tüm ilerleme verileri başarıyla sıfırlandı! 🔄');
  };

  const getProgressLevel = (count: number) => {
    if (count >= 50) return { level: 'Uzman', color: 'purple', percentage: 100 };
    if (count >= 30) return { level: 'İleri', color: 'blue', percentage: (count / 50) * 100 };
    if (count >= 15) return { level: 'Orta', color: 'green', percentage: (count / 30) * 100 };
    if (count >= 5) return { level: 'Başlangıç', color: 'yellow', percentage: (count / 15) * 100 };
    return { level: 'Yeni', color: 'gray', percentage: (count / 5) * 100 };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Ana Sayfaya Dön</span>
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">İlerleme Raporu</h1>
          <p className="text-gray-600">Matematik yolculuğundaki başarıların</p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="hidden sm:inline">İlerlemeyi Sıfırla</span>
          <span className="sm:hidden">Sıfırla</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">İlerlemeyi Sıfırla</h2>
              <p className="text-gray-600">
                Bu işlem tüm istatistiklerinizi, skorlarınızı ve rozetlerinizi kalıcı olarak silecektir. 
                Bu işlem geri alınamaz!
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                İptal
              </button>
              <button
                onClick={resetAllProgress}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Doğru</p>
              <p className="text-3xl font-bold text-blue-600">{totalCorrectAnswers}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Başarı Oranı</p>
              <p className="text-3xl font-bold text-green-600">{overallAccuracy}%</p>
            </div>
            <Trophy className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Uzun Seri</p>
              <p className="text-3xl font-bold text-orange-600">{bestOverallStreak}</p>
            </div>
            <Zap className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Skor</p>
              <p className="text-3xl font-bold text-purple-600">{totalScore}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Operation Progress */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">İşlem Bazında İlerleme</h2>
        <div className="space-y-6">
          {operations.map(operation => {
            const count = operation.stats.correctAnswers;
            const operationAccuracy = operation.stats.totalQuestions > 0 ? 
              Math.round((operation.stats.correctAnswers / operation.stats.totalQuestions) * 100) : 0;
            const progressData = getProgressLevel(count);
            
            return (
              <div key={operation.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{operation.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{operation.name}</h3>
                      <p className="text-sm text-gray-600">
                        {count} doğru • {operationAccuracy}% başarı • {operation.stats.totalGamesPlayed} oyun
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold text-${progressData.color}-600`}>
                      {progressData.level}
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>En iyi seri: {operation.stats.bestStreak}</div>
                      <div>Skor: {operation.stats.score}</div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-${operation.color}-500 h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${progressData.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kazanılan Rozetler</h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <h3 className="font-bold">{badge.name}</h3>
                    <p className="text-sm text-yellow-100">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Henüz rozet kazanmadın. Matematik oyunlarını oynayarak rozetler kazanabilirsin!</p>
          </div>
        )}
      </div>

      {/* Motivational Messages */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Motivasyon Mesajı 🌟</h2>
        {overallAccuracy >= 90 ? (
          <p className="text-lg">
            Harika! Çok yüksek bir başarı oranına sahipsin. Matematik konusunda gerçekten yeteneklisin!
          </p>
        ) : overallAccuracy >= 80 ? (
          <p className="text-lg">
            Çok iyi gidiyorsun! Biraz daha pratik yaparak mükemmel seviyeye ulaşabilirsin.
          </p>
        ) : overallAccuracy >= 70 ? (
          <p className="text-lg">
            İyi bir başlangıç! Düzenli pratik yaparak daha da gelişebilirsin.
          </p>
        ) : (
          <p className="text-lg">
            Herkes bir yerden başlar. Sabırla ve düzenli çalışmayla muhakkak gelişeceksin. Sen yapabilirsin!
          </p>
        )}
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-sm text-blue-100">Toplam Soru</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalGamesPlayed}</div>
            <div className="text-sm text-blue-100">Oyun Sayısı</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{allAchievements.length}</div>
            <div className="text-sm text-blue-100">Başarı Sayısı</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-sm text-blue-100">Toplam Skor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;