import { hasConstValue, Evaluator, mark, EvaluatorFactory } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const Await: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Await) {
        throw new TypeError(UnknownExpression(expr));
    }

    const rhs = compile(expr.rhs, options, compile);
    const isConst = hasConstValue(rhs as Evaluator);

    return mark({ isConst, isAsync: true }, (context, stack) => {

        const thenable = rhs(context, stack);

        if (Array.isArray(thenable)) {
            return Promise.all(thenable);
        }

        if (!thenable || typeof thenable.then !== 'function') {
            return Promise.resolve(thenable);
        }

        return thenable;
    });
};
