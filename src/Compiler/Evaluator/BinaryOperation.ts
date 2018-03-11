import { hasConstValue, mark, hasAsyncValue, EvaluatorFactory } from './';
import { ExpressionType } from '../../Parser';
import { UnknownExpression } from '../Error';
import { TokenType } from '../../Lexer';
import { hasOwnProp, makeProtoPropQuery, evalMaybeAsyncSteps } from './util';

export const BinaryOperation: EvaluatorFactory = (expr, options, compile) => {

    if (expr.type !== ExpressionType.BinaryOperation) {
        throw new TypeError(UnknownExpression(expr));
    }

    const lhs = compile(expr.lhs, options, compile);
    const rhs = compile(expr.rhs, options, compile);
    const isConst = hasConstValue(lhs) && hasConstValue(rhs);

    // short-circuit operators require special approach
    if (expr.operator === TokenType.PipePipe || expr.operator === TokenType.AmpAmp) {

        const isLHSAsync = hasAsyncValue(lhs);
        const isRHSAsync = hasAsyncValue(rhs);

        if (!isLHSAsync && !isRHSAsync) {
            return mark({ isConst }, (context, stack) => {
                if (expr.operator === TokenType.PipePipe) {
                    return lhs(context, stack) || rhs(context, stack);
                }
                return lhs(context, stack) && rhs(context, stack);
            });
        }

        return mark({ isConst, isAsync: true }, (context, stack) => {
            if (isLHSAsync) {
                return lhs(context, stack).then((a: any) => {
                    if (expr.operator === TokenType.PipePipe) {
                        return a || rhs(context, stack);
                    }
                    return a && rhs(context, stack);
                });
            }
            const a = lhs(context, stack);
            if (expr.operator === TokenType.PipePipe) {
                return a ? Promise.resolve(a) : rhs(context, stack);
            }
            return a ? rhs(context, stack) : Promise.resolve(a);
        });
    }

    const contains = options.NoProtoAccess ? hasOwnProp : makeProtoPropQuery(options);

    function evaluate(operator: TokenType.Any, a: any, b: any): any {
        switch (operator) {
            case TokenType.Pipe: return a | b;
            case TokenType.Caret: return a ^ b;
            case TokenType.Amp: return a & b;
            case TokenType.EqEq: return a == b; // tslint:disable-line:triple-equals
            case TokenType.BangEq: return a != b; // tslint:disable-line:triple-equals
            case TokenType.EqEqEq: return a === b;
            case TokenType.BangEqEq: return a !== b;
            case TokenType.Lt: return a < b;
            case TokenType.LtEq: return a <= b;
            case TokenType.Gt: return a > b;
            case TokenType.GtEq: return a >= b;
            case TokenType.LtLt: return a << b;
            case TokenType.GtGt: return a >> b;
            case TokenType.GtGtGt: return a >>> b;
            case TokenType.Plus: return a + b;
            case TokenType.Minus: return a - b;
            case TokenType.Star: return a * b;
            case TokenType.Slash: return a / b;
            case TokenType.Percent: return a % b;
            case TokenType.StarStar: return a ** b;
            case TokenType.In:
                // unlike in JS `in` operator not only works on objects but also on:
                //      arrays: 20 in [1, 20, 3] === true
                //      strings: 'sum' in 'lorem ipsum' === true
                if (Array.isArray(b) || typeof b === 'string') {
                    return (b as any).indexOf(a) !== -1;
                }
                return contains(b, a);
            default:
                throw new TypeError(UnknownExpression(expr));
        }
    }

    const isAsync = hasAsyncValue(lhs) || hasAsyncValue(rhs);

    return mark({ isConst, isAsync }, (context, stack) => {
        return evalMaybeAsyncSteps(context, stack, [lhs, rhs]).then(([a, b]) => {
            return evaluate(expr.operator, a, b);
        });
    });
};
