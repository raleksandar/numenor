
type Predicate = (element: any, index: number, array: any[]) => boolean;

const polyfill = {

    find(predicate: Predicate, thisArg?: any) {

        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        const o = Object(this);
        const len = o.length >>> 0;

        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }

        let k = 0;

        while (k < len) {
            const kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
                return kValue;
            }
            k++;
        }

        return undefined;
    },

    findIndex(predicate: Predicate, thisArg?: any) {

        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        const o = Object(this);
        const len = o.length >>> 0;

        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }

        let k = 0;

        while (k < len) {
            const kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
                return k;
            }
            k++;
        }

        return -1;
    },

    includes(searchElement: any, fromIndex = 0) {

        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        const o = Object(this);
        const len = o.length >>> 0;

        if (len === 0) {
            return false;
        }

        const n = fromIndex | 0;
        let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        function sameValueZero(x: any, y: any) {
            return x === y || (
                typeof x === 'number' &&
                typeof y === 'number' &&
                isNaN(x) &&
                isNaN(y)
            );
        }

        while (k < len) {

            if (sameValueZero(o[k], searchElement)) {
                return true;
            }

            k++;
        }

        return false;
    },
};

export const ArrayPrototype = Object.seal({
    concat: Array.prototype.concat,
    every: Array.prototype.every,
    filter: Array.prototype.filter,
    find: Array.prototype.find || polyfill.find,
    findIndex: Array.prototype.findIndex || polyfill.findIndex,
    forEach: Array.prototype.forEach,
    includes: Array.prototype.includes || polyfill.includes,
    indexOf: Array.prototype.indexOf,
    join: Array.prototype.join,
    lastIndexOf: Array.prototype.lastIndexOf,
    map: Array.prototype.map,
    reduce: Array.prototype.reduce,
    reduceRight: Array.prototype.reduceRight,
    slice: Array.prototype.slice,
    some: Array.prototype.some,
    toString: Array.prototype.toString,
});
