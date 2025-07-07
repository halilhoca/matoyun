import React, { useState } from 'react';
import { Calculator, Target, Trophy, Star, Home, BookOpen } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import MathGame from './components/MathGame';
import MultiplicationTable from './components/MultiplicationTable';
import Progress from './components/Progress';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userProgress, setUserProgress] = useLocalStorage('mathGameProgress', {
    totalCorrect: 0,
    totalAttempts: 0,
    streak: 0,
    badges: [],
    levelProgress: {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0
    }
  });

  const updateProgress = (operation: string, correct: boolean) => {
    setUserProgress(prev => ({
      ...prev,
      totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
      totalAttempts: prev.totalAttempts + 1,
      streak: correct ? prev.streak + 1 : 0,
      levelProgress: {
        ...prev.levelProgress,
        [operation]: prev.levelProgress[operation] + (correct ? 1 : 0)
      }
    }));
  };

  const resetProgress = () => {
    setUserProgress({
      totalCorrect: 0,
      totalAttempts: 0,
      streak: 0,
      badges: [],
      levelProgress: {
        addition: 0,
        subtraction: 0,
        multiplication: 0,
        division: 0
      }
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} progress={userProgress} />;
      case 'addition':
        return <MathGame operation="addition" onNavigate={setCurrentPage} onProgress={updateProgress} />;
      case 'subtraction':
        return <MathGame operation="subtraction" onNavigate={setCurrentPage} onProgress={updateProgress} />;
      case 'multiplication':
        return <MathGame operation="multiplication" onNavigate={setCurrentPage} onProgress={updateProgress} />;
      case 'division':
        return <MathGame operation="division" onNavigate={setCurrentPage} onProgress={updateProgress} />;
      case 'multiplicationTable':
        return <MultiplicationTable onNavigate={setCurrentPage} />;
      case 'progress':
        return <Progress progress={userProgress} onNavigate={setCurrentPage} onResetProgress={resetProgress} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} progress={userProgress} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile-optimized Navigation Header */}
      <nav className="bg-white shadow-lg border-b-4 border-blue-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <h1 className="text-sm md:text-xl font-bold text-gray-800">
                <span className="hidden sm:inline">Matematik Oyun Merkezi</span>
                <span className="sm:hidden">Matematik</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center space-x-1 px-2 md:px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Ana Sayfa</span>
              </button>
              <button
                onClick={() => setCurrentPage('progress')}
                className={`flex items-center space-x-1 px-2 md:px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'progress' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">İlerleme</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-16">
        {renderPage()}
      </main>

      {/* Mobile-optimized Footer */}
      <footer className="bg-white border-t-4 border-blue-400 fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-center text-gray-600">
            <p className="flex items-center justify-center space-x-2 text-xs md:text-sm">
              <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              <span>Matematik öğrenmek hiç bu kadar eğlenceli olmamıştı!</span>
              <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;