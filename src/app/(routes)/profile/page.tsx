'use client';
import React, { useState, useEffect } from 'react';
import { User, Calendar, TrendingUp, Activity, Utensils, ArrowLeft, Loader2, Sparkles, Target, Heart, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Prediction {
  id: number;
  userEmail: string;
  foodName: string;
  imageUrl?: string;
  calories: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  confidence: number;
  servingSize?: string;
  recommendation?: string;
  recommendationReason?: string;
  createdAt: string;
}

interface UserData {
  name: string;
  email: string;
  age: number;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  goal: string;
  targetWeight?: string;
  dietaryPreference?: string;
  allergies?: string;
  medicalConditions?: string;
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
  createdAt: string;
}

interface Stats {
  totalPredictions: number;
  totalCalories: number;
  averageConfidence: number;
}

interface ProfileData {
  user: UserData;
  predictions: Prediction[];
  summary: Stats;
}

export default function NutritionInsightsPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    const fetchProfile = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/get-predictions?userEmail=${encodeURIComponent(session.user.email)}&limit=50`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        
        // Fetch user data
        const userResponse = await fetch(`/api/get-user?email=${encodeURIComponent(session.user.email)}`);
        let userData = null;
        
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          userData = userResult.user;
        }

        setProfileData({
          user: userData || {
            name: session.user.name || 'User',
            email: session.user.email,
            age: 0,
            gender: 'not specified',
            weight: '0',
            height: '0',
            activityLevel: 'not specified',
            goal: 'not specified',
            createdAt: new Date().toISOString()
          },
          predictions: data.predictions,
          summary: data.summary
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, session, router]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMemberSince = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getRecommendationColor = (recommendation?: string): string => {
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

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'moderate':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'avoid':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTodayStats = () => {
    if (!profileData) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPredictions = profileData.predictions.filter(pred => {
      const predDate = new Date(pred.createdAt);
      predDate.setHours(0, 0, 0, 0);
      return predDate.getTime() === today.getTime();
    });

    const todayCalories = todayPredictions.reduce((sum, pred) => sum + pred.calories, 0);
    const todayProtein = todayPredictions.reduce((sum, pred) => sum + parseFloat(pred.protein || '0'), 0);
    const todayCarbs = todayPredictions.reduce((sum, pred) => sum + parseFloat(pred.carbs || '0'), 0);
    const todayFat = todayPredictions.reduce((sum, pred) => sum + parseFloat(pred.fat || '0'), 0);

    return {
      count: todayPredictions.length,
      calories: todayCalories,
      protein: todayProtein,
      carbs: todayCarbs,
      fat: todayFat
    };
  };

  const formatActivityLevel = (level: string) => {
    return level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatGoal = (goal: string) => {
    return goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your nutrition insights...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
            <Link
              href="/classifier"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Classifier
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, predictions, summary } = profileData;
  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Nutrition Insights</h1>
            <p className="text-gray-600">Track your food intake and get personalized recommendations</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium text-gray-800">{user.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium text-gray-800 capitalize">{user.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium text-gray-800">{user.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium text-gray-800">{user.weight} kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Goals & Activity</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium text-gray-800">{formatGoal(user.goal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activity Level:</span>
                <span className="font-medium text-gray-800">{formatActivityLevel(user.activityLevel)}</span>
              </div>
              {user.targetWeight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Weight:</span>
                  <span className="font-medium text-gray-800">{user.targetWeight} kg</span>
                </div>
              )}
              {user.dailyCalorieTarget && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Calorie Target:</span>
                  <span className="font-medium text-gray-800">{user.dailyCalorieTarget} kcal</span>
                </div>
              )}
              {user.dailyProteinTarget && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Protein Target:</span>
                  <span className="font-medium text-gray-800">{user.dailyProteinTarget}g</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Health Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 block mb-1">Dietary Preference:</span>
                <span className="font-medium text-gray-800 capitalize">{user.dietaryPreference || 'None'}</span>
              </div>
              {user.allergies && (
                <div>
                  <span className="text-gray-600 block mb-1">Allergies:</span>
                  <span className="font-medium text-gray-800">{user.allergies}</span>
                </div>
              )}
              {user.medicalConditions && (
                <div>
                  <span className="text-gray-600 block mb-1">Medical Conditions:</span>
                  <span className="font-medium text-gray-800">{user.medicalConditions}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <span className="text-gray-500 text-xs">Member since {getMemberSince(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        {todayStats && todayStats.count > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Today's Intake</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-blue-100 mb-1">Foods Logged</p>
                <p className="text-3xl font-bold">{todayStats.count}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-blue-100 mb-1">Calories</p>
                <p className="text-3xl font-bold">{todayStats.calories}</p>
                {user.dailyCalorieTarget && (
                  <p className="text-xs text-blue-200 mt-1">
                    {Math.round((todayStats.calories / user.dailyCalorieTarget) * 100)}% of target
                  </p>
                )}
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-blue-100 mb-1">Protein</p>
                <p className="text-3xl font-bold">{todayStats.protein.toFixed(1)}g</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-blue-100 mb-1">Carbs</p>
                <p className="text-3xl font-bold">{todayStats.carbs.toFixed(1)}g</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-blue-100 mb-1">Fat</p>
                <p className="text-3xl font-bold">{todayStats.fat.toFixed(1)}g</p>
              </div>
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Food Scans</p>
                <p className="text-3xl font-bold text-gray-800">{summary.totalPredictions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Calories Logged</p>
                <p className="text-3xl font-bold text-gray-800">{summary.totalCalories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-3xl font-bold text-gray-800">{summary.averageConfidence}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Food History with AI Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Food History & AI Recommendations</h2>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Utensils className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-2">No food scans yet</p>
              <p className="text-sm">Start classifying food to see your history and get personalized recommendations!</p>
              <Link
                href="/classifier"
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Start Scanning
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{pred.foodName}</h3>
                      <p className="text-sm text-gray-500">{formatDate(pred.createdAt)}</p>
                    </div>
                    {pred.recommendation && (
                      <div className={`px-3 py-1 rounded-full border-2 flex items-center gap-2 ${getRecommendationColor(pred.recommendation)}`}>
                        {getRecommendationIcon(pred.recommendation)}
                        <span className="font-semibold capitalize">{pred.recommendation}</span>
                      </div>
                    )}
                  </div>

                  {/* Nutritional Info */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 mb-1">Calories</p>
                      <p className="text-xl font-bold text-orange-700">{pred.calories}</p>
                    </div>
                    {pred.protein && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 mb-1">Protein</p>
                        <p className="text-xl font-bold text-blue-700">{parseFloat(pred.protein).toFixed(1)}g</p>
                      </div>
                    )}
                    {pred.carbs && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-yellow-600 mb-1">Carbs</p>
                        <p className="text-xl font-bold text-yellow-700">{parseFloat(pred.carbs).toFixed(1)}g</p>
                      </div>
                    )}
                    {pred.fat && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 mb-1">Fat</p>
                        <p className="text-xl font-bold text-red-700">{parseFloat(pred.fat).toFixed(1)}g</p>
                      </div>
                    )}
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">Confidence</p>
                      <p className="text-xl font-bold text-purple-700">{pred.confidence}%</p>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  {pred.recommendationReason && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">AI Nutritional Guidance</h4>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {pred.recommendationReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/api/auth/signout')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
