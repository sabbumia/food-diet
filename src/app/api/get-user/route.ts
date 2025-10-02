// src/app/api/get-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Fetch user data
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        age: users.age,
        gender: users.gender,
        weight: users.weight,
        height: users.height,
        activityLevel: users.activityLevel,
        goal: users.goal,
        targetWeight: users.targetWeight,
        dietaryPreference: users.dietaryPreference,
        allergies: users.allergies,
        medicalConditions: users.medicalConditions,
        dailyCalorieTarget: users.dailyCalorieTarget,
        dailyProteinTarget: users.dailyProteinTarget,
        dailyCarbsTarget: users.dailyCarbsTarget,
        dailyFatTarget: users.dailyFatTarget,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Calculate BMI
    const heightInMeters = parseFloat(user.height?.toString() || '0') / 100;
    const weightInKg = parseFloat(user.weight?.toString() || '0');
    const bmi = heightInMeters > 0 ? (weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : '0';

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr = 0;
    if (user.age && user.gender && weightInKg > 0 && heightInMeters > 0) {
      const heightInCm = parseFloat(user.height?.toString() || '0');
      if (user.gender === 'male') {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * user.age) + 5;
      } else if (user.gender === 'female') {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * user.age) - 161;
      }
    }

    // Activity level multipliers for TDEE (Total Daily Energy Expenditure)
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const activityMultiplier = activityMultipliers[user.activityLevel || 'moderately_active'] || 1.55;
    const tdee = Math.round(bmr * activityMultiplier);

    // BMI Category
    const bmiValue = parseFloat(bmi);
    let bmiCategory = 'Unknown';
    if (bmiValue > 0) {
      if (bmiValue < 18.5) bmiCategory = 'Underweight';
      else if (bmiValue < 25) bmiCategory = 'Normal weight';
      else if (bmiValue < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        bmi,
        bmiCategory,
        bmr: Math.round(bmr),
        tdee,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data", details: error },
      { status: 500 }
    );
  }
}