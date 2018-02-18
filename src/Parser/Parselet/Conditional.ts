import * as ExpressionType from '../ExpressionType';
import { Parser, makeInfix, Infix } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Conditional as ConditionalPrecedence, Primary as PrimaryPrecedence } from '../Precedence';
import { ComputedMemberAccess, MemberAccess } from './MemberAccess';
import { Call } from './Call';

function conditional(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.Question) {
        throw new SyntaxError(UnknownToken(token));
    }

    const thenBranch = parser.parse();

    parser.expect(TokenType.Colon);

    const elseBranch = parser.parse(ConditionalPrecedence - 1);

    return {
        type: ExpressionType.Conditional,
        lhs,
        thenBranch,
        elseBranch,
    };
};

export const Conditional: Infix = makeInfix(conditional, ConditionalPrecedence);

function coalesce(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.QuestionQuestion) {
        throw new SyntaxError(UnknownToken(token));
    }

    // a ?? b => (#0 = a, #0 != null ? #0 : b)

    const elseBranch = parser.parse(ConditionalPrecedence - 1);

    const register: Expr = {
        type: ExpressionType.Register,
        index: 0,
    };

    return {
        type: ExpressionType.Sequence,
        expressions: [{
            type: ExpressionType.Assignment,
            lhs: register,
            rhs: lhs,
        }, {
            type: ExpressionType.Conditional,
            thenBranch: register,
            elseBranch,
            lhs: {
                type: ExpressionType.BinaryOperation,
                operator: TokenType.BangEq,
                lhs: register,
                rhs: {
                    type: ExpressionType.NullLiteral,
                    value: null,
                },
            },
        }],
    };
};

export const NullCoalesce: Infix = makeInfix(coalesce, ConditionalPrecedence);

function access(parser: Parser, lhs: Expr, token: Token.Any): Expr {

    if (token.type !== TokenType.QuestionDot) {
        throw new SyntaxError(UnknownToken(token));
    }

    // a?.b => (#0 = a, #0 != null ? #0.b : #0)
    // a?.[b] => (#0 = a, #0 != null ? #0[b] : #0)
    // a?.(b) => (#0 = a, #0 != null ? #0(b) : #0)

    const register: Expr = {
        type: ExpressionType.Register,
        index: 0,
    };

    let thenBranch: Expr;

    if (parser.match(TokenType.LBracket)) {
        thenBranch = ComputedMemberAccess(parser, register, parser.shift());
    } else if (parser.match(TokenType.LParen)) {
        thenBranch = Call(parser, register, parser.shift());
    } else {
        const dot: Token.Dot = {
            type: TokenType.Dot,
            line: token.line,
            col: token.col,
        };
        thenBranch = MemberAccess(parser, register, dot);
    }

    return {
        type: ExpressionType.Sequence,
        expressions: [{
            type: ExpressionType.Assignment,
            lhs: register,
            rhs: lhs,
        }, {
            type: ExpressionType.Conditional,
            thenBranch,
            elseBranch: register,
            lhs: {
                type: ExpressionType.BinaryOperation,
                operator: TokenType.BangEq,
                lhs: register,
                rhs: {
                    type: ExpressionType.NullLiteral,
                    value: null,
                },
            },
        }],
    };
};

export const NullConditional: Infix = makeInfix(access, PrimaryPrecedence);
