import express from "express";

import config from "./config";
import routes from "./routes";

import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const port = config.environment.port as number;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`);
});
