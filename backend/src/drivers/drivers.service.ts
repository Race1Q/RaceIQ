// src/drivers/drivers.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { 
  DriverResponseDto, 
  DriverStandingsResponseDto, 
  DriverDetailsResponseDto, 
  DriverPerformanceResponseDto,
  FeaturedDriverResponseDto 
} from './dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // The fields to select, including a computed full_name
  private get selectFields() {
    return 'id, driver_number, first_name, last_name, name_acronym, country_code, date_of_birth';
  }

  async getAllDrivers(): Promise<DriverResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields);

    if (error) {
      this.logger.error('Failed to fetch all drivers', error);
      throw new InternalServerErrorException('Failed to fetch all drivers');
    }
    return (data as unknown as DriverResponseDto[]) || [];
  }

  async searchDrivers(query: string): Promise<DriverResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,name_acronym.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search drivers', error);
      throw new InternalServerErrorException('Failed to search drivers');
    }
    return (data as unknown as DriverResponseDto[]) || [];
  }

  async findDriversByStandings(season: number): Promise<DriverStandingsResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .rpc('get_drivers_sorted_by_standings', { p_season: season });

    if (error) {
      this.logger.error('Failed to fetch drivers by standings', error);
      throw new InternalServerErrorException('Failed to fetch drivers by standings');
    }

    return data ?? [];
  }

  async findOneDetails(driverId: number): Promise<DriverDetailsResponseDto> {
    const { data, error } = await this.supabaseService.client
      .rpc('get_driver_details', { p_driver_id: driverId });

    if (error) {
      this.logger.error(`Failed to fetch details for driver ${driverId}`, error);
      throw new InternalServerErrorException('Failed to fetch driver details');
    }
    return data;
  }

  async findOnePerformance(driverId: number, season: string): Promise<DriverPerformanceResponseDto> {
    const seasonAsNumber = parseInt(season, 10); // Use parseInt for clarity
    
    // Ensure the parsed number is valid before making the database call
    if (isNaN(seasonAsNumber)) {
        this.logger.error(`Invalid season parameter: ${season}`);
        throw new BadRequestException('Invalid season parameter');
    }

    // Disallow future seasons to avoid backend 500s from empty datasets
    const currentYear = new Date().getFullYear();
    if (seasonAsNumber > currentYear) {
      throw new BadRequestException('Season not available yet');
    }

    // Fast existence check to avoid RPC errors when no data exists
    const existenceCheck = await this.supabaseService.client
      .from('driver_standings')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', driverId)
      .eq('season', seasonAsNumber);

    if (existenceCheck.error) {
      this.logger.warn(`Existence check failed for driver ${driverId}, season ${seasonAsNumber}: ${existenceCheck.error.message}`);
    } else if ((existenceCheck.count ?? 0) === 0) {
      throw new NotFoundException('No performance data found for driver and season');
    }

    const { data, error } = await this.supabaseService.client
      .rpc('get_driver_performance', { p_driver_id: driverId, p_season: seasonAsNumber }); // Pass the integer

    if (error) {
      this.logger.error(`Failed to fetch performance for driver ${driverId} in season ${season}`, error);
      // Map common Postgres operator mismatch to 404 if data likely absent
      if ((error as any).message?.includes('operator does not exist: bigint = text')) {
        throw new NotFoundException('No performance data found for driver and season');
      }
      throw new InternalServerErrorException('Failed to fetch driver performance');
    }
    if (!data) {
      throw new NotFoundException('No performance data found for driver and season');
    }
    return data as unknown as DriverPerformanceResponseDto;
  }

  async getFeaturedDriver(season: number): Promise<FeaturedDriverResponseDto> {
    const standings = await this.findDriversByStandings(season);
    if (!standings || standings.length === 0) {
      throw new NotFoundException(`No standings found for season ${season}`);
    }

    const topDriver = standings[0];
    this.logger.debug('Top driver data:', JSON.stringify(topDriver, null, 2));
    
    // The actual API returns 'id' field, not 'driver_id'
    const driverId = topDriver.id || topDriver.driver_id;
    if (!driverId) {
      this.logger.error('No driver ID found in standings data:', topDriver);
      throw new InternalServerErrorException('Driver ID not found in standings data');
    }

    // The actual API returns 'full_name' field, not separate first_name/last_name
    const fullName = topDriver.full_name || `${topDriver.first_name || ''} ${topDriver.last_name || ''}`.trim();
    const headshotUrl = this.getDriverHeadshotUrl(fullName);

    // Try to get performance data, but fallback to basic data if it fails
    let wins = 0;
    let podiums = 0;
    
    try {
      const performance = await this.findOnePerformance(driverId, String(season));
      wins = performance.wins || 0;
      podiums = performance.podiums || 0;
    } catch (error) {
      this.logger.warn(`Could not fetch performance data for driver ${driverId}, using basic data: ${error.message}`);
      // Use wins from standings data if available
      wins = topDriver.wins || 0;
      // For podiums, we'll need to estimate or use a default
      podiums = 0; // We could calculate this from standings if needed
    }

    return {
      driverId: driverId,
      fullName: fullName,
      teamName: topDriver.team_name || topDriver.constructor_name || 'Unknown Team',
      driverNumber: topDriver.driver_number,
      countryCode: topDriver.country_code,
      headshotUrl: headshotUrl,
      points: topDriver.points,
      wins: wins,
      podiums: podiums,
    };
  }

  private getDriverHeadshotUrl(fullName: string): string {
    // Simple headshot URL mapping (similar to frontend)
    const headshotMap: { [key: string]: string } = {
      "Max Verstappen": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png",
      "Sergio Pérez": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col-retina/image.png",
      "Lewis Hamilton": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col-retina/image.png",
      "George Russell": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col-retina/image.png",
      "Charles Leclerc": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col-retina/image.png",
      "Carlos Sainz": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col-retina/image.png",
      "Lando Norris": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col-retina/image.png",
      "Oscar Piastri": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col-retina/image.png",
      "Fernando Alonso": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col-retina/image.png",
      "Lance Stroll": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/2col-retina/image.png",
      "Esteban Ocon": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col-retina/image.png",
      "Pierre Gasly": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col-retina/image.png",
      "Yuki Tsunoda": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/2col-retina/image.png",
      "Daniel Ricciardo": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/2col-retina/image.png",
      "Nico Hülkenberg": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col-retina/image.png",
      "Valtteri Bottas": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/2col-retina/image.png",
      "Guanyu Zhou": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Z/ZHOGUA01_Zhou_Guanyu/zhogua01.png.transform/2col-retina/image.png",
      "Kevin Magnussen": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/2col-retina/image.png",
      "Alexander Albon": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alex_Albon/alealb01.png.transform/2col-retina/image.png",
      "Logan Sargeant": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/2col-retina/image.png",
      "Oliver Bearman": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/2col-retina/image.png",
      "Jack Doohan": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png.transform/2col-retina/image.png",
      "Jolyon Palmer": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JOLPAL01_Jolyon_Palmer/jolpal01.png.transform/2col-retina/image.png",
      "Franco Colapinto": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/2col-retina/image.png",
    };

    return headshotMap[fullName] || "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/default-driver.png";
  }
}