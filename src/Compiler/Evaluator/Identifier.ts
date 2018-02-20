import { InternalEvaluator, EvaluatorContext, RegisterSet, makeConstEval, markAsConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, UndefinedIdentifier, CannotAccessProto } from '../Error';
import { hasProtoProp, hasOwnProp, ownPropGetter, protoPropGetter } from './util';

export function Identifier(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Identifier) {
        throw new TypeError(UnknownExpression(expr));
    }

    const {name} = expr;

    if (name === '__proto__') {
        return markAsConst(() => { throw new TypeError(CannotAccessProto); });
    }

    const contains = options.NoProtoAccess ? hasOwnProp : hasProtoProp;

    if (options.Constants && contains(options.Constants, name)) {
        return makeConstEval(options.Constants[name]);
    }

    const get = options.NoProtoAccess ? ownPropGetter : protoPropGetter;

    if (options.NoUndefinedVars) {
        return (context: EvaluatorContext) => {
            if (!contains(context, name)) {
                throw new ReferenceError(UndefinedIdentifier(name));
            }
            return get(context, name);
        };
    }

    return (context: EvaluatorContext) => {
        return get(context, name);
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
