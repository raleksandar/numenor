export const Identifier = Symbol('IdentifierExpression');
export const Register = Symbol('RegisterExpression');
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
export const Sequence = Symbol('SequenceExpression');
export const MemberAccess = Symbol('MemberAccessExpression');
export const ComputedMemberAccess = Symbol('ComputedMemberAccessExpression');

export type Value = typeof NumberLiteral
    | typeof StringLiteral
    | typeof BooleanLiteral
    | typeof NullLiteral
    | typeof UndefinedLiteral;

export type Primary = Value
    | typeof Identifier
    | typeof Register
    | typeof ArrayLiteral
    | typeof ObjectLiteral
    | typeof Call
    | typeof MemberAccess
    | typeof ComputedMemberAccess;

export type Any = Primary
    | typeof Assignment
    | typeof BinaryOperation
    | typeof PrefixOperation
    | typeof PostfixOperation
    | typeof Conditional
    | typeof Sequence;
