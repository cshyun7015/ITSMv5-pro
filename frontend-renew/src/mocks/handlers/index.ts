import { operatorHandlers } from './operatorHandlers';
import { authHandlers } from './authHandlers';

export const handlers = [
  ...authHandlers,
  ...operatorHandlers,
];
