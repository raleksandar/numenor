import * as ExpressionType from './ExpressionType';
import { TokenType } from '../Lexer';

export interface Number {
    readonly type: typeof ExpressionType.NumberLiteral;
    readonly value: number;
}

export interface String {
    readonly type: typeof ExpressionType.StringLiteral;
    readonly value: string;
}

export interface Boolean {
    readonly type: typeof ExpressionType.BooleanLiteral;
    readonly value: boolean;
}

export interface Null {
    readonly type: typeof ExpressionType.NullLiteral;
    readonly value: null;
}

export interface Undefined {
    readonly type: typeof ExpressionType.UndefinedLiteral;
    readonly value: undefined;
}

export interface Identifier {
    readonly type: typeof ExpressionType.Identifier;
    readonly name: string;
}

export interface StackPush {
    readonly type: typeof ExpressionType.StackPush;
    readonly rhs: Any;
}

export interface StackPop {
    readonly type: typeof ExpressionType.StackPop;
}

export interface StackRef {
    readonly type: typeof ExpressionType.StackRef;
    readonly offset: number;
}

export interface Assignment {
    readonly type: typeof ExpressionType.Assignment;
    readonly lhs: Identifier | MemberAccess | ComputedMemberAccess;
    readonly rhs: Any;
}

export interface BinaryOperation {
    readonly type: typeof ExpressionType.BinaryOperation;
    readonly lhs: Any;
    readonly rhs: Any;
    readonly operator: TokenType.Any;
}

export interface PrefixOperation {
    readonly type: typeof ExpressionType.PrefixOperation;
    readonly rhs: Any;
    readonly operator: TokenType.Any;
}

export interface PostfixOperation {
    readonly type: typeof ExpressionType.PostfixOperation;
    readonly lhs: Any;
    readonly operator: TokenType.Any;
}

export interface Array {
    readonly type: typeof ExpressionType.ArrayLiteral;
    readonly items: Any[];
}

export interface NamedItem {
    readonly name: Any;
    readonly value: Any;
}

export interface Object {
    readonly type: typeof ExpressionType.ObjectLiteral;
    readonly items: NamedItem[];
}

export interface Call {
    readonly type: typeof ExpressionType.Call;
    readonly lhs: Any;
    readonly args: Any[];
}

export interface Sequence {
    readonly type: typeof ExpressionType.Sequence;
    readonly expressions: Any[];
}

export interface Conditional {
    readonly type: typeof ExpressionType.Conditional;
    readonly lhs: Any;
    readonly thenBranch: Any;
    readonly elseBranch: Any;
}

export interface MemberAccess {
    readonly type: typeof ExpressionType.MemberAccess;
    readonly lhs: Any;
    readonly name: string;
}

export interface ComputedMemberAccess {
    readonly type: typeof ExpressionType.ComputedMemberAccess;
    readonly lhs: Any;
    readonly rhs: Any;
}

export type Value = Number
    | String
    | Boolean
    | Null
    | Undefined;

export type Primary = Value
    | Identifier
    | StackPop
    | StackPush
    | StackRef
    | Array
    | Object
    | Call
    | MemberAccess
    | ComputedMemberAccess;

export type Any = Primary
    | BinaryOperation
    | PrefixOperation
    | PostfixOperation
    | Assignment
    | Conditional
    | Sequence;
