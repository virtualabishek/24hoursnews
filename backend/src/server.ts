import "dotenv/config";
import app from "./app.js";
import { startSchedulers } from "./scheduler.js";

const PORT = process.env.PORT || 8000;

// Fail closed: in production the API key gate and scrape secret must be set,
// otherwise refuse to boot rather than serve open.
if (process.env.NODE_ENV === "production") {
  const missing = ["API_KEY", "SCRAPE_SECRET_KEY"].filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables in production: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
  startSchedulers();
});
