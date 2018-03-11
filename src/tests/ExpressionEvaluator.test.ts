import { ExpressionEvaluator } from '../';
import { EvaluatorContext, CompilerOptions } from '../Compiler/Evaluator';

describe('ExpressionEvaluator', () => {

    const evaluator = new ExpressionEvaluator();
    const $eval = (expr: string, context?: EvaluatorContext) => {
        return evaluator.evaluate(expr, context);
    };
    const $compile = (expr: string, options?: CompilerOptions) => {
        return evaluator.compile(expr, options);
    };
    const delay = (msec: number) => new Promise((resolve) => {
        setTimeout(resolve, msec);
    });

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
        expect($eval('{a: 1, "b": 2, ["c" + 3]: 3}')).toEqual({ a: 1, b: 2, c3: 3 });
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
        expect($eval('{[prop()]: 123}', ctx)).toEqual({ baz: 123 });
    });

    it('Writes variables from context', () => {

        const ctx = {
        };

        expect($eval('foo = 123', ctx)).toBe(123);
        expect((ctx as any).foo).toBe(123);
    });

    it('Throws when accessing undefined variables with {NoUndefinedVars: true}', () => {

        const ctx = {
        };

        expect(() => {
            $compile('foo', { NoUndefinedVars: true })(ctx);
        }).toThrowError('foo is not defined');
    });

    it('Throws when accessing members of null/undefined value', () => {

        const ctx = {
            baz: null,
        };

        expect(() => {
            $eval('foo.bar', ctx);
        }).toThrowError('Cannot access property bar of undefined value');

        expect(() => {
            $eval('baz.qux', ctx);
        }).toThrowError('Cannot access property qux of null value');
    });

    it('Does not throw when accessing members of null/undefined values via null-conditional ?. operator', () => {

        const ctx = {
            baz: null,
            a: {
                b: {
                    c: 123,
                },
            },
        };

        expect($eval('foo?.bar', ctx)).toBe(undefined);
        expect($eval('baz?.qux', ctx)).toBe(null);
        expect($eval('a?.b?.c', ctx)).toBe(123);
    });

    it('Supports null-coalescing ?? operator', () => {
        expect($eval('foo ?? false')).toBe(false);
        expect($eval('0 || true')).toBe(true);
        expect($eval('0 ?? true')).toBe(0);
        expect($eval('null ?? false')).toBe(false);
    });

    it('Supports prefix increment/decrement expressions', () => {

        const ctx = {
            a: 0,
            b: 0,
        };

        expect($eval('++a', ctx)).toBe(1);
        expect(ctx.a).toBe(1);
        expect($eval('--b', ctx)).toBe(-1);
        expect(ctx.b).toBe(-1);
        expect($eval('++a * --b', ctx)).toBe(-4);
        expect(ctx.a).toBe(2);
        expect(ctx.b).toBe(-2);
    });

    it('Supports postfix increment/decrement expressions', () => {

        const ctx = {
            a: 0,
            b: 0,
        };

        expect($eval('a++', ctx)).toBe(0);
        expect(ctx.a).toBe(1);
        expect($eval('b--', ctx)).toBe(0);
        expect(ctx.b).toBe(-1);
        expect($eval('a++ * b--', ctx)).toBe(-1);
        expect(ctx.a).toBe(2);
        expect(ctx.b).toBe(-2);
    });

    it('Supports compile-time constants defined in {Constants: {}}', () => {

        let expr = $compile('a * b', {
            Constants: {
                a: 123,
                b: 2,
            },
        });
        expect(expr()).toBe(246);

        expr = $compile('(a.b * c.d[a.i]) ** 2', {
            Constants: {
                a: {
                    b: 2,
                    i: 1,
                },
                c: {
                    d: [1, 2, 3],
                }
            }
        });
        expect(expr()).toBe(16); // (2 * 2) ** 2
    });

    it('Supports compile-time function evaluation via {Constants: {}}', () => {
        const expr = $compile('square(square(0x10))', {
            Constants: {
                square: (x: number) => x * x,
            },
        });
        expect(expr()).toBe(0x10000);
    });

    it('Throws when accessing __proto__ member', () => {
        expect(() => {
            $eval('__proto__');
        }).toThrowError('Cannot access __proto__ member');
        expect(() => {
            $eval('a.__proto__', { a: [] });
        }).toThrowError('Cannot access __proto__ member');
        expect(() => {
            $eval('a["__pr" + "oto__"]', { a: [] });
        }).toThrowError('Cannot access __proto__ member');
    });

    it('Does not traverse prototype chain by default', () => {

        const ctx = {};
        Object.setPrototypeOf(ctx, {
            a: 123,
        });

        expect($eval('a', ctx)).toBe(undefined);
        expect($eval('[1,2,3].indexOf')).toBe(undefined);

        expect(() => {
            // need to turn on NoNewVars or this will set `a` directly on `ctx` otherwise
            $compile('a = 123', { NoNewVars: true })(ctx);
        }).toThrowError('a is not defined');
    });

    it('Traverses prototype chain with {NoProtoAccess: false}', () => {

        const ctx = {};
        const proto = { a: 123 };
        Object.setPrototypeOf(ctx, proto);

        expect($compile('a', { NoProtoAccess: false })(ctx)).toBe(123);
        expect($compile('[1,2,3].indexOf', { NoProtoAccess: false })()).toBeInstanceOf(Function);
        expect(() => {
            // this still needs to fail as {NoProtoAccess: false} only allows *read* access
            $compile('a = 123', { NoNewVars: true, NoProtoAccess: false })(ctx);
        }).toThrowError('a is not defined');
    });

    it('Invokes functions with correct thisArg', () => {

        const ctx = {
            x: 123,
            fn: function(m: number) {
                return this.x * m;
            },
            o: {
                m: 2,
                fn: function(...params: number[]) {
                    let sum = 0;
                    for (const x of params) {
                        sum += x;
                    }
                    return sum * this.m;
                }
            }
        };

        expect($eval('fn(2)', ctx)).toBe(246);
        expect($eval('o.fn(2, 4, 6, 8)', ctx)).toBe(40);
        expect($compile('[1,2,3,4,5,6].map(fn).indexOf(246)', { NoProtoAccess: false })(ctx)).toBe(1);
    });

    it('Supports custom prototypes for arrays and objects', () => {

        expect(Object.getPrototypeOf($eval('{foo: "bar"}'))).toBe(null);

        expect(() => {
            // push is not defined on default ArrayPrototype so this throws
            $compile('[1,2,3].push(4)', { NoProtoAccess: false })();
        }).toThrowError('Cannot invoke non-function values');

        const ArrayPrototype = {
            square() {
                return Array.prototype.map.call(this, (x: number) => x ** 2);
            }
        };

        expect($compile('[1,2,3].square()', { ArrayPrototype, NoProtoAccess: false })()).toEqual([1,4,9]);
    });

    it('Supports value marshalling', () => {

        const ObjectPrototype = {
            keys() {
                return Object.keys(this);
            }
        };

        const obj = $compile('{a: 1, b: 2, c: 3}', { ObjectPrototype, EnforceMarshalling: true })();

        expect(obj).toEqual({ a: 1, b: 2, c: 3 });
        expect(Object.getPrototypeOf(obj)).toBe(ObjectPrototype);
        expect(obj.keys()).toEqual(['a', 'b', 'c']);

        const ctx = {
            keys: null,
            fn(o: any) {
                this.keys = o.keys();
                return (this.keys as any).join('|');
            },
        };

        const expr = $compile('fn({foo: 1, bar: 2})', { ObjectPrototype, EnforceMarshalling: true });

        expect(expr(ctx)).toBe('foo|bar');
        expect(ctx.keys).toEqual(['foo', 'bar']);
    });

    it('Supports async expressions with await operator', async () => {

        const ctx = {
            asyncValue: (x: any) => delay(10).then(() => x),
        };

        const five = $eval('await asyncValue(5)', ctx);

        expect(five).toBeInstanceOf(Promise);

        await expect(five).resolves.toBe(5);

        const sum = $eval('await asyncValue(3) + 5 + await asyncValue(2)', ctx);

        expect(sum).toBeInstanceOf(Promise);

        await expect(sum).resolves.toBe(10);
    });

    it('Supports awaiting an array (Promise.all)', async () => {

        const resolveOrder: string[] = [];

        const ctx = {
            a: delay(10).then(() => resolveOrder.push('a') && 'a'),
            b: () => resolveOrder.push('b') && 'b',
            c: delay(40).then(() => resolveOrder.push('c') && 'c'),
            d: delay(20).then(() => resolveOrder.push('d') && 'd'),
        };

        const promise = $eval('await [a, b(), c, d]', ctx);

        expect(resolveOrder.length).toBe(1); // b() is already resolved here

        expect(promise).toBeInstanceOf(Promise);

        await expect(promise).resolves.toEqual(['a', 'b', 'c', 'd']);

        expect(resolveOrder).toEqual(['b', 'a', 'd', 'c']);
    });

    it('Await respects expression order evaluation', async () => {

        const resolveOrder: string[] = [];

        const ctx = {
            a: () => delay(10).then(() => resolveOrder.push('a') && 'a'),
            b: () => resolveOrder.push('b') && 'b',
            c: () => delay(40).then(() => resolveOrder.push('c') && 'c'),
            d: () => delay(20).then(() => resolveOrder.push('d') && 'd'),
        };

        const promise = $eval('[await a(), b(), await c(), await d()]', ctx);

        expect(resolveOrder.length).toBe(0);

        expect(promise).toBeInstanceOf(Promise);

        await expect(promise).resolves.toEqual(['a', 'b', 'c', 'd']);

        expect(resolveOrder).toEqual(['a', 'b', 'c', 'd']);
    });
});
