// Map your DB circuit_id -> file slug (without extension).
// Add/adjust as you grow your dataset.
export const circuitFileMap: Record<number, string> = {
    // confirmed from your message:
    297: "hungaroring",
  
    // Missing circuits - you'll need to add the correct circuit IDs from your database:
    // Chinese GP (Shanghai International Circuit)
    // [circuit_id]: "shanghai-international-circuit",
    
    // Emilia Romagna GP (Imola)
    // [circuit_id]: "imola",
    
    // Monaco GP
    // [circuit_id]: "monaco",
    
    // Spanish GP (Barcelona-Catalunya)
    // [circuit_id]: "barcelona-catalunya",
    
    // Belgian GP (Spa-Francorchamps)
    // [circuit_id]: "spa-francorchamps",
    
    // Dutch GP (Zandvoort)
    // [circuit_id]: "zandvoort",
    
    // Italian GP (Monza)
    // [circuit_id]: "monza",
    
    // Azerbaijan GP (Baku City Circuit)
    // [circuit_id]: "baku-city-circuit",
    
    // Singapore GP (Marina Bay)
    // [circuit_id]: "marina-bay",
    
    // US GP (Circuit of the Americas) - already exists as cota.geojson
    // [circuit_id]: "cota",
    
    // Mexican GP (Hermanos Rodriguez)
    // [circuit_id]: "hermanos-rodriguez",
    
    // Sao Paulo GP (Interlagos)
    // [circuit_id]: "interlagos",
    
    // Las Vegas GP
    // [circuit_id]: "las-vegas",
  };
  