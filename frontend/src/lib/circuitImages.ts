/**
 * Maps circuit IDs to image filenames
 * Naming convention: country-location.webp
 * 
 * Images are stored in /public/circuits/images/
 * Add new images following the naming pattern and update this map
 * 
 * UPDATED with actual circuit IDs from database console output
 */
export const circuitImageMap: Record<number, string> = {
  // All circuit images mapped to correct circuit IDs - UPDATED with actual filenames
  4: 'australia-albert.webp',        // Australian Grand Prix
  5: 'usa-austin.webp',              // United States Grand Prix (Circuit of the Americas)
  8: 'bahrain-b.webp',               // Bahrain Grand Prix  
  9: 'azerba-baku.webp',             // Azerbaijan Grand Prix
  14: 'spain-barcalona.webp',        // Spanish Grand Prix
  26: 'hungary-hungoring.webp',      // Hungarian Grand Prix
  27: 'italy-imola.webp',            // Emilia Romagna Grand Prix (Imola)
  29: 'brazil-interlagos.webp',      // São Paulo Grand Prix
  33: 'saudi-jeddah.webp',           // Saudi Arabian Grand Prix
  39: 'qatar-lusail.webp',           // Qatar Grand Prix
  41: 'singapore-sing.webp',         // Singapore Grand Prix
  42: 'usa-miami.webp',              // Miami Grand Prix
  43: 'monaco-monaco.webp',          // Monaco Grand Prix
  46: 'italy-monza.webp',            // Italian Grand Prix (Monza)
  56: 'austria-redbullring.webp',    // Austrian Grand Prix
  60: 'mexico-hermanos.webp',        // Mexico City Grand Prix
  63: 'china-bejing.webp',           // Chinese Grand Prix
  64: 'britain-silverstone.webp',    // British Grand Prix
  66: 'belgium-spa.webp',            // Belgian Grand Prix (Spa-Francorchamps)
  67: 'japan-suzuka.webp',           // Japanese Grand Prix
  70: 'usa-lasvegas.webp',           // Las Vegas Grand Prix
  71: 'canada-montreal.webp',        // Canadian Grand Prix
  73: 'abudhabi-yas.webp',           // Abu Dhabi Grand Prix
  75: 'dutch-zand.webp',             // Dutch Grand Prix
};

/**
 * Gets the image path for a given circuit ID
 * @param circuitId - The database circuit ID
 * @returns Image path or null if not found
 */
export const getCircuitImage = (circuitId: number): string | null => {
  const filename = circuitImageMap[circuitId];
  return filename ? `/circuits/images/${filename}` : null;
};

