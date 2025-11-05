import fs from 'node:fs';
import path from 'node:path';

const logsDir = path.join(process.cwd(), 'logs');
const latestLogPath = path.join(logsDir, 'latest.txt');

export function initLogger() {
  const date = new Date();
  const time =
    date.getFullYear() +
    '-' +
    `0${date.getMonth() + 1}`.slice(-2) +
    '-' +
    `0${date.getDate()}`.slice(-2) +
    ' ' +
    date.getHours() +
    ':' +
    date.getMinutes() +
    ':' +
    date.getSeconds();
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  if (!fs.existsSync(latestLogPath)) {
    fs.writeFileSync(latestLogPath, `# Log file generated : ${time}\n`);
  }
}

export default class Logger {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  info(message: string) {
    console.log(`[${this.name}-INFO] (${this.currentDate()}) ${message}`);
    fs.appendFile(latestLogPath, `[${this.name}-INFO] (${this.currentDate()}) ${message}\n`, (err) => {
      if (err) throw err;
    });
  }
  error(message: string, error?: any) {
    if (error) {
      if (error.detail) {
        message += `: ${error.detail}`;
      } else if (error.message) {
        message += `: ${error.message}`;
      } else {
        message += `: ${error}`;
      }
    }
    console.error(`[${this.name}-ERROR] (${this.currentDate()}) ${message}`);
    fs.appendFile(latestLogPath, `[${this.name}-ERROR] (${this.currentDate()}) ${message}\n`, (err) => {
      if (err) throw err;
    });
  }

  warn(message: string) {
    console.error(`[${this.name}-WARN] (${this.currentDate()}) ${message}`);
    fs.appendFile(latestLogPath, `[${this.name}-WARN] (${this.currentDate()}) ${message}\n`, (err) => {
      if (err) throw err;
    });
  }

  currentDate() {
    const date = new Date();
    return (
      date.getFullYear() +
      '-' +
      `0${date.getMonth() + 1}`.slice(-2) +
      '-' +
      `0${date.getDate()}`.slice(-2) +
      ' ' +
      date.getHours() +
      ':' +
      date.getMinutes() +
      ':' +
      date.getSeconds()
    );
  }
}
