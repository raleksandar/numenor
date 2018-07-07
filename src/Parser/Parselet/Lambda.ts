import { makePrefix, PrefixFn, MatchesFn, makeInfix, InfixFn } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken, UnexpectedToken } from '../Error';
import { Argument, Identifier } from '../Expression';
import { Precedence, ExpressionType } from '../';
import { Identifier as parseIdentifier } from './Value';

const prefix: PrefixFn = (parser, token) => {

    if (token.type !== TokenType.LParen) {
        throw new SyntaxError(UnknownToken(token));
    }

    const args: Argument[] = [];

    if (!parser.accept(TokenType.RParen)) {

        do {
            // support trailing comma
            if (parser.match(TokenType.RParen)) {
                // but not (,)
                if (args.length === 0) {
                    throw new SyntaxError(UnknownToken(parser.token));
                }
                break;
            }

            args.push(parseIdentifier(parser, parser.shift()) as Identifier);

        } while (parser.accept(TokenType.Comma));

        parser.expect(TokenType.RParen);
    }

    parser.expect(TokenType.RightArrow);

    return {
        type: ExpressionType.Lambda,
        args,
        body: parser.parse(),
    };
};

const infix: InfixFn = (parser, lhs, token) => {

    if (lhs.type !== ExpressionType.Identifier || token.type !== TokenType.RightArrow) {
        throw new SyntaxError(UnexpectedToken(TokenType.RightArrow, token));
    }

    return {
        type: ExpressionType.Lambda,
        args: [ lhs ],
        body: parser.parse(),
    };
};

// returns true if following grammar is matched:
// * ::= '(' IdentifierList ')' '=>'
// IdentifierList ::= Identifier | Identifier ',' IdentifierList | <empty>
const matches: MatchesFn = (parser, token) => {

    let offset = 0;
    const peek = () => parser.peek(offset++).type;

    if (token.type !== TokenType.LParen) {
        return false;
    }

    list: while (true) {
        switch (peek()) {
            case TokenType.RParen: {
                break list;
            }
            case TokenType.Identifier: {
                const next = peek();
                if (next === TokenType.RParen) {
                    break list;
                } else if (next === TokenType.Comma) {
                    continue;
                }
                return false;
            }
            default: {
                return false;
            }
        }
    }

    return peek() === TokenType.RightArrow;
};

export const LambdaPrefix = makePrefix(prefix, matches);
export const LambdaInfix = makeInfix(infix, Precedence.Primary);
