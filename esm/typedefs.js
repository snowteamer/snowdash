/**
 * An integer number.
 *
 * @global
 * @typedef {number} int
 */

/**
 * An unsigned integer number.
 *
 * @global
 * @typedef {number} uint
 */

/**
 * @global
 * @template T
 * @typedef {function(T, uint?, Array<T>?): void} ArrayCallback
 */

/**
 * @global
 * @template T
 * @typedef {function(T, uint?, Array<T>?): boolean} ArrayPredicate
 */

/**
 * @global
 * @template T, U
 * @typedef {function(T, uint?): U} ArrayMappingFunction
 */

/**
 * @global
 * @template T
 * @typedef {Array<T>} MutableArray
 */

/*eslint-disable jsdoc/valid-types */
/**
 * @global
 * @template T
 * @typedef {T & {-readonly[P in keyof T]: T[P]}} Mutable<T>
 */
/*eslint-enable jsdoc/valid-types */

/**
 * @global
 * @template T
 * @typedef {Mutable<ArrayLike<T>>} MutableArrayLike<T>
 */
