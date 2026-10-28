import { Pool } from "pg";

import config from "../config";

export const database = new Pool({
  connectionString: config.db.url,
});
