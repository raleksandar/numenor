import { Expression, ExpressionType } from '../Parser';
import { Evaluator, InternalEvaluator, EvaluatorContext, EmptyContext } from './Evaluator';
import * as Error from './Error';
import { ArrayPrototype } from './ArrayPrototype';
import { makeValueMarshaller } from './Evaluator/util';

export interface CompilerOptions {
    NoUndefinedVars?: boolean;      // throws if referencing variable not defined in the context
    NoNewVars?: boolean;            // throws if assigning a value to the variable not defined in context
    ImmutableContext?: boolean;     // throws if trying to use any assignment operation
    NoProtoAccess?: boolean;        // disallows accessing or traversing of prototype chain
    ObjectPrototype?: any;          // prototype to use for objects created via object literals
    ArrayPrototype?: any;           // prototype to use for array values
    EnforceMarshalling?: boolean;   // enforce given prototypes on object returned from evaluator
    Constants?: {                   // compile-time constants to use
        [name: string]: any;        // if a constant has function type it is eligible for CTFE
    };
}

export interface EvaluatorFactory {
    (expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator;
}

const DefaultOptions: CompilerOptions = {
    NoUndefinedVars: false,
    NoNewVars: false,
    ImmutableContext: false,
    NoProtoAccess: true,
    ObjectPrototype: null,
    ArrayPrototype,
    EnforceMarshalling: false,
    Constants: Object.create(null),
};

export abstract class Compiler {

    private compilers: Map<ExpressionType.Any, EvaluatorFactory> = new Map();

    protected setCompiler(expressionType: ExpressionType.Any, compiler: EvaluatorFactory) {
        this.compilers.set(expressionType, compiler);
    }

    compile(expression: Expression.Any, options?: CompilerOptions): Evaluator {

        const compile: EvaluatorFactory = (expr, opts) => {

            const factory = this.compilers.get(expr.type);

            if (typeof factory === 'undefined') {
                throw new TypeError(Error.UnknownExpression(expr));
            }

            return factory(expr, opts, compile);
        };

        const compileOptions = {...DefaultOptions, ...options};
        const evaluator = compile(expression, compileOptions, compile);
        const marshallValue = makeValueMarshaller(compileOptions);

        return (context?: EvaluatorContext) => {
            return marshallValue(evaluator(context || EmptyContext, []));
        };
    }
}
