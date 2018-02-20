import { InternalEvaluator, hasConstValue, Evaluator, markAsConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { TokenType } from '../../Lexer';

export function PrefixOperation(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.PrefixOperation) {
        throw new TypeError(UnknownExpression(expr));
    }

    const rhs = compile(expr.rhs, options, compile);

    if (expr.operator === TokenType.Bang) {
        return maybeConst(rhs, (context, stack) => {
            return !rhs(context, stack);
        });
    }

    if (expr.operator === TokenType.Tilde) {
        return maybeConst(rhs, (context, stack) => {
            return ~rhs(context, stack);
        });
    }

    if (expr.operator === TokenType.Plus) {
        return maybeConst(rhs, (context, stack) => {
            return +rhs(context, stack);
        });
    }

    if (expr.operator === TokenType.Minus) {
        return maybeConst(rhs, (context, stack) => {
            return -rhs(context, stack);
        });
    }

    throw new TypeError(UnknownExpression(expr));
}

function maybeConst(rhs: InternalEvaluator, evaluator: InternalEvaluator): InternalEvaluator {

    if (hasConstValue(rhs as Evaluator)) {
        return markAsConst(evaluator);
    }

    return evaluator;
}
