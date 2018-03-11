import { hasConstValue, mark, EvaluatorFactory, hasAsyncValue } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression, CannotAccessProperty, CannotAccessProto } from '../Error';
import { ownPropGetter, bindFunction, makeProtoPropGetter, evalMaybeAsyncSteps } from './util';

export const MemberAccess: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.MemberAccess) {
        throw new TypeError(UnknownExpression(expr));
    }

    const { name } = expr;

    if (name === '__proto__') {
        return mark({ isConst: true }, () => { throw new TypeError(CannotAccessProto); });
    }

    const lhs = compile(expr.lhs, options, compile);

    const isAsync = hasAsyncValue(lhs);
    const isConst = hasConstValue(lhs);

    const get = options.NoProtoAccess ? ownPropGetter : makeProtoPropGetter(options);

    return mark({ isAsync, isConst }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, [lhs]).then(([object]) => {

            if (object == null) {
                throw new TypeError(CannotAccessProperty(object, name));
            }

            const value = get(object, name);

            if (typeof value === 'function') {
                return bindFunction(value, object);
            }

            return value;
        });
    });
};

export const ComputedMemberAccess: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.ComputedMemberAccess) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const rhs = compile(expr.rhs, options, compile);

    const isAsync = hasAsyncValue(lhs) || hasAsyncValue(rhs);
    const isConst = hasConstValue(lhs) && hasConstValue(rhs);

    const get = options.NoProtoAccess ? ownPropGetter : makeProtoPropGetter(options);

    return mark({ isConst, isAsync }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, [

            [lhs, (object) => {
                if (object == null) {
                    throw new TypeError(CannotAccessProperty(object));
                }
                return object;
            }],

            [rhs, (name) => {
                if (name === '__proto__') {
                    throw new TypeError(CannotAccessProto);
                }
                return name;
            }],

        ]).then(([object, name]) => {

            const value = get(object, name);

            if (typeof value === 'function') {
                return bindFunction(value, object);
            }

            return value;
        });
    });
};
