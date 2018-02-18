const numeric = `Invalid numeric literal:`;
export const TrailingSeparator = `${numeric} no trailing separator allowed`;
export const SeparatorAfterExponent = `${numeric} no separator allowed after exponent mark`;
export const SeparatorBeforeExponent = `${numeric} no separator allowed before exponent mark`;
export const SeparatorAfterExponentSign = `${numeric} no separator allowed after exponent sign`;
export const SeparatorAfterPeriod = `${numeric} no separator allowed after decimal point`;
export const SeparatorBeforePeriod = `${numeric} no separator allowed before decimal point`;
export const ExpectedExponent = `${numeric} expected exponent`;
export const ExpectedHexadecimalDigit = `${numeric} expected hexadecimal digit`;
export const ExpectedOctalDigit = `${numeric} expected octal digit`;
export const ExpectedBinaryDigit = `${numeric} expected binary digit`;

const string = `Invalid string literal:`;
export const UnterminatedString = `${string} missing closing quote`;
export const HexadecimalEscape = `${string} expected 2-digit hexadecimal character code`;
export const UnicodeEscape = `${string} expected 4-digit hexadecimal character code`;
export const UnicodeCodePointEscape = `${string} expected hexadecimal Unicode code point`;
export const UnicodeCodePointInvalid = `${string} undefined Unicode code point`;
