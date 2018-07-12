import { Parser } from './Parser';
import { TokenType, Lexer } from './Lexer';
import { Identifier, NumberLiteral, StringLiteral, BooleanLiteral, NullLiteral, UndefinedLiteral } from './Parser/Parselet/Value';
import { makeAssignmentParselet } from './Parser/Parselet/Assignment';
import { makeBinaryOperatorParselet, RightAssociative } from './Parser/Parselet/BinaryOperator';
import * as Precedence from './Parser/Precedence';
import { Sequence } from './Parser/Parselet/Sequence';
import { Conditional, NullCoalesce, NullConditional } from './Parser/Parselet/Conditional';
import { makePrefixOperatorParselet, makePrefixAccessMutatorParselet, makePostfixAccessMutatorParselet } from './Parser/Parselet/UnaryOperator';
import { MemberAccess, ComputedMemberAccess } from './Parser/Parselet/MemberAccess';
import { Call } from './Parser/Parselet/Call';
import { Group } from './Parser/Parselet/Group';
import { ArrayLiteral } from './Parser/Parselet/ArrayLiteral';
import { ObjectLiteral } from './Parser/Parselet/ObjectLiteral';
import { Await } from './Parser/Parselet/Await';
import { Lambda } from './Parser/Parselet/Lambda';
import { Spread } from './Parser/Parselet/Spread';

export class ExpressionParser extends Parser {

