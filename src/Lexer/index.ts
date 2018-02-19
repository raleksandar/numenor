import * as Token from './Token';
import * as TokenType from './TokenType';
import * as LexerError from './Error';

export { TokenType, Token, LexerError };

enum State {
    ENTRY,
    WHITESPACE,
    IDENTIFIER,
    NUMERIC,
    NUMERIC_FLOAT,
    NUMERIC_EXPONENT,
    NUMERIC_HEXADECIMAL,
    NUMERIC_OCTAL,
    NUMERIC_BINARY,
    STRING,
    STRING_ESCAPE,
    STRING_ESCAPE_HEX,
    STRING_ESCAPE_UNICODE,
    STRING_ESCAPE_UNICODE_CODEPOINT,
}

const reWhitespace = /\s/;
const reLineTerminator = /[\r\n\u2028\u2029]/;
const reIdentStart = /[$_a-z]/i;
const reIdentPart = /[$_a-z0-9]/i;
const reHexDigit = /[0-9a-fA-F]/;
const reDecimalDigit = /[0-9]/;
const reOctalDigit = /[0-7]/;


export class Lexer {

    private readonly input: string;
    private readonly end: number;
    private offset: number;
    private nextCol: number;
    private nextLine: number;
    private nextToken: Token.Any;
    private currentToken: Token.Any;

    constructor(input: string, start: number = 0, length: number = 0) {
        this.input = input;
        this.end = start + (length !== 0 ? length : input.length - start);
        this.offset = start;
        this.nextCol = 0;
        this.nextLine = 1;
        this.nextToken = this.scan();
        this.currentToken = this.next();
    }

    get token() {
        return this.currentToken;
    }

    get lookahead() {
        return this.nextToken;
    }

    get line() {
        return this.currentToken.line;
    }

    get col() {
        return this.currentToken.col;
    }

    skip(type: TokenType.Any = TokenType.Whitespace) {
        while (this.currentToken.type === type) {
            this.next();
        }
    }

    next(): Token.Any {
        this.currentToken = this.nextToken;
        this.nextToken = this.scan();
        return this.currentToken;
    }

    shift(): Token.Any {
        const current = this.currentToken;
        this.next();
        return current;
    }

