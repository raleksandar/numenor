import { ExpressionType } from '../../Parser';
import {
    InternalEvaluator,
    EvaluatorContext,
    Stack,
    hasAsyncValue,
    hasConstValue,
    makeConstEval,
    evalConst,
    mark,
    EvaluatorFactory,
} from './';
import {
    UnknownExpression,
    UndefinedIdentifier,
    ImmutableContext,
    CannotAccessProperty,
    CannotAccessProto
} from '../Error';
import {
    hasOwnProp,
    makeProtoPropQuery,
    evalMaybeAsyncSteps,
    identity
} from './util';

export const Assignment: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.Assignment) {
        throw new TypeError(UnknownExpression(expr));
    }

    if (options.ImmutableContext) {
        return mark({ isConst: true }, () => { throw new TypeError(ImmutableContext); });
    }

    const rhs = compile(expr.rhs, options, compile);

    const contains = options.NoProtoAccess ? hasOwnProp : makeProtoPropQuery(options);
    let isConst = options.Constants && hasConstValue(rhs);
    let isAsync = hasAsyncValue(rhs);

    if (expr.lhs.type === ExpressionType.Identifier) {

        const { name } = expr.lhs;

        if (options.NoNewVars) {
            return (context: EvaluatorContext, stack: Stack) => {
                if (!hasOwnProp(context, name)) {
                    throw new ReferenceError(UndefinedIdentifier(name));
                }
                return context[name] = rhs(context, stack);
            };
        }

        if (isConst && contains(options.Constants!, name)) {
            if (isAsync) {
                return mark({ isConst, isAsync }, () => {
                    return evalConst(rhs).then((value: any) => options.Constants![name] = value);
                });
            }
            return makeConstEval(options.Constants![name] = evalConst(rhs));
        }

        if (isAsync) {
            return mark({ isAsync }, (context, stack) => {
                return rhs(context, stack).then((value: any) => context[name] = value);
            });
        }

        return (context: EvaluatorContext, stack: Stack) => {
            return context[name] = rhs(context, stack);
        };
    }

    let prop: InternalEvaluator;
    let propProcessor = identity;

    if (expr.lhs.type === ExpressionType.MemberAccess) {

        const { name } = expr.lhs;

        if (name === '__proto__') {
            return mark({ isConst: true }, () => { throw new TypeError(CannotAccessProto); });
        }

        prop = () => name;
        propProcessor = identity;

    } else if (expr.lhs.type === ExpressionType.ComputedMemberAccess) {

        prop = compile(expr.lhs.rhs, options, compile);
        propProcessor = (propName) => {
            if (propName === '__proto__') {
                throw new TypeError(CannotAccessProto);
            }
            return propName;
        };

        isConst = isConst && hasConstValue(prop);
        isAsync = isAsync || hasAsyncValue(prop);

    } else {
        throw new TypeError(UnknownExpression(expr.lhs));
    }

    const lhs = compile(expr.lhs.lhs, options, compile);

    isConst = isConst && hasConstValue(lhs);
    isAsync = isAsync || hasAsyncValue(lhs);

    return mark({ isConst, isAsync }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, [
            [lhs, (object) => {
                if (object === null || typeof object !== 'object') {
                    throw new TypeError(CannotAccessProperty(object, name));
                }
                return object;
            }],
            [prop, propProcessor],
            rhs,
        ]).then(([object, propName, value]) => {
            return object[propName] = value;
        });
    });
};
