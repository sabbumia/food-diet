// src/db/schema.ts
import { pgTable, serial, text, integer, timestamp, varchar, decimal, pgEnum } from "drizzle-orm/pg-core";

// Enums for better type safety
export const activityLevelEnum = pgEnum("activity_level", [
  "sedentary",        // Little to no exercise
  "lightly_active",   // Light exercise 1-3 days/week
  "moderately_active",// Moderate exercise 3-5 days/week
  "very_active",      // Hard exercise 6-7 days/week
  "extremely_active"  // Very hard exercise, physical job
]);

export const goalEnum = pgEnum("goal", [
  "lose_weight",      // Weight loss
  "maintain_weight",  // Maintain current weight
  "gain_weight",      // Weight gain/muscle building
  "improve_health"    // General health improvement
]);

export const dietaryPreferenceEnum = pgEnum("dietary_preference", [
  "none",
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
  "paleo",
  "gluten_free",
  "dairy_free",
  "halal",
  "kosher"
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say"
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  
  // Basic Demographics
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  
  // Physical Metrics
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // in kg
  height: decimal("height", { precision: 5, scale: 2 }).notNull(), // in cm
  
  // Activity & Goals
  activityLevel: activityLevelEnum("activity_level").notNull().default("moderately_active"),
  goal: goalEnum("goal").notNull().default("maintain_weight"),
  targetWeight: decimal("target_weight", { precision: 5, scale: 2 }), // Optional target weight in kg
  
  // Dietary Information
  dietaryPreference: dietaryPreferenceEnum("dietary_preference").default("none"),
  allergies: text("allergies"), // Comma-separated list of allergies
  medicalConditions: text("medical_conditions"), // e.g., "diabetes, hypertension"
  
  // Daily Nutritional Targets (calculated or user-set)
  dailyCalorieTarget: integer("daily_calorie_target"), // Target calories per day
  dailyProteinTarget: integer("daily_protein_target"), // in grams
  dailyCarbsTarget: integer("daily_carbs_target"), // in grams
  dailyFatTarget: integer("daily_fat_target"), // in grams
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const foodPredictions = pgTable("food_predictions", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  foodName: varchar("food_name", { length: 255 }).notNull(),
  imageUrl: text("image_url"), // Store the food image URL
  
  // Nutritional Information
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 6, scale: 2 }), // in grams
  carbs: decimal("carbs", { precision: 6, scale: 2 }), // in grams
  fat: decimal("fat", { precision: 6, scale: 2 }), // in grams
  fiber: decimal("fiber", { precision: 6, scale: 2 }), // in grams
  sugar: decimal("sugar", { precision: 6, scale: 2 }), // in grams
  
  // Prediction Details
  confidence: integer("confidence").notNull(), // Confidence percentage
  servingSize: varchar("serving_size", { length: 100 }), // e.g., "1 cup", "100g"
  
  // LLM Recommendation
  recommendation: text("recommendation"), // LLM's suggestion (good/moderate/avoid)
  recommendationReason: text("recommendation_reason"), // Why this recommendation was made
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table to track daily nutrition totals
export const dailyNutrition = pgTable("daily_nutrition", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  totalCalories: integer("total_calories").notNull().default(0),
  totalProtein: decimal("total_protein", { precision: 6, scale: 2 }).default("0"),
  totalCarbs: decimal("total_carbs", { precision: 6, scale: 2 }).default("0"),
  totalFat: decimal("total_fat", { precision: 6, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FoodPrediction = typeof foodPredictions.$inferSelect;
export type NewFoodPrediction = typeof foodPredictions.$inferInsert;
export type DailyNutrition = typeof dailyNutrition.$inferSelect;
export type NewDailyNutrition = typeof dailyNutrition.$inferInsert;