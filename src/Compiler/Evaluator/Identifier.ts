import { InternalEvaluator, EvaluatorContext, RegisterSet, makeConstEval } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, UndefinedIdentifier } from '../Error';

const hasOwnProp = Object.prototype.hasOwnProperty;
const contains = (object: any, member: string): boolean => {
    return hasOwnProp.call(object, member);
};

export function Identifier(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Identifier) {
        throw new TypeError(UnknownExpression(expr));
    }

    const {name} = expr;

    if (options.Constants && contains(options.Constants, name)) {
        return makeConstEval(options.Constants[name]);
    }

    if (options.NoUndefinedVars) {
        return (context: EvaluatorContext) => {
            if (!contains(context, name)) {
                throw new ReferenceError(UndefinedIdentifier(name));
            }
            return context[name];
        };
    }

    return (context: EvaluatorContext) => {
        return context[name];
    };
}

export function Register(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Register) {
        throw new TypeError(UnknownExpression(expr));
    }

    const {index} = expr;

    return (context: EvaluatorContext, registers: RegisterSet) => {
        const register = registers[index];
        if (typeof register !== 'undefined') {
            return register.value;
        }
        return undefined;
    };
}
