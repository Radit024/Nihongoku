import app from "./app";
import { logger } from "./lib/logger";
import path from "node:path";

const rawPort = process.env["PORT"];

const resolvedPort = rawPort && rawPort.trim() !== "" ? rawPort : "8080";

const port = Number(resolvedPort);
const isMonolithDev = process.env.MONOLITH_DEV === "1";

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${resolvedPort}"`);
}

async function mountNextDevIfNeeded(): Promise<void> {
  if (!isMonolithDev) return;

  const { default: next } = await import("next");
  const nextAppDir = path.resolve(__dirname, "..", "..", "niku-next");
  const nextApp = next({
    dev: true,
    dir: nextAppDir,
    port,
  });

  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  app.use((req, res, nextMiddleware) => {
    if (req.path.startsWith("/api")) {
      return nextMiddleware();
    }

    return handle(req, res);
  });

  logger.info({ port, nextAppDir }, "Monolith dev mode active: Next + API on one server");
}

async function bootstrap(): Promise<void> {
  await mountNextDevIfNeeded();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");

    if (isMonolithDev) {
      const frontendUrl = `http://localhost:${port}`;
      const apiUrl = `http://localhost:${port}/api`;
      logger.info({ frontendUrl, apiUrl }, "Monolith endpoints ready");
    }
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
