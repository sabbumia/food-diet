import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      age,
      gender,
      weight,
      height,
      activityLevel,
      goal,
      dietaryPreference,
      allergies,
      medicalConditions
    } = body;

    // Validation
    if (!email || !password || !name || !age || !gender || !weight || !height || !activityLevel || !goal) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        age: parseInt(age),
        gender,
        weight: weight.toString(),
        height: height.toString(),
        activityLevel,
        goal,
        dietaryPreference: dietaryPreference || "none",
        allergies: allergies || null,
        medicalConditions: medicalConditions || null,
      })
      .returning();

    return NextResponse.json(
      { message: "User created successfully", user: { email: newUser[0].email, name: newUser[0].name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}