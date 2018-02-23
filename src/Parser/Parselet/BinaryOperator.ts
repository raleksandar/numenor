import { Infix, makeInfix, InfixFn } from './';
import { Any as Expr } from '../Expression';
import { BinaryOperation } from '../ExpressionType';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Precedence } from '../Precedence';

export const LeftAssociative = Symbol('LeftAssociative');
export const RightAssociative = Symbol('RightAssociative');

export type Associativity = typeof LeftAssociative | typeof RightAssociative;

export function makeBinaryOperatorParselet<T extends TokenType.BinaryOperator>(
    operator: T,
    precedence: Precedence,
    associativity: Associativity = LeftAssociative,
): Infix {

    const parselet: InfixFn = (parser, lhs, token): Expr => {

        if (token.type !== operator) {
            throw new SyntaxError(UnknownToken(token));
        }

        const isRight = associativity === RightAssociative;
        const rhs = parser.parse(isRight ? precedence - 1 : precedence);

        return {
            type: BinaryOperation,
            lhs,
            rhs,
            operator,
        };
    }

    return makeInfix(parselet, precedence);
}
