export const ConstValue = Symbol('const');

export interface EvaluatorContext {
    [name: string]: any;
}

export interface Evaluator {
    (context?: EvaluatorContext): any;
    [ConstValue]?: boolean;
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
}

export function hasConstValue(object: Evaluator): boolean {
    return object[ConstValue] === true;
}

export function markAsConst(evaluator: Evaluator | InternalEvaluator): Evaluator {
    evaluator[ConstValue] = true;
    return evaluator as Evaluator;
}

export function makeConstEval(value: any): Evaluator {
    return markAsConst(() => value);
}

export const EmptyContext: EvaluatorContext = Object.create(null);

export function evalConst(evaluator: InternalEvaluator) {
    return evaluator(EmptyContext, []);
}
