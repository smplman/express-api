import express, { response } from 'express';
import type { Express, Request, Response } from 'express';

import { routes } from './config/routes';
import { buildRoutes } from './modules/router/index';

import { getData } from './modules/api/index';

const app: Express = express();
const port = process.env.PORT || 3000;

buildRoutes(app, routes);

app.get('/', async (req: Request, res: Response) => {
  let data = await getData();
  // console.log('data', data);
  res.json(data);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});