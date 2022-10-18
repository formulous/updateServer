/*
logging module 개발의 편의성을 위해 만든 controller
*/
import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { Logger } from './logger.util';

@Controller()
export class LogController {
  @Post('/')
  async wrongAccess(@Body() dto: object): Promise<void> {
    this.printLog(dto['type']);
  }
  
  // post 요청으로 받은 type에 따라 logger 실행
  printLog(type: string): void {
    try {
      switch (type) {
        case 'warning':
          Logger.warning('WARNING Message', {
            name: "object's name",
            cause: 'sql injection',
          });
          break;
        case 'debug':
          Logger.debug('DEBUG Message', {
            name: "object's name",
            cause: 'try debugging',
          });
          break;
        case 'info':
          Logger.info('INFO Message', {
            name: "object's name",
            cause: 'select information',
          });
          break;
        case 'log':
          // levels : 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug'
          Logger.log('notice', 'LOG Message', {
            name: "object's name",
            cause: 'sql injection',
          });
          break;
        default:
          throw new InternalServerErrorException();
      }
    } catch (err) {
      Logger.error('ERROR Message', err.stack);
    }
  }
}
