import { ExpressionEvaluator } from '../';
import { EvaluatorContext } from '../Compiler/Evaluator';


describe('ExpressionEvaluator', () => {

    const evaluator = new ExpressionEvaluator();
    const $eval = (expr: string, context?: EvaluatorContext) => {
        return evaluator.evaluate(expr, context);
    };

    it('Evaluates number expression', () => {
        expect($eval('3.14')).toBe(3.14);
    });

    it('Evaluates string expression', () => {
        expect($eval('"hello world!"')).toBe('hello world!');
    });

    it('Evaluates array literal expression', () => {
        expect($eval('[1, "foo", true, ["bar"]]')).toEqual([1, 'foo', true, ['bar']]);
    });

    it('Evaluates object literal expression', () => {
        expect($eval('{a: 1, "b": 2, ["c" + 3]: 3}')).toEqual({a: 1, b: 2, c3: 3});
    });

    it('Evaluates binary expressions', () => {
        expect($eval('2 + 2')).toBe(4);
        expect($eval('1 - 3')).toBe(-2);
        expect($eval('1 - 3 + 2')).toBe(0);
        expect($eval('3.14 * 0.1e3')).toBe(314);
    });

    it('Respects operator precedence and associativity', () => {
        expect($eval('2 + 2 / 2')).toBe(3);
        expect($eval('2 ** 1 ** 2')).toBe(2);
    });

    it('Reads variables from context', () => {

        const ctx = {
            foo: 2,
            bar: 10,
            obj: {
                a: 5,
                b: {
                    c: 11,
                },
            },
            prop: () => 'baz',
        };

        expect($eval('foo * bar', ctx)).toBe(20);
        expect($eval('bar in [1, 2, 10, 20, 30]', ctx)).toBe(true);
        expect($eval('obj.a * obj.b.c', ctx)).toBe(55);
        expect($eval('{[prop()]: 123}', ctx)).toEqual({baz: 123});
    });

    it('Writes variables from context', () => {

        const ctx = {
        };

        expect($eval('foo = 123', ctx)).toBe(123);
        expect((ctx as any).foo).toBe(123);
    });


});
