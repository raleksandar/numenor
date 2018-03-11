import { hasConstValue, EvaluatorFactory, hasAsyncValue, mark } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { TokenType } from '../../Lexer';
import { evalMaybeAsyncSteps } from './util';

export const PrefixOperation: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.PrefixOperation) {
        throw new TypeError(UnknownExpression(expr));
    }

    function evaluate(operator: TokenType.Any, x: any): any {
        switch (operator) {
            case TokenType.Bang: return !x;
            case TokenType.Tilde: return ~x;
            case TokenType.Plus: return +x;
            case TokenType.Minus: return -x;
            default:
                throw new TypeError(UnknownExpression(expr));
        }
    }

    const rhs = compile(expr.rhs, options, compile);

    const isAsync = hasAsyncValue(rhs);
    const isConst = hasConstValue(rhs);

    return mark({ isConst, isAsync }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, [rhs]).then(([x]) => {
            return evaluate(expr.operator, x);
        });
    });
};
