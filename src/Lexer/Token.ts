import * as TokenType from './TokenType';

export interface TokenPosition {
    readonly line: number;
    readonly col: number;
    readonly offset: number;
}

export interface Token extends TokenPosition {
    readonly lexeme: string;
}

export interface Literal extends Token {
    readonly value: number | string | boolean | null | undefined;
}

export interface Assignment extends Token {
    readonly operator: TokenType.Any;
}

export interface Unknown extends Token {
    readonly type: typeof TokenType.Unknown;
}

export interface Invalid extends Token {
    readonly type: typeof TokenType.Invalid;
    readonly error: string;
}

export interface EOF extends Token {
    readonly type: typeof TokenType.EOF;
}

export interface Identifier extends Token {
    readonly type: typeof TokenType.Identifier;
    readonly name: string;
}

export interface Whitespace extends Token {
    readonly type: typeof TokenType.Whitespace;
}

export interface LineTerminator extends Token {
    readonly type: typeof TokenType.LineTerminator;
}

export interface NumberLiteral extends Literal {
    readonly type: typeof TokenType.NumberLiteral;
    readonly value: number;
    readonly radix: number;
}

export interface StringLiteral extends Literal {
    readonly type: typeof TokenType.StringLiteral;
    readonly value: string;
}

export interface BooleanLiteral extends Literal {
    readonly type: typeof TokenType.BooleanLiteral;
    readonly value: boolean;
}

export interface NullLiteral extends Literal {
    readonly type: typeof TokenType.NullLiteral;
    readonly value: null;
}

export interface UndefinedLiteral extends Literal {
    readonly type: typeof TokenType.UndefinedLiteral;
    readonly value: undefined;
}

export interface LParen extends Token {
    readonly type: typeof TokenType.LParen;
}

export interface RParen extends Token {
    readonly type: typeof TokenType.RParen;
}

export interface LBrace extends Token {
    readonly type: typeof TokenType.LBrace;
}

export interface RBrace extends Token {
    readonly type: typeof TokenType.RBrace;
}

export interface LBracket extends Token {
    readonly type: typeof TokenType.LBracket;
}

export interface RBracket extends Token {
    readonly type: typeof TokenType.RBracket;
}

export interface Comma extends Token {
    readonly type: typeof TokenType.Comma;
}

export interface Dot extends Token {
    readonly type: typeof TokenType.Dot;
}

export interface Colon extends Token {
    readonly type: typeof TokenType.Colon;
}

export interface In extends Token {
    readonly type: typeof TokenType.In;
}

export interface Await extends Token {
    readonly type: typeof TokenType.Await;
}

export interface Plus extends Token {
    readonly type: typeof TokenType.Plus;
}

export interface PlusPlus extends Assignment {
    readonly type: typeof TokenType.PlusPlus;
}

export interface PlusEq extends Assignment {
    readonly type: typeof TokenType.PlusEq;
}

export interface Minus extends Token {
    readonly type: typeof TokenType.Minus;
}

export interface MinusMinus extends Assignment {
    readonly type: typeof TokenType.MinusMinus;
}

export interface MinusEq extends Assignment {
    readonly type: typeof TokenType.MinusEq;
}

export interface Eq extends Assignment {
    readonly type: typeof TokenType.Eq;
}

export interface EqEq extends Token {
    readonly type: typeof TokenType.EqEq;
}

export interface EqEqEq extends Token {
    readonly type: typeof TokenType.EqEqEq;
}

export interface Bang extends Token {
    readonly type: typeof TokenType.Bang;
}

export interface BangEq extends Token {
    readonly type: typeof TokenType.BangEq;
}

export interface BangEqEq extends Token {
    readonly type: typeof TokenType.BangEqEq;
}

export interface Amp extends Token {
    readonly type: typeof TokenType.Amp;
}

export interface AmpEq extends Assignment {
    readonly type: typeof TokenType.AmpEq;
}

export interface AmpAmp extends Token {
    readonly type: typeof TokenType.AmpAmp;
}

export interface Pipe extends Token {
    readonly type: typeof TokenType.Pipe;
}

