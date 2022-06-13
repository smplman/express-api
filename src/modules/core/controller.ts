import type { Request, Response, NextFunction } from 'express';

export interface IController {
  new (req: Request, res: Response, next?: NextFunction): any
}

// export abstract class Controller implements IController {
//   constructor (req: Request, res: Response, next?: NextFunction) {}
// }