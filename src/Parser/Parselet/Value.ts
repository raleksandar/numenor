import * as ExpressionType from '../ExpressionType';
import { Prefix } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expression } from '../Expression';
import { Identifier as IdentifierToken, Literal as LiteralToken } from '../../Lexer/Token';

export const Identifier: Prefix = (parser, token) => {
    if (token.type !== TokenType.Identifier) {
        throw new SyntaxError(UnknownToken(token));
    }
    return {
        type: ExpressionType.Identifier,
        name: (token as IdentifierToken).name,
    };
};

function parse<T extends TokenType.Literal, E extends ExpressionType.Value>(
    literal: T,
    expression: E,
): Prefix {

    return (parser, token) => {

        if (token.type !== literal) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: expression,
            value: (token as LiteralToken).value,
        } as Expression;
    };
}

export const NumberLiteral = parse(TokenType.NumberLiteral, ExpressionType.NumberLiteral);
export const StringLiteral = parse(TokenType.StringLiteral, ExpressionType.StringLiteral);
export const BooleanLiteral = parse(TokenType.BooleanLiteral, ExpressionType.BooleanLiteral);
export const NullLiteral = parse(TokenType.NullLiteral, ExpressionType.NullLiteral);
export const UndefinedLiteral = parse(TokenType.UndefinedLiteral, ExpressionType.UndefinedLiteral);
