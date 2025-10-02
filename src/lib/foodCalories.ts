// src/lib/foodCalories.ts
export interface FoodData {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export const foodDatabase: Record<string, FoodData> = {
  "Biriyani": { calories: 290, protein: 12, carbs: 45, fat: 8 },
  "Boiled_egg": { calories: 68, protein: 6, carbs: 0.5, fat: 5 },
  "Buter_Dal": { calories: 100, protein: 7, carbs: 18, fat: 0.5 },
  "Cake": { calories: 340, protein: 4, carbs: 50, fat: 15 },
  "Cha": { calories: 40, protein: 0.5, carbs: 8, fat: 1 },
  "Chicken_curry": { calories: 190, protein: 18, carbs: 8, fat: 10 },
  "Chicken_wings": { calories: 290, protein: 26, carbs: 0, fat: 20 },
  "Chocolate_cake": { calories: 350, protein: 5, carbs: 48, fat: 17 },
  "Chow_mein": { calories: 200, protein: 8, carbs: 28, fat: 6 },
  "Crab_Dish_Kakra": { calories: 97, protein: 19, carbs: 0, fat: 1.5 },
  "Fish Bhuna_Mach Bhuna": { calories: 210, protein: 22, carbs: 5, fat: 12 },
  "French_fries": { calories: 312, protein: 4, carbs: 41, fat: 15 },
  "Fried fish_Mach Bhaja": { calories: 200, protein: 20, carbs: 8, fat: 11 },
  "Fried_rice": { calories: 250, protein: 6, carbs: 38, fat: 8 },
  "Hilsha_Fish_Curry": { calories: 180, protein: 20, carbs: 4, fat: 10 },
  "Kacchi": { calories: 300, protein: 14, carbs: 42, fat: 10 },
  "Khichuri": { calories: 170, protein: 8, carbs: 30, fat: 3 },
  "Lentil fritters_Dal Puri": { calories: 300, protein: 8, carbs: 35, fat: 15 },
  "Lentil soup_Dal": { calories: 120, protein: 9, carbs: 20, fat: 0.5 },
  "Meat Curry_Gosht Bhuna": { calories: 250, protein: 20, carbs: 8, fat: 16 },
  "Misti": { calories: 320, protein: 3, carbs: 65, fat: 7 },
  "Momos": { calories: 120, protein: 6, carbs: 18, fat: 3 },
  "Naan Ruti": { calories: 262, protein: 9, carbs: 45, fat: 5 },
  "Rosogolla": { calories: 125, protein: 2, carbs: 28, fat: 1 },
  "Salad": { calories: 50, protein: 2, carbs: 10, fat: 0.5 },
  "Sandwich": { calories: 250, protein: 10, carbs: 35, fat: 8 },
  "Shik_kabab": { calories: 240, protein: 22, carbs: 4, fat: 16 },
  "Singgara": { calories: 250, protein: 5, carbs: 30, fat: 12 },
  "Vegetable fritters _Beguni": { calories: 280, protein: 4, carbs: 35, fat: 14 },
  "Vorta": { calories: 120, protein: 3, carbs: 15, fat: 6 },
  "bakorkhani": { calories: 400, protein: 8, carbs: 70, fat: 10 },
  "cheesecake": { calories: 321, protein: 6, carbs: 32, fat: 19 },
  "cup_cakes": { calories: 305, protein: 3, carbs: 42, fat: 14 },
  "fuchka": { calories: 80, protein: 2, carbs: 15, fat: 2 },
  "golap Jam": { calories: 150, protein: 1, carbs: 35, fat: 1 },
  "haleem": { calories: 260, protein: 18, carbs: 25, fat: 12 },
  "ice_cream": { calories: 207, protein: 4, carbs: 24, fat: 11 },
  "jilapi": { calories: 310, protein: 2, carbs: 70, fat: 3 },
  "kebab_Gosht Kebab": { calories: 250, protein: 20, carbs: 5, fat: 17 },
  "morog_polao": { calories: 240, protein: 12, carbs: 35, fat: 7 },
  "nehari": { calories: 210, protein: 16, carbs: 8, fat: 13 },
  "omelette": { calories: 150, protein: 12, carbs: 1, fat: 11 },
  "pakora": { calories: 315, protein: 6, carbs: 38, fat: 16 },
  "pizza": { calories: 266, protein: 11, carbs: 33, fat: 10 },
  "poached_egg": { calories: 71, protein: 6, carbs: 0.4, fat: 5 },
  "porota": { calories: 330, protein: 6, carbs: 45, fat: 15 },
  "roshmalai": { calories: 230, protein: 5, carbs: 35, fat: 9 },
  "steak": { calories: 271, protein: 26, carbs: 0, fat: 18 },
  "yogurt": { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3 },
};

export function getFoodData(foodName: string): FoodData {
  // Try exact match first
  if (foodDatabase[foodName]) {
    return foodDatabase[foodName];
  }
  
  // Try case-insensitive match
  const lowerFoodName = foodName.toLowerCase();
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (key.toLowerCase() === lowerFoodName) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (key.toLowerCase().includes(lowerFoodName) || lowerFoodName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default values if not found (estimated based on typical food)
  return {
    calories: 200,
    protein: 8,
    carbs: 30,
    fat: 6
  };
}

// Backward compatibility
export function getCalories(foodName: string): number {
  return getFoodData(foodName).calories;
}

// Legacy export for backward compatibility
export const foodCalories: Record<string, number> = Object.entries(foodDatabase).reduce((acc, [key, value]) => {
  acc[key] = value.calories;
  return acc;
}, {} as Record<string, number>);