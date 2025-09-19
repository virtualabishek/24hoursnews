import app from "./app.js";
import { startSchedulers } from "./scheduler.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
  startSchedulers();
});
