import { InternalEvaluator, makeConstEval, hasConstValue, Evaluator, evalConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { TokenType } from '../../Lexer';

export function BinaryOperation(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.BinaryOperation) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const rhs = compile(expr.rhs, options, compile);

    if (expr.operator === TokenType.PipePipe) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) || rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.AmpAmp) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) && rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Pipe) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) | rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Caret) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) ^ rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Amp) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) & rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.EqEq) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) == rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.BangEq) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) != rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.EqEqEq) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) === rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.BangEqEq) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) !== rhs(context, registers);
        });
    }

    // unlike in JS `in` operator works on arrays: 2 in [1, 2, 3] === true
    if (expr.operator === TokenType.In) {
        return maybeConst(lhs, rhs, (context, registers) => {

            const item = lhs(context, registers);
            const value = rhs(context, registers);

            if (Array.isArray(value)) {
                return value.indexOf(item) !== -1;
            }

            return item in value;
        });
    }

    if (expr.operator === TokenType.Lt) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) < rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.LtEq) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) <= rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Gt) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) > rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.GtEq) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) >= rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.LtLt) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) << rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.GtGt) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) >> rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.GtGtGt) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) >>> rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Plus) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) + rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Minus) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) - rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Star) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) * rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Slash) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) / rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.Percent) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) % rhs(context, registers);
        });
    }

    if (expr.operator === TokenType.StarStar) {
        return maybeConst(lhs, rhs, (context, registers) => {
            return lhs(context, registers) ** rhs(context, registers);
        });
    }

    throw new TypeError(UnknownExpression(expr));
}

function maybeConst(lhs: InternalEvaluator, rhs: InternalEvaluator, evaluator: InternalEvaluator): InternalEvaluator {

    if (hasConstValue(lhs as Evaluator) && hasConstValue(rhs as Evaluator)) {
        return makeConstEval(evalConst(evaluator));
    }

    return evaluator;
}
