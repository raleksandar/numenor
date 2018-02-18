import { Prefix, Infix, makeInfix, Parser } from './';
import { Any as Expr } from '../Expression';
import { PrefixOperation, PostfixOperation } from '../ExpressionType';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Precedence, Postfix as PostfixPrecedence } from '../Precedence';

export function makePrefixOperatorParselet<T extends TokenType.UnaryOperator>(operator: T): Prefix {

    return (parser: Parser, token: Token.Any): Expr => {

        if (token.type !== operator) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: PrefixOperation,
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
            type: PostfixOperation,
            lhs,
            operator,
        };
    }

    return makeInfix(parselet, precedence);
}
