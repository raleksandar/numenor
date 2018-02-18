import * as ExpressionType from '../ExpressionType';
import { Prefix, Parser } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expression } from '../Expression';

export const Identifier: Prefix = (parser: Parser, token: Token.Any) => {
    if (token.type !== TokenType.Identifier) {
        throw new SyntaxError(UnknownToken(token));
    }
    return {
        type: ExpressionType.Identifier,
        name: token.name,
    };
};

function parse<T extends TokenType.Literal, E extends ExpressionType.Value>(
    literal: T,
    expression: E,
): Prefix {

    return (parser: Parser, token: Token.Any) => {

        if (token.type !== literal) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: expression,
            value: token.value,
        } as Expression;
    };
}

export const NumberLiteral = parse(TokenType.NumberLiteral, ExpressionType.NumberLiteral);
export const StringLiteral = parse(TokenType.StringLiteral, ExpressionType.StringLiteral);
export const BooleanLiteral = parse(TokenType.BooleanLiteral, ExpressionType.BooleanLiteral);
export const NullLiteral = parse(TokenType.NullLiteral, ExpressionType.NullLiteral);
export const UndefinedLiteral = parse(TokenType.UndefinedLiteral, ExpressionType.UndefinedLiteral);
