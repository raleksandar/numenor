import {
    hasConstValue,
    hasAsyncValue,
    mark,
    EvaluatorFactory,
} from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { evalMaybeAsyncSteps, identity } from './util';

export const ArrayLiteral: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.ArrayLiteral) {
        throw new TypeError(UnknownExpression(expr));
    }

    let isConst = true;
    let isAsync = false;

    const items = expr.items.map((itemExpr) => {

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
        return evalMaybeAsyncSteps(context, stack, items).then(identity);
    });
};