    private scan(): Token.Any {

        const col = this.nextCol;
        const line = this.nextLine;

        if (this.offset >= this.end) {
            return {col, line, type: TokenType.EOF};
        }

        const startOffset = this.offset;

        let token: Token.Any | undefined = undefined,
            state = State.ENTRY,
            ch: string,
            quote = '',
            value = '';

        const advance = (step = 1) => {
            ch = this.input.substr(this.offset + step - 1, 1);
            this.offset += step;
            this.nextCol += step;
            return ch;
        };

        const peek = (next = 1) => this.input.substr(this.offset + next - 1, 1);

        const match = (expected: string) => {
            if (peek() === expected) {
                advance();
                return true;
            }
            return false;
        };

        const getRaw = () => this.input.substr(startOffset, this.offset - startOffset - 1);

        ch = advance();

        while (token === undefined) {

            stateMachine: switch (state) {

                case State.ENTRY: {

                    if (reWhitespace.test(ch)) {
                        state = State.WHITESPACE;
                        break;
                    }

                    if (reIdentStart.test(ch)) {
                        state = State.IDENTIFIER;
                        break;
                    }

                    if (ch === '"' || ch === "'") {
                        state = State.STRING;
                        quote = ch;
                        advance();
                        break;
                    }

                    if (ch === '0') {
                        const nextCh = peek();
                        if (nextCh === 'x') {
                            state = State.NUMERIC_HEXADECIMAL;
                            advance(2);
                        } else if (nextCh === 'o') {
                            state = State.NUMERIC_OCTAL;
                            advance(2);
                        } else if (nextCh === 'b') {
                            state = State.NUMERIC_BINARY;
                            advance(2);
                        } else {
                            state = State.NUMERIC;
                        }
                        break;
                    }

                    if (reDecimalDigit.test(ch)) {
                        state = State.NUMERIC;
                        break;
                    }

                    if (ch === '.') {
                        if (reDecimalDigit.test(peek())) {
                            value = '0.';
                            state = State.NUMERIC_FLOAT;
                        } else {
                            token = {col, line, type: TokenType.Dot};
                        }
                    } else if (ch === '+') {
                        if (match('+')) {
                            token = {col, line, type: TokenType.PlusPlus, operator: TokenType.Plus};
                        } else if (match('=')) {
                            token = {col, line, type: TokenType.PlusEq, operator: TokenType.Plus};
                        } else {
                            token = {col, line, type: TokenType.Plus};
                        }
                    } else if (ch === '-') {
                        if (match('-')) {
                            token = {col, line, type: TokenType.MinusMinus, operator: TokenType.Minus};
                        } else if (match('=')) {
                            token = {col, line, type: TokenType.MinusEq, operator: TokenType.Minus};
                        } else {
                            token = {col, line, type: TokenType.Minus};
                        }
                    } else if (ch === '=') {
                        if (match('=')) {
                            if (match('=')) {
                                token = {col, line, type: TokenType.EqEqEq};
                            } else {
                                token = {col, line, type: TokenType.EqEq};
                            }
                        } else {
                            token = {col, line, type: TokenType.Eq, operator: TokenType.Eq};
                        }
                    } else if (ch === '!') {
                        if (match('=')) {
                            if (match('=')) {
                                token = {col, line, type: TokenType.BangEqEq};
                            } else {
                                token = {col, line, type: TokenType.BangEq};
                            }
                        } else {
                            token = {col, line, type: TokenType.Bang};
                        }
                    } else if (ch === '&') {
                        if (match('&')) {
                            token = {col, line, type: TokenType.AmpAmp};
                        } else if (match('=')) {
                            token = {col, line, type: TokenType.AmpEq, operator: TokenType.Amp};
                        } else {
                            token = {col, line, type: TokenType.Amp};
                        }
                    } else if (ch === '|') {
                        if (match('|')) {
                            token = {col, line, type: TokenType.PipePipe};
                        } else if (match('=')) {
                            token = {col, line, type: TokenType.PipeEq, operator: TokenType.Pipe};
                        } else {
                            token = {col, line, type: TokenType.Pipe};
                        }
                    } else if (ch === '^') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.CaretEq, operator: TokenType.Caret};
                        } else {
                            token = {col, line, type: TokenType.Caret};
                        }
                    } else if (ch === '~') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.TildeEq, operator: TokenType.Tilde};
                        } else {
                            token = {col, line, type: TokenType.Tilde};
                        }
                    } else if (ch === '*') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.StarEq, operator: TokenType.Star};
                        } else if (match('*')) {
                            if (match('=')) {
                                token = {col, line, type: TokenType.StarStarEq, operator: TokenType.StarStar};
                            } else {
                                token = {col, line, type: TokenType.StarStar};
                            }
                        } else {
                            token = {col, line, type: TokenType.Star};
                        }
                    } else if (ch === '/') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.SlashEq, operator: TokenType.Slash};
                        } else {
                            token = {col, line, type: TokenType.Slash};
                        }
                    } else if (ch === '%') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.PercentEq, operator: TokenType.Percent};
                        } else {
                            token = {col, line, type: TokenType.Percent};
                        }
                    } else if (ch === '<') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.LtEq};
                        } else if (match('<')) {
                            if (match('=')) {
                                token = {col, line, type: TokenType.LtLtEq, operator: TokenType.LtLt};
                            } else {
                                token = {col, line, type: TokenType.LtLt};
                            }
                        } else {
                            token = {col, line, type: TokenType.Lt};
                        }
                    } else if (ch === '>') {
                        if (match('=')) {
                            token = {col, line, type: TokenType.GtEq};
                        } else if (match('>')) {
                            if (match('>')) {
                                if (match('=')) {
                                    token = {col, line, type: TokenType.GtGtGtEq, operator: TokenType.GtGtGt};
                                } else {
                                    token = {col, line, type: TokenType.GtGtGt};
                                }
                            } else if (match('=')) {
                                token = {col, line, type: TokenType.GtGtEq, operator: TokenType.GtGt};
                            } else {
                                token = {col, line, type: TokenType.GtGt};
                            }
                        } else {
                            token = {col, line, type: TokenType.Gt};
                        }
                    } else if (ch === '?') {
                        if (match('?')) {
                            if (match('=')) {
                                token = {col, line, type: TokenType.QuestionQuestionEq, operator: TokenType.QuestionQuestion};
                            } else {
                                token = {col, line, type: TokenType.QuestionQuestion};
                            }
                        } else {
                            if (peek() === '.' && !reDecimalDigit.test(peek(2))) {
                                advance();
                                token = {col, line, type: TokenType.QuestionDot};
                            } else {
                                token = {col, line, type: TokenType.Question};
                            }
                        }
                    } else if (ch === '(') {
                        token = {col, line, type: TokenType.LParen};
                    } else if (ch === ')') {
                        token = {col, line, type: TokenType.RParen};
                    } else if (ch === '{') {
                        token = {col, line, type: TokenType.LBrace};
                    } else if (ch === '}') {
                        token = {col, line, type: TokenType.RBrace};
                    } else if (ch === '[') {
                        token = {col, line, type: TokenType.LBracket};
                    } else if (ch === ']') {
                        token = {col, line, type: TokenType.RBracket};
                    } else if (ch === ',') {
                        token = {col, line, type: TokenType.Comma};
                    } else if (ch === ':') {
                        token = {col, line, type: TokenType.Colon};
                    } else {
                        token = {col, line, type: TokenType.Unknown, raw: ch};
                    }
                    advance();
                    break;
                }

                case State.WHITESPACE: {
                    do {
                        if (reLineTerminator.test(ch)) {
                            this.nextLine++;
                            this.nextCol = 0;
                            if (ch === '\r' && peek() === '\n') {
                                this.offset++;
                            }
                        }
                        advance();
                    } while (reWhitespace.test(ch));
                    token = {
                        col,
                        line,
                        type: TokenType.Whitespace,
                    };
                    break;
                }

                case State.IDENTIFIER: {
                    do {
                        advance();
                    } while (reIdentPart.test(ch));
                    const name = getRaw();
                    if (name === 'in') {
                        token = {col, line, type: TokenType.In};
                    } else if (name === 'true' || name === 'false') {
                        token = {
                            col,
                            line,
                            raw: name,
                            value: name === 'true',
                            type: TokenType.BooleanLiteral,
                        };
                    } else if (name === 'null') {
                        token = {col, line, value: null, type: TokenType.NullLiteral};
                    } else if (name === 'undefined') {
                        token = {col, line, value: undefined, type: TokenType.UndefinedLiteral};
                    } else {
                        token = {col, line, name, type: TokenType.Identifier};
                    }
                    break;
                }

                case State.NUMERIC: {
                    while (reDecimalDigit.test(ch) ||
                        ch === '_' ||
                        ch === '.' ||
                        ch === 'e' ||
                        ch === 'E'
                    ) {
                        if (ch !== '_') {
                            value += ch;
                            if (ch === '.') {
                                if (peek() === '_') {
                                    advance(2);
                                    token = {
                                        raw: getRaw(),
                                        col: this.nextCol,
                                        line: this.nextLine,
                                        type: TokenType.Invalid,
                                        error: LexerError.SeparatorAfterPeriod,
                                    };
                                } else {
                                    state = State.NUMERIC_FLOAT;
                                    advance();
                                }
                                break stateMachine;
                            }
                            if (ch === 'e' || ch === 'E') {
                                if (peek() === '_') {
                                    advance(2);
                                    token = {
                                        raw: getRaw(),
                                        col: this.nextCol,
                                        line: this.nextLine,
                                        type: TokenType.Invalid,
                                        error: LexerError.SeparatorAfterExponent,
                                    };
                                } else {
                                    state = State.NUMERIC_EXPONENT;
                                    advance();
                                }
                                break stateMachine;
                            }
                        } else {
                            const nextCh = peek();
                            if (nextCh === '.' || nextCh === 'e' || nextCh === 'E') {
                                advance(2);
                                token = {
                                    raw: getRaw(),
                                    col: this.nextCol,
                                    line: this.nextLine,
                                    type: TokenType.Invalid,
                                    error: nextCh === '.' ?
                                        LexerError.SeparatorBeforePeriod :
                                        LexerError.SeparatorBeforeExponent,
                                };
                                break stateMachine;
                            }
                        }
                        advance();
                    }
                    const raw = getRaw();
                    if (raw.substr(-1) === '_') {
                        token = {
                            raw,
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.TrailingSeparator,
                        };
                    } else {
                        token = {
                            col,
                            line,
                            raw,
                            radix: 10,
                            value: Number.parseInt(value, 10),
                            type: TokenType.NumberLiteral,
                        };
                    }
                    break;
                }

                case State.NUMERIC_FLOAT: {
                    while (reDecimalDigit.test(ch) || ch === '_' || ch === 'e' || ch === 'E') {
                        if (ch !== '_') {
                            value += ch;
                            if (ch === 'e' || ch === 'E') {
                                if (peek() === '_') {
                                    advance(2);
                                    token = {
                                        raw: getRaw(),
                                        col: this.nextCol,
                                        line: this.nextLine,
                                        type: TokenType.Invalid,
                                        error: LexerError.SeparatorAfterExponent,
                                    };
                                } else {
                                    state = State.NUMERIC_EXPONENT;
                                    advance();
                                }
                                break stateMachine;
                            }
                        } else {
                            const nextCh = peek();
                            if (nextCh === 'e' || nextCh === 'E') {
                                advance(2);
                                token = {
                                    raw: getRaw(),
                                    col: this.nextCol,
                                    line: this.nextLine,
                                    type: TokenType.Invalid,
                                    error: LexerError.SeparatorBeforeExponent,
                                };
                                break stateMachine;
                            }
                        }
                        advance();
                    }
                    const raw = getRaw();
                    if (raw.substr(-1) === '_') {
                        token = {
                            raw,
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.TrailingSeparator,
                        };
                    } else {
                        token = {
                            col,
                            line,
                            raw,
                            radix: 10,
                            value: Number.parseFloat(value),
                            type: TokenType.NumberLiteral,
                        };
                    }
                    break;
                }

                case State.NUMERIC_EXPONENT: {
                    if (ch === '+' || ch === '-') {
                        value += ch;
                        if (advance() === '_') {
                            token = {
                                raw: getRaw(),
                                col: this.nextCol,
                                line: this.nextLine,
                                type: TokenType.Invalid,
                                error: LexerError.SeparatorAfterExponentSign,
                            };
                            break;
                        }
                    }
                    if (!reDecimalDigit.test(ch)) {
                        token = {
                            raw: getRaw(),
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.ExpectedExponent,
                        };
                        break;
                    }
                    while (reDecimalDigit.test(ch) || ch === '_') {
                        if (ch !== '_') {
                            value += ch;
                        }
                        advance();
                    }
                    const raw = getRaw();
                    if (raw.substr(-1) === '_') {
                        token = {
                            raw,
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.TrailingSeparator,
                        };
                    } else {
                        token = {
                            col,
                            line,
                            raw,
                            radix: 10,
                            value: Number.parseFloat(value),
                            type: TokenType.NumberLiteral,
                        };
                    }
                    break;
                }

                case State.NUMERIC_HEXADECIMAL: {
                    while (reHexDigit.test(ch) || ch === '_') {
                        if (ch !== '_') {
                            value += ch;
                        }
                        advance();
                    }
                    const raw = getRaw();
                    if (value.length === 0 || raw.substr(-1) === '_') {
                        token = {
                            raw,
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: value.length === 0 ?
                                LexerError.ExpectedHexadecimalDigit :
                                LexerError.TrailingSeparator,
                        };
                    } else {
                        token = {
                            raw,
                            col,
                            line,
                            radix: 16,
                            value: Number.parseInt(value, 16),
                            type: TokenType.NumberLiteral,
                        };
                    }
                    break;
                }

                case State.NUMERIC_OCTAL: {
                    while (reOctalDigit.test(ch) || ch === '_') {
                        if (ch !== '_') {
                            value += ch;
                        }
                        advance();
                    }
                    const raw = getRaw();
                    if (value.length === 0 || raw.substr(-1) === '_') {
                        token = {
                            raw,
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: value.length === 0 ?
                                LexerError.ExpectedOctalDigit :
                                LexerError.TrailingSeparator,
                        };
                    } else {
                        token = {
                            raw,
                            col,
                            line,
                            radix: 8,
                            value: Number.parseInt(value, 8),
                            type: TokenType.NumberLiteral,
                        };
                    }
                    break;
                }

                case State.NUMERIC_BINARY: {
                    while (ch === '0' || ch === '1' || ch === '_') {
                        if (ch !== '_') {
                            value += ch;
                        }
                        advance();
                    }
                    const raw = getRaw();
                    if (value.length === 0 || raw.substr(-1) === '_') {
                        token = {
                            raw,
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: value.length === 0 ?
                                LexerError.ExpectedBinaryDigit :
                                LexerError.TrailingSeparator,
                        };
                    } else {
                        token = {
                            raw,
                            col,
                            line,
                            radix: 2,
                            value: Number.parseInt(value, 2),
                            type: TokenType.NumberLiteral,
                        };
                    }
                    break;
                }

                case State.STRING: {
                    while (ch !== quote) {
                        if (ch === '\\') {
                            advance();
                            state = State.STRING_ESCAPE;
                            break stateMachine;
                        } else if (reLineTerminator.test(ch) || ch === '') {
                            token = {
                                raw: getRaw(),
                                col: this.nextCol,
                                line: this.nextLine,
                                type: TokenType.Invalid,
                                error: LexerError.UnterminatedString,
                            };
                            break stateMachine;
                        } else {
                            value += ch;
                        }
                        advance();
                    }
                    advance();
                    token = {
                        col,
                        line,
                        value,
                        raw: getRaw(),
                        type: TokenType.StringLiteral,
                    };
                    break;
                }

                case State.STRING_ESCAPE: {
                    state = State.STRING;
                    if (ch === '\\' || ch === '"' || ch === "'") {
                        value += ch;
                    } else if (ch === 'b') {
                        value += '\b';
                    } else if (ch === 'f') {
                        value += '\f';
                    } else if (ch === 'n') {
                        value += '\n';
                    } else if (ch === 'r') {
                        value += '\r';
                    } else if (ch === 't') {
                        value += '\t';
                    } else if (ch === 'v') {
                        value += '\v';
                    } else if (ch === '0') {
                        value += '\0';
                    } else if (reLineTerminator.test(ch)) {
                        this.nextLine++;
                        this.nextCol = 0;
                        if (ch === '\r' && peek() === '\n') {
                            this.offset++;
                        }
                    } else if (ch === 'x') {
                        state = State.STRING_ESCAPE_HEX;
                    } else if (ch === 'u') {
                        if (peek() === '{') {
                            advance();
                            state = State.STRING_ESCAPE_UNICODE_CODEPOINT;
                        } else {
                            state = State.STRING_ESCAPE_UNICODE;
                        }
                    }
                    advance();
                    break;
                }

                case State.STRING_ESCAPE_HEX: {
                    if (!reHexDigit.test(ch) || !reHexDigit.test(peek())) {
                        token = {
                            raw: getRaw(),
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.HexadecimalEscape,
                        };
                    } else {
                        const code = Number.parseInt(ch + advance(), 16);
                        value += String.fromCharCode(code);
                        state = State.STRING;
                    }
                    break;
                }

                case State.STRING_ESCAPE_UNICODE: {
                    let hex = '';
                    while (hex.length < 4 && reHexDigit.test(ch)) {
                        hex += ch;
                        advance();
                    }
                    if (hex.length < 4) {
                        token = {
                            raw: getRaw(),
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.UnicodeEscape,
                        };
                    } else {
                        value += String.fromCharCode(Number.parseInt(hex, 16));
                        state = State.STRING;
                    }
                    break;
                }

                case State.STRING_ESCAPE_UNICODE_CODEPOINT: {
                    let hex = '';
                    while (ch !== '}' && ch !== '' && reHexDigit.test(ch)) {
                        hex += ch;
                        advance();
                    }
                    if (ch !== '}' || hex === '') {
                        token = {
                            raw: getRaw(),
                            col: this.nextCol,
                            line: this.nextLine,
                            type: TokenType.Invalid,
                            error: LexerError.UnicodeCodePointEscape,
                        };
                    } else {
                        const codePoint = Number.parseInt(hex, 16);
                        if (codePoint > 0x10ffff) {
                            token = {
                                raw: getRaw(),
                                col: this.nextCol,
                                line: this.nextLine,
                                type: TokenType.Invalid,
                                error: `${LexerError.UnicodeCodePointInvalid}: 0x${hex}`,
                            };
                        } else {
                            advance();
                            value += String.fromCodePoint(codePoint);
                            state = State.STRING;
                        }
                    }
                    break;
                }

                default: {
                    token = {col, line, type: TokenType.Unknown, raw: ch};
                    break;
                }
            }
        }

        if (token.type as TokenType.Any !== TokenType.EOF) {
            this.offset--;
            if (this.nextCol > 0) {
                this.nextCol--;
            }
        }

        return token;
    }
}
