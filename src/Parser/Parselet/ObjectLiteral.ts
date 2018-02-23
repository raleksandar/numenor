import * as ExpressionType from '../ExpressionType';
import { Prefix } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expression, NamedItem } from '../Expression';
import { Sequence as SequencePrecedence } from '../Precedence';

export const ObjectLiteral: Prefix = (parser, token) => {

    if (token.type !== TokenType.LBrace) {
        throw new SyntaxError(UnknownToken(token));
    }

    const items: NamedItem[] = [];

    if (!parser.accept(TokenType.RBrace)) {

        do {
            // support trailing comma
            if (parser.match(TokenType.Comma)) {
                const comma = parser.shift();
                // but not {,}
                if (parser.match(TokenType.RBrace)) {
                    throw new SyntaxError(UnknownToken(comma));
                }
                break;
            }

            let name: Expression,
                value: Expression;

            const computedPropertyName = parser.accept(TokenType.LBracket);

            if (computedPropertyName) {
                name = parser.parse();
                parser.expect(TokenType.RBracket);
            } else {

                const currentToken = parser.token;

                if (currentToken.type === TokenType.Identifier) {
                    name = {
                        type: ExpressionType.StringLiteral,
                        value: currentToken.name,
                    };
                } else if (currentToken.type === TokenType.StringLiteral) {
                    name = {
                        type: ExpressionType.StringLiteral,
                        value: currentToken.value,
                    };
                } else if (currentToken.type === TokenType.NumberLiteral) {
                    name = {
                        type: ExpressionType.NumberLiteral,
                        value: currentToken.value,
                    };
                } else {
                    throw new SyntaxError(UnknownToken(currentToken));
                }

                parser.shift();
            }

            if (!computedPropertyName && (
                parser.token.type === TokenType.Comma ||
                parser.token.type === TokenType.RBrace
            )) {
                // shorthand property name
                if (name.type !== ExpressionType.Identifier) {
                    throw new SyntaxError(UnknownToken(parser.token));
                }
                value = name;
                name = {
                    type: ExpressionType.StringLiteral,
                    value: name.name,
                };
            } else {
                parser.expect(TokenType.Colon);
                value = parser.parse(SequencePrecedence);
            }

            items.push({
                name,
                value,
            });

        } while (parser.accept(TokenType.Comma));

        parser.expect(TokenType.RBrace);
    }

    return {
        type: ExpressionType.ObjectLiteral,
        items,
    };
};
