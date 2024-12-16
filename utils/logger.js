import winston from "winston";
import expressWinston from "express-winston";

export const setupLogging = (app) => {
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.File({ filename: 'logs/security.log' }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    meta: true, // Ajoute les métadonnées comme IP et requêtes
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) { return false; },
  }));
};