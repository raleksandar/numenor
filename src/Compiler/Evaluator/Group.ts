import { EvaluatorFactory } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const Group: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Group || !expr.expression) {
        throw new TypeError(UnknownExpression(expr));
    }

    return compile(expr.expression, options, compile);
};
