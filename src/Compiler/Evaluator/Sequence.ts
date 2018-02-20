import { InternalEvaluator, Stack, EvaluatorContext, hasConstValue, Evaluator } from './';
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

    if (length === 1) {
        return expressions[length - 1];
    }

    return (context: EvaluatorContext, stack: Stack) => {

        let value: any;

        for (let i = 0; i < length; i++) {
            value = expressions[i](context, stack);
        }

        return value;
    };
}
