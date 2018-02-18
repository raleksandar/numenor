import * as ExpressionType from '../ExpressionType';
import { Parser, makeInfix, Infix } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Primary as CallPrecedence, Sequence as SequencePrecedence } from '../Precedence';

function parselet(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.LParen) {
        throw new SyntaxError(UnknownToken(token));
    }

    const args: Expr[] = [];

    if (!parser.accept(TokenType.RParen)) {

        do {
            // support trailing comma
            if (parser.match(TokenType.Comma)) {
                const comma = parser.shift();
                // but not (,)
                if (parser.match(TokenType.RParen)) {
                    throw new SyntaxError(UnknownToken(comma));
                }
                break;
            }

            args.push(parser.parse(SequencePrecedence));

        } while (parser.accept(TokenType.Comma));

        parser.expect(TokenType.RParen);
    }

    return {
        type: ExpressionType.Call,
        lhs: lhs,
        args,
    };
};

export const Call: Infix = makeInfix(parselet, CallPrecedence);
