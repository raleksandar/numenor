import { Scanner } from './';
import { TokenType } from '../';
import { isIdentStart, isIdentPart } from '../CharacterClass';

export const Identifier: Scanner = (start, position, context) => {

    if (!isIdentStart(start)) {
        return false;
    }

    let ch = start;

    while (isIdentPart(ch)) {
        ch = context.advance();
    }

    const name = context.accept();

    if (name === 'in') {
        return {
            type: TokenType.In,
            lexeme: name,
            ...position,
        };
    }

    if (name === 'await') {
        return {
            type: TokenType.Await,
            lexeme: name,
            ...position,
        };
    }

    if (name === 'true' || name === 'false') {
        return {
            type: TokenType.BooleanLiteral,
            value: name === 'true',
            lexeme: name,
            ...position,
        };
    }

    if (name === 'null') {
        return {
            type: TokenType.NullLiteral,
            value: null,
            lexeme: name,
            ...position,
        };
    }

    if (name === 'undefined') {
        return {
            type: TokenType.UndefinedLiteral,
            value: undefined,
            lexeme: name,
            ...position,
        };
    }

    return {
        type: TokenType.Identifier,
        name,
        lexeme: name,
        ...position,
    };
};
