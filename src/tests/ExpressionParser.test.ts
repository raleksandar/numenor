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

    it('Parses array expression', () => {
        const expr = parser.parse('[1, 2, 3,]') as Expression.Array;
        expect(expr.type).toBe(ExpressionType.ArrayLiteral);
        expect(expr.items).toEqual([
            { type: ExpressionType.NumberLiteral, value: 1 },
            { type: ExpressionType.NumberLiteral, value: 2 },
            { type: ExpressionType.NumberLiteral, value: 3 },
        ]);
    });

    it('Parses object expression', () => {
        const expr = parser.parse('{ a: 1, b: 2, }') as Expression.Object;
        expect(expr.type).toBe(ExpressionType.ObjectLiteral);
        expect(expr.items).toEqual([
            {
                name: { type: ExpressionType.StringLiteral, value: 'a' },
                value: { type: ExpressionType.NumberLiteral, value: 1 },
            },
            {
                name: { type: ExpressionType.StringLiteral, value: 'b' },
                value: { type: ExpressionType.NumberLiteral, value: 2 },
            },
        ]);
    });

    it('Parses call expression', () => {
        const expr = parser.parse('fn(1, 2,)') as Expression.Call;
        expect(expr.type).toBe(ExpressionType.Call);
        expect(expr.lhs).toEqual({ type: ExpressionType.Identifier, name: 'fn' });
        expect(expr.args).toEqual([
            { type: ExpressionType.NumberLiteral, value: 1 },
            { type: ExpressionType.NumberLiteral, value: 2 },
        ]);
    });

    it('Parses sequence expression', () => {
        const expr = parser.parse('1, 2, 3, 4');
        expect(expr).toEqual({
            type: ExpressionType.Sequence,
            expressions: [
                { type: ExpressionType.NumberLiteral, value: 1 },
                { type: ExpressionType.NumberLiteral, value: 2 },
                { type: ExpressionType.NumberLiteral, value: 3 },
                { type: ExpressionType.NumberLiteral, value: 4 },
            ],
        });
    });

    it('Parses await expression', () => {

        const expr = parser.parse('await fn()') as Expression.Await;
        expect(expr.type).toBe(ExpressionType.Await);
        expect(expr.rhs).toEqual({
            type: ExpressionType.Call,
            lhs: { type: ExpressionType.Identifier, name: 'fn' },
            args: [],
        });

        expect(parser.parse('await foo() + await bar()')).toEqual({
            type: ExpressionType.BinaryOperation,
            operator: TokenType.Plus,
            lhs: {
                type: ExpressionType.Await,
                rhs: {
                    type: ExpressionType.Call,
                    args: [],
                    lhs: { type: ExpressionType.Identifier, name: 'foo' },
                },
            },
            rhs: {
                type: ExpressionType.Await,
                rhs: {
                    type: ExpressionType.Call,
                    args: [],
                    lhs: { type: ExpressionType.Identifier, name: 'bar' },
                },
            },
        });
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

    it('Supports node event', () => {

        const listener = ({ node }: { node: Expression.Any }) => {
            expect(node).toEqual({
                type: ExpressionType.NumberLiteral,
                value: 1000,
            });
        };

        parser.addListener('node', listener);

        parser.parse('1e3');

        parser.removeListener('node', listener);
    });

    it('Supports replacing current node in node event listener', () => {

        const listener = ({ replaceWith }: { replaceWith: (expr: Expression.Any) => void }) => {
            expect(replaceWith).toBeInstanceOf(Function);
            replaceWith({
                type: ExpressionType.StringLiteral,
                value: 'replaced!',
            });
        };

        parser.addListener('node', listener);

        const expr = parser.parse('1e3');

        parser.removeListener('node', listener);

        expect(expr).toEqual({
            type: ExpressionType.StringLiteral,
            value: 'replaced!',
        });
    });
});
