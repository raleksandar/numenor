import * as ExpressionType from '../ExpressionType';
import { Parser, makeInfix, Infix } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Sequence as SequencePrecedence } from '../Precedence';

function parselet(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.Comma) {
        throw new SyntaxError(UnknownToken(token));
    }

    const expressions: Expr[] = [lhs];
    let comma: Token.Any = token;

    do {
        if (parser.match(TokenType.EOF) || parser.match(TokenType.RParen)) {
            // do not allow trailing comma
            throw new SyntaxError(UnknownToken(comma));
        }

        expressions.push(parser.parse());
        comma = parser.token;

    } while (parser.accept(TokenType.Comma));

    return {
        type: ExpressionType.Sequence,
        expressions,
    };
};

export const Sequence: Infix = makeInfix(parselet, SequencePrecedence);
