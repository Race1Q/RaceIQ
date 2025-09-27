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
  wins: 9,
  podiums: 24,
  fastestLaps: 5,
  points: 550,
  championshipStanding: "P1",
  winsPerSeason: [
    { season: "2024", wins: 7 },
    { season: "2025", wins: 2 },
  ],
  funFact: "Oscar is the first driver since Lewis Hamilton to win the F3 and F2 championships in consecutive rookie seasons.",
  recentForm: [
    { position: 3, raceName: "Italian GP", countryCode: "ITA" },
    { position: 1, raceName: "Dutch GP", countryCode: "NLD" },
  ],
  firstRace: { year: "2023", event: "Bahrain GP" },
};
