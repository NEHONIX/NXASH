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
import system_path from "path";
import { config } from "./conf/conf";

dotenv.config();

const app = express();

// Middlewares de sécurité
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Middleware pour retirer 'br' de l'en-tête Accept-Encoding
app.use((req, _, next) => {
  const encoding = req.headers["accept-encoding"];

  if (typeof encoding === "string") {
    req.headers["accept-encoding"] = encoding.replace(/\bbr\b,?\s*/g, "");
  }

  next();
});

app.use(compressionMiddleware);
app.use(xssMiddleware);
app.use("/api", limiter);

// Middlewares de base
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));

// Pour express-rate-limit : faire confiance aux proxies
app.set("trust proxy", 1);

// Routes
app.use("/api", router);

// Config EJS (moteur de rendu)
app.set("view engine", "ejs");
app.set("views", system_path.join(__dirname, "views"));

// Route par défaut
app.get("/", (req: Request, res: Response) => {
  const welcome_msg = `Welcome to ${config.server._name}!`;
  const server_config = config.server;
  res.render("main", { welcome_msg, server_config });
});

// Gestion des routes non trouvées
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, "Route non trouvée"));
});

// Conversion et gestion des erreurs
const PORT = config.server._port;
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
  console.log(`✅ NEHONIX server started on port: ${PORT}`);
});
