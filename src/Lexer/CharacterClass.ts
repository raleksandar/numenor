
const reWhitespace = /[ \f\t\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
export function isWhitespace(ch: string): boolean {
    return reWhitespace.test(ch);
}

const reLineTerminator = /[\r\n\u2028\u2029]/;
export function isLineTerminator(ch: string): boolean {
    return reLineTerminator.test(ch);
}

const reIdentStart = /[$_a-z]/i;
export function isIdentStart(ch: string): boolean {
    return reIdentStart.test(ch);
}

const reIdentPart = /[$_a-z0-9]/i;
export function isIdentPart(ch: string): boolean {
    return reIdentPart.test(ch);
}

const reHexDigit = /[0-9a-fA-F]/;
export function isHexDigit(ch: string): boolean {
    return reHexDigit.test(ch);
}

const reDecimalDigit = /[0-9]/;
export function isDecimalDigit(ch: string): boolean {
    return reDecimalDigit.test(ch);
}

const reOctalDigit = /[0-7]/;
export function isOctalDigit(ch: string): boolean {
    return reOctalDigit.test(ch);
}

export function isBinaryDigit(ch: string): boolean {
    return ch === '0' || ch === '1';
}
