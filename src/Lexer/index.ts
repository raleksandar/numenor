import { Any as Token } from './Token';
import * as TokenType from './TokenType';
import * as LexerError from './Error';
import { Scanner, ScannerContext } from './Scanner';

export { TokenType, Token, LexerError };

export interface LexerState {
    offset: number;
    line: number;
    col: number;
}

export const InitialLexerState: LexerState = {
    offset: 0,
    line: 1,
    col: 0,
};

export abstract class Lexer {

    private readonly scanners: Scanner[];
    private state: LexerState;
    private input: string;
    private end: number;
    private nextToken: Token;
    private currentToken: Token;
    private scannerContext?: ScannerContext & {start(): string};

    constructor() {
        this.scanners = [];
        this.state = { offset: 0, line: 1, col: 0 };
        this.input = '';
        this.end = 0;
        this.currentToken = { type: TokenType.EOF, line: 1, col: 0 };
        this.nextToken = { type: TokenType.EOF, line: 1, col: 0 };
    }

    get currentState() {
        return this.state;
    }

    initialize(input: string, state?: LexerState, length: number = 0) {

        if (!state) {
            state = InitialLexerState;
        }

        this.state = Object.assign(Object.create(null), state);
        this.input = input;
        this.end = state.offset + (length !== 0 ? length : input.length - state.offset);

        let ch: string;
        let startOffset: number;

        this.scannerContext = {

            start: () => {
                startOffset = this.state.offset;
                return this.scannerContext!.advance();
            },

            current: () => ch,

            peek: (next = 1): string => {
                return this.input.substr(this.state.offset + next - 1, 1);
            },

            advance: (step = 1): string => {
                if (step > 0) {
                    ch = this.input.substr(this.state.offset + step - 1, 1);
                    this.state.offset += step;
                    this.state.col += step;
                }
                return ch;
            },

            match(expected: string) {
                if (this.peek() === expected) {
                    this.advance();
                    return true;
                }
                return false;
            },

            accept: (extra = 0) => {
                return this.input.substr(startOffset, this.state.offset - startOffset - 1 + extra);
            },

            newline: () => {
                this.state.line++;
                this.state.col = 0;
            },
        };

        this.nextToken = this.scan();
        this.currentToken = this.next();
    }

    get token() {
        return this.currentToken;
    }

    get lookahead() {
        return this.nextToken;
    }

    skip(type: TokenType.Any = TokenType.Whitespace) {
        while (this.currentToken.type === type) {
            this.next();
        }
    }

    next(): Token {
        this.currentToken = this.nextToken;
        this.nextToken = this.scan();
        return this.currentToken;
    }

    shift(): Token {
        const current = this.currentToken;
        this.next();
        return current;
    }

    protected addScanner(scanner: Scanner) {
        this.scanners.push(scanner);
    }

    private scan(): Token {

        const { line, col } = this.state;

        if (!this.scannerContext || this.state.offset >= this.end) {
            return { type: TokenType.EOF, line, col };
        }

        const start = this.scannerContext.start();
        const { length } = this.scanners;

        for (let i = 0; i < length; i++) {
            try {
                const token = this.scanners[i](start, line, col, this.scannerContext);
                if (token !== false) {
                    this.state.offset--;
                    if (this.state.col > 0) {
                        this.state.col--;
                    }
                    return token;
                }
            } catch (error) {
                if (typeof error !== 'string') {
                    throw error;
                }
                return {
                    type: TokenType.Invalid,
                    raw: this.scannerContext.accept(+1),
                    line: this.state.line,
                    col: this.state.offset,
                    error,
                };
            }
        }

        return { type: TokenType.Unknown, raw: start, line, col };
    }
}
