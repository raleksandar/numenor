import { CompilerOptions } from '../';

const ownProp = Object.prototype.hasOwnProperty;
const bind = Function.prototype.bind;

export type PropQuery = (obj: {}, prop: string) => boolean;
export type Getter = (obj: {[name: string]: any}, prop: string) => any;

export function makeProtoPropQuery(options: CompilerOptions): PropQuery {
    return (obj, prop) => {

        if (prop === '__proto__') {
            return false;
        }

        if (hasOwnProp(obj, prop)) {
            return true;
        }

        if (Array.isArray(obj)) {
            return prop in options.ArrayPrototype;
        }

        return prop in obj;
    };
}

export const hasOwnProp: PropQuery = (obj, prop) => {
    return prop !== '__proto__' && ownProp.call(obj, prop);
};

export function makeProtoPropGetter(options: CompilerOptions): Getter {
    return (obj, prop) => {

        if (prop === '__proto__') {
            return undefined;
        }

        if (hasOwnProp(obj, prop)) {
            return obj[prop];
        }

        if (Array.isArray(obj)) {
            return options.ArrayPrototype[prop];
        }

        return obj[prop];
    };
}

export const ownPropGetter: Getter = (obj, prop) => {
    return hasOwnProp(obj, prop) ? obj[prop] : undefined;
};

export function makeValueMarshaller(options: CompilerOptions) {
    return (value: any) => {

        if (options.EnforceMarshalling && Array.isArray(value)) {
            Object.setPrototypeOf(value, options.ArrayPrototype);
        }

        return value;
    };
}

export function bindFunction(fn: () => any, thisArg: any): () => any {
    return bind.call(fn, thisArg);
}
