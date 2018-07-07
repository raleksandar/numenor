export const Unknown = Symbol.for('numenor:tok:unknown');
export const Invalid = Symbol.for('numenor:tok:invalid');
export const EOF = Symbol.for('numenor:tok:eof');
export const NumberLiteral = Symbol.for('numenor:tok:number');
export const StringLiteral = Symbol.for('numenor:tok:string');
export const BooleanLiteral = Symbol.for('numenor:tok:bool');
export const NullLiteral = Symbol.for('numenor:tok:null');
export const UndefinedLiteral = Symbol.for('numenor:tok:undefined');
export const Identifier = Symbol.for('numenor:tok:ident');
export const Whitespace = Symbol.for('numenor:tok:space');
export const LineTerminator = Symbol.for('numenor:tok:eol');
export const LParen = Symbol.for('numenor:tok:(');
export const RParen = Symbol.for('numenor:tok:)');
export const LBrace = Symbol.for('numenor:tok:{');
export const RBrace = Symbol.for('numenor:tok:}');
export const LBracket = Symbol.for('numenor:tok:[');
export const RBracket = Symbol.for('numenor:tok:]');
export const Comma = Symbol.for('numenor:tok:,');
export const Dot = Symbol.for('numenor:tok:.');
export const Plus = Symbol.for('numenor:tok:+');
export const PlusEq = Symbol.for('numenor:tok:+=');
export const PlusPlus = Symbol.for('numenor:tok:++');
export const Minus = Symbol.for('numenor:tok:-');
export const MinusEq = Symbol.for('numenor:tok:-=');
export const MinusMinus = Symbol.for('numenor:tok:--');
export const Eq = Symbol.for('numenor:tok:=');
export const EqEq = Symbol.for('numenor:tok:==');
export const EqEqEq = Symbol.for('numenor:tok:===');
export const Bang = Symbol.for('numenor:tok:!');
export const BangEq = Symbol.for('numenor:tok:!=');
export const BangEqEq = Symbol.for('numenor:tok:!==');
export const Amp = Symbol.for('numenor:tok:&');
export const AmpEq = Symbol.for('numenor:tok:&=');
export const AmpAmp = Symbol.for('numenor:tok:&&');
export const Pipe = Symbol.for('numenor:tok:|');
export const PipeEq = Symbol.for('numenor:tok:|=');
export const PipePipe = Symbol.for('numenor:tok:||');
export const Caret = Symbol.for('numenor:tok:^');
export const CaretEq = Symbol.for('numenor:tok:^=');
export const Tilde = Symbol.for('numenor:tok:~');
export const TildeEq = Symbol.for('numenor:tok:~=');
export const Star = Symbol.for('numenor:tok:*');
export const StarEq = Symbol.for('numenor:tok:*=');
export const StarStar = Symbol.for('numenor:tok:**');
export const StarStarEq = Symbol.for('numenor:tok:**=');
export const Slash = Symbol.for('numenor:tok:/');
export const SlashEq = Symbol.for('numenor:tok:/=');
export const Percent = Symbol.for('numenor:tok:%');
export const PercentEq = Symbol.for('numenor:tok:%=');
export const Lt = Symbol.for('numenor:tok:<');
export const LtEq = Symbol.for('numenor:tok:<=');
export const LtLt = Symbol.for('numenor:tok:<<');
export const LtLtEq = Symbol.for('numenor:tok:<<=');
export const Gt = Symbol.for('numenor:tok:>');
export const GtEq = Symbol.for('numenor:tok:>=');
export const GtGt = Symbol.for('numenor:tok:>>');
export const GtGtEq = Symbol.for('numenor:tok:>>=');
export const GtGtGt = Symbol.for('numenor:tok:>>>');
export const GtGtGtEq = Symbol.for('numenor:tok:>>>=');
export const Question = Symbol.for('numenor:tok:?');
export const QuestionDot = Symbol.for('numenor:tok:?.');
export const QuestionQuestion = Symbol.for('numenor:tok:??');
export const QuestionQuestionEq = Symbol.for('numenor:tok:??=');
export const Colon = Symbol.for('numenor:tok::');
export const In = Symbol.for('numenor:tok:in');
export const Await = Symbol.for('numenor:tok:await');
export const RightArrow = Symbol.for('numenor:tok:=>');

export type Literal = typeof NumberLiteral
    | typeof StringLiteral
    | typeof BooleanLiteral
    | typeof NullLiteral
    | typeof UndefinedLiteral;

export type AccessMutatorOperator = typeof PlusPlus
    | typeof MinusMinus;

export type UnaryOperator = AccessMutatorOperator
    | typeof Plus
    | typeof Minus
    | typeof Bang
    | typeof Tilde
    | typeof Await;

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
    | typeof RightArrow
    | Literal
    | AssignmentOperator
    | UnaryOperator
    | BinaryOperator;
