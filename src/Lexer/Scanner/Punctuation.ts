import { Scanner, ScannerContext } from './';
import { Any as Token } from '../Token';
import { TokenType } from '../';

export function makePunctuationScanner(lexeme: string, type: TokenType.Any): Scanner {

    const chars = lexeme.split('');
    const {length} = chars;

    if (length === 0) {
        throw new Error('You must specify at least one punctuation character');
    }

    return (start, line, col, context) => {

        if (!acceptPunctuation(chars, context)) {
            return false;
        }

        context.advance(length);

        return {type, line, col} as Token;
    };
}

export function makeOperatorScanner(lexeme: string, type: TokenType.Any, operator: TokenType.Any): Scanner {

    const punctuation = makePunctuationScanner(lexeme, type);

    return (start, line, col, context) => {

        const token = punctuation(start, line, col, context);

        if (token === false) {
            return false;
        }

        (token as {operator: TokenType.Any}).operator = operator;

        return token;
    };
}

function acceptPunctuation(chars: string[], context: ScannerContext): boolean {

    if (context.current() !== chars[0]) {
        return false;
    }

    const {length} = chars;

    for (let i = 1; i < length; i++) {
        if (context.peek(i) !== chars[i]) {
            return false;
        }
    }

    return true;
}
