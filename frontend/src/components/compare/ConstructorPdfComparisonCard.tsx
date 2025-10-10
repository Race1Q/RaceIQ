// frontend/src/components/compare/ConstructorPdfComparisonCard.tsx
import jsPDF from 'jspdf';
import { getTeamColor } from '../../lib/teamColors';

interface ConstructorPdfData {
  id: string;
  name: string;
  nationality: string;
  isActive: boolean;
  teamColor: string;
}

interface ConstructorStats {
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  points: number;
  dnfs: number;
  races: number;
}

interface ConstructorComparisonData {
  constructor1: ConstructorPdfData;
  constructor2: ConstructorPdfData;
  stats1: ConstructorStats;
  stats2: ConstructorStats;
  enabledMetrics: Record<string, boolean>;
  score: {
    c1: number | null;
    c2: number | null;
  };
}

export const ConstructorPdfComparisonCard = async (data: ConstructorComparisonData) => {
  const { constructor1, constructor2, stats1, stats2, enabledMetrics, score } = data;
  
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
  addText('F1 Constructor Comparison', 20, 20, { color: 'white', fontSize: 24 });
  addText('RaceIQ Analytics', pageWidth - 60, 20, { color: 'white', fontSize: 12 });
  
  // Constructor 1 Section
  const sectionWidth = (pageWidth - 60) / 2;
  const startY = 50;
  
  // Constructor 1 Header
  addRect(20, startY, sectionWidth, 25, lightGray);
  addCircle(40, startY + 12.5, 8, constructor1.teamColor);
  addText(constructor1.name, 60, startY + 10, { fontSize: 16, fontWeight: 'bold' });
  addText(constructor1.nationality, 60, startY + 18, { fontSize: 12, color: darkGray });
  
  // Constructor 1 Stats
  let yPos = startY + 35;
  const enabledMetricsArray = Object.keys(enabledMetrics).filter(key => enabledMetrics[key]);
  
  enabledMetricsArray.forEach((metric, index) => {
    const metricLabels: Record<string, string> = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastestLaps: 'Fastest Laps',
      points: 'Points',
      races: 'Races',
      dnf: 'DNFs',
    };
    
    const metricMap: Record<string, string> = {
      wins: 'wins',
      podiums: 'podiums',
      poles: 'poles',
      fastestLaps: 'fastestLaps',
      points: 'points',
      races: 'races',
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
  
  // Constructor 2 Section
  const constructor2X = centerX + 20;
  
  // Constructor 2 Header
  addRect(constructor2X, startY, sectionWidth, 25, lightGray);
  addCircle(constructor2X + 20, startY + 12.5, 8, constructor2.teamColor);
  addText(constructor2.name, constructor2X + 40, startY + 10, { fontSize: 16, fontWeight: 'bold' });
  addText(constructor2.nationality, constructor2X + 40, startY + 18, { fontSize: 12, color: darkGray });
  
  // Constructor 2 Stats
  yPos = startY + 35;
  enabledMetricsArray.forEach((metric, index) => {
    const metricLabels: Record<string, string> = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastestLaps: 'Fastest Laps',
      points: 'Points',
      races: 'Races',
      dnf: 'DNFs',
    };
    
    const metricMap: Record<string, string> = {
      wins: 'wins',
      podiums: 'podiums',
      poles: 'poles',
      fastestLaps: 'fastestLaps',
      points: 'points',
      races: 'races',
      dnf: 'dnfs',
    };
    
    const statKey = metricMap[metric] || metric;
    const value = (stats2 as any)[statKey] || 0;
    const label = metricLabels[metric] || metric;
    
    addText(label, constructor2X + 10, yPos, { fontSize: 12 });
    addText(value.toString(), constructor2X + sectionWidth - 20, yPos, { fontSize: 12, fontWeight: 'bold' });
    yPos += 8;
  });
  
  // Composite Score Section
  const scoreY = startY + 120;
  addRect(20, scoreY, pageWidth - 40, 30, lightGray);
  addText('Composite Score', 30, scoreY + 10, { fontSize: 16, fontWeight: 'bold' });
  
  if (score.c1 !== null && score.c2 !== null) {
    addText(`${constructor1.name}: ${score.c1}`, 30, scoreY + 20, { fontSize: 14 });
    addText(`${constructor2.name}: ${score.c2}`, centerX + 20, scoreY + 20, { fontSize: 14 });
    
    // Winner highlight
    const winner = score.c1 > score.c2 ? constructor1 : constructor2;
    const winnerScore = score.c1 > score.c2 ? score.c1 : score.c2;
    addText(`Winner: ${winner.name} (${winnerScore})`, centerX - 30, scoreY + 25, { 
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
  const fileName = `constructor-comparison-${constructor1.name.replace(/\s+/g, '-')}-vs-${constructor2.name.replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
};
