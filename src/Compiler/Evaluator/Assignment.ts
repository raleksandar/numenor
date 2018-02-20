import { InternalEvaluator, EvaluatorContext, RegisterSet, ConstValue, hasConstValue, Evaluator, makeConstEval, evalConst, markAsConst } from './';
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

    if (options.ImmutableContext && expr.lhs.type !== ExpressionType.Register) {
        return markAsConst(() => { throw new TypeError(ImmutableContext); });
    }

    const rhs = compile(expr.rhs, options, compile);

    if (expr.lhs.type === ExpressionType.Register) {

        const {index} = expr.lhs;
        const isConst = hasConstValue(rhs as Evaluator);

        return (context: EvaluatorContext, registers: RegisterSet) => {
            return registers[index] = {
                value: rhs(context, registers),
                [ConstValue]: isConst,
            };
        };
    }

    const contains = options.NoProtoAccess ? hasOwnProp : hasProtoProp;
    const isConst = options.Constants && hasConstValue(rhs as Evaluator);

    if (expr.lhs.type === ExpressionType.Identifier) {

        const {name} = expr.lhs;

        if (options.NoNewVars) {
            return (context: EvaluatorContext, registers: RegisterSet) => {
                if (!hasOwnProp(context, name)) {
                    throw new ReferenceError(UndefinedIdentifier(name));
                }
                return context[name] = rhs(context, registers);
            };
        }

        if (isConst && contains(options.Constants!, name)) {
            return makeConstEval(options.Constants![name] = evalConst(rhs));
        }

        return (context: EvaluatorContext, registers: RegisterSet) => {
            return context[name] = rhs(context, registers);
        };
    }

    if (expr.lhs.type === ExpressionType.MemberAccess) {

        const {name} = expr.lhs;
        const lhs = compile(expr.lhs.lhs, options, compile);

        if (isConst && hasConstValue(lhs as Evaluator)) {
            return makeConstEval(evalConst(lhs)[name] = evalConst(rhs));
        }

        return (context: EvaluatorContext, registers: RegisterSet) => {

            const object = lhs(context, registers);

            if (object === null || typeof object !== 'object') {
                throw new TypeError(CannotAccessProperty(object, name));
            }

            return object[name] = rhs(context, registers);
        };
    }

    if (expr.lhs.type === ExpressionType.ComputedMemberAccess) {

        const lhs = compile(expr.lhs.lhs, options, compile);
        const prop = compile(expr.lhs.rhs, options, compile);

        if (isConst && hasConstValue(lhs as Evaluator) && hasConstValue(prop as Evaluator)) {
            return makeConstEval(evalConst(lhs)[evalConst(prop)] = evalConst(rhs));
        }

        return (context: EvaluatorContext, registers: RegisterSet) => {

            const object = lhs(context, registers);

            if (object === null || typeof object !== 'object') {
                throw new TypeError(CannotAccessProperty(object));
            }

            return object[prop(context, registers)] = rhs(context, registers);
        };
    }

    throw new TypeError(UnknownExpression(expr.lhs));
}
