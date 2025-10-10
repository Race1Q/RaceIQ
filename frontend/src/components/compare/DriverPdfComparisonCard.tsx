// frontend/src/components/compare/DriverPdfComparisonCard.tsx
import jsPDF from 'jspdf';

interface DriverPdfData {
  id: string;
  fullName: string;
  teamName: string;
  championshipStanding: number | string | null;
  wins: number;
  podiums: number;
  points: number;
  imageUrl: string;
  teamColorToken: string;
  teamColorHex?: string;
}

interface DriverStats {
  wins: number;
  podiums: number;
  fastestLaps: number;
  points: number;
  dnfs: number;
  sprintWins: number;
  sprintPodiums: number;
}

interface DriverComparisonData {
  driver1: DriverPdfData;
  driver2: DriverPdfData;
  stats1: DriverStats;
  stats2: DriverStats;
  enabledMetrics: Record<string, boolean>;
  score: {
    d1: number | null;
    d2: number | null;
  };
}

export const DriverPdfComparisonCard = async (data: DriverComparisonData) => {
  const { driver1, driver2, stats1, stats2, enabledMetrics, score } = data;
  
  // Create new PDF document
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#e10600';
  const textColor = '#333333';
  const lightGray = '#f5f5f5';
  const darkGray = '#666666';
  
  // Helper function to add text with font
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.fontSize || 12);
    doc.setTextColor(options.color || textColor);
    doc.text(text, x, y);
  };
  
  // Helper function to add rectangle
  const addRect = (x: number, y: number, width: number, height: number, color: string) => {
    doc.setFillColor(color);
    doc.rect(x, y, width, height, 'F');
  };
  
  // Helper function to add circle
  const addCircle = (x: number, y: number, radius: number, color: string) => {
    doc.setFillColor(color);
    doc.circle(x, y, radius, 'F');
  };
  
  // Header
  addRect(0, 0, pageWidth, 30, primaryColor);
  addText('F1 Driver Comparison', 20, 20, { color: 'white', fontSize: 24 });
  addText('RaceIQ Analytics', pageWidth - 60, 20, { color: 'white', fontSize: 12 });
  
  // Driver 1 Section
  const sectionWidth = (pageWidth - 60) / 2;
  const startY = 50;
  
  // Driver 1 Header
  addRect(20, startY, sectionWidth, 25, lightGray);
  addCircle(40, startY + 12.5, 8, driver1.teamColorHex || '#CCCCCC');
  addText(driver1.fullName, 60, startY + 10, { fontSize: 16, fontWeight: 'bold' });
  addText(`${driver1.teamName}`, 60, startY + 18, { fontSize: 12, color: darkGray });
  
  // Driver 1 Stats
  let yPos = startY + 35;
  const enabledMetricsArray = Object.keys(enabledMetrics).filter(key => enabledMetrics[key]);
  
  enabledMetricsArray.forEach((metric, index) => {
    const metricLabels: Record<string, string> = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastestLaps: 'Fastest Laps',
      points: 'Points',
      sprintWins: 'Sprint Wins',
      sprintPodiums: 'Sprint Podiums',
      dnf: 'DNFs',
    };
    
    const metricMap: Record<string, string> = {
      wins: 'wins',
      podiums: 'podiums',
      poles: 'poles',
      fastestLaps: 'fastestLaps',
      points: 'points',
      sprintWins: 'sprintWins',
      sprintPodiums: 'sprintPodiums',
      dnf: 'dnfs',
    };
    
    const statKey = metricMap[metric] || metric;
    const value = (stats1 as any)[statKey] || 0;
    const label = metricLabels[metric] || metric;
    
    addText(label, 30, yPos, { fontSize: 12 });
    addText(value.toString(), sectionWidth + 10, yPos, { fontSize: 12, fontWeight: 'bold' });
    yPos += 8;
  });
  
  // VS Divider
  const centerX = pageWidth / 2;
  const centerY = startY + 50;
  addText('VS', centerX - 5, centerY, { fontSize: 20, fontWeight: 'bold', color: primaryColor });
  
  // Driver 2 Section
  const driver2X = centerX + 20;
  
  // Driver 2 Header
  addRect(driver2X, startY, sectionWidth, 25, lightGray);
  addCircle(driver2X + 20, startY + 12.5, 8, driver2.teamColorHex || '#CCCCCC');
  addText(driver2.fullName, driver2X + 40, startY + 10, { fontSize: 16, fontWeight: 'bold' });
  addText(`${driver2.teamName}`, driver2X + 40, startY + 18, { fontSize: 12, color: darkGray });
  
  // Driver 2 Stats
  yPos = startY + 35;
  enabledMetricsArray.forEach((metric, index) => {
    const metricLabels: Record<string, string> = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastestLaps: 'Fastest Laps',
      points: 'Points',
      sprintWins: 'Sprint Wins',
      sprintPodiums: 'Sprint Podiums',
      dnf: 'DNFs',
    };
    
    const metricMap: Record<string, string> = {
      wins: 'wins',
      podiums: 'podiums',
      poles: 'poles',
      fastestLaps: 'fastestLaps',
      points: 'points',
      sprintWins: 'sprintWins',
      sprintPodiums: 'sprintPodiums',
      dnf: 'dnfs',
    };
    
    const statKey = metricMap[metric] || metric;
    const value = (stats2 as any)[statKey] || 0;
    const label = metricLabels[metric] || metric;
    
    addText(label, driver2X + 10, yPos, { fontSize: 12 });
    addText(value.toString(), driver2X + sectionWidth - 20, yPos, { fontSize: 12, fontWeight: 'bold' });
    yPos += 8;
  });
  
  // Composite Score Section
  const scoreY = startY + 120;
  addRect(20, scoreY, pageWidth - 40, 30, lightGray);
  addText('Composite Score', 30, scoreY + 10, { fontSize: 16, fontWeight: 'bold' });
  
  if (score.d1 !== null && score.d2 !== null) {
    addText(`${driver1.fullName}: ${score.d1}`, 30, scoreY + 20, { fontSize: 14 });
    addText(`${driver2.fullName}: ${score.d2}`, centerX + 20, scoreY + 20, { fontSize: 14 });
    
    // Winner highlight
    const winner = score.d1 > score.d2 ? driver1 : driver2;
    const winnerScore = score.d1 > score.d2 ? score.d1 : score.d2;
    addText(`Winner: ${winner.fullName} (${winnerScore})`, centerX - 30, scoreY + 25, { 
      fontSize: 12, 
      fontWeight: 'bold', 
      color: primaryColor 
    });
  }
  
  // Footer
  const footerY = pageHeight - 20;
  addText('Generated by RaceIQ', 20, footerY, { fontSize: 10, color: darkGray });
  addText(new Date().toLocaleDateString(), pageWidth - 50, footerY, { fontSize: 10, color: darkGray });
  
  // Save the PDF
  const fileName = `driver-comparison-${driver1.fullName.replace(/\s+/g, '-')}-vs-${driver2.fullName.replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
};
