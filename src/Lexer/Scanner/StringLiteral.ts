import { Scanner, ScannerContext } from './';
import { TokenType } from '../';
import * as LexerError from '../Error';
import { isLineTerminator, isHexDigit } from '../CharacterClass';

export const StringLiteral: Scanner = (start, position, context) => {

    if (start !== '"' && start !== "'") {
        return false;
    }

    let ch = context.advance();
    let value = '';

    while (ch !== start) {
        if (ch === '\\') {
            ch = context.advance();
            value += handleEscapeSequence(context);
        } else if (isLineTerminator(ch) || ch === '') {
            throw LexerError.UnterminatedString;
        } else {
            value += ch;
        }
        ch = context.advance();
    }

    context.advance();

    return {
        type: TokenType.StringLiteral,
        lexeme: context.accept(),
        value,
        ...position,
    };
};

const escapes = new Map<string, string>();

escapes.set('\\', '\\');
escapes.set('"', '"');
escapes.set("'", "'");
escapes.set('b', '\b');
escapes.set('f', '\f');
escapes.set('n', '\n');
escapes.set('r', '\r');
escapes.set('t', '\t');
escapes.set('v', '\v');

function handleEscapeSequence(context: ScannerContext): string {

    const ch = context.current();

    if (escapes.has(ch)) {
        context.advance();
        return escapes.get(ch)!;
    }

    if (isLineTerminator(ch)) {
        context.newline();
        context.advance();
        if (ch === '\r' && context.current() === '\n') {
            context.advance();
        }
        return '';
    }

    if (ch === 'x') {
        return handleHexEscape(context);
    }

    if (ch === 'u') {
        if (context.peek() === '{') {
            context.advance();
            return handleUnicodeCodePointEscape(context);
        } else {
            return handleUnicodeEscape(context);
        }
    }

    throw LexerError.InvalidEscapeSequence;
}

function handleHexEscape(context: ScannerContext): string {

    const ch = context.advance();

    if (!isHexDigit(ch) || !isHexDigit(context.peek())) {
        throw LexerError.HexadecimalEscape;
    }

    const code = Number.parseInt(ch + context.advance(), 16);
    context.advance();
    return String.fromCharCode(code);
}

function handleUnicodeEscape(context: ScannerContext): string {

    let ch = context.advance();
    let hex = '';

    while (hex.length < 4 && isHexDigit(ch)) {
        hex += ch;
        ch = context.advance();
    }

    if (hex.length < 4) {
        throw LexerError.UnicodeEscape;
    }

    return String.fromCharCode(Number.parseInt(hex, 16));
}

function handleUnicodeCodePointEscape(context: ScannerContext): string {

    let ch = context.advance();
    let hex = '';

    while (ch !== '}' && ch !== '' && isHexDigit(ch)) {
        hex += ch;
        ch = context.advance();
    }

    if (ch !== '}' || hex === '') {
        throw LexerError.UnicodeCodePointEscape;
    }

    const codePoint = Number.parseInt(hex, 16);

    if (codePoint > 0x10ffff) {
        throw `${LexerError.UnicodeCodePointInvalid}: 0x${hex}`;
    }

    context.advance();
    return String.fromCodePoint(codePoint);
}
