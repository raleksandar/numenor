import { Scanner, ScannerContext } from './';
import { TokenType } from '../';
import * as LexerError from '../Error';
import { isHexDigit, isDecimalDigit, isOctalDigit, isBinaryDigit } from '../CharacterClass';

const HexLiteral = lex(16, isHexDigit, LexerError.ExpectedHexadecimalDigit);
const OctalLiteral = lex(8, isOctalDigit, LexerError.ExpectedOctalDigit);
const BinaryLiteral = lex(2, isBinaryDigit, LexerError.ExpectedBinaryDigit);

export const NumberLiteral: Scanner = (start, line, col, context) => {

    if (start === '0') {
        const nextCh = context.peek();
        if (nextCh === 'x') {
            return HexLiteral(context.advance(2), line, col, context);
        }
        if (nextCh === 'o') {
            return OctalLiteral(context.advance(2), line, col, context);
        }
        if (nextCh === 'b') {
            return BinaryLiteral(context.advance(2), line, col, context);
        }
    }

    if (start === '.' && isDecimalDigit(context.peek())) {
        context.advance();
        const value = Number.parseFloat('0.' + handleFloat(context));
        return {
            type: TokenType.NumberLiteral,
            raw: context.accept(),
            radix: 10,
            value,
            line,
            col,
        };
    }

    if (!isDecimalDigit(start)) {
        return false;
    }

    let ch = start;
    let trailingUnderscore = false;
    let value = '';

    while (isDecimalDigit(ch)) {
        value += ch;
        ch = context.advance();
        trailingUnderscore = false;

        if (ch === '_') {
            trailingUnderscore = true;
            ch = context.advance();
            if (ch === '.') {
                throw LexerError.SeparatorBeforePeriod;
            } else if (ch === 'e' || ch === 'E') {
                throw LexerError.SeparatorBeforeExponent;
            }
        } else if (ch === '.') {
            if (context.advance() === '_') {
                throw LexerError.SeparatorAfterPeriod;
            }
            value += '.' + handleFloat(context);
            break;
        } else if (ch === 'e' || ch === 'E') {
            if (context.advance() === '_') {
                throw LexerError.SeparatorAfterExponent;
            }
            value += 'e' + handleExponent(context);
            break;
        }
    }

    if (trailingUnderscore) {
        throw LexerError.TrailingSeparator;
    }

    return {
        type: TokenType.NumberLiteral,
        value: Number.parseFloat(value),
        raw: context.accept(),
        radix: 10,
        line,
        col,
    };
};

function handleFloat(context: ScannerContext): string {

    let ch = context.current();
    let trailingUnderscore = false;
    let value = '';

    while (isDecimalDigit(ch) || ch === '_' || ch === 'e' || ch === 'E') {
        if (ch !== '_') {
            trailingUnderscore = false;
            value += ch;
            if (ch === 'e' || ch === 'E') {
                context.advance();
                if (context.peek() === '_') {
                    context.advance();
                    throw LexerError.SeparatorAfterExponent;
                }
                return value + handleExponent(context);
            }
        } else {
            trailingUnderscore = true;
            const nextCh = context.peek();
            if (nextCh === 'e' || nextCh === 'E') {
                context.advance(2);
                throw LexerError.SeparatorBeforeExponent;
            }
        }
        ch = context.advance();
    }

    if (trailingUnderscore) {
        context.advance();
        throw LexerError.TrailingSeparator;
    }

    return value;
}

function handleExponent(context: ScannerContext): string {

    let ch = context.current();
    let value = '';

    if (ch === '+' || ch === '-') {
        value += ch;
        ch = context.advance();
        if (ch === '_') {
            throw LexerError.SeparatorAfterExponentSign;
        }
    }

    if (!isDecimalDigit(ch)) {
        throw LexerError.ExpectedExponent;
    }

    let trailingUnderscore = false;

    while (isDecimalDigit(ch) || ch === '_') {
        trailingUnderscore = ch === '_';
        if (!trailingUnderscore) {
            value += ch;
        }
        ch = context.advance();
    }

    if (trailingUnderscore) {
        throw LexerError.TrailingSeparator;
    }

    return value;
}

function lex(radix: number, isValidDigit: (ch: string) => boolean, error: string): Scanner {
    return (start, line, col, context) => {

        let ch = start;
        let value = '';
        let trailingUnderscore = false;

        while (isValidDigit(ch) || ch === '_') {
            trailingUnderscore = ch === '_';
            if (!trailingUnderscore) {
                value += ch;
            }
            ch = context.advance();
        }

        if (value.length === 0) {
            throw error;
        }

        if (trailingUnderscore) {
            throw LexerError.TrailingSeparator;
        }

        return {
            type: TokenType.NumberLiteral,
            value: Number.parseInt(value, radix),
            raw: context.accept(),
            col,
            line,
            radix,
        };
    };
}
