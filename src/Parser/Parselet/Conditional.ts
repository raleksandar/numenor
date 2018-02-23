import * as ExpressionType from '../ExpressionType';
import { makeInfix, Infix, InfixFn } from './';
import { Token, TokenType } from '../../Lexer';
import { UnknownToken } from '../Error';
import { Any as Expr } from '../Expression';
import { Conditional as ConditionalPrecedence, Primary as PrimaryPrecedence } from '../Precedence';
import { ComputedMemberAccess, MemberAccess } from './MemberAccess';
import { Call } from './Call';

const conditional: InfixFn = (parser, lhs, token) => {

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

const coalesce: InfixFn = (parser, lhs, token) => {

    if (token.type !== TokenType.QuestionQuestion) {
        throw new SyntaxError(UnknownToken(token));
    }

    // a ?? b => (#push(a), #ref(1) != null ? #pop() : (#pop(), b))

    const elseBranch = parser.parse(ConditionalPrecedence - 1);

    const pop: Expr = {
        type: ExpressionType.StackPop,
    };

    return {
        type: ExpressionType.Sequence,
        expressions: [{
            type: ExpressionType.StackPush,
            rhs: lhs,
        }, {
            type: ExpressionType.Conditional,
            thenBranch: pop,
            elseBranch: {
                type: ExpressionType.Sequence,
                expressions: [pop, elseBranch],
            },
            lhs: {
                type: ExpressionType.BinaryOperation,
                operator: TokenType.BangEq,
                lhs: {
                    type: ExpressionType.StackRef,
                    offset: 1,
                },
                rhs: {
                    type: ExpressionType.NullLiteral,
                    value: null,
                },
            },
        }],
    };
};

export const NullCoalesce: Infix = makeInfix(coalesce, ConditionalPrecedence);

const access: InfixFn = (parser, lhs, token, context) => {

    if (token.type !== TokenType.QuestionDot) {
        throw new SyntaxError(UnknownToken(token));
    }

    // a?.b => (#push(a), #ref(1) != null ? #pop().b : #pop())
    // a?.[b] => (#push(a), #ref(1) != null ? #pop()[b] : #pop())
    // a?.(b) => (#push(a), #ref(1) != null ? #pop()(b) : #pop())

    const pop: Expr = {
        type: ExpressionType.StackPop,
    };

    let thenBranch: Expr;

    if (parser.match(TokenType.LBracket)) {
        thenBranch = ComputedMemberAccess(parser, pop, parser.shift(), context);
    } else if (parser.match(TokenType.LParen)) {
        thenBranch = Call(parser, pop, parser.shift(), context);
    } else {
        const dot: Token = {
            type: TokenType.Dot,
            line: token.line,
            col: token.col,
        };
        thenBranch = MemberAccess(parser, pop, dot, context);
    }

    return {
        type: ExpressionType.Sequence,
        expressions: [{
            type: ExpressionType.StackPush,
            rhs: lhs,
        }, {
            type: ExpressionType.Conditional,
            thenBranch,
            elseBranch: pop,
            lhs: {
                type: ExpressionType.BinaryOperation,
                operator: TokenType.BangEq,
                lhs: {
                    type: ExpressionType.StackRef,
                    offset: 1,
                },
                rhs: {
                    type: ExpressionType.NullLiteral,
                    value: null,
                },
            },
        }],
    };
};

export const NullConditional: Infix = makeInfix(access, PrimaryPrecedence);
