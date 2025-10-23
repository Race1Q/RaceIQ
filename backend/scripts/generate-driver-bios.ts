import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BioService } from '../src/ai/services/bio.service';
import { DriversService } from '../src/drivers/drivers.service';
import { SeasonsService } from '../src/seasons/seasons.service';

async function generateDriverBios() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const bioService = app.get(BioService);
  const driversService = app.get(DriversService);
  const seasonsService = app.get(SeasonsService);

  // Get the latest season dynamically
  const seasons = await seasonsService.findAll();
  const currentSeason = seasons.length > 0 ? seasons[0].year : new Date().getFullYear();
  
  console.log(`🚀 Starting driver bio generation for season ${currentSeason}...`);
  
  // Get all drivers for current season
  const drivers = await driversService.findAll({ year: currentSeason });
  console.log(`📊 Found ${drivers.length} drivers`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Generate bios for each driver
  for (const driver of drivers) {
    console.log(`👤 Generating bio for ${driver.first_name} ${driver.last_name} (ID: ${driver.id})...`);
    
    try {
      await bioService.getDriverBio(driver.id, currentSeason);
      console.log(`  ✅ Bio generated successfully`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Bio failed: ${error.message}`);
      failCount++;
    }
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`🎉 Driver bio generation complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  await app.close();
}

generateDriverBios().catch(console.error);
