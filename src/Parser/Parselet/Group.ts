import { Prefix } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';

export const Group: Prefix = (parser, token) => {

    if (token.type !== TokenType.LParen) {
        throw new SyntaxError(UnknownToken(token));
    }

    const expression = parser.parse();
    parser.expect(TokenType.RParen);
    return expression;
};
