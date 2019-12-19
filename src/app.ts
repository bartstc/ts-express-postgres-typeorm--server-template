import express, { Application, Request, Response } from "express";
import path from "path";

import { errorMiddleware } from "@middlewares/error.middleware";

import { Controller } from "@global-types/controller.interface";

class App {
  public app: Application;
  public port: number;

  constructor(port: number, middleWares: any, controllers: Controller[]) {
    this.app = express();
    this.port = port;

    this.initializeMiddleWares(middleWares);
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
    this.handleProductionMode();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`);
    });
  }

  public getServer(): Application {
    return this.app;
  }

  private initializeMiddleWares(middleWares: any): void {
    middleWares.forEach((middleware: any) => {
      this.app.use(middleware);
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private handleProductionMode(): void {
    if (process.env.NODE_ENV === "production") {
      this.app.use(express.static("client/build"));

      this.app.get("*", (_: Request, res: Response) => {
        res.sendFile(
          path.resolve(__dirname, "../client", "build", "index.html")
        );
      });
    }
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach(controller => {
      this.app.use("/", controller.router);
    });
  }
}

export { App };
