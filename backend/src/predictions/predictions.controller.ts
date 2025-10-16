import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PredictRequestDto } from './dto/predict-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming path is correct
import { ScopesGuard } from '../auth/scopes.guard';   // Assuming path is correct
import { Scopes } from '../auth/scopes.decorator';     // Assuming path is correct

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
  ) {}

  @Post('predict')
  // @UseGuards(JwtAuthGuard, ScopesGuard) // Temporarily disabled for debugging
  // @Scopes('read:predictions') // Temporarily disabled for debugging
  @ApiOperation({ summary: 'Get podium predictions for a list of drivers' })
  @ApiBody({ type: PredictRequestDto })
  @ApiResponse({ status: 200, description: 'A list of podium predictions.' })
  @ApiResponse({ status: 500, description: 'Server error during prediction.' })
  async predict(@Body() predictRequestDto: PredictRequestDto) {
    return this.predictionsService.getPredictions(predictRequestDto);
  }
}