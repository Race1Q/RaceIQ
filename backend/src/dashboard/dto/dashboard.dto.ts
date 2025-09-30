// backend/src/dashboard/dto/dashboard.dto.ts

export class NextRaceDto {
  raceName: string;
  circuitName: string;
  raceDate: string;
}

export class StandingsItemDto {
  position: number;
  driverFullName: string;
  driverHeadshotUrl: string | null;
  constructorName: string;
  points: number;
}

export class PodiumItemDto {
  position: number;
  driverFullName: string;
  constructorName: string;
}

export class LastRacePodiumDto {
  raceName: string;
  podium: PodiumItemDto[];
}

export class FastestLapDto {
  driverFullName: string;
  lapTime: string; // Formatted as string
}

export class HeadToHeadDriverDto {
  fullName: string;
  headshotUrl: string;
  teamName: string;
  wins: number;
  podiums: number;
  points: number;
}

export class HeadToHeadDto {
  driver1: HeadToHeadDriverDto;
  driver2: HeadToHeadDriverDto;
}

export class ConstructorStandingsItemDto {
  position: number;
  constructorName: string;
  points: number;
}

export class DashboardResponseDto {
  standingsYear: number;
  nextRace: NextRaceDto;
  championshipStandings: StandingsItemDto[];
  lastRacePodium: LastRacePodiumDto;
  lastRaceFastestLap: FastestLapDto;
  headToHead: HeadToHeadDto;
  constructorStandings: ConstructorStandingsItemDto[];
}
