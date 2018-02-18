import { InternalEvaluator, makeConstEval } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export function Value(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.NumberLiteral &&
        expr.type !== ExpressionType.StringLiteral &&
        expr.type !== ExpressionType.BooleanLiteral &&
        expr.type !== ExpressionType.NullLiteral &&
        expr.type !== ExpressionType.UndefinedLiteral
    ) {
        throw new TypeError(UnknownExpression(expr));
    }

    return makeConstEval(expr.value);
}
