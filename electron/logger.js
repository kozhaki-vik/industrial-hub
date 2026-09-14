import fs from 'fs';
import path from 'path';
import os from 'os';
import electron from 'electron';

const app = electron.app || (electron.default && electron.default.app);

const MAX_LOG_SIZE = 2 * 1024 * 1024; // 2 MB

let logDir = null;
let logFilePath = null;
let oldLogFilePath = null;

function formatTimestamp() {
  const d = new Date();
  const pad = (n, s = 2) => String(n).padStart(s, '0');
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  return `${dateStr} ${timeStr}`;
}

function ensureLogDir() {
  if (!logDir) {
    try {
      const userData = app.getPath('userData');
      logDir = path.join(userData, 'logs');
      logFilePath = path.join(logDir, 'hub.log');
      oldLogFilePath = path.join(logDir, 'hub.old.log');
    } catch {
      logDir = path.join(os.tmpdir(), 'industrial-hub-logs');
      logFilePath = path.join(logDir, 'hub.log');
      oldLogFilePath = path.join(logDir, 'hub.old.log');
    }
  }

  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch {}
  }
}

function rotateIfNeeded() {
  try {
    if (fs.existsSync(logFilePath)) {
      const stat = fs.statSync(logFilePath);
      if (stat.size >= MAX_LOG_SIZE) {
        if (fs.existsSync(oldLogFilePath)) {
          try { fs.unlinkSync(oldLogFilePath); } catch {}
        }
        try { fs.renameSync(logFilePath, oldLogFilePath); } catch {}
      }
    }
  } catch {}
}

function writeEntry(level, message) {
  try {
    ensureLogDir();
    rotateIfNeeded();
    const line = `[${formatTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(logFilePath, line, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
}

function formatArgs(args) {
  return args.map(arg => {
    if (arg instanceof Error) {
      return `${arg.message}\n${arg.stack || ''}`;
    }
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
}

export const logger = {
  init() {
    ensureLogDir();
    rotateIfNeeded();
    const separator = '='.repeat(60);
    const startMsg = [
      separator,
      `Industrial Hub v${app.getVersion()} started`,
      `Time: ${new Date().toISOString()}`,
      `OS: ${os.type()} ${os.release()} (${os.arch()})`,
      `Platform: ${process.platform}`,
      `Node: ${process.version}, Electron: ${process.versions.electron}`,
      `Executable: ${process.execPath}`,
      `Logs path: ${logFilePath}`,
      separator
    ].join('\n');
    writeEntry('INFO', startMsg);
  },

  info(...args) {
    const msg = formatArgs(args);
    console.log(`[INFO] ${msg}`);
    writeEntry('INFO', msg);
  },

  warn(...args) {
    const msg = formatArgs(args);
    console.warn(`[WARN] ${msg}`);
    writeEntry('WARN', msg);
  },

  error(...args) {
    const msg = formatArgs(args);
    console.error(`[ERROR] ${msg}`);
    writeEntry('ERROR', msg);
  },

  debug(...args) {
    const msg = formatArgs(args);
    writeEntry('DEBUG', msg);
  },

  getLogPaths() {
    ensureLogDir();
    return { logDir, logFilePath, oldLogFilePath };
  },

  getRecentLogs(maxLines = 100) {
    ensureLogDir();
    try {
      if (!fs.existsSync(logFilePath)) return 'Лог-файл пока пуст.';
      const content = fs.readFileSync(logFilePath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      return lines.slice(-maxLines).join('\n');
    } catch (err) {
      return `Не удалось прочитать лог: ${err.message}`;
    }
  }
};
