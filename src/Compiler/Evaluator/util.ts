
const ownProp = Object.prototype.hasOwnProperty;

export type PropQuery = (obj: {}, prop: string) => boolean;
export type Getter = (obj: {[name: string]: any}, prop: string) => any;

export const hasProtoProp: PropQuery = (obj, prop) => {
    return prop !== '__proto__'  && prop in obj;
};

export const hasOwnProp: PropQuery = (obj, prop) => {
    return prop !== '__proto__'  && ownProp.call(obj, prop);
};

export const protoPropGetter: Getter = (obj, prop) => {
    return prop !== '__proto__' ? obj[prop] : undefined;
};

export const ownPropGetter: Getter = (obj, prop) => {
    return hasOwnProp(obj, prop) ? obj[prop] : undefined;
};
