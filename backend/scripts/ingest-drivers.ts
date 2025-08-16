// Explicitly load backend env file
import { config } from 'dotenv';
import { existsSync } from 'fs';
config({ path: '.env.back' }); // change to '.env.backend' if that's your filename

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { IngestService } from '../src/drivers/ingest.service';

// Robust arg parsing: supports "--name=value", "--name value", and positional "2025"
function getArg(name: string): string | undefined {
  const eq = process.argv.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return undefined;
}
function getYearOrPositional(): string | undefined {
  const viaFlag = getArg('year');
  if (viaFlag) return viaFlag;
  const positional = process.argv.slice(2).find(a => /^\d{4}$/.test(a));
  return positional;
}

async function main() {
  console.log('cwd =', process.cwd());
  console.log('env file present =', existsSync('.env.back')); // adjust if using .env.backend
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const configService = app.get(ConfigService);
  const ingest = app.get(IngestService);

  // Debug logging using ConfigService
  console.log('SUPABASE_URL =', configService.get<string>('SUPABASE_URL'));
  console.log('SERVICE_ROLE present =', !!configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'));
  console.log('argv =', process.argv); // <— debug what npm actually passes

  // Read from CLI or fallback to env vars (note: SEASON_YEAR and MEETING_KEY not in .env.back)
  const year = getYearOrPositional() || configService.get<string>('SEASON_YEAR') || undefined;
  const meeting = getArg('meeting') || configService.get<string>('MEETING_KEY') || undefined;

  console.log('Args ->', { year, meeting });
  const res = await ingest.run({ year, meeting_key: meeting });
  console.log('Ingest result:', res);

  await app.close();
}

main().catch(e => {
  console.error('CLI failed:', e);
  process.exit(1);
});
