import "module-alias/register";
import "dotenv/config";
import "reflect-metadata";
import bodyParser from "body-parser";
import helmet from "helmet";
import { createConnection } from "typeorm";

import { User } from "@modules/auth/user.entity";
import { AuthController } from "@modules/auth/auth.controller";

import { validateEnv } from "@utils/validate-env";

import { App } from "./app";
import { config } from "./ormconfig";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT: number;
    }
  }
}

validateEnv();
const port = process.env.PORT || 5000;

const conn = async () => {
  try {
    const connection = await createConnection(config);
    await connection.runMigrations();
    console.log(`Is connected: ${connection.isConnected}`);
  } catch (err) {
    console.log("Error while connecting to the database", err);
    return err;
  }

  const app = new App(
    port,
    [bodyParser.json(), bodyParser.urlencoded({ extended: true }), helmet()],
    [new AuthController()]
  );
  app.listen();
};

conn();

// HEROKU DEPLOYMENT
// create test brunch for deployment
// git push heroku HEAD:master
// after deployment: add env variables
// heroku logs --tail -> debugging

/* Start configuration
- npm init // package.json
- tsc --init // tsconfig.json
*/
