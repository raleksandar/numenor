import { Prefix } from './';
import { ExpressionType } from '../';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';

export const Group: Prefix = (parser, token) => {

    if (token.type !== TokenType.LParen) {
        throw new SyntaxError(UnknownToken(token));
    }

    if (parser.accept(TokenType.RParen)) {
        return { type: ExpressionType.Group };
    }

    const expression = parser.parse();
    parser.expect(TokenType.RParen);

    return {
        type: ExpressionType.Group,
        expression,
    };
};
