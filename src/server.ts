import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
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
  res.send("Welcome to NEHONIX SERVER!" +
    `
    If you're seeing this page, it means that the server is up and running!
    `
  );
});

// Gestion des routes non trouvées
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, "Route non trouvée"));
});

// Conversion et gestion des erreurs
app.use(errorConverter);
app.use(errorHandler);

process.on("unhandledRejection", (err: Error) => {
  console.error("Erreur non gérée:", err.message);
});

process.on("uncaughtException", (err: Error) => {
  console.error("Exception non capturée:", err.message);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`✅ NEHONIX Server has been with success started on port: ${PORT}`);
});
