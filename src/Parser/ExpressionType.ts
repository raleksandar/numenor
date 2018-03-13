export const Identifier = Symbol.for('numenor:expr:ident');
export const StackPush = Symbol.for('numenor:expr:stack_push');
export const StackPop = Symbol.for('numenor:expr:stack_pop');
export const StackRef = Symbol.for('numenor:expr:stack_ref');
export const NumberLiteral = Symbol.for('numenor:expr:number');
export const StringLiteral = Symbol.for('numenor:expr:string');
export const BooleanLiteral = Symbol.for('numenor:expr:bool');
export const NullLiteral = Symbol.for('numenor:expr:null');
export const UndefinedLiteral = Symbol.for('numenor:expr:undefined');
export const Assignment = Symbol.for('numenor:expr:assign');
export const ArrayLiteral = Symbol.for('numenor:expr:array');
export const ObjectLiteral = Symbol.for('numenor:expr:object');
export const Conditional = Symbol.for('numenor:expr:conditional');
export const BinaryOperation = Symbol.for('numenor:expr:binop');
export const PrefixOperation = Symbol.for('numenor:expr:prefix');
export const PostfixOperation = Symbol.for('numenor:expr:postfix');
export const Call = Symbol.for('numenor:expr:call');
export const Await = Symbol.for('numenor:expr:await');
export const Sequence = Symbol.for('numenor:expr:sequence');
export const MemberAccess = Symbol.for('numenor:expr:access');
export const ComputedMemberAccess = Symbol.for('numenor:expr:computed_access');

export type Value = typeof NumberLiteral
    | typeof StringLiteral
    | typeof BooleanLiteral
    | typeof NullLiteral
    | typeof UndefinedLiteral;

export type StackOperation = typeof StackPush
    | typeof StackPop
    | typeof StackRef;

export type Primary = Value
    | StackOperation
    | typeof Identifier
    | typeof ArrayLiteral
    | typeof ObjectLiteral
    | typeof Call
    | typeof Await
    | typeof MemberAccess
    | typeof ComputedMemberAccess;

export type Any = Primary
    | typeof Assignment
    | typeof BinaryOperation
    | typeof PrefixOperation
    | typeof PostfixOperation
    | typeof Conditional
    | typeof Sequence;
