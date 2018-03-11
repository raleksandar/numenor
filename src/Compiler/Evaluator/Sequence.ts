import { hasConstValue, EvaluatorFactory, hasAsyncValue, mark } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { evalMaybeAsyncSteps } from './util';

export const Sequence: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Sequence) {
        throw new TypeError(UnknownExpression(expr));
    }

    let isConst = true;
    let isAsync = false;

    const items = expr.expressions.map((itemExpr) => {

        const item = compile(itemExpr, options, compile);

        if (isConst && !hasConstValue(item)) {
            isConst = false;
        }

        if (!isAsync && hasAsyncValue(item)) {
            isAsync = true;
        }

        return item;
    });

    return mark({ isConst, isAsync }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, items).then((values) => {
            return values[values.length - 1];
        });
    });
};
