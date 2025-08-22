'use client';

import { useState } from 'react';
import { Question, Response } from '@/types';
import { evaluationService } from '@/lib/firestore';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EvaluationFormProps {
  evaluationId: string;
  questions: Question[];
  onSubmit: () => void;
  onCancel: () => void;
}

export default function EvaluationForm({ 
  evaluationId, 
  questions, 
  onSubmit, 
  onCancel 
}: EvaluationFormProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleResponseChange = (questionId: string, value: number | string) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId, value, type: currentQuestion.type };
        return updated;
      } else {
        return [...prev, { questionId, value, type: currentQuestion.type }];
      }
    });
  };

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === currentQuestion.id);
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const response = getCurrentResponse();
    if (currentQuestion.type === 'slider') {
      return response && typeof response.value === 'number' && response.value >= 1 && response.value <= 10;
    } else {
      return response && typeof response.value === 'string' && response.value.trim().length > 0;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setLoading(true);
    setError('');

    try {
      await evaluationService.submitEvaluation(evaluationId, responses);
      onSubmit();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit evaluation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = () => {
    const response = getCurrentResponse();

    if (currentQuestion.type === 'slider') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={response?.value || 5}
            onChange={(e) => handleResponseChange(currentQuestion.id, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-blue-600">
              {response?.value || 5}
            </span>
            <span className="text-sm text-gray-500 ml-2">/ 10</span>
          </div>
        </div>
      );
    } else {
      return (
        <textarea
          value={response?.value || ''}
          onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your response here..."
        />
      );
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">{currentQuestion.text}</h2>
            {currentQuestion.required && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            )}
          </div>
          {currentQuestion.category && (
            <p className="text-sm text-gray-500">Category: {currentQuestion.category}</p>
          )}
        </div>

        {/* Response Input */}
        <div className="mb-6">
          {renderQuestion()}
        </div>

        {/* Validation Message */}
        {!canProceed() && currentQuestion.required && (
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {currentQuestion.type === 'slider' 
                ? 'Please select a rating between 1 and 10' 
                : 'Please provide a response'
              }
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            {!isFirstQuestion && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Previous
              </button>
            )}

            {!isLastQuestion ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Submit Evaluation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
