export const Identifier = Symbol('IdentifierExpression');
export const StackPush = Symbol('StackPushExpression');
export const StackPop = Symbol('StackPopExpression');
export const StackRef = Symbol('StackRefExpression');
export const NumberLiteral = Symbol('NumberLiteralExpression');
export const StringLiteral = Symbol('StringLiteralExpression');
export const BooleanLiteral = Symbol('BooleanLiteralExpression');
export const NullLiteral = Symbol('NullLiteralExpression');
export const UndefinedLiteral = Symbol('UndefinedLiteralExpression');
export const Assignment = Symbol('AssignmentExpression');
export const ArrayLiteral = Symbol('ArrayLiteralExpression');
export const ObjectLiteral = Symbol('ObjectLiteralExpression');
export const Conditional = Symbol('ConditionalExpression');
export const BinaryOperation = Symbol('BinaryOperationExpression');
export const PrefixOperation = Symbol('PrefixOperationExpression');
export const PostfixOperation = Symbol('PostfixOperationExpression');
export const Call = Symbol('CallExpression');
export const Await = Symbol('AwaitExpression');
export const Sequence = Symbol('SequenceExpression');
export const MemberAccess = Symbol('MemberAccessExpression');
export const ComputedMemberAccess = Symbol('ComputedMemberAccessExpression');

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
