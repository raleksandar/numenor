import { Any as Expr } from '../Expression';
import { Any as Precedence } from '../Precedence';
import { Token, TokenType } from '../../Lexer';

export interface Parser {

    /**
     * Current token.
     *
     * @type {Token}
     * @memberof Parser
     */
    token: Token;

    /**
     * Parse next expression in input
     *
     * @returns {Expr}
     * @memberof Parser
     */
    parse(precedence?: Precedence): Expr;

    /**
     * Returns true if the current token matches given type.
     *
     * @param {TokenType.Any} tokenType
     * @returns {boolean}
     * @memberof Parser
     */
    match(tokenType: TokenType.Any): boolean;

    /**
     * Returns true if the current token matches given type and then advances
     * to the next token. Returns false (without advancing) otherwise.
     *
     * @param {TokenType.Any} tokenType Token type to check for
     * @returns {boolean}
     * @memberof Parser
     */
    accept(tokenType: TokenType.Any): boolean;

    /**
     * Returns the token from the queue at the given offset.
     * Note: this method does not mutate the queue or the parser state.
     *
     * @param {number} offset   Offset (from the current token) to return the token from.
     * @returns {Token}
     * @memberOf Parser
     */
    peek(offset: number): Token;

    /**
     * Returns current token and then advances to the next token.
     *
     * @returns {Token}
     * @memberof Parser
     */
    shift(): Token;

    /**
     * Inserts a token at the current position (before the current token).
     *
     * @param token Token to insert
     */
    unshift(token: Token): void;

    /**
     * Verifies that the current token matches given type, returns it and then
     * advances to the next token.
     * In case that the current token does not match given type an unexpected
     * token SyntaxError is thrown.
     *
     * @param {TokenType.Any} tokenType Token type to match
     * @returns {Token}
     * @memberof Parser
     */
    expect(tokenType: TokenType.Any): Token;
}

export type InfixFn = (parser: Parser, lhs: Expr, token: Token, context?: any) => Expr;
export type PrefixFn = (parser: Parser, token: Token, context?: any) => Expr;
export type MatchesFn = (parser: Parser, token: Token) => Boolean;

export interface Prefix extends PrefixFn {
    readonly matches?: MatchesFn;
}

export interface Infix extends InfixFn {
    readonly precedence: Precedence;
    readonly matches?: MatchesFn;
}

export function makePrefix(parser: PrefixFn, matches?: MatchesFn): Prefix {
    const parselet = parser as Prefix;
    (parselet as {matches?: MatchesFn}).matches = matches;
    return parselet;
}

export function makeInfix(parser: InfixFn, precedence: Precedence, matches?: MatchesFn): Infix {
    const parselet = parser as Infix;
    (parselet as {precedence: Precedence}).precedence = precedence;
    (parselet as {matches?: MatchesFn}).matches = matches;
    return parselet;
}
