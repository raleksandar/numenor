import { Compiler } from './Compiler';
import { ExpressionType } from './Parser';
import { Assignment } from './Compiler/Evaluator/Assignment';
import { Identifier } from './Compiler/Evaluator/Identifier';
import { ArrayLiteral } from './Compiler/Evaluator/ArrayLiteral';
import { BinaryOperation } from './Compiler/Evaluator/BinaryOperation';
import { Call } from './Compiler/Evaluator/Call';
import { Conditional } from './Compiler/Evaluator/Conditional';
import { MemberAccess, ComputedMemberAccess } from './Compiler/Evaluator/MemberAccess';
import { ObjectLiteral } from './Compiler/Evaluator/ObjectLiteral';
import { PrefixOperation } from './Compiler/Evaluator/PrefixOperation';
import { Sequence } from './Compiler/Evaluator/Sequence';
import { Value } from './Compiler/Evaluator/Value';
import { StackPush, StackPop, StackRef } from './Compiler/Evaluator/Stack';
import { Await } from './Compiler/Evaluator/Await';
import { Lambda } from './Compiler/Evaluator/Lambda';

export class ExpressionCompiler extends Compiler {

    constructor() {
        super();

        this.setCompiler(ExpressionType.ArrayLiteral, ArrayLiteral);
        this.setCompiler(ExpressionType.Assignment, Assignment);
        this.setCompiler(ExpressionType.BinaryOperation, BinaryOperation);
        this.setCompiler(ExpressionType.Call, Call);
        this.setCompiler(ExpressionType.Conditional, Conditional);
        this.setCompiler(ExpressionType.Identifier, Identifier);
        this.setCompiler(ExpressionType.StackPush, StackPush);
        this.setCompiler(ExpressionType.StackPop, StackPop);
        this.setCompiler(ExpressionType.StackRef, StackRef);
        this.setCompiler(ExpressionType.Await, Await);
        this.setCompiler(ExpressionType.MemberAccess, MemberAccess);
        this.setCompiler(ExpressionType.ComputedMemberAccess, ComputedMemberAccess);
        this.setCompiler(ExpressionType.ObjectLiteral, ObjectLiteral);
        this.setCompiler(ExpressionType.PrefixOperation, PrefixOperation);
        this.setCompiler(ExpressionType.Sequence, Sequence);
        this.setCompiler(ExpressionType.NumberLiteral, Value);
        this.setCompiler(ExpressionType.StringLiteral, Value);
        this.setCompiler(ExpressionType.BooleanLiteral, Value);
        this.setCompiler(ExpressionType.NullLiteral, Value);
        this.setCompiler(ExpressionType.UndefinedLiteral, Value);
        this.setCompiler(ExpressionType.Lambda, Lambda);
    }
}
