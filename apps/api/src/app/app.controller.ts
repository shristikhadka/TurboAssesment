import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api') // Add 'api' prefix to this controller instead of global prefix
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
