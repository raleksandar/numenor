export const ConstValue = Symbol('const');

export interface EvaluatorContext {
    [name: string]: any;
}

export interface Evaluator {
    (context?: EvaluatorContext): any;
    [ConstValue]?: boolean;
}

export interface Register {
    value: any;
    [ConstValue]: boolean;
}

export interface RegisterSet {
    [index: number]: Register;
}

export interface InternalEvaluator {
    (context: EvaluatorContext, registers: RegisterSet): any;
    [ConstValue]?: boolean;
}

export function hasConstValue(object: Evaluator | Register): boolean {
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
export const RootRegisters: RegisterSet = [];

export function evalConst(evaluator: InternalEvaluator) {
    return evaluator(EmptyContext, RootRegisters);
}
