import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface MultiplicationTableProps {
  onNavigate: (page: string) => void;
}

const MultiplicationTable: React.FC<MultiplicationTableProps> = ({ onNavigate }) => {
  const [selectedTable, setSelectedTable] = useState(1);
  const [showAnswers, setShowAnswers] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const generateTable = (number: number) => {
    return Array.from({ length: 10 }, (_, i) => ({
      multiplier: i + 1,
      product: number * (i + 1)
    }));
  };

  const handleQuizAnswer = (multiplier: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${selectedTable}_${multiplier}`]: answer
    }));
  };

  const checkQuizAnswers = () => {
    setShowQuizResults(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  const getQuizResult = (multiplier: number) => {
    const key = `${selectedTable}_${multiplier}`;
    const userAnswer = parseInt(quizAnswers[key] || '');
    const correctAnswer = selectedTable * multiplier;
    
    if (isNaN(userAnswer)) return null;
    return userAnswer === correctAnswer;
  };

  const calculateQuizScore = () => {
    let correct = 0;
    let total = 0;
    
    for (let i = 1; i <= 10; i++) {
      const result = getQuizResult(i);
      if (result !== null) {
        total++;
        if (result) correct++;
      }
    }
    
    return { correct, total };
  };

  const tableData = generateTable(selectedTable);
  const { correct, total } = calculateQuizScore();

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
          <h1 className="text-3xl font-bold text-gray-800">Çarpım Tablosu</h1>
          <p className="text-gray-600">Çarpım tablolarını öğren ve pratik yap!</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setQuizMode(!quizMode)}
            className={`px-4 py-2 rounded-lg transition-all ${
              quizMode 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {quizMode ? 'Öğrenme Modu' : 'Quiz Modu'}
          </button>
        </div>
      </div>

      {/* Table Selector */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Çarpım Tablosu Seç</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => {
                setSelectedTable(num);
                resetQuiz();
              }}
              className={`w-12 h-12 rounded-lg font-bold transition-all ${
                selectedTable === num
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedTable} Çarpım Tablosu
          </h2>
          
          {!quizMode && (
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showAnswers ? 'Cevapları Gizle' : 'Cevapları Göster'}</span>
            </button>
          )}

          {quizMode && (
            <div className="flex space-x-2">
              {showQuizResults && (
                <div className="text-lg font-bold text-blue-600">
                  Skor: {correct}/{total}
                </div>
              )}
              <button
                onClick={checkQuizAnswers}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Kontrol Et
              </button>
              <button
                onClick={resetQuiz}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Table Display */}
        <div className="space-y-3">
          {tableData.map(({ multiplier, product }) => (
            <div
              key={multiplier}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                quizMode && showQuizResults
                  ? getQuizResult(multiplier) === true
                    ? 'border-green-300 bg-green-50'
                    : getQuizResult(multiplier) === false
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-800">
                  {selectedTable} × {multiplier} =
                </div>
                
                {quizMode ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={quizAnswers[`${selectedTable}_${multiplier}`] || ''}
                      onChange={(e) => handleQuizAnswer(multiplier, e.target.value)}
                      className="w-20 px-3 py-2 border rounded-lg text-center font-bold text-lg focus:border-blue-500 focus:outline-none"
                      placeholder="?"
                    />
                    {showQuizResults && (
                      <div className="flex items-center">
                        {getQuizResult(multiplier) === true ? (
                          <div className="text-green-600 font-bold">✓</div>
                        ) : getQuizResult(multiplier) === false ? (
                          <div className="text-red-600 font-bold">✗ ({product})</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {showAnswers ? product : '?'}
                  </div>
                )}
              </div>

              <div className="text-4xl">
                {multiplier <= 3 ? '🌟' : multiplier <= 6 ? '⭐' : multiplier <= 9 ? '🎯' : '🏆'}
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Results */}
        {quizMode && showQuizResults && total > 0 && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-2">Quiz Sonuçları</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correct}</div>
                <div className="text-sm text-gray-600">Doğru</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{total - correct}</div>
                <div className="text-sm text-gray-600">Yanlış</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {total > 0 ? Math.round((correct / total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Başarı</div>
              </div>
            </div>
            {correct === total && (
              <div className="text-center mt-4 text-green-600 font-bold">
                🎉 Tebrikler! Tüm soruları doğru cevapladın! 🎉
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">💡 İpucu</h3>
        <p className="text-purple-100">
          Çarpım tablosunu öğrenmek için önce küçük sayılarla başla. Her gün biraz pratik yaparak
          kolayca öğrenebilirsin. Çarpma aslında tekrar tekrar toplama işlemidir!
        </p>
      </div>
    </div>
  );
};

export default MultiplicationTable;