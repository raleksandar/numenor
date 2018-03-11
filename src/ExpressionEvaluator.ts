import { Parser } from './Parser';
import { Compiler } from './Compiler';
import { ExpressionParser } from './ExpressionParser';
import { ExpressionCompiler } from './ExpressionCompiler';
import { ExpressionLexer } from './ExpressionLexer';
import { EvaluatorContext, Evaluator, CompilerOptions } from './Compiler/Evaluator';

export class ExpressionEvaluator {

    private readonly parser: Parser;
    private readonly compiler: Compiler;

    constructor() {
        this.parser = new ExpressionParser(new ExpressionLexer());
        this.compiler = new ExpressionCompiler();
    }

    compile(expression: string, options?: CompilerOptions): Evaluator {
        return this.compiler.compile(this.parser.parse(expression), options);
    }

    evaluate(expression: string, context?: EvaluatorContext, options?: CompilerOptions): any {
        return this.compile(expression, options)(context);
    }
}
