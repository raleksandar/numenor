import { InternalEvaluator, EvaluatorContext, makeConstEval, markAsConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, UndefinedIdentifier, CannotAccessProto } from '../Error';
import { hasProtoProp, hasOwnProp, ownPropGetter, protoPropGetter, bindFunction } from './util';

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
        const value = options.Constants[name];
        if (typeof value === 'function') {
            return makeConstEval(bindFunction(value, options.Constants));
        }
        return makeConstEval(value);
    }

    const get = options.NoProtoAccess ? ownPropGetter : protoPropGetter;

    const evaluator = (context: EvaluatorContext) => {

        const value = get(context, name);

        if (typeof value === 'function') {
            return bindFunction(value, context);
        }

        return value;
    };

    if (options.NoUndefinedVars) {
        return (context: EvaluatorContext) => {

            if (!contains(context, name)) {
                throw new ReferenceError(UndefinedIdentifier(name));
            }

            return evaluator(context);
        };
    }

    return evaluator;
}
