import * as ExpressionType from '../ExpressionType';
import { makeInfix, Infix, InfixFn } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Sequence as SequencePrecedence } from '../Precedence';

const parselet: InfixFn = (parser, lhs, token) => {

    if (token.type !== TokenType.Comma) {
        throw new SyntaxError(UnknownToken(token));
    }

    const expressions: Expr[] = [lhs];
    let comma: Token = token;

    do {
        if (parser.match(TokenType.EOF) || parser.match(TokenType.RParen)) {
            // do not allow trailing comma
            throw new SyntaxError(UnknownToken(comma));
        }

        expressions.push(parser.parse(SequencePrecedence));
        comma = parser.token;

    } while (parser.accept(TokenType.Comma));

    return {
        type: ExpressionType.Sequence,
        expressions,
    };
};

export const Sequence: Infix = makeInfix(parselet, SequencePrecedence);
