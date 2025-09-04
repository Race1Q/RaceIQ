import axios from 'axios';

export interface RaceDto {
  id: number;
  season_id: number;
  circuit_id: number;
  round: number;
  name: string;
  date: string;
  time: string;
}

export interface CircuitDto {
  id?: number;
  name: string;
  location: string;
  country_code: string;
  map_url: string;
}

class ApiClient {
  private axiosInstance = axios.create({
    baseURL: '/api',
  });

  async getRaces(season: number = 2025): Promise<RaceDto[]> {
    const response = await this.axiosInstance.get<RaceDto[]>(`/races`, { params: { season } });
    return response.data;
  }

  async getRaceById(id: number): Promise<RaceDto> {
    const response = await this.axiosInstance.get<RaceDto>(`/races/${id}`);
    return response.data;
  }

  async getCircuitById(id: number): Promise<CircuitDto | null> {
    const response = await this.axiosInstance.get<CircuitDto>(`/circuits/id/${id}`);
    return response.data ?? null;
  }
}

export const apiClient = new ApiClient();
