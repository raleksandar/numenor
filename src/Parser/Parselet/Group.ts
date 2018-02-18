import { Prefix, Parser } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';

export const Group: Prefix = (parser: Parser, token: Token.Any) => {

    if (token.type !== TokenType.LParen) {
        throw new SyntaxError(UnknownToken(token));
    }

    const expression = parser.parse();
    parser.expect(TokenType.RParen);
    return expression;
};
