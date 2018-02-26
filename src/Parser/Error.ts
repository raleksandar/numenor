import { Token, TokenType } from '../Lexer';

function str(tokenType: TokenType.Any): string {
    // Symbol(Foo) -> Foo
    return tokenType.toString().replace(/^.+?\((.+?)\)/, '$1');
}

export const UnknownToken = ({ lexeme, line, col }: Token) => (
    `Unexpected ${JSON.stringify(lexeme)} at line ${line}:${col}`
);

export const UnexpectedToken = (tokenType: TokenType.Any, { lexeme, line, col }: Token) => (
    `Expected ${str(tokenType)} but found ${JSON.stringify(lexeme)} at line ${line}:${col}`
);

export const InvalidLeftHandSide = `Invalid left-hand side in assignment`;