export interface PipeEq extends Assignment {
    readonly type: typeof TokenType.PipeEq;
}

export interface PipePipe extends Token {
    readonly type: typeof TokenType.PipePipe;
}

export interface Caret extends Token {
    readonly type: typeof TokenType.Caret;
}

export interface CaretEq extends Assignment {
    readonly type: typeof TokenType.CaretEq;
}

export interface Tilde extends Token {
    readonly type: typeof TokenType.Tilde;
}

export interface TildeEq extends Assignment {
    readonly type: typeof TokenType.TildeEq;
}

export interface Star extends Token {
    readonly type: typeof TokenType.Star;
}

export interface StarStar extends Token {
    readonly type: typeof TokenType.StarStar;
}

export interface StarEq extends Assignment {
    readonly type: typeof TokenType.StarEq;
}

export interface StarStarEq extends Assignment {
    readonly type: typeof TokenType.StarStarEq;
}

export interface Slash extends Token {
    readonly type: typeof TokenType.Slash;
}

export interface SlashEq extends Assignment {
    readonly type: typeof TokenType.SlashEq;
}

export interface Percent extends Token {
    readonly type: typeof TokenType.Percent;
}

export interface PercentEq extends Assignment {
    readonly type: typeof TokenType.PercentEq;
}

export interface Lt extends Token {
    readonly type: typeof TokenType.Lt;
}

export interface LtEq extends Token {
    readonly type: typeof TokenType.LtEq;
}

export interface LtLt extends Token {
    readonly type: typeof TokenType.LtLt;
}

export interface LtLtEq extends Assignment {
    readonly type: typeof TokenType.LtLtEq;
}

export interface Gt extends Token {
    readonly type: typeof TokenType.Gt;
}

export interface GtEq extends Token {
    readonly type: typeof TokenType.GtEq;
}

export interface GtGt extends Token {
    readonly type: typeof TokenType.GtGt;
}

export interface GtGtEq extends Assignment {
    readonly type: typeof TokenType.GtGtEq;
}

export interface GtGtGt extends Token {
    readonly type: typeof TokenType.GtGtGt;
}

export interface GtGtGtEq extends Assignment {
    readonly type: typeof TokenType.GtGtGtEq;
}

export interface Question extends Token {
    readonly type: typeof TokenType.Question;
}

export interface QuestionDot extends Token {
    readonly type: typeof TokenType.QuestionDot;
}

export interface QuestionQuestion extends Token {
    readonly type: typeof TokenType.QuestionQuestion;
}

export interface QuestionQuestionEq extends Assignment {
    readonly type: typeof TokenType.QuestionQuestionEq;
}

export interface RightArrow extends Token {
    readonly type: typeof TokenType.RightArrow;
}

export interface Ellipsis extends Token {
    readonly type: typeof TokenType.Ellipsis;
}

export type Any = Unknown
    | Invalid
    | EOF
    | Whitespace
    | LineTerminator
    | NumberLiteral
    | StringLiteral
    | BooleanLiteral
    | NullLiteral
    | UndefinedLiteral
    | Identifier
    | LParen
    | RParen
    | LBrace
    | RBrace
    | LBracket
    | RBracket
    | Comma
    | Dot
    | Colon
    | In
    | Await
    | Plus
    | PlusPlus
    | PlusEq
    | Minus
    | MinusMinus
    | MinusEq
    | Eq
    | EqEq
    | EqEqEq
    | Bang
    | BangEq
    | BangEqEq
    | Amp
    | AmpEq
    | AmpAmp
    | Pipe
    | PipeEq
    | PipePipe
    | Caret
    | CaretEq
    | Tilde
    | TildeEq
    | Star
    | StarStar
    | StarEq
    | StarStarEq
    | Slash
    | SlashEq
    | Percent
    | PercentEq
    | Lt
    | LtEq
    | LtLt
    | LtLtEq
    | Gt
    | GtEq
    | GtGt
    | GtGtEq
    | GtGtGt
    | GtGtGtEq
    | Question
    | QuestionDot
    | QuestionQuestion
    | QuestionQuestionEq
    | RightArrow
    | Ellipsis;
