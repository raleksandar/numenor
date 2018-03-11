import { EvaluatorFactory } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export const StackPush: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.StackPush) {
        throw new TypeError(UnknownExpression(expr));
    }

    const rhs = compile(expr.rhs, options, compile);

    return (context, stack) => {
        const value = rhs(context, stack);
        stack.push(value);
        return value;
    };
};

export const StackPop: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.StackPop) {
        throw new TypeError(UnknownExpression(expr));
    }

    return (context, stack) => stack.pop();
};

export const StackRef: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.StackRef) {
        throw new TypeError(UnknownExpression(expr));
    }

    const { offset } = expr;

    return (context, stack) => {
        const { length } = stack;
        const index = length - offset;
        if (index >= 0 && index < length) {
            return stack[index];
        }
        return undefined;
    };
};
