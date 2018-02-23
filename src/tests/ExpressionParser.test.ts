import { ExpressionParser } from '../ExpressionParser';
import { ExpressionLexer } from '../ExpressionLexer';
import * as ExpressionType from '../Parser/ExpressionType';
import * as Expression from '../Parser/Expression';

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
});
