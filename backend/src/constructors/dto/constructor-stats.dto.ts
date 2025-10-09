export class ConstructorStatsDto {
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  points: number;
  dnfs: number;
  races: number;
}

export class ConstructorComparisonStatsResponseDto {
  constructorId: number;
  year: number | null;
  career: ConstructorStatsDto;
  yearStats: ConstructorStatsDto | null;
}
