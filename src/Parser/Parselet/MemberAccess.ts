import * as ExpressionType from '../ExpressionType';
import { makeInfix, Infix, InfixFn } from './';
import { TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Primary as MemberAccessPrecedence } from '../Precedence';

const dot: InfixFn = (parser, lhs, token) => {

    if (token.type !== TokenType.Dot) {
        throw new SyntaxError(UnknownToken(token));
    }

    const currentToken = parser.shift();
    let name: string;

    if (currentToken.type === TokenType.Identifier) {
        name = currentToken.name;
    } else if (currentToken.type === TokenType.In ||
        currentToken.type === TokenType.NullLiteral ||
        currentToken.type === TokenType.UndefinedLiteral ||
        currentToken.type === TokenType.BooleanLiteral
    ) {
        name = currentToken.lexeme;
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

const index: InfixFn = (parser, lhs, token) => {

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
