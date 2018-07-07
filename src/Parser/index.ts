import { Lexer, TokenType, Token, LexerState, InitialLexerState } from '../Lexer';
import * as Expression from './Expression';
import * as Parselet from './Parselet';
import * as Precedence from './Precedence';
import * as Error from './Error';
import * as ExpressionType from './ExpressionType';
import { EventEmitter } from '../common/EventEmitter';

export {
    Expression,
    ExpressionType,
    Parselet,
    Precedence,
    Error as ParserError,
};

type PrefixParsers = Map<TokenType.Any, Parselet.Prefix[]>;
type InfixParsers = Map<TokenType.Any, Parselet.Infix[]>;
type TokenSet = Set<TokenType.Any>;

class ParserContext implements Parselet.Parser {

    private readonly queue: Token[] = [];
    private readonly scopeStack: TokenType.Any[] = [];

    constructor(
        private readonly fireEvent: (event: string, ...params: any[]) => void,
        private readonly lexer: Lexer,
        private readonly prefix: PrefixParsers,
        private readonly infix: InfixParsers,
        private readonly ignored: TokenSet = new Set(),
        private readonly context: any
    ) {
        this.skipIgnored();
    }

    get token(): Token {
        return this.peek(0);
    }

    parse(precedence: Precedence.Any = 0): Expression.Any {

        let token = this.shift();

        const parser = this.getPrefix(token);

        if (parser === undefined) {
            throw new SyntaxError(Error.UnknownToken(token));
        }

        this.scopeStack.push(token.type);
        this.fireEvent('scope:enter', token.type, this.scopeStack);

        let expression = parser(this, token, this.context);

        this.fireEvent('scope:leave', this.scopeStack.pop(), this.scopeStack);

        this.fireEvent('node', {
            get node() { return expression; },
            replaceWith: (expr: Expression.Any) => {
                expression = expr;
            },
        });

        while (true) {

            const parser = this.getInfix(this.token);

            if (parser === undefined || precedence >= parser.precedence) {
                break;
            }

            expression = parser(this, expression, this.shift(), this.context);
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

    peek(offset: number = 0): Token {
        while (this.queue.length <= offset) {
            const token = this.lexer.shift();
            if (token.type === TokenType.EOF) {
                return token;
            }
            if (!this.ignored.has(token.type)) {
                this.queue.push(token);
            }
        }
        return this.queue[offset];
    }

    shift(): Token {
        let token: Token;
        do {
            if (this.queue.length > 0) {
                token = this.queue.shift()!;
            } else {
                token = this.lexer.shift();
            }
        } while (this.ignored.has(token.type));
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

    private skipIgnored() {
        while (this.ignored.has(this.lexer.token.type)) {
            this.lexer.next();
        }
    }

    private getParser(registry: Map<TokenType.Any, any[]>, token: Token): any {
        const parsers = registry.get(token.type) as ({ matches?: Parselet.MatchesFn }[] | undefined);
        if (parsers) {
            for (const parser of parsers) {
                if (!parser.matches || parser.matches(this, token)) {
                    return parser;
                }
            }
        }
        return undefined;
    }

    private getPrefix(token: Token): Parselet.Prefix | undefined {
        const parser = this.getParser(this.prefix, token);
        return parser ? (parser as Parselet.Prefix) : parser;
    }

    private getInfix(token: Token): Parselet.Infix | undefined {
        const parser = this.getParser(this.infix, token);
        return parser ? (parser as Parselet.Infix) : parser;
    }
}

export abstract class Parser extends EventEmitter {

    parseletContext: any;

    private readonly prefix: PrefixParsers;
    private readonly infix: InfixParsers;
    private readonly ignored: TokenSet;

    constructor(private readonly lexer: Lexer) {
        super();
        this.prefix = new Map();
        this.infix = new Map();
        this.ignored = new Set();
    }

    get state(): LexerState {
        return this.lexer.currentState;
    }

    parse(input: string, state?: LexerState, exhaustive = true): Expression.Any {

        if (!state) {
            state = InitialLexerState;
        }

        this.lexer.initialize(input, state);

        const parserContext = new ParserContext(
            this.fireEvent.bind(this),
            this.lexer,
            this.prefix,
            this.infix,
            this.ignored,
            this.parseletContext,
        );

        const expression = parserContext.parse();

        if (exhaustive && !parserContext.match(TokenType.EOF)) {
            throw new SyntaxError(Error.UnknownToken(parserContext.token));
        }

        return expression;
    }

    protected setPrefix(tokenType: TokenType.Any, parser: Parselet.Prefix) {
        if (!this.prefix.has(tokenType)) {
            this.prefix.set(tokenType, []);
        }
        this.prefix.get(tokenType)!.push(parser);
    }

    protected setInfix(tokenType: TokenType.Any, parser: Parselet.Infix) {
        if (!this.infix.has(tokenType)) {
            this.infix.set(tokenType, []);
        }
        this.infix.get(tokenType)!.push(parser);
    }

    protected ignore(tokenType: TokenType.Any) {
        this.ignored.add(tokenType);
    }
}
