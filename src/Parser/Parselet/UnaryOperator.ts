import { Prefix, Infix, makeInfix, Parser } from './';
import { Any as Expr } from '../Expression';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken, InvalidLeftHandSide } from '../Error';
import { Any as Precedence, Postfix as PostfixPrecedence, Prefix as PrefixPrecedence } from '../Precedence';
import * as ExpressionType from '../ExpressionType';

export function makePrefixOperatorParselet<T extends TokenType.UnaryOperator>(operator: T): Prefix {

    return (parser: Parser, token: Token.Any): Expr => {

        if (token.type !== operator) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: ExpressionType.PrefixOperation,
            rhs: parser.parse(),
            operator,
        };
    };
}

export function makePostfixOperatorParselet<T extends TokenType.UnaryOperator>(
    operator: T,
    precedence: Precedence = PostfixPrecedence,
): Infix {

    const parselet = (parser: Parser, lhs: Expr, token: Token.Any): Expr => {

        if (token.type !== operator) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: ExpressionType.PostfixOperation,
            lhs,
            operator,
        };
    }

    return makeInfix(parselet, precedence);
}

export function makePrefixAccessMutatorParselet(): Prefix {

    return (parser: Parser, token: Token.Any): Expr => {

        if (!('operator' in token)) {
            throw new SyntaxError(UnknownToken(token));
        }

        // ++a => (a += 1) => (a = a + 1)

        const lhs = parser.parse(PrefixPrecedence);

        if (lhs.type !== ExpressionType.Identifier &&
            lhs.type !== ExpressionType.Register &&
            lhs.type !== ExpressionType.MemberAccess &&
            lhs.type !== ExpressionType.ComputedMemberAccess
        ) {
            throw new SyntaxError(InvalidLeftHandSide);
        }

        const rhs: Expr = {
            type: ExpressionType.BinaryOperation,
            operator: token.operator,
            rhs: {
                type: ExpressionType.NumberLiteral,
                value: 1,
            },
            lhs,
        };

        return {
            type: ExpressionType.Assignment,
            lhs,
            rhs,
        };
    };
}
