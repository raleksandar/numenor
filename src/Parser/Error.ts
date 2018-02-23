import { Token, TokenType } from '../Lexer';

function str(tokenType: TokenType.Any): string {
    // Symbol(Foo) -> Foo
    return tokenType.toString().replace(/^.+?\((.+?)\)/, '$1');
}

export const UnknownToken = ({type, line, col}: Token) => (
    `Unexpected ${str(type)} at line ${line}:${col}`
);

export const UnexpectedToken = (tokenType: TokenType.Any, {type, line, col}: Token) => (
    `Expected ${str(tokenType)} but found ${str(type)} at line ${line}:${col}`
);

export const InvalidLeftHandSide = `Invalid left-hand side in assignment`;
