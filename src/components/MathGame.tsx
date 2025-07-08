import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, Target, Trophy, RefreshCw, CheckCircle, XCircle, Zap, Star, Award, Brain, CloudLightning as Lightning } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface MathGameProps {
  operation: string;
  onNavigate: (page: string) => void;
  onProgress: (operation: string, correct: boolean) => void;
}

const MathGame: React.FC<MathGameProps> = ({ operation, onNavigate, onProgress }) => {
  const [currentProblem, setCurrentProblem] = useState({ num1: 0, num2: 0, answer: 0, choices: [0, 0, 0, 0] });
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [gameStats, setGameStats] = useLocalStorage(`gameStats_${operation}`, {
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    streak: 0,
    bestStreak: 0,
    totalGamesPlayed: 0
  });
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameActive, setGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameMode, setGameMode] = useState('normal');
  const [powerUps, setPowerUps] = useState({ timeBonus: 3, skipQuestion: 2, doublePoints: 2 });
  const [currentPowerUp, setCurrentPowerUp] = useState<string | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [achievements, setAchievements] = useLocalStorage(`achievements_${operation}`, [] as string[]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [fastAnswerBonus, setFastAnswerBonus] = useState(0);
  const [usedProblems, setUsedProblems] = useState<Set<string>>(new Set()); // Kullanılan soruları takip et

  const operationConfig = {
    addition: { symbol: '+', title: 'Toplama', color: 'green', emoji: '➕' },
    subtraction: { symbol: '-', title: 'Çıkarma', color: 'red', emoji: '➖' },
    multiplication: { symbol: '×', title: 'Çarpma', color: 'blue', emoji: '✖️' },
    division: { symbol: '÷', title: 'Bölme', color: 'purple', emoji: '➗' }
  };

  const config = operationConfig[operation as keyof typeof operationConfig];

  const gameModes = {
    normal: { time: 90, title: 'Normal Mod', description: '90 saniye, normal hız' },
    speed: { time: 60, title: 'Hız Modu', description: '60 saniye, hızlı geçiş' },
    challenge: { time: 120, title: 'Meydan Okuma', description: '120 saniye, zor sorular' }
  };

  const generateChoices = useCallback((correctAnswer: number) => {
    const choices = [correctAnswer];
    const usedNumbers = new Set([correctAnswer]);
    
    while (choices.length < 4) {
      let wrongAnswer;
      const variation = Math.floor(Math.random() * 15) + 1;
      
      const strategies = [
        () => correctAnswer + variation,
        () => Math.max(1, correctAnswer - variation),
        () => correctAnswer * 2,
        () => Math.max(1, Math.floor(correctAnswer / 2)),
        () => correctAnswer + (Math.random() < 0.5 ? 10 : -10),
        () => correctAnswer + Math.floor(Math.random() * 20) - 10,
        () => Math.max(1, correctAnswer - Math.floor(Math.random() * 10)),
        () => correctAnswer + Math.floor(Math.random() * 5) + 1
      ];
      
      wrongAnswer = strategies[Math.floor(Math.random() * strategies.length)]();
      
      if (!usedNumbers.has(wrongAnswer) && wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
        choices.push(wrongAnswer);
        usedNumbers.add(wrongAnswer);
      }
    }
    
    return choices.sort(() => Math.random() - 0.5);
  }, []);

  const generateProblem = useCallback(() => {
    let num1, num2, answer;
    let problemKey = '';
    let attempts = 0;
    const maxAttempts = 50; // Sonsuz döngüyü önlemek için
    
    do {
      // Geliştirilmiş zorluk seviyeleri
      const difficultyRanges = {
        easy: {
          addition: { min1: 1, max1: 10, min2: 1, max2: 10 },
          subtraction: { min1: 5, max1: 20, min2: 1, max2: 10 },
          multiplication: { min1: 2, max1: 9, min2: 2, max2: 9 }, // 2-9 arası çarpma
          division: { minAnswer: 1, maxAnswer: 10, minDivisor: 1, maxDivisor: 5 }
        },
        medium: {
          addition: { min1: 10, max1: 50, min2: 10, max2: 50 },
          subtraction: { min1: 20, max1: 100, min2: 5, max2: 50 },
          multiplication: { min1: 2, max1: 9, min2: 10, max2: 99 }, // Rakam × İki basamaklı
          division: { minAnswer: 5, maxAnswer: 25, minDivisor: 2, maxDivisor: 12 }
        },
        hard: {
          addition: { min1: 50, max1: 200, min2: 50, max2: 200 },
          subtraction: { min1: 100, max1: 500, min2: 20, max2: 200 },
          multiplication: { min1: 10, max1: 99, min2: 10, max2: 99 }, // İki basamaklı × İki basamaklı
          division: { minAnswer: 15, maxAnswer: 50, minDivisor: 5, maxDivisor: 20 }
        }
      };

      const currentRange = difficultyRanges[difficulty as keyof typeof difficultyRanges];

      switch (operation) {
        case 'addition':
          const addRange = currentRange.addition;
          num1 = Math.floor(Math.random() * (addRange.max1 - addRange.min1 + 1)) + addRange.min1;
          num2 = Math.floor(Math.random() * (addRange.max2 - addRange.min2 + 1)) + addRange.min2;
          answer = num1 + num2;
          break;
        case 'subtraction':
          const subRange = currentRange.subtraction;
          num1 = Math.floor(Math.random() * (subRange.max1 - subRange.min1 + 1)) + subRange.min1;
          num2 = Math.floor(Math.random() * (Math.min(subRange.max2, num1 - 1) - subRange.min2 + 1)) + subRange.min2;
          answer = num1 - num2;
          break;
        case 'multiplication':
          const multRange = currentRange.multiplication;
          num1 = Math.floor(Math.random() * (multRange.max1 - multRange.min1 + 1)) + multRange.min1;
          num2 = Math.floor(Math.random() * (multRange.max2 - multRange.min2 + 1)) + multRange.min2;
          answer = num1 * num2;
          break;
        case 'division':
          const divRange = currentRange.division;
          answer = Math.floor(Math.random() * (divRange.maxAnswer - divRange.minAnswer + 1)) + divRange.minAnswer;
          num2 = Math.floor(Math.random() * (divRange.maxDivisor - divRange.minDivisor + 1)) + divRange.minDivisor;
          num1 = answer * num2;
          break;
        default:
          num1 = 1;
          num2 = 1;
          answer = 2;
      }

      problemKey = `${num1}_${num2}_${operation}`;
      attempts++;
      
      // Eğer çok fazla deneme yapıldıysa, kullanılan soruları temizle
      if (attempts > maxAttempts) {
        setUsedProblems(new Set());
        break;
      }
    } while (usedProblems.has(problemKey));

    // Yeni soruyu kullanılan sorulara ekle
    setUsedProblems(prev => new Set([...prev, problemKey]));

    const choices = generateChoices(answer);
    setCurrentProblem({ num1, num2, answer, choices });
    setQuestionStartTime(Date.now());
    
    // Şık seçimini ve feedback'i temizle
    setSelectedChoice(null);
    setFeedback({ type: null, message: '' });
  }, [operation, difficulty, gameMode, generateChoices, usedProblems]);

  const checkAchievements = useCallback((newScore: number, newStreak: number) => {
    const newAchievements = [];
    
    if (newStreak >= 5 && !achievements.includes('streak5')) {
      newAchievements.push('streak5');
    }
    if (newStreak >= 10 && !achievements.includes('streak10')) {
      newAchievements.push('streak10');
    }
    if (newStreak >= 20 && !achievements.includes('streak20')) {
      newAchievements.push('streak20');
    }
    if (newScore >= 20 && !achievements.includes('score20')) {
      newAchievements.push('score20');
    }
    if (newScore >= 50 && !achievements.includes('score50')) {
      newAchievements.push('score50');
    }
    if (newScore >= 100 && !achievements.includes('score100')) {
      newAchievements.push('score100');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [achievements]);

  const usePowerUp = (powerUpType: string) => {
    if (powerUps[powerUpType as keyof typeof powerUps] <= 0) return;
    
    setPowerUps(prev => ({
      ...prev,
      [powerUpType]: prev[powerUpType as keyof typeof prev] - 1
    }));
    
    setCurrentPowerUp(powerUpType);
    
    switch (powerUpType) {
      case 'timeBonus':
        setTimeLeft(prev => prev + 15);
        setTimeout(() => setCurrentPowerUp(null), 2000);
        break;
      case 'skipQuestion':
        generateProblem();
        setTimeout(() => setCurrentPowerUp(null), 1000);
        break;
      case 'doublePoints':
        setTimeout(() => setCurrentPowerUp(null), 10000);
        break;
    }
  };

  const handleChoiceSelect = (choice: number) => {
    if (selectedChoice !== null || feedback.type !== null) return;
    
    setSelectedChoice(choice);
    const isCorrect = choice === currentProblem.answer;
    const responseTime = Date.now() - questionStartTime;
    const isFastAnswer = responseTime < 3000;
    
    // Toplam soru sayısını artır
    const newTotalQuestions = gameStats.totalQuestions + 1;
    
    if (isCorrect) {
      let points = 1;
      
      if (gameStats.streak >= 5) {
        setComboMultiplier(2);
        points *= 2;
      } else if (gameStats.streak >= 10) {
        setComboMultiplier(3);
        points *= 3;
      }
      
      if (currentPowerUp === 'doublePoints') {
        points *= 2;
      }
      
      if (isFastAnswer) {
        points += 1;
        setFastAnswerBonus(1);
      }
      
      const newScore = gameStats.score + points;
      const newStreak = gameStats.streak + 1;
      const newCorrectAnswers = gameStats.correctAnswers + 1;
      const newBestStreak = Math.max(gameStats.bestStreak, newStreak);
      
      setGameStats({
        ...gameStats,
        score: newScore,
        streak: newStreak,
        correctAnswers: newCorrectAnswers,
        totalQuestions: newTotalQuestions,
        bestStreak: newBestStreak
      });
      
      setFeedback({ 
        type: 'correct', 
        message: isFastAnswer ? 'Süper hızlı! Bonus puan! ⚡' : 'Tebrikler! Doğru cevap! 🎉' 
      });
      onProgress(operation, true);
      checkAchievements(newScore, newStreak);
    } else {
      setGameStats({
        ...gameStats,
        streak: 0,
        totalQuestions: newTotalQuestions
      });
      setComboMultiplier(1);
      setFeedback({ 
        type: 'incorrect', 
        message: `Yanlış. Doğru cevap: ${currentProblem.answer} 🤔` 
      });
      onProgress(operation, false);
    }
    
    const transitionTime = gameMode === 'speed' ? 600 : gameMode === 'normal' ? 1000 : 800;
    
    setTimeout(() => {
      setFastAnswerBonus(0);
      generateProblem();
    }, transitionTime);
  };

  const startGame = () => {
    const modeTime = gameModes[gameMode as keyof typeof gameModes].time;
    setGameActive(true);
    
    // Oyun başladığında sadece geçici değerleri sıfırla, toplam istatistikleri koru
    setGameStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    
    setTimeLeft(modeTime);
    setComboMultiplier(1);
    setCurrentPowerUp(null);
    setUsedProblems(new Set()); // Kullanılan soruları temizle
    generateProblem();
  };

  const resetGame = () => {
    setGameActive(false);
    setTimeLeft(90);
    setFeedback({ type: null, message: '' });
    setSelectedChoice(null);
    setComboMultiplier(1);
    setCurrentPowerUp(null);
    setPowerUps({ timeBonus: 3, skipQuestion: 2, doublePoints: 2 });
    setUsedProblems(new Set());
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
    return () => clearInterval(interval);
  }, [gameActive, timeLeft]);

  // Doğru doğruluk hesaplaması
  const accuracy = gameStats.totalQuestions > 0 ? Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100) : 0;

  const getChoiceStyle = (choice: number) => {
    if (selectedChoice === null && feedback.type === null) {
      return 'bg-white border-4 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-800 transform hover:scale-105 active:scale-95';
    }
    
    if (choice === currentProblem.answer) {
      return 'bg-green-500 border-4 border-green-600 text-white transform scale-105 shadow-xl';
    }
    
    if (choice === selectedChoice && choice !== currentProblem.answer) {
      return 'bg-red-500 border-4 border-red-600 text-white transform scale-95';
    }
    
    return 'bg-gray-200 border-4 border-gray-300 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-2 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Mobile-optimized Header */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center justify-center space-x-2">
                <span>{config.emoji}</span>
                <span className="hidden sm:inline">{config.title}</span>
                <span className="sm:hidden">{config.title.slice(0, 4)}</span>
                {comboMultiplier > 1 && (
                  <span className="text-orange-500 animate-pulse">x{comboMultiplier}</span>
                )}
              </h1>
            </div>
            <div className="w-20"></div>
          </div>
          
          {/* Geliştirilmiş Zorluk ve Mod Seçimi */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zorluk Seviyesi Seçimi */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Zorluk Seviyesi</h3>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { 
                      value: 'easy', 
                      label: 'Kolay', 
                      desc: operation === 'multiplication' ? '2-9 × 2-9' : 'Başlangıç seviyesi', 
                      color: 'green', 
                      icon: '🌱' 
                    },
                    { 
                      value: 'medium', 
                      label: 'Orta', 
                      desc: operation === 'multiplication' ? 'Rakam × İki basamak' : 'Dengeli seviye', 
                      color: 'yellow', 
                      icon: '⭐' 
                    },
                    { 
                      value: 'hard', 
                      label: 'Zor', 
                      desc: operation === 'multiplication' ? 'İki basamak × İki basamak' : 'Uzman seviyesi', 
                      color: 'red', 
                      icon: '🔥' 
                    }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setDifficulty(level.value)}
                      disabled={gameActive}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        difficulty === level.value 
                          ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700` 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      } ${gameActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="text-lg">{level.icon}</div>
                      <div className="text-xs font-semibold">{level.label}</div>
                      <div className="text-xs text-gray-500">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Oyun Modu Seçimi */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Oyun Modu</h3>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  className="w-full px-3 py-3 border-2 rounded-xl text-base font-medium border-blue-200 focus:border-blue-500 focus:outline-none"
                  disabled={gameActive}
                >
                  <option value="normal">🎯 Normal (90s)</option>
                  <option value="speed">⚡ Hız Modu (60s)</option>
                  <option value="challenge">🏆 Meydan Okuma (120s)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-xl p-3 shadow-md border-2 border-blue-200">
            <div className="text-center">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Skor</p>
              <p className="text-lg font-bold text-blue-600">{gameStats.score}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md border-2 border-green-200">
            <div className="text-center">
              <div className="text-green-500 text-lg mb-1">🔥</div>
              <p className="text-xs text-gray-600">Seri</p>
              <p className="text-lg font-bold text-green-600">{gameStats.streak}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md border-2 border-orange-200">
            <div className="text-center">
              <Trophy className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Doğruluk</p>
              <p className="text-lg font-bold text-orange-600">{accuracy}%</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md border-2 border-red-200">
            <div className="text-center">
              <Clock className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Süre</p>
              <p className="text-lg font-bold text-red-600">{timeLeft}s</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md border-2 border-purple-200">
            <div className="text-center">
              <Zap className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Combo</p>
              <p className="text-lg font-bold text-purple-600">x{comboMultiplier}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md border-2 border-pink-200">
            <div className="text-center">
              <Award className="h-6 w-6 text-pink-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Soru</p>
              <p className="text-lg font-bold text-pink-600">{gameStats.totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Mobile Power-ups */}
        {gameActive && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Güçlendirici Kartlar</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => usePowerUp('timeBonus')}
                disabled={powerUps.timeBonus <= 0}
                className="flex flex-col items-center space-y-1 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-400 transition-all active:scale-95"
              >
                <Clock className="h-6 w-6" />
                <span className="text-xs font-bold">+15s</span>
                <span className="text-xs">({powerUps.timeBonus})</span>
              </button>
              <button
                onClick={() => usePowerUp('skipQuestion')}
                disabled={powerUps.skipQuestion <= 0}
                className="flex flex-col items-center space-y-1 p-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:bg-gray-400 transition-all active:scale-95"
              >
                <Lightning className="h-6 w-6" />
                <span className="text-xs font-bold">Atla</span>
                <span className="text-xs">({powerUps.skipQuestion})</span>
              </button>
              <button
                onClick={() => usePowerUp('doublePoints')}
                disabled={powerUps.doublePoints <= 0 || currentPowerUp === 'doublePoints'}
                className="flex flex-col items-center space-y-1 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-400 transition-all active:scale-95"
              >
                <Star className="h-6 w-6" />
                <span className="text-xs font-bold">2x</span>
                <span className="text-xs">({powerUps.doublePoints})</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile-optimized Game Area */}
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border-2 border-gray-200">
          {!gameActive ? (
            <div className="text-center space-y-6">
              <div className="text-6xl md:text-8xl mb-4 animate-bounce">{config.emoji}</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {config.title} Oyunu
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                <h3 className="font-bold text-lg mb-2">{gameModes[gameMode as keyof typeof gameModes].title}</h3>
                <p className="text-gray-600 text-sm">{gameModes[gameMode as keyof typeof gameModes].description}</p>
              </div>
              <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
                Doğru şıkkı seç ve matematik ustası ol! Hızlı cevaplar bonus puan kazandırır!
              </p>
              <button
                onClick={startGame}
                className={`bg-${config.color}-500 hover:bg-${config.color}-600 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg text-xl w-full max-w-xs`}
              >
                <Brain className="h-6 w-6 inline mr-2" />
                Oyunu Başlat
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Power-up Display */}
              {currentPowerUp && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold animate-pulse">
                    <Star className="h-5 w-5" />
                    <span className="text-sm">
                      {currentPowerUp === 'timeBonus' && 'Zaman Bonusu Aktif!'}
                      {currentPowerUp === 'skipQuestion' && 'Soru Atlandı!'}
                      {currentPowerUp === 'doublePoints' && 'Çift Puan Aktif!'}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Problem Display */}
              <div className="text-center">
                <div className="text-4xl md:text-7xl font-bold text-gray-800 mb-6 animate-fade-in">
                  {currentProblem.num1} {config.symbol} {currentProblem.num2} = ?
                </div>
                
                {/* Fast Answer Bonus */}
                {fastAnswerBonus > 0 && (
                  <div className="text-yellow-600 font-bold text-lg mb-4 animate-bounce">
                    ⚡ Hız Bonusu! +{fastAnswerBonus} puan
                  </div>
                )}
                
                {/* Feedback */}
                {feedback.type && (
                  <div className={`flex items-center justify-center space-x-2 mb-6 animate-pulse ${
                    feedback.type === 'correct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback.type === 'correct' ? (
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8" />
                    ) : (
                      <XCircle className="h-6 w-6 md:h-8 md:w-8" />
                    )}
                    <span className="text-lg md:text-xl font-medium">{feedback.message}</span>
                  </div>
                )}

                {/* Mobile-optimized Multiple Choice */}
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {currentProblem.choices.map((choice, index) => (
                    <button
                      key={`${choice}-${index}-${currentProblem.num1}-${currentProblem.num2}`}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={selectedChoice !== null || feedback.type !== null}
                      className={`${getChoiceStyle(choice)} p-6 md:p-8 rounded-2xl font-bold text-2xl md:text-3xl transition-all duration-200 shadow-lg disabled:cursor-not-allowed min-h-[80px] md:min-h-[100px] flex items-center justify-center`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Game Over */}
          {timeLeft === 0 && (
            <div className="text-center space-y-6 mt-8">
              <div className="text-4xl md:text-6xl animate-bounce">⏰</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Süre Doldu!</h3>
              <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-xl text-gray-600 mb-2">
                  <span className="font-bold text-blue-600">{gameStats.score}</span> puan kazandın!
                </p>
                <p className="text-lg text-gray-600 mb-2">
                  {gameStats.totalQuestions} sorudan <span className="font-bold text-green-600">{gameStats.correctAnswers}</span> doğru
                </p>
                <p className="text-lg text-gray-600 mb-2">
                  Doğruluk oranı: <span className="font-bold text-orange-600">{accuracy}%</span>
                </p>
                <p className="text-lg text-gray-600">
                  En uzun seri: <span className="font-bold text-orange-600">{gameStats.bestStreak}</span>
                </p>
              </div>
              
              {/* Achievement notifications */}
              {achievements.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4 max-w-md mx-auto">
                  <h4 className="font-bold text-yellow-800 mb-2">🏆 Kazanılan Başarılar:</h4>
                  <div className="space-y-1">
                    {achievements.includes('streak5') && <p className="text-yellow-700">🔥 5 Seri Başarısı</p>}
                    {achievements.includes('streak10') && <p className="text-yellow-700">⚡ 10 Seri Ustası</p>}
                    {achievements.includes('streak20') && <p className="text-yellow-700">💫 20 Seri Efsanesi</p>}
                    {achievements.includes('score20') && <p className="text-yellow-700">🎯 20 Puan Başarısı</p>}
                    {achievements.includes('score50') && <p className="text-yellow-700">👑 50 Puan Kralı</p>}
                    {achievements.includes('score100') && <p className="text-yellow-700">🏆 100 Puan Ustası</p>}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {accuracy >= 90 && <p className="text-green-600 font-bold text-lg md:text-xl">🏆 Mükemmel! Sen bir matematik ustasısın!</p>}
                {accuracy >= 80 && accuracy < 90 && <p className="text-blue-600 font-bold text-lg md:text-xl">🌟 Harika! Çok iyi gidiyorsun!</p>}
                {accuracy >= 70 && accuracy < 80 && <p className="text-orange-600 font-bold text-lg md:text-xl">👍 İyi! Biraz daha pratik yapabilirsin!</p>}
                {accuracy < 70 && <p className="text-purple-600 font-bold text-lg md:text-xl">💪 Güzel başlangıç! Pratik yaparak gelişeceksin!</p>}
              </div>
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg text-lg w-full max-w-xs"
              >
                <RefreshCw className="h-6 w-6 inline mr-2" />
                Tekrar Oyna
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathGame;