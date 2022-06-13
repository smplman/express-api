import type { Express, Handler } from 'express';

export interface IRoute {
  name: string
  method: keyof Express
  path: string
  controller: any
}