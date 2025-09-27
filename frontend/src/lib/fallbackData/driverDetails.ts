// frontend/src/lib/fallbackData/driverDetails.ts
import type { DriverDetailsData } from "../../types";

export const fallbackDriverDetails: DriverDetailsData = {
  id: 609,
  fullName: "Oscar Piastri",
  firstName: "Oscar",
  lastName: "Piastri",
  countryCode: "AUS",
  dateOfBirth: "2001-04-06",
  teamName: "McLaren",
  imageUrl: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col-retina/image.png",
  number: 81,
  wins: 9,
  podiums: 24,
  points: 550,
  championshipStanding: "P1",
  firstRace: { year: "2023", event: "Bahrain GP" },
  winsPerSeason: [
    { season: "2021", wins: 6 },
    { season: "2022", wins: 5 },
    { season: "2023", wins: 7 },
    { season: "2024", wins: 9 },
    { season: "2025", wins: 2 },
  ],
  // NEW: Add structured stat objects
  currentSeasonStats: [
    { label: "Wins", value: 2 },
    { label: "Podiums", value: 5 },
    { label: "Fastest Laps", value: 1 },
  ],
  careerStats: [
    { label: "Wins", value: 9 },
    { label: "Podiums", value: 24 },
    { label: "Fastest Laps", value: 5 },
    { label: "Grands Prix Entered", value: 58 },
    { label: "DNFs", value: 3 },
    { label: "Highest Finish", value: "1st" },
  ],
  // Other properties can be added as needed
  funFact: "Oscar is the first driver since Lewis Hamilton to win the F3 and F2 championships in consecutive rookie seasons.",
  recentForm: [],
};
