import { makeConstEval, EvaluatorFactory, mark, ValueLookup } from './';
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

    if (options.Constants) {

        let constValue: any = undefined;

        if (contains(options.Constants, name)) {
            constValue = options.Constants[name];
        } else if (contains(options.Constants, ValueLookup)) {
            constValue = options.Constants[ValueLookup](name);
        }

        if (constValue !== undefined) {
            if (typeof constValue === 'function') {
                return makeConstEval(bindFunction(constValue, options.Constants));
            }
            return makeConstEval(constValue);
        }
    }

    const get = options.NoProtoAccess ? ownPropGetter : makeProtoPropGetter(options);

    return (context) => {

        let value = get(context, name);

        if (value === undefined && contains(context, ValueLookup)) {
            value = context[ValueLookup](name);
        }

        if (options.NoUndefinedVars && value === undefined) {
            throw new ReferenceError(UndefinedIdentifier(name));
        }

        if (typeof value === 'function') {
            return bindFunction(value, context);
        }

        return value;
    };
};
