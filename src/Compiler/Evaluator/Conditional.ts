import { InternalEvaluator, Stack, EvaluatorContext, hasConstValue, Evaluator, evalConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export function Conditional(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Conditional) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const thenBranch = compile(expr.thenBranch, options, compile);
    const elseBranch = compile(expr.elseBranch, options, compile);

    if (hasConstValue(lhs as Evaluator)) {
        return evalConst(lhs) ? thenBranch : elseBranch;
    }

    return (context: EvaluatorContext, stack: Stack) => {
        return lhs(context, stack) ?
            thenBranch(context, stack) :
            elseBranch(context, stack);
    };
}
