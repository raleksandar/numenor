import * as ExpressionType from '../ExpressionType';
import { Prefix, Parser } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expression } from '../Expression';
import { Sequence as SequencePrecedence } from '../Precedence';

export const ArrayLiteral: Prefix = (parser: Parser, token: Token.Any) => {

    if (token.type !== TokenType.LBracket) {
        throw new SyntaxError(UnknownToken(token));
    }

    const items: Expression[] = [];

    if (!parser.accept(TokenType.RBracket)) {

        do {
            // support trailing comma
            if (parser.match(TokenType.Comma)) {
                const comma = parser.shift();
                // but not [,]
                if (parser.match(TokenType.RBracket)) {
                    throw new SyntaxError(UnknownToken(comma));
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
