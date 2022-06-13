import type { Request, Response, NextFunction, Handler } from 'express';

export class ArticleController {
  constructor (req: Request, res: Response, next?: NextFunction) {
    res.send(`Artilce Route with id ${req.params.id}`);
  }
}