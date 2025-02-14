// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import {
  limiter,
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  xssMiddleware,
} from "./middlewares/security.middleware";
import { errorConverter, errorHandler } from "./middlewares/error.middleware";
import ApiError from "./utils/ApiError";
import router from "./routes";
// import ServerCaches from "./utils/cache/server.cache.ts.draft";
import chalk from "chalk";
 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(xssMiddleware);
app.use("/api", limiter);

// Middlewares de base
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));

// Routes
app.use("/api", router);

// Route par défaut
app.get("/", (req: Request, res: Response) => {
  res.send("Bienvenue sur l'API StudentLabs");
});

// Gestion des routes non trouvées
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, "Route non trouvée"));
});

// Conversion et gestion des erreurs
app.use(errorConverter);
app.use(errorHandler);

// const newEncryptionKey = crypto.randomBytes(32).toString("hex");
// console.log("cript: ", newEncryptionKey);

// Gestion des erreurs non capturées
process.on("unhandledRejection", (err: Error) => {
  //console.error("Erreur non gérée:", err.message);
  // Enregistrer l'erreur dans un service de monitoring
});

// const cache = new ServerCaches({filepath: "/caches/test.json"});
// console.log(chalk.yellowBright("Fichier cache utilisé :", cache.filepath));
// cache.readCache();
  
console.log("test", process.env.FIREBASE_PROJECT_ID);
// console.log(crypto.randomBytes(32).toString("hex"));

process.on("uncaughtException", (err: Error) => {
  //console.error("Exception non capturée:", err.message);
  // Enregistrer l'erreur dans un service de monitoring
  process.exit(1);
});

http.createServer(app).listen(PORT, () => {
  console.log(`NEHONIX Server started on port:${PORT}`);
});
