import { hasConstValue, EvaluatorFactory, hasAsyncValue, mark } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { EvalStep, evalMaybeAsyncSteps } from './util';

export const ObjectLiteral: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.ObjectLiteral) {
        throw new TypeError(UnknownExpression(expr));
    }

    let isConst = true;
    let isAsync = false;

    const { length } = expr.items;
    const steps: EvalStep[] = new Array(length * 2);

    expr.items.forEach(({ name, value }, index) => {

        const nameEval = compile(name, options, compile);
        const valueEval = compile(value, options, compile);

        if (isConst && !(hasConstValue(nameEval) && hasConstValue(valueEval))) {
            isConst = false;
        }

        if (!isAsync && (hasAsyncValue(nameEval) || hasAsyncValue(valueEval))) {
            isAsync = true;
        }

        steps[index * 2] = nameEval;
        steps[index * 2 + 1] = valueEval;
    });

    const { ObjectPrototype } = options;

    return mark({ isAsync, isConst }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, steps).then((pairs) => {

            const object = Object.create(ObjectPrototype);

            for (let i = 0; i < length; i++) {
                object[pairs[i * 2]] = pairs[i * 2 + 1];
            }

            return object;
        });
    });
};
