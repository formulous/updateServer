/* eslint-disable @typescript-eslint/no-explicit-any */
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { colors } from '../colors';

// 실제 create logger를 행하게 되는 class
class LogUtil {
  private logger: winston.Logger;
  constructor() {
    // logger의 config 정의
    const configJson = {
      filename: '%DATE%_RMS_SERVER.log',
      datePattern: 'YYYY/MM/DD/YYYYMMDD',
      json: false,
      maxFiles: '14d',
    };
    this.logger = createLogger(configJson);
  }

  // warning logging
  warning(message: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.warning({ message, stack, option });
  }
  // error logging => err는 저마다 stack값을 가지고 있음. 해당 stack값을 err 원인 파악을 위해 parameter 받아온다.
  error(message: string, errStack: string) {
    const stack = this.getStack();
    const err = {
      message,
      stack,
      option: errStack,
    };
    this.logger.error(err);
  }

  // info logging 
  info(message: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.info({ message, stack, option });
  }

  // debug logging
  debug(message: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.debug({ message, stack, option });
  }

  // loging => log level에 따라 다르게 logging 해준다.
  log(level: string, msg: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.log({ level: level, message: msg, stack, option });
  }
  
  // 해당 명령이 일어난 위치 stack을 추출하기 위한 함수
  getStack() {
    const stackList: string[] = new Error().stack.split('\n');
    const funcName = getFuncNameInLine(stackList[3]);
    if (funcName === 'setHttpContextMiddleware') {
      return 'HTTP';
    }

    if (funcName.includes('<anonymous>')) {
      const stackIdx = stackList.findIndex((stack) => {
        const isSameClass = stack.includes(funcName.split('.')[0]);
        if (isSameClass && !stack.includes('<anonymous>')) {
          return true;
        }
      });
      const funcNameNotWithAnonymous = stackList[stackIdx];
      return funcNameNotWithAnonymous
        ? getFuncNameInLine(funcNameNotWithAnonymous)
        : funcName;
    } else {
      return funcName;
    }
  }
}

function getFileNameInline(line) {
  return line.split('/').pop().slice(0, -2);
}

function getFuncNameInLine(line: string) {
  return `${line.trim().split(' ')[1]} - ${getFileNameInline(line)}`;
}

// logger export
export const Logger = new LogUtil();

// winston logger를 이용한 loging module 실제 구현 부
function createLogger(logOption) {
  return winston.createLogger({
    levels: winston.config.syslog.levels,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss.SSS',
      }),
      winston.format.ms(),
      winston.format.prettyPrint(),
      winston.format.printf((info) => {
        return `${colors.brightGreen(info.timestamp)} ${
          info.level
        } ${colors.yellow(info.stack)} ${colors.orange(
          info.message
        )} ${JSON.stringify(info.option)} ${colors.yellow(info.ms)}`;
      })
    ),
    transports: [
      new winston.transports.DailyRotateFile(logOption),
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.prettyPrint(),
          winston.format.printf((info) => {
            return `${colors.brightGreen(info.timestamp)} ${
              info.level
            } ${colors.yellow(`[${info.stack}]`)} ${colors.orange(
              info.message
            )} ${JSON.stringify(info.option)} ${colors.yellow(info.ms)}`;
          })
        ),
      }),
    ],
  });
}
