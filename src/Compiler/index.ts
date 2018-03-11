import { Expression, ExpressionType } from '../Parser';
import { Evaluator, EvaluatorContext, CompilerOptions, EvaluatorFactory } from './Evaluator';
import * as Error from './Error';
import { ArrayPrototype } from './ArrayPrototype';
import { makeValueMarshaller } from './Evaluator/util';
import { EventEmitter } from '../common/EventEmitter';

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

export abstract class Compiler extends EventEmitter {

    private compilers: Map<ExpressionType.Any, EvaluatorFactory> = new Map();

    compile(expression: Expression.Any, options?: CompilerOptions): Evaluator {

        const scopeStack: ExpressionType.Any[] = [];

        const compile = (expr: Expression.Any, opts: CompilerOptions) => {

            const makeEval = this.compilers.get(expr.type);

            if (typeof makeEval === 'undefined') {
                throw new TypeError(Error.UnknownExpression(expr));
            }

            scopeStack.push(expr.type);
            this.fireEvent('scope:enter', expr.type, scopeStack);

            const evaluator = makeEval(expr, opts, compile);

            this.fireEvent('scope:leave', expr.type, scopeStack, evaluator);

            return evaluator;
        };

        const compileOptions = { ...DefaultOptions, ...options };
        const evaluator = compile(expression, compileOptions);
        const marshallValue = makeValueMarshaller(compileOptions);

        return (context?: EvaluatorContext) => {
            return marshallValue(evaluator(context || Object.create(null), []));
        };
    }

    protected setCompiler(expressionType: ExpressionType.Any, compiler: EvaluatorFactory) {
        this.compilers.set(expressionType, compiler);
    }
}
