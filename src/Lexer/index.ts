import { Any as Token, TokenPosition } from './Token';
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
        this.currentToken = { type: TokenType.EOF, ...this.state, lexeme: '' };
        this.nextToken = { type: TokenType.EOF, ...this.state, lexeme: '' };
    }

    get currentState() {
        return this.state;
    }

    set currentState(state: LexerState) {
        this.state = Object.assign(Object.create(null), state);
        this.nextToken = this.scan();
        this.currentToken = this.next();
    }

    initialize(input: string, state?: LexerState, length: number = 0) {

        if (!state) {
            state = InitialLexerState;
        }

        const offset = state.offset || 0;

        this.input = input;
        this.end = offset + (length !== 0 ? length : input.length - offset);

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

        this.currentState = state;
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

        const { line, col, offset } = this.state;
        const position: TokenPosition = { line, col, offset };

        if (!this.scannerContext || this.state.offset >= this.end) {
            return { type: TokenType.EOF, ...position, lexeme: '' };
        }

        const start = this.scannerContext.start();
        const { length } = this.scanners;

        for (let i = 0; i < length; i++) {
            try {
                const token = this.scanners[i](start, position, this.scannerContext);
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
                    lexeme: this.scannerContext.accept(+1),
                    ...position,
                    error,
                };
            }
        }

        return { type: TokenType.Unknown, lexeme: start, ...position };
    }
}
