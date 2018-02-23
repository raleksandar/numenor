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
    parse(): Expr;
    parse(precedence: Precedence): Expr;


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

export interface Prefix {
    (parser: Parser, token: Token): Expr;
}

export type InfixFn = (parser: Parser, lhs: Expr, token: Token) => Expr;

export interface Infix extends InfixFn {
    readonly precedence: Precedence;
}

export function makeInfix(parser: InfixFn, precedence: Precedence): Infix {
    const parselet = parser as Infix;
    (parselet as {precedence: Precedence}).precedence = precedence;
    return parselet;
}
