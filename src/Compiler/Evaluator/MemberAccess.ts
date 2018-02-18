import { InternalEvaluator, EvaluatorContext, RegisterSet, hasConstValue, Evaluator, evalConst, makeConstEval } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression, CannotAccessProperty } from '../Error';

export function MemberAccess(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.MemberAccess) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const {name} = expr;

    const evaluator = (context: EvaluatorContext, registers: RegisterSet) => {

        const object = lhs(context, registers);

        if (object === null || typeof object !== 'object') {
            throw new TypeError(CannotAccessProperty(object, name));
        }

        return object[name];
    };

    if (hasConstValue(lhs as Evaluator)) {
        return makeConstEval(evalConst(evaluator));
    }

    return evaluator;
}

export function ComputedMemberAccess(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.ComputedMemberAccess) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const rhs = compile(expr.rhs, options, compile);

    const evaluator = (context: EvaluatorContext, registers: RegisterSet) => {

        const object = lhs(context, registers);

        if (object === null || typeof object !== 'object') {
            throw new TypeError(CannotAccessProperty(object));
        }

        const name = rhs(context, registers);

        return object[name];
    };

    if (hasConstValue(lhs as Evaluator) && hasConstValue(rhs as Evaluator)) {
        return makeConstEval(evalConst(evaluator));
    }

    return evaluator;
}
