import { hasConstValue, hasAsyncValue, EvaluatorFactory, mark } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const Lambda: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Lambda) {
        throw new TypeError(UnknownExpression(expr));
    }

    const { length } = expr.args;
    const body = compile(expr.body, options, compile);

    const isConst = hasConstValue(body);
    const isAsync = hasAsyncValue(body);

    return mark({ isAsync, isConst }, (context, stack) => {
        return (...args: any[]) => {
            const invocationContext = { ...context };
            for (let i = 0; i < length; i++) {
                invocationContext[expr.args[i].name] = i < length ? args[i] : undefined;
            }
            return body(invocationContext, stack);
        };
    });
};
