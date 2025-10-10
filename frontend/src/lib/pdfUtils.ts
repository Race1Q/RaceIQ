// frontend/src/lib/pdfUtils.ts
export async function loadImageAsDataURL(url: string): Promise<string> {
  try {
    // Handles SVG and bitmap sources -> PNG dataURL for jsPDF
    const res = await fetch(url, { mode: "cors" });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }
    
    const blob = await res.blob();
    const isSvg = blob.type.includes("image/svg") || url.toLowerCase().includes('.svg');
    
    if (!isSvg) {
      return await blobToDataUrl(blob);
    }
    
    // For SVG, convert blob to text
    const svgText = await blob.text();
    return await svgToPngDataUrl(svgText);
  } catch (error) {
    console.warn(`Failed to load image from ${url}:`, error);
    // Return empty string as fallback
    return '';
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function svgToPngDataUrl(svgText: string): Promise<string> {
  const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await img.decode();

  const canvas = document.createElement("canvas");
  // try to infer a reasonable size
  const w = img.width || 256;
  const h = img.height || 256;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/png");
  URL.revokeObjectURL(url);
  return dataUrl;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
