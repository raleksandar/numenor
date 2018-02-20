import { InternalEvaluator, EvaluatorContext, Stack, hasConstValue, Evaluator, markAsConst } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, CannotAccessProperty, CannotAccessProto } from '../Error';
import { ownPropGetter, protoPropGetter } from './util';

export function MemberAccess(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.MemberAccess) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const {name} = expr;

    if (name === '__proto__') {
        return markAsConst(() => { throw new TypeError(CannotAccessProto); });
    }

    const get = options.NoProtoAccess ? ownPropGetter : protoPropGetter;

    const evaluator = (context: EvaluatorContext, stack: Stack) => {

        const object = lhs(context, stack);

        if (object === null || typeof object !== 'object') {
            throw new TypeError(CannotAccessProperty(object, name));
        }

        return get(object, name);
    };

    if (hasConstValue(lhs as Evaluator)) {
        return markAsConst(evaluator);
    }

    return evaluator;
}

export function ComputedMemberAccess(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.ComputedMemberAccess) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const rhs = compile(expr.rhs, options, compile);

    const get = options.NoProtoAccess ? ownPropGetter : protoPropGetter;

    const evaluator = (context: EvaluatorContext, stack: Stack) => {

        const object = lhs(context, stack);

        if (object === null || typeof object !== 'object') {
            throw new TypeError(CannotAccessProperty(object));
        }

        const name = rhs(context, stack);

        if (name === '__proto__') {
            throw new TypeError(CannotAccessProto);
        }

        return get(object, name);
    };

    if (hasConstValue(lhs as Evaluator) && hasConstValue(rhs as Evaluator)) {
        return markAsConst(evaluator);
    }

    return evaluator;
}
