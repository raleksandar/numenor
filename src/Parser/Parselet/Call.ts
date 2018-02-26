import * as ExpressionType from '../ExpressionType';
import { makeInfix, Infix, InfixFn } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Primary as CallPrecedence, Sequence as SequencePrecedence } from '../Precedence';

const parselet: InfixFn = (parser, lhs, token) => {

    if (token.type !== TokenType.LParen) {
        throw new SyntaxError(UnknownToken(token));
    }

    const args: Expr[] = [];

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
