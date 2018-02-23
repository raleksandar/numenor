import {
    InternalEvaluator,
    Evaluator,
    hasConstValue,
    makeConstEval,
    evalConst,
    EvaluatorContext,
    Stack
} from './';
import { CompilerOptions, EvaluatorFactory } from '../';
import { Expression, ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';

export function ObjectLiteral(expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator {

    if (expr.type !== ExpressionType.ObjectLiteral) {
        throw new TypeError(UnknownExpression(expr));
    }

    let isConst = true;

    const items = expr.items.map(({name, value}) => {

        const nameEval = compile(name, options, compile);
        const valueEval = compile(value, options, compile);

        const isNameConst = hasConstValue(nameEval as Evaluator);

        if (isConst && !isNameConst || !hasConstValue(valueEval as Evaluator)) {
            isConst = false;
        }

        return {
            name: isNameConst ? evalConst(nameEval) : nameEval,
            value: valueEval,
        };
    });

    const {ObjectPrototype} = options;

    if (isConst) {

        const object = Object.create(ObjectPrototype);

        items.forEach(({name, value}) => {
            object[name] = evalConst(value);
        });

        return makeConstEval(object);
    }

    const length = items.length;

    return (context: EvaluatorContext, stack: Stack) => {

        const object = Object.create(ObjectPrototype);

        for (let i = 0; i < length; i++) {

            const {name, value} = items[i];
            let itemName = name;

            if (typeof name === 'function') {
                itemName = name(context, stack);
            }

            object[itemName] = value(context, stack);
        }

        return object;
    };
}
