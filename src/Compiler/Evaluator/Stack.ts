import { InternalEvaluator, EvaluatorContext, Stack } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export function StackPush(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.StackPush) {
        throw new TypeError(UnknownExpression(expr));
    }

    const rhs = compile(expr.rhs, options, compile);

    return (context: EvaluatorContext, stack: Stack) => {
        const value = rhs(context, stack);
        stack.push(value);
        return value;
    };
}

export function StackPop(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.StackPop) {
        throw new TypeError(UnknownExpression(expr));
    }

    return (context: EvaluatorContext, stack: Stack) => {
        return stack.pop();
    };
}

export function StackRef(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.StackRef) {
        throw new TypeError(UnknownExpression(expr));
    }

    const { offset } = expr;

    return (context: EvaluatorContext, stack: Stack) => {
        const { length } = stack;
        const index = length - offset;
        if (index >= 0 && index < length) {
            return stack[index];
        }
        return undefined;
    };
}
