import {
    InternalEvaluator,
    Evaluator,
    hasConstValue,
    makeConstEval,
    evalConst,
    EvaluatorContext,
    RegisterSet
} from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export function ArrayLiteral(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.ArrayLiteral) {
        throw new TypeError(UnknownExpression(expr));
    }

    let isConst = true;

    const items: InternalEvaluator[] = expr.items.map((itemExpr) => {

        const item = compile(itemExpr, options, compile);

        if (isConst && !hasConstValue(item as Evaluator)) {
            isConst = false;
        }

        return item;
    });

    if (isConst) {
        return makeConstEval(items.map(evalConst));
    }

    const length = items.length;

    return (context: EvaluatorContext, registers: RegisterSet) => {

        const array: any[] = new Array(length);

        for (let i = 0; i < length; i++) {
            array[i] = items[i](context, registers);
        }

        return array;
    };
}
