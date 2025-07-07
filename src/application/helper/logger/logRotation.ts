import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Directory for storing log files
const logDirectory: string = path.resolve(__dirname, 'logs');
console.log('Log Directory:', logDirectory);

// Create the log directory if it does not exist
if (!fs.existsSync(logDirectory)) {
  console.log(`Creating log directory at: ${logDirectory}`);
  fs.mkdirSync(logDirectory);
} else {
  console.log(`Log directory exists at: ${logDirectory}`);
}


/**
 * Transport for winston to handle log file rotation daily.
 * @type {DailyRotateFile}
 */
const transport: DailyRotateFile = new DailyRotateFile({
  filename: path.join(logDirectory, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD', // Date pattern for the log files
  zippedArchive: true, // Compresses old log files to save space
  maxSize: '20m', // Maximum size of each log file before rotation (20 megabytes)
  maxFiles: '14d', // Number of days to keep log files before deletion (14 days)
});

/**
 * Winston logger instance.
 * @type {winston.Logger}
 */
const logger: winston.Logger = winston.createLogger({
  level: 'info', // Minimum log level to be recorded
  format: winston.format.combine(
    winston.format.timestamp(), // Adds a timestamp to each log entry
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`; // Custom format for log messages
    })
  ),
  transports: [
    transport, // Daily rotating log files transport
    new winston.transports.Console(), // Console transport for immediate logging output
  ],
});

export default logger;