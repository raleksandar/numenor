import { EvaluatorFactory } from './';
import { UnknownExpression } from '../Error';

export const Spread: EvaluatorFactory = (expr) => {
    throw new TypeError(UnknownExpression(expr));
};
