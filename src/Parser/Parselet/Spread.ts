import * as ExpressionType from '../ExpressionType';
import { Prefix } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Prefix as PrefixPrecedence } from '../Precedence';

export const Spread: Prefix = (parser, token) => {
    if (token.type !== TokenType.Ellipsis) {
        throw new SyntaxError(UnknownToken(token));
    }
    return {
        type: ExpressionType.Spread,
        rhs: parser.parse(PrefixPrecedence),
    };
};
