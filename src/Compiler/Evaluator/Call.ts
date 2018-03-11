import { hasConstValue, hasAsyncValue, EvaluatorFactory, mark } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression, CantInvoke } from '../Error';
import { makeValueMarshaller, EvalStep, evalMaybeAsyncSteps } from './util';

export const Call: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Call) {
        throw new TypeError(UnknownExpression(expr));
    }

    const marshallValue = makeValueMarshaller(options);

    const lhs = compile(expr.lhs, options, compile);

    const steps: EvalStep[] = [[lhs, (callee) => {
        if (typeof callee !== 'function') {
            throw new TypeError(CantInvoke);
        }
        return callee;
    }]];

    let isConst = hasConstValue(lhs);
    let isAsync = hasAsyncValue(lhs);

    expr.args.forEach((argExpr) => {

        const arg = compile(argExpr, options, compile);

        if (isConst && !hasConstValue(arg)) {
            isConst = false;
        }

        if (!isAsync && hasAsyncValue(arg)) {
            isAsync = true;
        }

        steps.push([arg, marshallValue]);
    });

    return mark({ isAsync, isConst }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, steps).then(([callee, ...params]) => {
            return callee(...params);
        });
    });
};
