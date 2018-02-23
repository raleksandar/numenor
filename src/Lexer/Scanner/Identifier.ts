import { Scanner } from './';
import { TokenType } from '../';
import { isIdentStart, isIdentPart } from '../CharacterClass';

export const Identifier: Scanner = (start, line, col, context) => {

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
            line,
            col,
        };
    }

    if (name === 'true' || name === 'false') {
        return {
            type: TokenType.BooleanLiteral,
            raw: name,
            value: name === 'true',
            line,
            col,
        };
    }

    if (name === 'null') {
        return {
            type: TokenType.NullLiteral,
            raw: name,
            value: null,
            line,
            col,
        };
    }

    if (name === 'undefined') {
        return {
            type: TokenType.UndefinedLiteral,
            raw: name,
            value: undefined,
            line,
            col,
        };
    }

    return {
        type: TokenType.Identifier,
        name,
        line,
        col,
    };
};
