// "use client"

// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import React from 'react'

// function page() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/signin"); 
//     }
//   }, [status, router]);

//   if (status === "loading") {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="text-xl text-gray-600">Loading...</div>
//     </div>
//   );
//   }
//   return (
//     <div>Check</div>
//   )
// }

// export default page
















'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

interface Prediction {
  rank: number;
  class: string;
  confidence: number;
}

export default function FoodClassifier() {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allClasses, setAllClasses] = useState<string[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkConnection = async (): Promise<void> => {
    if (!apiUrl.trim()) {
      setError('Please enter the ngrok URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConnectionAttempts(prev => prev + 1);

    try {
      const url = apiUrl.trim().replace(/\/$/, '');
      
      // Try both with and without /api prefix
      let response: Response;
      let finalUrl: string = url;
      
      try {
        response = await fetch(`${url}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          mode: 'cors',
          credentials: 'omit',
        });
      } catch (err) {
        // Try with /api prefix
        console.log('Trying /api prefix...');
        response = await fetch(`${url}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          mode: 'cors',
          credentials: 'omit',
        });
        finalUrl = `${url}/api`;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: { status: string; model_loaded: boolean } = await response.json();
      
      if (data.status === 'healthy' && data.model_loaded) {
        setIsConnected(true);
        setError(null);
        setApiUrl(finalUrl); // Update with working URL
        
        // Fetch all classes
        try {
          const classesResponse = await fetch(`${finalUrl}/classes`, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const classesData: { classes: string[] } = await classesResponse.json();
          setAllClasses(classesData.classes || []);
        } catch (e) {
          console.log('Could not fetch classes:', e);
        }
      } else {
        setError('Model not loaded on server');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(
        connectionAttempts === 0 
          ? 'Failed to connect. Make sure you visited the ngrok URL in your browser first to bypass the warning page!'
          : 'Still cannot connect. Please check: 1) Server is running 2) URL is correct 3) You clicked "Visit Site" on ngrok warning page'
      );
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  const handlePredict = async (): Promise<void> => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    if (!isConnected) {
      setError('Please connect to API first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const url = apiUrl.trim().replace(/\/$/, '');
      const response = await fetch(`${url}/predict?top_k=5`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: { success: boolean; predictions: Prediction[]; detail?: string } = await response.json();
      
      if (data.success) {
        setPredictions(data.predictions);
      } else {
        setError('Prediction failed: ' + (data.detail || 'Unknown error'));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍽️ Food Classification AI
          </h1>
          <p className="text-gray-600">
            Upload an image of food and let AI identify it for you
          </p>
        </div>

        {/* API Connection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">API Connection</h2>
          </div>
          
          {!isConnected && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <strong>Important:</strong> Before connecting, visit your ngrok URL in a browser first: <br />
                  <a href={apiUrl || 'https://your-url.ngrok-free.app'} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                    {apiUrl || 'Paste your URL above first'}
                  </a>
                  <br />
                  Click "Visit Site" on the ngrok warning page, then come back here and click Connect.
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste your ngrok URL (e.g., https://xxxx.ngrok-free.app)"
              value={apiUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setApiUrl(e.target.value);
                setConnectionAttempts(0);
              }}
              disabled={isConnected}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm"
            />
            <button
              onClick={checkConnection}
              disabled={isLoading || isConnected}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Connecting...</span>
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Connected</span>
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>

          {isConnected && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 flex-1">Successfully connected to API!</span>
              <button
                onClick={() => {
                  setIsConnected(false);
                  setApiUrl('');
                  setConnectionAttempts(0);
                  handleReset();
                }}
                className="text-sm text-green-700 hover:text-green-900 underline whitespace-nowrap"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

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
              disabled={!isConnected}
            />

            {!previewUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="w-16 h-16 text-gray-400" />
                <span className="text-gray-600 font-medium text-center px-4">
                  {isConnected ? 'Click to upload an image' : 'Connect to API first'}
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
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Classify Food
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isLoading}
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
                  <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>Upload and classify an image to see results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Top Prediction Highlight */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                  <div className="text-sm font-medium mb-1">Top Prediction</div>
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

        {/* Available Classes Info */}
        {isConnected && allClasses.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Available Food Classes ({allClasses.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {allClasses.map((cls: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Powered by NextViT Model </p>
        </div>
      </div>
    </div>
  );
}