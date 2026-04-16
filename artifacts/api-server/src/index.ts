import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

const resolvedPort = rawPort && rawPort.trim() !== "" ? rawPort : "8080";

const port = Number(resolvedPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${resolvedPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
