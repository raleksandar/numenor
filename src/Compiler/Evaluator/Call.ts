import { InternalEvaluator, RegisterSet, EvaluatorContext } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, CantInvoke } from '../Error';

export function Call(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Call) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const args = expr.args.map((arg) => compile(arg, options, compile));
    const length = args.length;

    return (context: EvaluatorContext, registers: RegisterSet) => {

        const callee = lhs(context, registers);

        if (typeof callee !== 'function') {
            throw new TypeError(CantInvoke);
        }

        const params: any[] = new Array(length);

        for (let i = 0; i < length; i++) {
            params[i] = args[i](context, registers);
        }

        return callee(...params);
    };
}
