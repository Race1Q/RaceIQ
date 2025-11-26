// frontend/src/lib/fallbackData/dashboardData.ts

import type { DashboardData } from "../../types";

export const fallbackDashboardData: DashboardData = {
  nextRace: {
    raceName: "Italian Grand Prix",
    circuitName: "Monza Circuit",
    raceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Approx. 3 days from now
  },
  championshipStandings: [
    { position: 1, driverFullName: "Max Verstappen", driverHeadshotUrl: null, constructorName: "Red Bull Racing", points: 350 },
    { position: 2, driverFullName: "Lando Norris", driverHeadshotUrl: null, constructorName: "McLaren", points: 332 },
    { position: 3, driverFullName: "Charles Leclerc", driverHeadshotUrl: null, constructorName: "Ferrari", points: 301 },
    { position: 4, driverFullName: "Oscar Piastri", driverHeadshotUrl: null, constructorName: "McLaren", points: 285 },
    { position: 5, driverFullName: "Carlos Sainz", driverHeadshotUrl: null, constructorName: "Ferrari", points: 240 },
  ],
  lastRacePodium: {
    raceName: "British Grand Prix",
    podium: [
      { position: 1, driverFullName: "Max Verstappen", constructorName: "Red Bull Racing", driverProfileImageUrl: null },
      { position: 2, driverFullName: "Oscar Piastri", constructorName: "McLaren", driverProfileImageUrl: null },
      { position: 3, driverFullName: "Lando Norris", constructorName: "McLaren", driverProfileImageUrl: null },
    ],
  },
  lastRaceFastestLap: {
    driverFullName: "Lewis Hamilton",
    lapTime: "1:27.097",
    driverProfileImageUrl: null,
  },
  headToHead: {
    driver1: {
      fullName: "Lando Norris",
      headshotUrl: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png",
      teamName: "McLaren",
      wins: 5,
      podiums: 15,
      points: 332,
    },
    driver2: {
      fullName: "Oscar Piastri",
      headshotUrl: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png",
      teamName: "McLaren",
      wins: 2,
      podiums: 8,
      points: 285,
    },
  },
};
