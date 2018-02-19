import { InternalEvaluator, RegisterSet, EvaluatorContext, hasConstValue, Evaluator, evalConst, makeConstEval } from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export function Sequence(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.Sequence) {
        throw new TypeError(UnknownExpression(expr));
    }

    const expressions = expr.expressions
        .map((e) => compile(e, options, compile))
        .filter((e, index, {length}) => {
            return index === length - 1 || !hasConstValue(e as Evaluator);
        });

    const {length} = expressions;

    if (length === 1 && hasConstValue(expressions[length - 1] as Evaluator)) {
        return makeConstEval(evalConst);
    }

    return (context: EvaluatorContext) => {

        const registers: RegisterSet = [];

        let value: any;

        for (let i = 0; i < length; i++) {
            value = expressions[i](context, registers);
        }

        return value;
    };
}
