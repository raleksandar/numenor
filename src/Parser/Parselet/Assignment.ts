import * as ExpressionType from '../ExpressionType';
import { makeInfix, Infix, InfixFn } from './';
import { Assignment as AssignmentPrecedence } from '../Precedence';
import { Any as Expr } from '../Expression';
import { TokenType } from '../../Lexer';
import { UnknownToken, InvalidLeftHandSide } from '../Error';
import { NullCoalesce } from './Conditional';

export function makeAssignmentParselet<T extends TokenType.Any>(operator: T): Infix {

    const parselet: InfixFn = (parser, lhs, token): Expr => {

        if (!('operator' in token)) {
            throw new SyntaxError(UnknownToken(token));
        }

        if (lhs.type !== ExpressionType.Identifier &&
            lhs.type !== ExpressionType.MemberAccess &&
            lhs.type !== ExpressionType.ComputedMemberAccess
        ) {
            throw new SyntaxError(InvalidLeftHandSide);
        }

        let rhs: Expr;

        if (operator === TokenType.QuestionQuestion) {
            // a ??= b => a = a ?? b => a = (#push(a), #ref(1) != null ? #pop() : (#pop(), b))
            rhs = NullCoalesce(parser, lhs, {
                type: TokenType.QuestionQuestion,
                line: token.line,
                col: token.col,
            });
        } else {
            rhs = parser.parse(AssignmentPrecedence - 1);
            if (operator !== TokenType.Eq) {
                rhs = {
                    type: ExpressionType.BinaryOperation,
                    operator: token.operator,
                    lhs,
                    rhs,
                };
            }
        }

        return {
            type: ExpressionType.Assignment,
            lhs,
            rhs,
        };
    };

    return makeInfix(parselet, AssignmentPrecedence);
}
