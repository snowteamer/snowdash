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
 * An object whose prototype is the null value.
 * - Unfortunately, TypeScript does not allow to express this type exactly
 *   ([#1108](https://github.com/microsoft/TypeScript/issues/1108)).
 *
 * @global
 * @template T
 * @typedef {Record<PropertyKey, T>} BareObject
 */

/**
 * @global
 * @template K, V
 * @typedef {function(V, K?, Map<K, V>?): void} MapCallback
 */

/**
 * @global
 * @template K, V
 * @typedef {function(V, K?, Map<K, V>?): boolean} MapPredicate
 */

/* eslint-disable jsdoc/valid-types */
/**
 * @global
 * @template T
 * @typedef {T & {-readonly[P in keyof T]: T[P]}} Mutable<T>
 */
/* eslint-enable jsdoc/valid-types */

/**
 * @global
 * @template T
 * @typedef {Mutable<ArrayLike<T>>} MutableArrayLike<T>
 */

/**
 *
 * @global
 * @typedef {!object} NonPrimitive
 */

/**
 * @global
 * @template T
 * @typedef {function(T): boolean} Predicate
 */

/**
 * @global
 * @template T
 * @typedef {function(T, T?, Set<T>?): void} SetCallback
 */

/**
 * @global
 * @template T
 * @typedef {function(T, T?, Set<T>?): boolean} SetPredicate
 */
