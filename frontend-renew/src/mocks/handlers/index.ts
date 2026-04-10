import { operatorHandlers } from './operatorHandlers';
import { authHandlers } from './authHandlers';
import { commonCodeHandlers } from './commonCodeHandlers';

export const handlers = [
  ...authHandlers,
  ...operatorHandlers,
  ...commonCodeHandlers,
];
