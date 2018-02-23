import { InternalEvaluator, Stack, EvaluatorContext, hasConstValue, Evaluator, markAsConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, CantInvoke } from '../Error';
import { makeValueMarshaller } from './util';

export function Call(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Call) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);

    let isConst = hasConstValue(lhs as Evaluator);

    const args = expr.args.map((argExpr) => {

        const arg = compile(argExpr, options, compile);

        if (isConst && !hasConstValue(arg as Evaluator)) {
            isConst = false;
        }

        return arg;
    });

    const {length} = args;
    const marshallValue = makeValueMarshaller(options);

    const evaluator = (context: EvaluatorContext, stack: Stack) => {

        const callee = lhs(context, stack);

        if (typeof callee !== 'function') {
            throw new TypeError(CantInvoke);
        }

        const params: any[] = new Array(length);

        for (let i = 0; i < length; i++) {
            params[i] = marshallValue(args[i](context, stack));
        }

        return callee(...params);
    };

    if (isConst) {
        return markAsConst(evaluator);
    }

    return evaluator;
}
