import { Lexer, TokenType, Token, LexerState, InitialLexerState } from '../Lexer';
import * as Expression from './Expression';
import * as Parselet from './Parselet';
import * as Precedence from './Precedence';
import * as Error from './Error';
import * as ExpressionType from './ExpressionType';

export {
    Expression,
    ExpressionType,
    Parselet,
    Precedence,
    Error as ParserError,
};

type PrefixParsers = Map<TokenType.Any, Parselet.Prefix>;
type InfixParsers = Map<TokenType.Any, Parselet.Infix>;
type TokenSet = Set<TokenType.Any>;

class ParserContext implements Parselet.Parser {

    private queue: Token[] = [];

    constructor(
        private readonly lexer: Lexer,
        private readonly prefix: PrefixParsers,
        private readonly infix: InfixParsers,
        private readonly ignored: TokenSet = new Set()
    ) {
        this.skipIgnored();
    }

    private skipIgnored() {
        while (this.ignored.has(this.lexer.token.type)) {
            this.lexer.next();
        }
    }

    get token(): Token {
        if (this.queue.length > 0) {
            return this.queue.shift()!;
        }
        this.skipIgnored();
        return this.lexer.token;
    }

    parse(precedence: Precedence.Any = 0): Expression.Any {

        let token = this.shift();

        const parser = this.prefix.get(token.type as TokenType.Any);
        if (parser === undefined) {
            throw new SyntaxError(Error.UnknownToken(token));
        }

        let expression = parser(this, token);

        while (true) {

            const parser = this.infix.get(this.token.type as TokenType.Any);

            if (parser === undefined || precedence >= parser.precedence) {
                break;
            }

            expression = parser(this, expression, this.shift());
        }

        return expression;
    }

    match(tokenType: TokenType.Any): boolean {
        return this.token.type === tokenType;
    }

    accept(tokenType: TokenType.Any): boolean {
        if (!this.match(tokenType)) {
            return false;
        }
        this.shift();
        return true;
    }

    shift(): Token {
        let token: Token;
        do {
            if (this.queue.length > 0) {
                token = this.queue.shift()!;
            } else {
                token = this.lexer.shift();
            }
        } while (this.ignored.has(token.type as TokenType.Any));
        return token;
    }

    unshift(token: Token) {
        this.queue.unshift(token);
    }

    expect(tokenType: TokenType.Any): Token {
        if (this.token.type !== tokenType) {
            throw new SyntaxError(Error.UnexpectedToken(tokenType, this.token));
        }
        return this.shift();
    }
}

export abstract class Parser {

    private readonly prefix: PrefixParsers;
    private readonly infix: InfixParsers;
    private readonly ignored: TokenSet;
    private lexerState: LexerState;

    constructor(private readonly lexer: Lexer) {
        this.prefix = new Map();
        this.infix = new Map();
        this.ignored = new Set();
        this.lexerState = {
            offset: 0,
            line: 1,
            col: 0,
        };
    }

    protected setPrefix(tokenType: TokenType.Any, parser: Parselet.Prefix) {
        this.prefix.set(tokenType, parser);
    }

    protected setInfix(tokenType: TokenType.Any, parser: Parselet.Infix) {
        this.infix.set(tokenType, parser);
    }

    protected ignore(tokenType: TokenType.Any) {
        this.ignored.add(tokenType);
    }

    get state(): LexerState {
        return this.lexerState;
    }

    parse(input: string, state?: LexerState, exhaustive = true): Expression.Any {

        if (!state) {
            state = InitialLexerState;
        }

        this.lexer.initialize(input, state);

        const parserContext = new ParserContext(
            this.lexer,
            this.prefix,
            this.infix,
            this.ignored
        );

        const expression = parserContext.parse();

        this.lexerState = this.lexer.currentState;

        if (exhaustive && !parserContext.match(TokenType.EOF)) {
            throw new SyntaxError(Error.UnknownToken(parserContext.token));
        }

        return expression;
    }
}
