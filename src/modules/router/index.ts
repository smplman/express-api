import type { IRoute } from '../router/models/IRoute';
import type { Express, Request, Response, NextFunction } from 'express';

export function buildRoutes (app: Express, routes: IRoute[]) {
  routes?.forEach((route) => {
    app?.[route.method](route?.path, (req: Request, res: Response, next?: NextFunction) => {
      new route.controller(req, res, next)
    });
  })
}