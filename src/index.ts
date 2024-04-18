import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(3000);
