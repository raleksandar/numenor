import {
    InternalEvaluator,
    EvaluatorContext,
    Stack,
    hasAsyncValue,
    CompilerOptions,
} from './';

const ownProp = Object.prototype.hasOwnProperty;
const bind = Function.prototype.bind;

export type PropQuery = (obj: {}, prop: string | symbol) => boolean;
export type Getter = (obj: {[name: string]: any}, prop: string) => any;

export function makeProtoPropQuery(options: CompilerOptions): PropQuery {
    return (obj, prop) => {

        if (prop === '__proto__') {
            return false;
        }

        if (hasOwnProp(obj, prop)) {
            return true;
        }

        if (Array.isArray(obj)) {
            return prop in options.ArrayPrototype;
        }

        return prop in obj;
    };
}

export const hasOwnProp: PropQuery = (obj, prop) => {
    return prop !== '__proto__' && ownProp.call(obj, prop);
};

export function makeProtoPropGetter(options: CompilerOptions): Getter {
    return (obj, prop) => {

        if (prop === '__proto__') {
            return undefined;
        }

        if (hasOwnProp(obj, prop)) {
            return obj[prop];
        }

        if (Array.isArray(obj)) {
            return options.ArrayPrototype[prop];
        }

        return obj[prop];
    };
}

export const ownPropGetter: Getter = (obj, prop) => {
    return hasOwnProp(obj, prop) ? obj[prop] : undefined;
};

export function makeValueMarshaller(options: CompilerOptions): ValueProcessor {
    return (value: any) => {

        if (options.EnforceMarshalling && Array.isArray(value)) {
            Object.setPrototypeOf(value, options.ArrayPrototype);
        }

        return value;
    };
}

export function bindFunction(fn: () => any, thisArg: any): () => any {
    return bind.call(fn, thisArg);
}

export type ValueProcessor = (value: any) => any;
export type EvalStep = InternalEvaluator | [InternalEvaluator, ValueProcessor];

export const identity: ValueProcessor = (value) => value;

export function evalMaybeAsyncSteps(context: EvaluatorContext, stack: Stack, expressions: EvalStep[]): PromiseLike<any[]> {

    const { length } = expressions;
    const values = new Array(length);

    let isAsync = false;
    let current = 0;
    let error: any;

    while (current < length) {

        const expression = expressions[current];
        let evaluate: InternalEvaluator;
        let process = identity;

        if (Array.isArray(expression)) {
            [evaluate, process] = expression;
        } else {
            evaluate = expression;
        }

        if (hasAsyncValue(evaluate)) {
            if (error) {
                return Promise.reject(error);
            }
            isAsync = true;
            break;
        }

        if (!error) {
            try {
                values[current] = process(evaluate(context, stack));
            } catch (evalError) {
                error = evalError;
            }
        }

        current++;
    }

    if (!isAsync) {
        if (error) {
            throw error;
        }
        // a synchronous thenable object
        return {
            then: (fn: (results: any[]) => any) => fn(values),
        };
    }

    return new Promise((resolve, reject) => {

        function next() {
            if (++current === length) {
                resolve(values);
                return;
            }

            const expression = expressions[current];
            let evaluate: InternalEvaluator;
            let process = identity;

            if (Array.isArray(expression)) {
                [evaluate, process] = expression;
            } else {
                evaluate = expression;
            }

            if (hasAsyncValue(evaluate)) {
                evaluate(context, stack)
                    .then((value: any) => {
                        values[current] = process(value);
                        next();
                    })
                    .catch(reject);
            } else {
                try {
                    values[current] = process(evaluate(context, stack));
                    next();
                } catch (evalError) {
                    reject(evalError);
                }
            }
        }

        current--;
        next();
    });
}
