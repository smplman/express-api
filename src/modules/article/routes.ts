import { ArticleController } from './controller';
import type { IRoute } from '../router/models/IRoute';

export const article: IRoute[]  = [
  {
    name: 'article',
    method: 'get',
    path: '/article/:id',
    controller: ArticleController
  }
]
