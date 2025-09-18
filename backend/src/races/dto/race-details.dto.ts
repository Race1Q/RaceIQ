import { Circuit } from '../../circuits/circuits.entity';
import { ConstructorEntity } from '../../constructors/constructors.entity';
import { Driver } from '../../drivers/drivers.entity';
import { Lap } from '../../laps/laps.entity';
import { PitStop } from '../../pit-stops/pit-stops.entity';
import { QualifyingResult } from '../../qualifying-results/qualifying-results.entity';
import { RaceEvent } from '../../race-events/race-events.entity';
import { RaceResult } from '../../race-results/race-results.entity';
import { Season } from '../../seasons/seasons.entity';
import { TireStint } from '../../tire-stints/tire-stints.entity';

class RaceInfo {
  id: number;
  name: string;
  round: number;
  date: Date;
  time: string;
  season: Season;
  circuit: Circuit;
  weather: any;
}

export class RaceDetailsDto {
  raceInfo: RaceInfo;
  raceResults: RaceResult[];
  qualifyingResults: QualifyingResult[];
  laps: Lap[];
  pitStops: PitStop[];
  tireStints: TireStint[];
  raceEvents: RaceEvent[];
}


