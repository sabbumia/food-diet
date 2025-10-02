// src/app/api/get-predictions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { foodPredictions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get user's food predictions ordered by most recent
    const predictions = await db
      .select()
      .from(foodPredictions)
      .where(eq(foodPredictions.userEmail, userEmail))
      .orderBy(desc(foodPredictions.createdAt))
      .limit(limit);

    // Calculate summary statistics
    const totalCalories = predictions.reduce(
      (sum, pred) => sum + (pred.calories || 0),
      0
    );
    const avgConfidence = predictions.length > 0
      ? predictions.reduce((sum, pred) => sum + (pred.confidence || 0), 0) / predictions.length
      : 0;

    return NextResponse.json({
      success: true,
      predictions,
      summary: {
        totalPredictions: predictions.length,
        totalCalories,
        averageConfidence: avgConfidence.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}