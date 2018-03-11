import { makeConstEval, EvaluatorFactory } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const Value: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.NumberLiteral &&
        expr.type !== ExpressionType.StringLiteral &&
        expr.type !== ExpressionType.BooleanLiteral &&
        expr.type !== ExpressionType.NullLiteral &&
        expr.type !== ExpressionType.UndefinedLiteral
    ) {
        throw new TypeError(UnknownExpression(expr));
    }

    return makeConstEval(expr.value);
};
