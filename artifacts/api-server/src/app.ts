import express, { type Express } from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const webOutDir = path.resolve(__dirname, "..", "..", "niku-next", "out");
const webIndexFile = path.join(webOutDir, "index.html");
const hasWebStaticBuild = fs.existsSync(webIndexFile);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (hasWebStaticBuild) {
  logger.info({ webOutDir }, "Serving static web build from api-server");

  app.use(
    express.static(webOutDir, {
      extensions: ["html"],
    }),
  );

  // SPA fallback for non-API routes so one server can host both frontend and backend.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.includes(".")) {
      return next();
    }

    return res.sendFile(webIndexFile);
  });
}

export default app;
