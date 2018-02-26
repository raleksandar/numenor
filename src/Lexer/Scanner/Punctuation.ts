import { Scanner } from './';
import { Any as Token } from '../Token';
import { TokenType } from '../';

export function makePunctuationScanner(lexeme: string, type: TokenType.Any): Scanner {

    const chars = lexeme.split('');
    const { length } = chars;

    if (length === 0) {
        throw new Error('You must specify at least one punctuation character');
    }

    return (start, position, context) => {

        if (start !== chars[0]) {
            return false;
        }

        for (let i = 1; i < length; i++) {
            if (context.peek(i) !== chars[i]) {
                return false;
            }
        }

        context.advance(length);

        return { type, lexeme, ...position } as Token;
    };
}

export function makeOperatorScanner(lexeme: string, type: TokenType.Any, operator: TokenType.Any): Scanner {

    const punctuation = makePunctuationScanner(lexeme, type);

    return (start, position, context) => {

        const token = punctuation(start, position, context);

        if (token === false) {
            return false;
        }

        (token as {operator: TokenType.Any}).operator = operator;

        return token;
    };
}
