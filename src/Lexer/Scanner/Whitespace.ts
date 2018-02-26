import { Scanner } from './';
import { TokenType } from '../';
import { isWhitespace, isLineTerminator } from '../CharacterClass';

export const Whitespace: Scanner = (start, position, context) => {

    if (!isWhitespace(start)) {
        return false;
    }

    let ch = start;

    while (isWhitespace(ch)) {
        ch = context.advance();
    }

    return {
        type: TokenType.Whitespace,
        lexeme: context.accept(),
        ...position,
    };
};

export const LineTerminator: Scanner = (start, position, context) => {

    if (!isLineTerminator(start)) {
        return false;
    }

    let ch = start;

    while (isLineTerminator(ch)) {
        if (ch === '\r' && context.peek() === '\n') {
            context.advance();
        }
        context.newline();
        ch = context.advance();
    }

    return {
        type: TokenType.LineTerminator,
        lexeme: context.accept(),
        ...position,
    };
};
