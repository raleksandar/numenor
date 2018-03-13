import { Any as Expression } from '../../Parser/Expression';

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

export const ConstValue = Symbol('const');
export const AsyncValue = Symbol('async');
export const ValueLookup = Symbol('lookup');

export interface EvaluatorContext {
    [name: string]: any;
}

export interface Evaluator {
    (context?: EvaluatorContext): any;
    [ConstValue]?: boolean;
    [AsyncValue]?: boolean;
}

export interface Stack {
    [index: number]: any;
    length: number;
    push(value: any): number;
    pop(): any;
}

export interface InternalEvaluator {
    (context: EvaluatorContext, stack: Stack): any;
    [ConstValue]?: boolean;
    [AsyncValue]?: boolean;
}

export interface EvaluatorFactory {
    (expr: Expression, options: CompilerOptions, compile: EvaluatorFactory): InternalEvaluator;
}

export interface EvaluatorAttributes {
    isConst?: boolean;
    isAsync?: boolean;
}

export function mark(attrib: EvaluatorAttributes, evaluator: InternalEvaluator) {
    if (attrib.isConst) {
        evaluator[ConstValue] = true;
    }
    if (attrib.isAsync) {
        evaluator[AsyncValue] = true;
    }
    return evaluator;
}

export function hasAsyncValue(object: InternalEvaluator): boolean {
    return object[AsyncValue] === true;
}

export function hasConstValue(object: InternalEvaluator): boolean {
    return object[ConstValue] === true;
}

export function makeConstEval(value: any): InternalEvaluator {
    return mark({ isConst: true }, () => value) as InternalEvaluator;
}

export function evalConst(evaluator: InternalEvaluator) {
    return evaluator(Object.create(null), []);
}
