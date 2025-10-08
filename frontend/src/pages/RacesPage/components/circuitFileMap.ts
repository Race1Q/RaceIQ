// src/pages/RacesPage/components/circuitFileMap.ts
// Map your DB circuit_id -> file slug (without extension).
// UPDATED with actual circuit IDs from database console output
export const circuitFileMap: Record<number, string> = {
  // Updated with actual circuit IDs from your database
  4: "albert-park",                    // Australian Grand Prix
  5: "circuit-of-the-americas",        // United States Grand Prix (Austin)
  8: "bahrain-international-circuit",  // Bahrain Grand Prix
  9: "baku-city-circuit",              // Azerbaijan Grand Prix
  14: "circuit-de-barcelona-catalunya", // Spanish Grand Prix
  26: "hungaroring",                   // Hungarian Grand Prix
  27: "autodromo-enzo-e-dino-ferrari", // Emilia Romagna Grand Prix (Imola)
  29: "aut-dromo-jos-carlos-pace",     // São Paulo Grand Prix
  33: "jeddah-corniche",               // Saudi Arabian Grand Prix
  39: "losail",                        // Qatar Grand Prix
  41: "marina-bay-street-circuit",     // Singapore Grand Prix
  42: "miami",                         // Miami Grand Prix
  43: "circuit-de-monaco",             // Monaco Grand Prix
  46: "autodromo-nazionale-di-monza",  // Italian Grand Prix (Monza)
  56: "red-bull-ring",                 // Austrian Grand Prix
  60: "aut-dromo-hermanos-rodr-guez",  // Mexico City Grand Prix
  63: "shanghai-international-circuit", // Chinese Grand Prix
  64: "silverstone",                   // British Grand Prix
  66: "circuit-de-spa-francorchamps",  // Belgian Grand Prix (Spa)
  67: "suzuka",                        // Japanese Grand Prix
  70: "las-vegas-street-circuit",      // Las Vegas Grand Prix
  71: "circuit-gilles-villeneuve",     // Canadian Grand Prix
  73: "yas-marina",                    // Abu Dhabi Grand Prix
  75: "circuit-park-zandvoort",        // Dutch Grand Prix
  
  // Keep the original mapping as fallback
  297: "hungaroring",
};