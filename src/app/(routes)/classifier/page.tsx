<<<<<<< HEAD
//src/app/(routes)/classifier/page.tsx

'use client';
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, Image, Loader2, CheckCircle, XCircle, User, History, Sparkles } from 'lucide-react';
=======
'use client';
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, Image, Loader2, CheckCircle, XCircle, User } from 'lucide-react';
>>>>>>> 190b945223af3fff05ac5705b198bb9aa1fab3c3
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Prediction {
  rank: number;
  class: string;
  confidence: number;
}

interface LLMRecommendation {
  recommendation: string;
  recommendationReason: string;
  nutritionalInsights: string;
  suggestion: string;
}

export default function FoodClassifier() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [savingPrediction, setSavingPrediction] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [llmRecommendation, setLlmRecommendation] = useState<LLMRecommendation | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);
  
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPredictions(null);
      setError(null);
      setSaveSuccess(false);
      setLlmRecommendation(null);
    }
  };

  const savePredictionWithRecommendation = async (topPrediction: Prediction): Promise<void> => {
    if (!userEmail) {
      setError('Please login to save predictions');
      return;
    }

    setSavingPrediction(true);
    try {
      const response = await fetch('/api/save-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          foodName: topPrediction.class,
          confidence: topPrediction.confidence,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save prediction');
      }

      const data = await response.json();
      console.log('Saved prediction:', data);
      
      // Set the LLM recommendation to display
      if (data.llmRecommendation) {
        setLlmRecommendation(data.llmRecommendation);
      }

      setSaveSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error('Save prediction error:', err);
      setError(`Failed to save: ${(err as Error).message}`);
    } finally {
      setSavingPrediction(false);
    }
  };

  const handlePredict = async (): Promise<void> => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPredictions(null);
    setSaveSuccess(false);
    setLlmRecommendation(null);
    
    try {
      // Load Gradio Client dynamically
      const { Client } = await import("@gradio/client");
      
      // Connect to Hugging Face Space
      const client = await Client.connect("crbit/bangladeshi-food-classifier");
      
      // Call the predict endpoint with the image
      const result = await client.predict("/predict_image", { 
        image: selectedImage,
        top_k: 5,
      });
      
      console.log('HF Response:', result.data);
      
<<<<<<< HEAD
=======
      // Parse the response structure: result.data[0].confidences
>>>>>>> 190b945223af3fff05ac5705b198bb9aa1fab3c3
      // @ts-ignore
      if (result.data && result.data.length > 0) {
        // @ts-ignore
        const responseData = result.data[0];
        
        if (responseData.confidences && Array.isArray(responseData.confidences)) {
          const formattedPredictions: Prediction[] = responseData.confidences.map((pred: any, index: number) => ({
            rank: index + 1,
            class: pred.label || 'Unknown',
            confidence: pred.confidence * 100
          }));
          
          setPredictions(formattedPredictions);
          
<<<<<<< HEAD
          // Automatically save the highest prediction with LLM recommendation
          if (formattedPredictions.length > 0) {
            await savePredictionWithRecommendation(formattedPredictions[0]);
=======
          // Automatically save the highest prediction
          if (formattedPredictions.length > 0) {
            await savePrediction(formattedPredictions[0]);
>>>>>>> 190b945223af3fff05ac5705b198bb9aa1fab3c3
          }
        } else {
          throw new Error('No confidences array found in response');
        }
      } else {
        throw new Error('No predictions returned from model');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(`Failed to get prediction: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (): void => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPredictions(null);
    setError(null);
    setSaveSuccess(false);
    setLlmRecommendation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (confidence: number): string => {
    if (confidence >= 70) return 'bg-green-500';
    if (confidence >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation?.toLowerCase()) {
      case 'good':
        return 'bg-green-50 border-green-300 text-green-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'avoid':
        return 'bg-red-50 border-red-300 text-red-800';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'good':
        return '✅';
      case 'moderate':
        return '⚠️';
      case 'avoid':
        return '❌';
      default:
        return '💡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍽️ Bangladeshi Food Classification AI
          </h1>
          <p className="text-gray-600">
<<<<<<< HEAD
            Upload an image of Bangladeshi food and get AI-powered nutritional insights
=======
            Upload an image of Bangladeshi food and let AI identify it for you
>>>>>>> 190b945223af3fff05ac5705b198bb9aa1fab3c3
          </p>
          {userEmail && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <p className="text-sm text-gray-500">
                Logged in as: {userEmail}
              </p>
            </div>
          )}
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Prediction saved successfully with AI recommendations!
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Image
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {!previewUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-3"
              >
                <Image className="w-16 h-16 text-gray-400" />
                <span className="text-gray-600 font-medium text-center px-4">
                  Click to upload an image
                </span>
                <span className="text-sm text-gray-500">
                  JPG, JPEG, PNG supported
                </span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePredict}
                    disabled={isLoading || savingPrediction}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : savingPrediction ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Getting AI Insights...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Classify Food
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isLoading || savingPrediction}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Prediction Results
            </h2>
            {!predictions ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>Upload and classify an image to see results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Top Prediction Highlight */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                  <div className="text-sm font-medium mb-1">Top Prediction (Saved)</div>
                  <div className="text-2xl font-bold break-words">{predictions[0].class}</div>
                  <div className="text-lg font-semibold mt-1">
                    {predictions[0].confidence.toFixed(2)}% confidence
                  </div>
                </div>

                {/* All Predictions */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Top 5 Predictions:
                  </div>
                  {predictions.map((pred: Prediction) => (
                    <div
                      key={pred.rank}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 flex-1 mr-2 break-words">
                          {pred.rank}. {pred.class}
                        </span>
                        <span className={`font-bold ${getConfidenceColor(pred.confidence)} whitespace-nowrap`}>
                          {pred.confidence.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getConfidenceBgColor(pred.confidence)} transition-all duration-500`}
                          style={{ width: `${pred.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* AI Recommendation Section */}
        {llmRecommendation && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                AI Nutritional Insights
              </h2>
            </div>

            {/* Recommendation Badge */}
            <div className={`p-4 rounded-lg border-2 mb-4 ${getRecommendationColor(llmRecommendation.recommendation)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getRecommendationIcon(llmRecommendation.recommendation)}</span>
                <h3 className="text-xl font-bold capitalize">
                  {llmRecommendation.recommendation} Choice for You
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                {llmRecommendation.recommendationReason}
              </p>
            </div>

            {/* Nutritional Insights */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Nutritional Insights</h4>
                <p className="text-sm text-blue-700">
                  {llmRecommendation.nutritionalInsights}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Suggestion</h4>
                <p className="text-sm text-green-700">
                  {llmRecommendation.suggestion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            About This Classifier
          </h3>
          <p className="text-gray-600">
            This AI model uses computer vision to identify Bangladeshi food items and provides 
            personalized nutritional recommendations based on your health profile, goals, and dietary preferences.
          </p>
=======
        {/* Info Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ℹ️ About This Classifier
          </h3>
          <p className="text-gray-600">
            This AI model is hosted on Hugging Face Spaces and can identify various Bangladeshi food items. 
            Simply upload an image and get instant predictions with confidence scores.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Powered by NextViT Model • Hosted on Hugging Face Spaces</p>
>>>>>>> 190b945223af3fff05ac5705b198bb9aa1fab3c3
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
