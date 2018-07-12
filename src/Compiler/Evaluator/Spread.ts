import { EvaluatorFactory } from './';
import { UnknownExpression } from '../Error';

export const Spread: EvaluatorFactory = (expr) => {
    // right now the Spread expression is only allowed in the context of a
    // lambda arguments as a variadic argument definition (a.k.a. rest params)
    // and these are compiled by the Lambda expression compiler
    throw new TypeError(UnknownExpression(expr));
};
