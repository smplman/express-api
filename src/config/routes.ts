import type { IRoute } from '../modules/router/models/IRoute';
import { article } from '../modules/article/routes';

export const routes: IRoute[] = [
  ...article
]