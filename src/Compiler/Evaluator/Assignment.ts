import { InternalEvaluator, EvaluatorContext, Stack, hasConstValue, Evaluator, makeConstEval, evalConst, markAsConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import {
    UnknownExpression,
    UndefinedIdentifier,
    ImmutableContext,
    CannotAccessProperty
} from '../Error';
import { hasOwnProp, hasProtoProp } from './util';

export function Assignment(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Assignment) {
        throw new TypeError(UnknownExpression(expr));
    }

    if (options.ImmutableContext) {
        return markAsConst(() => { throw new TypeError(ImmutableContext); });
    }

    const rhs = compile(expr.rhs, options, compile);

    const contains = options.NoProtoAccess ? hasOwnProp : hasProtoProp;
    const isConst = options.Constants && hasConstValue(rhs as Evaluator);

    if (expr.lhs.type === ExpressionType.Identifier) {

        const {name} = expr.lhs;

        if (options.NoNewVars) {
            return (context: EvaluatorContext, stack: Stack) => {
                if (!hasOwnProp(context, name)) {
                    throw new ReferenceError(UndefinedIdentifier(name));
                }
                return context[name] = rhs(context, stack);
            };
        }

        if (isConst && contains(options.Constants!, name)) {
            return makeConstEval(options.Constants![name] = evalConst(rhs));
        }

        return (context: EvaluatorContext, stack: Stack) => {
            return context[name] = rhs(context, stack);
        };
    }

    if (expr.lhs.type === ExpressionType.MemberAccess) {

        const {name} = expr.lhs;
        const lhs = compile(expr.lhs.lhs, options, compile);

        const evaluator = (context: EvaluatorContext, stack: Stack) => {

            const object = lhs(context, stack);

            if (object === null || typeof object !== 'object') {
                throw new TypeError(CannotAccessProperty(object, name));
            }

            return object[name] = rhs(context, stack);
        };

        if (isConst && hasConstValue(lhs as Evaluator)) {
            return markAsConst(evaluator);
        }

        return evaluator;
    }

    if (expr.lhs.type === ExpressionType.ComputedMemberAccess) {

        const lhs = compile(expr.lhs.lhs, options, compile);
        const prop = compile(expr.lhs.rhs, options, compile);

        const evaluator = (context: EvaluatorContext, stack: Stack) => {

            const object = lhs(context, stack);

            if (object === null || typeof object !== 'object') {
                throw new TypeError(CannotAccessProperty(object));
            }

            return object[prop(context, stack)] = rhs(context, stack);
        };

        if (isConst && hasConstValue(lhs as Evaluator) && hasConstValue(prop as Evaluator)) {
            return markAsConst(evaluator);
        }

        return evaluator;
    }

    throw new TypeError(UnknownExpression(expr.lhs));
}
