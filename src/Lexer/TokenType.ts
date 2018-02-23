export const Unknown = Symbol('Unknown');
export const Invalid = Symbol('Invalid');
export const EOF = Symbol('EndOfFile');
export const NumberLiteral = Symbol('NumericLiteral');
export const StringLiteral = Symbol('StringLiteral');
export const BooleanLiteral = Symbol('BooleanLiteral');
export const NullLiteral = Symbol('null');
export const UndefinedLiteral = Symbol('undefined');
export const Identifier = Symbol('Identifier');
export const Whitespace = Symbol('Whitespace');
export const LineTerminator = Symbol('LineTerminator');
export const LParen = Symbol('(');
export const RParen = Symbol(')');
export const LBrace = Symbol('{');
export const RBrace = Symbol('}');
export const LBracket = Symbol('[');
export const RBracket = Symbol(']');
export const Comma = Symbol(',');
export const Dot = Symbol('.');
export const Plus = Symbol('+');
export const PlusEq = Symbol('+=');
export const PlusPlus = Symbol('++');
export const Minus = Symbol('-');
export const MinusEq = Symbol('-=');
export const MinusMinus = Symbol('--');
export const Eq = Symbol('=');
export const EqEq = Symbol('==');
export const EqEqEq = Symbol('===');
export const Bang = Symbol('!');
export const BangEq = Symbol('!=');
export const BangEqEq = Symbol('!==');
export const Amp = Symbol('&');
export const AmpEq = Symbol('&=');
export const AmpAmp = Symbol('&&');
export const Pipe = Symbol('|');
export const PipeEq = Symbol('|=');
export const PipePipe = Symbol('||');
export const Caret = Symbol('^');
export const CaretEq = Symbol('^=');
export const Tilde = Symbol('~');
export const TildeEq = Symbol('~=');
export const Star = Symbol('*');
export const StarEq = Symbol('*=');
export const StarStar = Symbol('**');
export const StarStarEq = Symbol('**=');
export const Slash = Symbol('/');
export const SlashEq = Symbol('/=');
export const Percent = Symbol('%');
export const PercentEq = Symbol('%=');
export const Lt = Symbol('<');
export const LtEq = Symbol('<=');
export const LtLt = Symbol('<<');
export const LtLtEq = Symbol('<<=');
export const Gt = Symbol('>');
export const GtEq = Symbol('>=');
export const GtGt = Symbol('>>');
export const GtGtEq = Symbol('>>=');
export const GtGtGt = Symbol('>>>');
export const GtGtGtEq = Symbol('>>>=');
export const Question = Symbol('?');
export const QuestionDot = Symbol('?.');
export const QuestionQuestion = Symbol('??');
export const QuestionQuestionEq = Symbol('??=');
export const Colon = Symbol(':');
export const In = Symbol('in');

export type Literal = typeof NumberLiteral
    | typeof StringLiteral
    | typeof BooleanLiteral
    | typeof NullLiteral
    | typeof UndefinedLiteral;

export type UnaryOperator = typeof Plus
    | typeof PlusPlus
    | typeof Minus
    | typeof MinusMinus
    | typeof Bang
    | typeof Tilde;

export type AssignmentOperator = typeof Eq
    | typeof PlusEq
    | typeof MinusEq
    | typeof StarEq
    | typeof StarStarEq
    | typeof SlashEq
    | typeof PercentEq
    | typeof AmpEq
    | typeof PipeEq
    | typeof CaretEq
    | typeof TildeEq
    | typeof QuestionQuestionEq
    | typeof LtLtEq
    | typeof GtGtEq
    | typeof GtGtGtEq;

export type AdditionOperator = typeof Plus
    | typeof Minus;

export type ArithmeticOperator = AdditionOperator
    | typeof Star
    | typeof StarStar
    | typeof Slash
    | typeof Percent;

export type RelationalOperator = typeof Lt
    | typeof LtEq
    | typeof Gt
    | typeof GtEq
    | typeof In;

export type BinaryBitwiseOperator = typeof Amp
    | typeof Pipe
    | typeof Caret;

export type BitwiseOperator = typeof Tilde
    | BinaryBitwiseOperator;

export type BinaryLogicalOperator = typeof AmpAmp
    | typeof PipePipe
    | typeof QuestionQuestion;

export type LogicalOperator = typeof Bang
    | BinaryLogicalOperator;

export type EqualityOperator = typeof EqEq
    | typeof EqEqEq
    | typeof BangEq
    | typeof BangEqEq;

export type BitwiseShiftOperator = typeof LtLt
    | typeof GtGt
    | typeof GtGtGt;

export type BinaryOperator = ArithmeticOperator
    | RelationalOperator
    | BinaryBitwiseOperator
    | BinaryLogicalOperator
    | EqualityOperator
    | BitwiseShiftOperator;

export type Any = typeof Unknown
    | typeof Invalid
    | typeof EOF
    | typeof Whitespace
    | typeof LineTerminator
    | typeof LParen
    | typeof RParen
    | typeof LBrace
    | typeof RBrace
    | typeof LBracket
    | typeof RBracket
    | typeof Comma
    | typeof Dot
    | typeof QuestionDot
    | typeof Question
    | typeof Colon
    | typeof Identifier
    | Literal
    | AssignmentOperator
    | UnaryOperator
    | BinaryOperator;
