export type TimeContext =
  | "early-morning" // 5am–9am: coffee, outdoors
  | "morning" // 9am–12pm: general browse
  | "lunch" // 12pm–2pm: food & drink heavy
  | "afternoon" // 2pm–6pm: culture, shopping
  | "evening" // 6pm–9pm: food, nightlife, tonight
  | "late-night" // 9pm–close: nightlife only
  | "sunday-morning"; // special case: brunch

export function getTimeContext(): TimeContext {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const bostonDate = new Date(now);
  const hour = bostonDate.getHours();
  const day = bostonDate.getDay(); // 0 = Sunday

  if (day === 0 && hour >= 9 && hour < 14) return "sunday-morning";
  if (hour >= 5 && hour < 9) return "early-morning";
  if (hour >= 9 && hour < 12) return "morning";
  if (hour >= 12 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  return "late-night";
}

export const TIME_CONTEXT_CATEGORY_WEIGHT: Record<TimeContext, string[]> = {
  "early-morning": ["Coffee", "Outdoors"],
  morning: [],
  lunch: ["Food & Drink"],
  afternoon: ["Culture", "Shopping"],
  evening: ["Food & Drink", "Nightlife"],
  "late-night": ["Nightlife"],
  "sunday-morning": ["Food & Drink", "Coffee", "Outdoors"],
};
