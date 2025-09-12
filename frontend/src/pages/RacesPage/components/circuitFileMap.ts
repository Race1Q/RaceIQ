// src/pages/RacesPage/components/circuitFileMap.ts
// Map your DB circuit_id -> file slug (without extension).
// Add/adjust as you grow your dataset.
export const circuitFileMap: Record<number, string> = {
    // Common F1 circuits - you'll need to verify these IDs match your database
    1: "bahrain-international-circuit",
    2: "jeddah-corniche", 
    3: "albert-park",
    4: "albert-park", // Australian GP (your dataset uses this slug)
    5: "autodromo-enzo-e-dino-ferrari", // Imola
    6: "circuit-de-monaco", // Monaco
    7: "circuit-de-barcelona-catalunya", // Spanish GP
    8: "circuit-gilles-villeneuve", // Canadian GP
    9: "red-bull-ring", // Austrian GP
    10: "silverstone", // British GP
    11: "hungaroring", // Hungarian GP
    12: "circuit-de-spa-francorchamps", // Belgian GP
    13: "circuit-park-zandvoort", // Dutch GP
    14: "autodromo-nazionale-di-monza", // Italian GP
    15: "baku-city-circuit", // Azerbaijan GP
    16: "marina-bay-street-circuit", // Singapore GP
    17: "suzuka", // Japanese GP
    18: "losail", // Qatar GP
    19: "circuit-of-the-americas", // US GP
    20: "miami", // Miami GP
    21: "aut-dromo-hermanos-rodr-guez", // Mexican GP
    22: "aut-dromo-jos-carlos-pace", // Brazilian GP
    23: "las-vegas-street-circuit", // Las Vegas GP
    24: "yas-marina", // Abu Dhabi GP
    
    // Keep the original mapping
    297: "hungaroring",
  };
  