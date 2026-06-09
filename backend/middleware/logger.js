import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../logs');
const logFilePath = path.join(logDir, 'access.log');

const createLogger = (req, res) => {
    const timestamp = new Date().toISOString();
    return `
[${timestamp}] ${req.method} ${req.originalUrl} 
- Query: ${JSON.stringify(req.query)} 
- Params: ${JSON.stringify(req.params)} 
- User: ${req.user ? req.user.id : "Unauthenticated"} 
- IP: ${req.ip} 
- User-Agent: ${req.headers["user-agent"]}
- Referrer: ${req.get("Referrer") || "N/A"}

- Response Status Code: ${res.statusCode}
- Error: ${res.locals.error ? res.locals.error.message : "None"}
- Request Protocol: ${req.protocol}
- Request Host: ${req.get("host")}
- Request Port: ${req.socket.localPort}
- Request Method: ${req.method}
- Request URL: ${req.originalUrl}
- Request Path: ${req.path}
    `;
};

const saveLogToFile = (logMessage) => {
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(logFilePath, logMessage + '\n');
    } catch (error) {
        console.error('Error writing log to file:', error);
    }
};

export const Logger = async (req, res, next) => {
    const logMessage = createLogger(req, res);
    console.log(logMessage);
    saveLogToFile(logMessage);
    next();
};