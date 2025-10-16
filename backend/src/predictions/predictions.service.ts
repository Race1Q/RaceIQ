import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { PredictRequestDto } from './dto/predict-request.dto';

@Injectable()
export class PredictionsService {
  async getPredictions(predictRequestDto: PredictRequestDto) {
    const { drivers } = predictRequestDto;

    const options = {
      mode: 'json' as const,
      scriptPath: path.join(__dirname, '../../src/ml-scripts'), // More robust path
      // Make sure to point to your virtual environment's Python executable
      pythonPath: path.join(__dirname, '../../src/ml-scripts/venv/bin/python3'),
    };

    try {
      const predictionPromises = drivers.map(driver => {
        const scriptArgs = [JSON.stringify(driver.features)];
        return PythonShell.run('run_prediction.py', { ...options, args: scriptArgs });
      });

      const results = await Promise.all(predictionPromises);

      // Combine the original driver info with the prediction results
      return drivers.map((driver, index) => ({
        driverId: driver.driverId,
        prediction: results[index][0],
      }));

    } catch (err) {
      console.error('Error executing Python script:', err);
      // Throw a standard NestJS exception with more detail
      throw new InternalServerErrorException(`Failed to make predictions: ${err.message}`);
    }
  }
}