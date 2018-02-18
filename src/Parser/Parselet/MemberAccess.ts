import * as ExpressionType from '../ExpressionType';
import { Parser, makeInfix, Infix } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Primary as MemberAccessPrecedence } from '../Precedence';

function dot(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.Dot) {
        throw new SyntaxError(UnknownToken(token));
    }

    const currentToken = parser.shift();
    let name: string;

    if (currentToken.type === TokenType.Identifier) {
        name = currentToken.name;
    } else if (currentToken.type === TokenType.In) {
        name = 'in';
    } else if (currentToken.type === TokenType.NullLiteral) {
        name = 'null';
    } else if (currentToken.type === TokenType.UndefinedLiteral) {
        name = 'undefined';
    } else if (currentToken.type === TokenType.BooleanLiteral) {
        name = currentToken.raw;
    } else {
        throw new SyntaxError(UnknownToken(currentToken));
    }

    return {
        type: ExpressionType.MemberAccess,
        lhs,
        name,
    };
};

export const MemberAccess: Infix = makeInfix(dot, MemberAccessPrecedence);

function index(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.LBracket) {
        throw new SyntaxError(UnknownToken(token));
    }

    const rhs = parser.parse();

    parser.expect(TokenType.RBracket);

    return {
        type: ExpressionType.ComputedMemberAccess,
        lhs,
        rhs,
    };
};

export const ComputedMemberAccess: Infix = makeInfix(index, MemberAccessPrecedence);
