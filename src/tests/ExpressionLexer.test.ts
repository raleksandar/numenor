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

    const lex = (input: string, callback: (token: Token) => void) => {
        const tokens = tokenize(input);
        expect(tokens.length).toBe(2);
        expect(tokens[1].type).toBe(TokenType.EOF);
        callback(tokens[0]);
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

    it('Parses string escape sequence', () => {
        const tokens = tokenize('"first line\\nsecond line\\n\\r"');
        expect(tokens.length).toBe(2);
        expect(tokens[0].type).toBe(TokenType.StringLiteral);
        const stringToken = tokens[0];
        if (stringToken.type === TokenType.StringLiteral) {
            expect(stringToken.lexeme).toBe('"first line\\nsecond line\\n\\r"');
            expect(stringToken.value).toBe('first line\nsecond line\n\r');
        }
        expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('Parses punctuation operators', () => {

        lex('.', (token) => expect(token.type).toBe(TokenType.Dot));
        lex('(', (token) => expect(token.type).toBe(TokenType.LParen));
        lex(')', (token) => expect(token.type).toBe(TokenType.RParen));
        lex('[', (token) => expect(token.type).toBe(TokenType.LBracket));
        lex(']', (token) => expect(token.type).toBe(TokenType.RBracket));
        lex('{', (token) => expect(token.type).toBe(TokenType.LBrace));
        lex('}', (token) => expect(token.type).toBe(TokenType.RBrace));
        lex(',', (token) => expect(token.type).toBe(TokenType.Comma));
        lex(':', (token) => expect(token.type).toBe(TokenType.Colon));

        lex('++', (token) => expect(token.type).toBe(TokenType.PlusPlus));
        lex('+=', (token) => expect(token.type).toBe(TokenType.PlusEq));
        lex('+', (token) => expect(token.type).toBe(TokenType.Plus));

        lex('--', (token) => expect(token.type).toBe(TokenType.MinusMinus));
        lex('-=', (token) => expect(token.type).toBe(TokenType.MinusEq));
        lex('-', (token) => expect(token.type).toBe(TokenType.Minus));

        lex('=>', (token) => expect(token.type).toBe(TokenType.RightArrow));

        lex('===', (token) => expect(token.type).toBe(TokenType.EqEqEq));
        lex('==', (token) => expect(token.type).toBe(TokenType.EqEq));
        lex('=', (token) => expect(token.type).toBe(TokenType.Eq));

        lex('!==', (token) => expect(token.type).toBe(TokenType.BangEqEq));
        lex('!=', (token) => expect(token.type).toBe(TokenType.BangEq));
        lex('!', (token) => expect(token.type).toBe(TokenType.Bang));

        lex('&&', (token) => expect(token.type).toBe(TokenType.AmpAmp));
        lex('&=', (token) => expect(token.type).toBe(TokenType.AmpEq));
        lex('&', (token) => expect(token.type).toBe(TokenType.Amp));

        lex('||', (token) => expect(token.type).toBe(TokenType.PipePipe));
        lex('|=', (token) => expect(token.type).toBe(TokenType.PipeEq));
        lex('|', (token) => expect(token.type).toBe(TokenType.Pipe));

        lex('^=', (token) => expect(token.type).toBe(TokenType.CaretEq));
        lex('^', (token) => expect(token.type).toBe(TokenType.Caret));

        lex('~=', (token) => expect(token.type).toBe(TokenType.TildeEq));
        lex('~', (token) => expect(token.type).toBe(TokenType.Tilde));

        lex('**=', (token) => expect(token.type).toBe(TokenType.StarStarEq));
        lex('**', (token) => expect(token.type).toBe(TokenType.StarStar));
        lex('*=', (token) => expect(token.type).toBe(TokenType.StarEq));
        lex('*', (token) => expect(token.type).toBe(TokenType.Star));

        lex('/=', (token) => expect(token.type).toBe(TokenType.SlashEq));
        lex('/', (token) => expect(token.type).toBe(TokenType.Slash));

        lex('%=', (token) => expect(token.type).toBe(TokenType.PercentEq));
        lex('%', (token) => expect(token.type).toBe(TokenType.Percent));

        lex('<<=', (token) => expect(token.type).toBe(TokenType.LtLtEq));
        lex('<<', (token) => expect(token.type).toBe(TokenType.LtLt));
        lex('<=', (token) => expect(token.type).toBe(TokenType.LtEq));
        lex('<', (token) => expect(token.type).toBe(TokenType.Lt));

        lex('>>>=', (token) => expect(token.type).toBe(TokenType.GtGtGtEq));
        lex('>>>', (token) => expect(token.type).toBe(TokenType.GtGtGt));
        lex('>>=', (token) => expect(token.type).toBe(TokenType.GtGtEq));
        lex('>>', (token) => expect(token.type).toBe(TokenType.GtGt));
        lex('>=', (token) => expect(token.type).toBe(TokenType.GtEq));
        lex('>', (token) => expect(token.type).toBe(TokenType.Gt));

        lex('??=', (token) => expect(token.type).toBe(TokenType.QuestionQuestionEq));
        lex('??', (token) => expect(token.type).toBe(TokenType.QuestionQuestion));
        lex('?.', (token) => expect(token.type).toBe(TokenType.QuestionDot));
        lex('?', (token) => expect(token.type).toBe(TokenType.Question));
    });
});
