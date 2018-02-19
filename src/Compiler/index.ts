import { Expression, ExpressionType } from '../Parser';
import { Evaluator, InternalEvaluator, hasConstValue, EvaluatorContext, EmptyContext, RootRegisters } from './Evaluator';
import * as Error from './Error';

export interface CompilerOptions {
    NoUndefinedVars?: boolean;
    NoNewVars?: boolean;
    ImmutableContext?: boolean;
    Constants?: {
        [name: string]: any;
    };
}

export interface EvaluatorFactory {
    (expr: Expression.Any, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator;
}

const DefaultOptions: CompilerOptions = {
    NoUndefinedVars: false,
    NoNewVars: false,
    ImmutableContext: false,
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

        if (hasConstValue(evaluator as Evaluator)) {
            return evaluator as Evaluator;
        }

        return (context?: EvaluatorContext) => {
            return evaluator(context || EmptyContext, RootRegisters);
        };
    }
}
