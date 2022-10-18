/* eslint-disable @typescript-eslint/no-explicit-any */
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { colors } from '../colors';

class LogUtil {
  private logger: winston.Logger;
  constructor() {
    const configJson = {
      filename: '%DATE%_RMS_SERVER.log',
      datePattern: 'YYYY/MM/DD/YYYYMMDD',
      json: false,
      maxFiles: '14d',
    };
    this.logger = createLogger(configJson);
  }

  warning(message: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.warning({ message, stack, option });
  }

  error(message: string, errStack: string) {
    const stack = this.getStack();
    const err = {
      message,
      stack,
      option: errStack,
    };
    this.logger.error(err);
  }

  info(message: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.info({ message, stack, option });
  }

  debug(message: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.debug({ message, stack, option });
  }

  log(level: string, msg: string, option: { [key: string]: any } = {}) {
    const stack = this.getStack();
    this.logger.log({ level: level, message: msg, stack, option });
  }

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

export const Logger = new LogUtil();

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
