import { Prefix, Infix, makeInfix, InfixFn } from './';
import { Any as Expr } from '../Expression';
import { TokenType } from '../../Lexer';
import { UnknownToken, InvalidLeftHandSide } from '../Error';
import { Any as Precedence, Postfix as PostfixPrecedence, Prefix as PrefixPrecedence } from '../Precedence';
import * as ExpressionType from '../ExpressionType';

export function makePrefixOperatorParselet<T extends TokenType.UnaryOperator>(operator: T): Prefix {

    return (parser, token) => {

        if (token.type !== operator) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: ExpressionType.PrefixOperation,
            rhs: parser.parse(),
            operator,
        };
    };
}

export function makePostfixOperatorParselet<T extends TokenType.UnaryOperator>(
    operator: T,
    precedence: Precedence = PostfixPrecedence,
): Infix {

    const parselet: InfixFn = (parser, lhs, token) => {

        if (token.type !== operator) {
            throw new SyntaxError(UnknownToken(token));
        }

        return {
            type: ExpressionType.PostfixOperation,
            lhs,
            operator,
        };
    };

    return makeInfix(parselet, precedence);
}

export function makePrefixAccessMutatorParselet(): Prefix {

    return (parser, token): Expr => {

        if (!('operator' in token)) {
            throw new SyntaxError(UnknownToken(token));
        }

        // ++a => (a += 1) => (a = a + 1)

        const lhs = parser.parse(PrefixPrecedence);

        if (lhs.type !== ExpressionType.Identifier &&
            lhs.type !== ExpressionType.MemberAccess &&
            lhs.type !== ExpressionType.ComputedMemberAccess
        ) {
            throw new SyntaxError(InvalidLeftHandSide);
        }

        const rhs: Expr = {
            type: ExpressionType.BinaryOperation,
            operator: token.operator,
            rhs: {
                type: ExpressionType.NumberLiteral,
                value: 1,
            },
            lhs,
        };

        return {
            type: ExpressionType.Assignment,
            lhs,
            rhs,
        };
    };
}

export function makePostfixAccessMutatorParselet<T extends TokenType.BinaryOperator>(
    operator: T,
    precedence: Precedence = PostfixPrecedence,
): Infix {

    const parselet: InfixFn = (parser, lhs, token) => {

        if (!('operator' in token)) {
            throw new SyntaxError(UnknownToken(token));
        }

        // a++ => (#push(a), a = #ref(1) + 1, #pop())

        if (lhs.type !== ExpressionType.Identifier &&
            lhs.type !== ExpressionType.MemberAccess &&
            lhs.type !== ExpressionType.ComputedMemberAccess
        ) {
            throw new SyntaxError(InvalidLeftHandSide);
        }

        return {
            type: ExpressionType.Sequence,
            expressions: [{
                type: ExpressionType.StackPush,
                rhs: lhs,
            }, {
                type: ExpressionType.Assignment,
                lhs,
                rhs: {
                    type: ExpressionType.BinaryOperation,
                    lhs: {
                        type: ExpressionType.StackRef,
                        offset: 1,
                    },
                    rhs: {
                        type: ExpressionType.NumberLiteral,
                        value: 1,
                    },
                    operator: token.operator,
                },
            }, {
                type: ExpressionType.StackPop,
            }],
        };
    };

    return makeInfix(parselet, precedence);
}
