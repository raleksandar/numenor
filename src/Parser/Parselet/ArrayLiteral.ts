import * as ExpressionType from '../ExpressionType';
import { Prefix } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expression } from '../Expression';
import { Sequence as SequencePrecedence } from '../Precedence';

export const ArrayLiteral: Prefix = (parser, token) => {

    if (token.type !== TokenType.LBracket) {
        throw new SyntaxError(UnknownToken(token));
    }

    const items: Expression[] = [];

    if (!parser.accept(TokenType.RBracket)) {

        do {
            // support trailing comma
            if (parser.match(TokenType.RBracket)) {
                // but not [,]
                if (items.length === 0) {
                    throw new SyntaxError(UnknownToken(parser.token));
                }
                break;
            }

            items.push(parser.parse(SequencePrecedence));

        } while (parser.accept(TokenType.Comma));

        parser.expect(TokenType.RBracket);
    }

    return {
        type: ExpressionType.ArrayLiteral,
        items,
    };
};