    constructor(lexer: Lexer) {
        super(lexer);

        this.ignore(TokenType.Whitespace);
        this.ignore(TokenType.LineTerminator);

        this.setInfix(TokenType.Comma, Sequence);

        this.setInfix(TokenType.Eq, makeAssignmentParselet(TokenType.Eq));
        this.setInfix(TokenType.PlusEq, makeAssignmentParselet(TokenType.Plus));
        this.setInfix(TokenType.MinusEq, makeAssignmentParselet(TokenType.Minus));
        this.setInfix(TokenType.StarEq, makeAssignmentParselet(TokenType.Star));
        this.setInfix(TokenType.StarStarEq, makeAssignmentParselet(TokenType.StarStar));
        this.setInfix(TokenType.SlashEq, makeAssignmentParselet(TokenType.Slash));
        this.setInfix(TokenType.PercentEq, makeAssignmentParselet(TokenType.Percent));
        this.setInfix(TokenType.AmpEq, makeAssignmentParselet(TokenType.Amp));
        this.setInfix(TokenType.PipeEq, makeAssignmentParselet(TokenType.Pipe));
        this.setInfix(TokenType.CaretEq, makeAssignmentParselet(TokenType.Caret));
        this.setInfix(TokenType.TildeEq, makeAssignmentParselet(TokenType.Tilde));
        this.setInfix(TokenType.QuestionQuestionEq, makeAssignmentParselet(TokenType.QuestionQuestion));
        this.setInfix(TokenType.LtLtEq, makeAssignmentParselet(TokenType.LtLt));
        this.setInfix(TokenType.GtGtEq, makeAssignmentParselet(TokenType.GtGt));
        this.setInfix(TokenType.GtGtGtEq, makeAssignmentParselet(TokenType.GtGtGt));

        this.setInfix(TokenType.Question, Conditional);
        this.setInfix(TokenType.QuestionQuestion, NullCoalesce);

        this.setInfix(TokenType.PipePipe, makeBinaryOperatorParselet(TokenType.PipePipe, Precedence.LogicalOr));

        this.setInfix(TokenType.AmpAmp, makeBinaryOperatorParselet(TokenType.AmpAmp, Precedence.LogicalAnd));

        this.setInfix(TokenType.Pipe, makeBinaryOperatorParselet(TokenType.Pipe, Precedence.BitwiseOr));

        this.setInfix(TokenType.Caret, makeBinaryOperatorParselet(TokenType.Caret, Precedence.BitwiseXor));

        this.setInfix(TokenType.Amp, makeBinaryOperatorParselet(TokenType.Amp, Precedence.BitwiseAnd));

        this.setInfix(TokenType.EqEq, makeBinaryOperatorParselet(TokenType.EqEq, Precedence.Equality));
        this.setInfix(TokenType.BangEq, makeBinaryOperatorParselet(TokenType.BangEq, Precedence.Equality));
        this.setInfix(TokenType.EqEqEq, makeBinaryOperatorParselet(TokenType.EqEqEq, Precedence.Equality));
        this.setInfix(TokenType.BangEqEq, makeBinaryOperatorParselet(TokenType.BangEqEq, Precedence.Equality));

        this.setInfix(TokenType.Lt, makeBinaryOperatorParselet(TokenType.Lt, Precedence.Relational));
        this.setInfix(TokenType.LtEq, makeBinaryOperatorParselet(TokenType.LtEq, Precedence.Relational));
        this.setInfix(TokenType.Gt, makeBinaryOperatorParselet(TokenType.Gt, Precedence.Relational));
        this.setInfix(TokenType.GtEq, makeBinaryOperatorParselet(TokenType.GtEq, Precedence.Relational));
        this.setInfix(TokenType.In, makeBinaryOperatorParselet(TokenType.In, Precedence.Relational));

        this.setInfix(TokenType.LtLt, makeBinaryOperatorParselet(TokenType.LtLt, Precedence.BitwiseShift));
        this.setInfix(TokenType.GtGt, makeBinaryOperatorParselet(TokenType.GtGt, Precedence.BitwiseShift));
        this.setInfix(TokenType.GtGtGt, makeBinaryOperatorParselet(TokenType.GtGtGt, Precedence.BitwiseShift));

        this.setInfix(TokenType.Plus, makeBinaryOperatorParselet(TokenType.Plus, Precedence.Additive));
        this.setInfix(TokenType.Minus, makeBinaryOperatorParselet(TokenType.Minus, Precedence.Additive));

        this.setInfix(TokenType.Star, makeBinaryOperatorParselet(TokenType.Star, Precedence.Multiplicative));
        this.setInfix(TokenType.Slash, makeBinaryOperatorParselet(TokenType.Slash, Precedence.Multiplicative));
        this.setInfix(TokenType.Percent, makeBinaryOperatorParselet(TokenType.Percent, Precedence.Multiplicative));

        this.setInfix(TokenType.StarStar, makeBinaryOperatorParselet(TokenType.StarStar, Precedence.Power, RightAssociative));

        this.setPrefix(TokenType.Await, Await);
        this.setPrefix(TokenType.Bang, makePrefixOperatorParselet(TokenType.Bang));
        this.setPrefix(TokenType.Tilde, makePrefixOperatorParselet(TokenType.Tilde));
        this.setPrefix(TokenType.Plus, makePrefixOperatorParselet(TokenType.Plus));
        this.setPrefix(TokenType.Minus, makePrefixOperatorParselet(TokenType.Minus));
        this.setPrefix(TokenType.PlusPlus, makePrefixAccessMutatorParselet());
        this.setPrefix(TokenType.MinusMinus, makePrefixAccessMutatorParselet());

        this.setInfix(TokenType.PlusPlus, makePostfixAccessMutatorParselet(TokenType.PlusPlus));
        this.setInfix(TokenType.MinusMinus, makePostfixAccessMutatorParselet(TokenType.MinusMinus));

        this.setInfix(TokenType.Dot, MemberAccess);
        this.setInfix(TokenType.LBracket, ComputedMemberAccess);
        this.setInfix(TokenType.LParen, Call);
        this.setInfix(TokenType.QuestionDot, NullConditional);

        this.setPrefix(TokenType.Ellipsis, Spread);
        this.setInfix(TokenType.RightArrow, Lambda);

        this.setPrefix(TokenType.LParen, Group);

        this.setPrefix(TokenType.Identifier, Identifier);
        this.setPrefix(TokenType.NumberLiteral, NumberLiteral);
        this.setPrefix(TokenType.StringLiteral, StringLiteral);
        this.setPrefix(TokenType.BooleanLiteral, BooleanLiteral);
        this.setPrefix(TokenType.NullLiteral, NullLiteral);
        this.setPrefix(TokenType.UndefinedLiteral, UndefinedLiteral);
        this.setPrefix(TokenType.LBracket, ArrayLiteral);
        this.setPrefix(TokenType.LBrace, ObjectLiteral);
    }
}
