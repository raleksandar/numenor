import { Expression, ExpressionType } from '../Parser';

function str(exprType: ExpressionType.Any): string {
    // Symbol(Foo) -> Foo
    return exprType.toString().replace(/^.+?\((.+?)\)/, '$1');
}

export const UnknownExpression = ({ type }: Expression.Any) => (
    `Unknown expression type ${str(type)}`
);

export const UndefinedIdentifier = (name: string) => (
    `${name} is not defined`
);

export const CannotAccessProperty = (value: any, name?: string) => (
    `Cannot access property ${name ? name + ' ' : ''}of ${value} value`
);

export const CannotAccessProto = `Cannot access __proto__ member`;
export const CantInvoke = `Cannot invoke non-function values`;
export const ImmutableContext = `Cannot mutate context`;
