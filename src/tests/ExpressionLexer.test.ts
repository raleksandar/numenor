import { Token, TokenType, LexerError } from '../Lexer';
import { ExpressionLexer } from '../ExpressionLexer';

describe('Lexer', () => {

    const lexer = new ExpressionLexer();
    const tokenize = (input: string) => {
        lexer.initialize(input);
        const tokens: Token[] = [lexer.token];
        while (lexer.token.type !== TokenType.EOF) {
            tokens.push(lexer.next());
        }
        return tokens;
    };

    it('Returns EOF on empty string', () => {
        const tokens = tokenize('');
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('Parses base-10 integer literals', () => {
        const tokens = tokenize('123');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.NumberLiteral);
        const token = tokens[0];
        if (token.type === TokenType.NumberLiteral) {
            expect(token.radix).toBe(10);
            expect(token.lexeme).toBe('123');
            expect(token.value).toBe(123);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Parses separators in base-10 integer literals', () => {
        const tokens = tokenize('1_234_567');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.NumberLiteral);
        const token = tokens[0];
        if (token.type === TokenType.NumberLiteral) {
            expect(token.radix).toBe(10);
            expect(token.lexeme).toBe('1_234_567');
            expect(token.value).toBe(1234567);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Does not allow trailing separator in base-10 integer literals', () => {
        const tokens = tokenize('1_234_567_');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.Invalid);
        const token = tokens[0];
        if (token.type === TokenType.Invalid) {
            expect(token.lexeme).toBe('1_234_567_');
            expect(token.error).toBe(LexerError.TrailingSeparator);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Parses floating point literals', () => {
        const tokens = tokenize('123.45');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.NumberLiteral);
        const token = tokens[0];
        if (token.type === TokenType.NumberLiteral) {
            expect(token.radix).toBe(10);
            expect(token.lexeme).toBe('123.45');
            expect(token.value).toBe(123.45);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Parses floating point literals with only decimal part', () => {
        const tokens = tokenize('.45');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.NumberLiteral);
        const token = tokens[0];
        if (token.type === TokenType.NumberLiteral) {
            expect(token.radix).toBe(10);
            expect(token.lexeme).toBe('.45');
            expect(token.value).toBe(0.45);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Parses separators floating point literals', () => {
        const tokens = tokenize('123_456.78');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.NumberLiteral);
        const token = tokens[0];
        if (token.type === TokenType.NumberLiteral) {
            expect(token.radix).toBe(10);
            expect(token.lexeme).toBe('123_456.78');
            expect(token.value).toBe(123456.78);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Does not allow trailing separator in floating point literals', () => {
        const tokens = tokenize('123_456.78_');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.Invalid);
        const token = tokens[0];
        if (token.type === TokenType.Invalid) {
            expect(token.lexeme).toBe('123_456.78_');
            expect(token.error).toBe(LexerError.TrailingSeparator);
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Does not allow separator before decimal point in floating point literals', () => {
        const tokens = tokenize('123_456_.78');
        expect(tokens.length).toBe(3);
        expect(tokens[0].type).toBe(TokenType.Invalid);
        const invalidToken = tokens[0];
        if (invalidToken.type === TokenType.Invalid) {
            expect(invalidToken.lexeme).toBe('123_456_.');
            expect(invalidToken.error).toBe(LexerError.SeparatorBeforePeriod);
        }
        expect(tokens[1].type).toBe(TokenType.NumberLiteral);
        const numericToken = tokens[1];
        if (numericToken.type === TokenType.NumberLiteral) {
            expect(numericToken.radix).toBe(10);
            expect(numericToken.lexeme).toBe('78');
            expect(numericToken.value).toBe(78);
        }
        expect(tokens[2].type).toBe(TokenType.EOF);
    });

    it('Does not allow separator after decimal point in floating point literals', () => {
        const tokens = tokenize('123_456._78');
        expect(tokens.length).toBe(3);
        expect(tokens[0].type).toBe(TokenType.Invalid);
        const invalidToken = tokens[0];
        if (invalidToken.type === TokenType.Invalid) {
            expect(invalidToken.lexeme).toBe('123_456._');
            expect(invalidToken.error).toBe(LexerError.SeparatorAfterPeriod);
        }
        expect(tokens[1].type).toBe(TokenType.NumberLiteral);
        const numericToken = tokens[1];
        if (numericToken.type === TokenType.NumberLiteral) {
            expect(numericToken.radix).toBe(10);
            expect(numericToken.lexeme).toBe('78');
            expect(numericToken.value).toBe(78);
        }
        expect(tokens[2].type).toBe(TokenType.EOF);
    });
});
