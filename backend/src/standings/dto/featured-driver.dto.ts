// backend/src/standings/dto/featured-driver.dto.ts
import { RecentFormItem } from '../../drivers/dto/driver-stats.dto';

export class FeaturedDriverDto {
  id: number;
  fullName: string;
  driverNumber: number | null;
  countryCode: string | null;
  teamName: string;
  seasonPoints: number;
  seasonWins: number;
  position: number;
  careerStats: {
    wins: number;
    podiums: number;
    poles: number;
  };
  recentForm: RecentFormItem[];
}


