import { makeConstEval, EvaluatorFactory, mark, InternalEvaluator } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression, UndefinedIdentifier, CannotAccessProto } from '../Error';
import { hasOwnProp, ownPropGetter, bindFunction, makeProtoPropQuery, makeProtoPropGetter } from './util';

export const Identifier: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Identifier) {
        throw new TypeError(UnknownExpression(expr));
    }

    const { name } = expr;

    if (name === '__proto__') {
        return mark({ isConst: true }, () => { throw new TypeError(CannotAccessProto); });
    }

    const contains = options.NoProtoAccess ? hasOwnProp : makeProtoPropQuery(options);

    if (options.Constants && contains(options.Constants, name)) {
        const value = options.Constants[name];
        if (typeof value === 'function') {
            return makeConstEval(bindFunction(value, options.Constants));
        }
        return makeConstEval(value);
    }

    const get = options.NoProtoAccess ? ownPropGetter : makeProtoPropGetter(options);

    const evaluator: InternalEvaluator = (context) => {

        const value = get(context, name);

        if (typeof value === 'function') {
            return bindFunction(value, context);
        }

        return value;
    };

    if (options.NoUndefinedVars) {
        return (context, stack) => {

            if (!contains(context, name)) {
                throw new ReferenceError(UndefinedIdentifier(name));
            }

            return evaluator(context, stack);
        };
    }

    return evaluator;
};
