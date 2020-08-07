/**
 * @file Iterators.js - Utilities for iterator objects.
 */

/**
 * @typedef {number} int
 */

/**
 * @typedef {number} uint
 */

import * as tc from "tc";

const Iterators = {
	drop,
	dropWhile,
	find,
	fromIterable,
	next,
	[Symbol.toStringTag]: "snowdash.Iterators",
};


/**
 * @template T
 * @param {Iterable<T>} iterable
 * @returns {Iterator<T>}
 */
export function fromIterable(iterable) {
	tc.expectIterable(iterable);
	return iterable[Symbol.iterator]();
}


/**
 * @param {Iterator<*>} iterator
 * @param {uint} n
 */
export function drop(iterator, n) {
	tc.expectPositiveInteger(n);
	let i = n;
	while(i--) iterator.next();
}

/**
 * @template T
 * @param {Iterator<T>} iterator
 * @param {function(T): boolean} predicate
 */
export function dropWhile(iterator, predicate) {
	tc.expectFunction(predicate);
	while(true) {
		const {done, value} = iterator.next();
		if(done || !predicate(value)) return;
	}
}

/**
 * @template T
 * @param {Iterator<T>} iterator
 * @param {function(T): boolean} predicate
 * @param {T} [defaultValue]
 * @returns {T}
 */
export function find(iterator, predicate, defaultValue = undefined) {
	tc.expectFunction(predicate);
	while(true) {
		const {done, value} = iterator.next();
		if(done) {
			if(typeof defaultValue !== "undefined") return defaultValue;
			throw new Error("No next value.");
		}
		if(predicate(value)) return value;
	}
}

/**
 * @template T
 * @param {Iterator<T>} iterator
 * @param {T} [defaultValue]
 * @returns {T}
 */
export function next(iterator, defaultValue) {
	const {done, value} = iterator.next();
	if(done) {
		if(typeof defaultValue !== "undefined") return defaultValue;
		throw new Error("No next value.");
	}
	return value;
}

export default Iterators;
