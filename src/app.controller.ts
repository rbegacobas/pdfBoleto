import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response) {
    // Serve the static frontend index.html from /public
    const indexPath = join(__dirname, '..', '..', 'public', 'index.html');
    return res.sendFile(indexPath);
  }
}
