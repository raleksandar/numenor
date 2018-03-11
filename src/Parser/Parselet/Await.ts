import * as ExpressionType from '../ExpressionType';
import { Prefix } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Prefix as PrefixPrecedence } from '../Precedence';

export const Await: Prefix = (parser, token) => {
    if (token.type !== TokenType.Await) {
        throw new SyntaxError(UnknownToken(token));
    }
    return {
        type: ExpressionType.Await,
        rhs: parser.parse(PrefixPrecedence),
    };
};
