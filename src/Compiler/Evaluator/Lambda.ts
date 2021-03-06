import { hasConstValue, hasAsyncValue, EvaluatorFactory, mark, InternalEvaluator } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const Lambda: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Lambda) {
        throw new TypeError(UnknownExpression(expr));
    }

    const body = compile(expr.body, options, compile);

    let isConst = hasConstValue(body);
    let isAsync = hasAsyncValue(body);

    const args = expr.args.map((arg) => {
        let defaultValue: InternalEvaluator;
        if (arg.variadic) {
            defaultValue = () => [];
        } else if (arg.default) {
            defaultValue = compile(arg.default, options, compile);
            isConst = !isConst && hasConstValue(defaultValue);
            isAsync = !isAsync && hasAsyncValue(defaultValue);
        } else {
            defaultValue = () => undefined;
        }
        return {
            name: arg.name,
            variadic: !!arg.variadic,
            defaultValue,
        };
    });

    return mark({ isAsync, isConst }, (context, stack) => {
        return (...params: any[]) => {
            const invocationContext = { ...context };
            for (let i = 0; i < args.length; i++) {
                if (args[i].variadic) {
                    invocationContext[args[i].name] = params.slice(i);
                } else {
                    invocationContext[args[i].name] = i < params.length ?
                        params[i] :
                        args[i].defaultValue(invocationContext, stack);
                }
            }
            return body(invocationContext, stack);
        };
    });
};
