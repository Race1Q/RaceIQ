import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('drivers')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class DriversController {
  // GET /drivers  -> requires read:drivers
  @Get()
  @Scopes('read:drivers')
  findAll() {
    // Return dummy data for now (matches your Drivers.tsx theme)
    return [
      { id: 'ver', name: 'Max Verstappen', team: 'Red Bull Racing', number: 1, nationality: 'Dutch' },
      { id: 'ham', name: 'Lewis Hamilton', team: 'Mercedes', number: 44, nationality: 'British' },
      { id: 'lec', name: 'Charles Leclerc', team: 'Ferrari', number: 16, nationality: 'Monégasque' },
      { id: 'nor', name: 'Lando Norris', team: 'McLaren', number: 4, nationality: 'British' },
    ];
  }

  // POST /drivers -> requires write:drivers (kept for future admin edits)
  @Post()
  @Scopes('write:drivers')
  create(@Body() dto: any) {
    return { created: true, dto };
  }
}
