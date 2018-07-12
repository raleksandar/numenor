import { makeInfix, InfixFn } from './';
import { TokenType } from '../../Lexer';
import { UnexpectedToken, InvalidArgumentList } from '../Error';
import { Argument } from '../Expression';
import { Precedence, ExpressionType } from '../';
import { Assignment as AssignmentPrecedence } from '../Precedence';

const lambda: InfixFn = (parser, lhs, token) => {

    if (token.type !== TokenType.RightArrow) {
        throw new SyntaxError(UnexpectedToken(TokenType.RightArrow, token));
    }

    let paramList = [lhs];

    if (lhs.type === ExpressionType.Group) {
        if (!lhs.expression) {
            paramList = [];
        } else if (lhs.expression.type === ExpressionType.Sequence) {
            paramList = lhs.expression.expressions;
        } else {
            paramList = [lhs.expression];
        }
    } else if (lhs.type !== ExpressionType.Identifier) {
        throw new SyntaxError(InvalidArgumentList);
    }

    const args = paramList.map((expr): Argument => {
        if (expr.type === ExpressionType.Identifier) {
            return {
                name: expr.name,
                default: {
                    type: ExpressionType.UndefinedLiteral,
                    value: undefined,
                },
            };
        }
        if (expr.type === ExpressionType.Assignment &&
            expr.lhs.type === ExpressionType.Identifier
        ) {
            return {
                name: expr.lhs.name,
                default: expr.rhs,
            };
        }
        throw new SyntaxError(InvalidArgumentList);
    });

    return {
        type: ExpressionType.Lambda,
        args,
        body: parser.parse(AssignmentPrecedence - 1),
    };
};

export const Lambda = makeInfix(lambda, Precedence.Primary);
