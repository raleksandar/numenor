import { ExpressionParser } from '../ExpressionParser';
import { ExpressionLexer } from '../ExpressionLexer';
import * as ExpressionType from '../Parser/ExpressionType';
import * as Expression from '../Parser/Expression';
import { TokenType } from '../Lexer';

describe('ExpressionParser', () => {

    let parser: ExpressionParser;

    beforeAll(() => {
        parser = new ExpressionParser(new ExpressionLexer());
    });

    it('Parses identifier expression', () => {
        const expr = parser.parse('someVariable') as Expression.Identifier;
        expect(expr.type).toBe(ExpressionType.Identifier);
        expect(expr.name).toBe('someVariable');
    });

    it('Parses number expression', () => {
        const expr = parser.parse('3.14') as Expression.Number;
        expect(expr.type).toBe(ExpressionType.NumberLiteral);
        expect(expr.value).toBe(3.14);
    });

    it('Parses string expression', () => {
        const expr = parser.parse('"hello world!"') as Expression.String;
        expect(expr.type).toBe(ExpressionType.StringLiteral);
        expect(expr.value).toBe('hello world!');
    });

    it('Supports scope:enter and scope:leave events', () => {

        const args: any[] = [];

        const enter = jest.fn((token, stack) => args.push(['enter', token, [...stack]]));
        const leave = jest.fn((token, stack) => args.push(['leave', token, [...stack]]));

        parser.addListener('scope:enter', enter);
        parser.addListener('scope:leave', leave);

        parser.parse('[1, 2]');

        expect(enter).toHaveBeenCalledTimes(3);
        expect(leave).toHaveBeenCalledTimes(3);

        expect(args).toEqual([
            ['enter', TokenType.LBracket, [TokenType.LBracket]],
            ['enter', TokenType.NumberLiteral, [TokenType.LBracket, TokenType.NumberLiteral]],
            ['leave', TokenType.NumberLiteral, [TokenType.LBracket]],
            ['enter', TokenType.NumberLiteral, [TokenType.LBracket, TokenType.NumberLiteral]],
            ['leave', TokenType.NumberLiteral, [TokenType.LBracket]],
            ['leave', TokenType.LBracket, []],
        ]);

        parser.removeListener('scope:enter', enter);
        parser.removeListener('scope:leave', leave);

        args.length = 0;

        parser.parse('123');

        expect(args).toEqual([]);
    });

});
