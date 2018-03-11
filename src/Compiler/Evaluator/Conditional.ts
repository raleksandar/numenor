import { hasConstValue, evalConst, EvaluatorFactory, hasAsyncValue, mark } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const Conditional: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Conditional) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const thenBranch = compile(expr.thenBranch, options, compile);
    const elseBranch = compile(expr.elseBranch, options, compile);

    const isLHSAsync = hasAsyncValue(lhs);
    const isThenAsync = hasAsyncValue(thenBranch);
    const isElseAsync = hasAsyncValue(elseBranch);
    const isAsync = isLHSAsync || isThenAsync || isElseAsync;

    const isLHSConst = hasConstValue(lhs);
    const isThenConst = hasConstValue(thenBranch);
    const isElseConst = hasConstValue(elseBranch);
    const isConst = isLHSConst && isThenConst && isElseConst;

    if (isAsync) {
        if (isLHSAsync) {
            return mark({ isAsync, isConst }, (context, stack) => {
                return lhs(context, stack).then((thruthy: any) => {
                    return thruthy ?
                        thenBranch(context, stack) :
                        elseBranch(context, stack);
                });
            });
        }
        if (isLHSConst) {
            return evalConst(lhs) ?
                mark({ isAsync: isThenAsync, isConst: isThenConst }, thenBranch) :
                mark({ isAsync: isElseAsync, isConst: isElseConst }, elseBranch);
        }
        return mark({ isAsync }, (context, stack) => {
            if (lhs(context, stack)) {
                const value = thenBranch(context, stack);
                return isThenAsync ? value : Promise.resolve(value);
            }
            const value = elseBranch(context, stack);
            return isElseAsync ? value : Promise.resolve(value);
        });
    }

    if (isLHSConst) {
        return evalConst(lhs) ? thenBranch : elseBranch;
    }

    return (context, stack) => {
        return lhs(context, stack) ?
            thenBranch(context, stack) :
            elseBranch(context, stack);
    };
};
