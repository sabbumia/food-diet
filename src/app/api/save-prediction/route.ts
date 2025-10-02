// src/app/api/save-prediction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getFoodData } from "@/lib/foodCalories";
import { foodPredictions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { openai } from "@/config/OpenAIModel";

const NUTRITION_RECOMMENDATION_PROMPT = `You are a nutrition AI assistant. Based on the user's profile and the food they're about to eat, provide a personalized recommendation.

Analyze:
1. The food's nutritional value
2. User's health goals and current metrics
3. User's dietary restrictions and medical conditions
4. How this food fits into their daily nutrition targets

Provide a recommendation in this exact JSON format:
{
  "recommendation": "good" | "moderate" | "avoid",
  "recommendationReason": "A brief, personalized explanation (2-3 sentences) about why this is good/moderate/avoid for THIS specific user based on their goals, health conditions, and nutritional needs.",
  "nutritionalInsights": "Brief insight about the food's nutritional value",
  "suggestion": "A practical suggestion for this user"
}

Be specific to the user's situation. Don't give generic advice.`;

export async function POST(req: NextRequest) {
  try {
    const { userEmail, foodName, confidence } = await req.json();

    if (!userEmail || !foodName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!userProfile || userProfile.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userProfile[0];

    // Get food data from your predefined list
    const foodData = getFoodData(foodName);

    // Prepare user context for LLM
    const userContext = {
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      activityLevel: user.activityLevel,
      goal: user.goal,
      targetWeight: user.targetWeight,
      dietaryPreference: user.dietaryPreference,
      allergies: user.allergies,
      medicalConditions: user.medicalConditions,
      dailyCalorieTarget: user.dailyCalorieTarget,
      dailyProteinTarget: user.dailyProteinTarget,
    };

    const foodContext = {
      foodName,
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      confidence: confidence,
    };

    // Get LLM recommendation
    console.log("Requesting LLM recommendation...");
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: [
        { role: "system", content: NUTRITION_RECOMMENDATION_PROMPT },
        {
          role: "user",
          content: `User Profile: ${JSON.stringify(userContext)}\n\nFood Being Consumed: ${JSON.stringify(foodContext)}\n\nProvide a personalized recommendation.`,
        },
      ],
      temperature: 0.7,
    });

    const rawResp = completion.choices[0].message?.content;

    if (!rawResp) {
      console.error("No response from LLM");
      return NextResponse.json(
        { error: "Failed to get recommendation" },
        { status: 500 }
      );
    }

    // Clean and parse LLM response
    const cleanResp = rawResp
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let llmRecommendation;
    try {
      llmRecommendation = JSON.parse(cleanResp);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw Response:", rawResp);
      // Fallback recommendation
      llmRecommendation = {
        recommendation: "moderate",
        recommendationReason: "Unable to generate personalized recommendation at this time.",
        nutritionalInsights: "Standard nutritional value",
        suggestion: "Consult with a healthcare provider for personalized advice.",
      };
    }

    // Save to database - FIXED: Convert confidence to integer
    const [savedPrediction] = await db
      .insert(foodPredictions)
      .values({
        userEmail,
        foodName,
        calories: foodData.calories,
        protein: foodData.protein.toString(),
        carbs: foodData.carbs.toString(),
        fat: foodData.fat.toString(),
        confidence: Math.round(confidence), // FIXED: Round to integer
        servingSize: "1 serving (approx 100g)",
        recommendation: llmRecommendation.recommendation,
        recommendationReason: `${llmRecommendation.recommendationReason}\n\nInsights: ${llmRecommendation.nutritionalInsights}\n\nSuggestion: ${llmRecommendation.suggestion}`,
      })
      .returning();

    console.log("Prediction saved successfully:", savedPrediction);

    return NextResponse.json({
      success: true,
      prediction: savedPrediction,
      llmRecommendation,
    });
  } catch (error) {
    console.error("Error in save-prediction API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}