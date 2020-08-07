/**
 * @file Iterables.js - Utilities for iterable objects.
 */

/**
 * @typedef {number} uint
 */

import * as tc from "./tc";
import Iterators from "./Iterators";

const Iterables = {
	bigrams,
	chunk,
	filter,
	fromFunction,
	group,
	groupWith,
	map,
	ngrams,
	objectEntries,
	objectKeys,
	objectValues,
	take,
	takeWhile,
	zip,
	zipWith,
	[Symbol.toStringTag]: "snowdash.Iterables"
};

const call = Function.prototype.call.bind(Function.prototype.call);


/**
 * @template T
 * @generator
 * @param {function(T): T} fn
 * @param {T} initialValue
 * @yields {T}
 * @see Haskell 'iterate'
 */
export function* fromFunction(fn, initialValue) {
	tc.expectFunction(fn);
	let currentValue = initialValue;
	yield currentValue;
	while(true) {
		currentValue = fn(currentValue);
		yield currentValue;
	}
}

/**
 * @template T
 * @generator
 * @param {Iterable<T>} iterable
 * @yields {T[]}
 */
export function* bigrams(iterable) {
	tc.expectIterable(iterable);
	const iterator = Iterators.fromIterable(iterable);
	const sentinel = {};
	let a = Iterators.next(iterator, sentinel);
	let b = Iterators.next(iterator, sentinel);
	while(b !== sentinel) {
		yield [a, b];
		a = b;
		b = Iterators.next(iterator, sentinel);
	}
}

/**
 * @template T
 * @generator
 * @param {Iterable<T>} iterable
 * @param {uint} [n=1]
 * @yields {T[]}
 */
export function* chunk<T>(iterable: Iterable<T>, n = 1) {
	tc.expectIterable(iterable);
	tc.expectPositiveInteger(n);
	let chunk = [] as T[];
	let i = 0;

	for(const x of iterable) {
		if(i < n) {
			chunk[i] = x;
		} else {
			yield chunk;
			chunk = [x];
			i = 0;
		}
		i++;
	}
}

/**
 * @template T
 * @generator
 * @param {Iterable<T>} iterable
 * @param {function(T, uint?): boolean} predicate
 * @param {*=} thisArg
 * @yields {T}
 */
export function* filter(iterable, predicate, thisArg = undefined) {
	tc.expectFunction(predicate);
	tc.expectIterable(iterable);
	for(const x of iterable) {
		if(call(predicate, thisArg, x)) yield x;
	}
}

/**
 * @template T
 * @generator
 * @param {Iterable<T>} iterable
 * @yields {T[]}
 */
export function* group(iterable) {
	tc.expectIterable(iterable);
	yield* Iterables.groupWith(iterable, (x) => x);
}

/**
 * @template T
 * @generator
 * @param {Iterable<T>} iterable
 * @param {function(T, uint): *} mapfn
 * @yields {T[]}
 */
export function* groupWith<T>(iterable: Iterable<T>, mapfn) {
	tc.expectIterable(iterable);
	tc.expectFunction(mapfn);
	let i = 0;
	let currentChunk = [] as T[];
	let currentValue;
	const length = tc.isArrayLike(iterable) ? iterable.length : Infinity;
	for(const element of iterable) {
		const newValue = mapfn(element, i);
		if(i === 0) {
			currentChunk[currentChunk.length] = element;
			currentValue = newValue;
		} else if(newValue === currentValue) {
			currentChunk[currentChunk.length] = element;
		} else {
			yield currentChunk;
			currentChunk = [element];
			currentValue = newValue;
		}
		if(i++ === length) break;
	}
	yield currentChunk;
}

/**
 * @template T, U
 * @generator
 * @param {Iterable<T>} iterable
 * @param {function(T): U} fn
 * @param {*=} thisArg
 * @yields {U}
 */
export function* map(iterable, fn, thisArg = undefined) {
	tc.expectIterable(iterable);
	tc.expectFunction(fn);
	for(const x of iterable) {
		yield call(fn, thisArg, x);
	}
}

/**
 * No shorter ngram will be returned if the iterable is exhausted before
 * yielding 'n' elements.
 *
 * @generator
 * @template T
 * @param {Iterable<T>} iterable
 * @param {uint} n
 * @yields {T[]}
 */
export function* ngrams(iterable, n = 1) {
	tc.expectIterable(iterable);
	tc.expectPositiveInteger(n);
	let ngram = new Array(n);
	let i = 0;
	for(const x of iterable) {
		if(i < n) {
			ngram[i] = x;
		} else {
			ngram = ngram.slice(1);
			ngram[n - 1] = x;
			yield ngram;
		}
		i++;
	}
}

export function* objectEntries(object) {
	for(const key in object) {
		if(Object.hasOwnProperty.prototype.call(object, key)) {
			yield [key, object[key]];
		}
	}
}

export function* objectKeys(object) {
	for(const key in object) {
		if(Object.hasOwnProperty.prototype.call(object, key)) {
			yield key;
		}
	}
}

export function* objectValues(object) {
	for(const key in object) {
		if(Object.hasOwnProperty.prototype.call(object, key)) {
			yield object[key];
		}
	}
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {uint} n
 * @returns {T[]}
 * @note In Haskell, if 'n' is negative, 'take n xs' yields the empty sequence.
 */
export function take<T>(iterable: Iterable<T>, n) {
	tc.expectIterable(iterable);
	tc.expectPositiveInteger(n);
	const iterator = Iterators.fromIterable(iterable);
	const rv = [] as T[];
	let i = n;
	while(--i >= 0) rv[rv.length] = iterator.next().value;
	return rv;
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {Function} predicate
 * @returns {T[]}
 */
export function takeWhile<T>(iterable: Iterable<T>, predicate) {
	tc.expectIterable(iterable);
	tc.expectFunction(predicate);
	const iterator = Iterators.fromIterable(iterable);
	const rv = [] as T[];
	while(true) {
		const next = iterator.next();
		if(next.done) break;
		const nextValue = next.value;
		if(!predicate(nextValue)) break;
		rv[rv.length] = nextValue;
	}
	return rv;
}

/*
 * In Haskell,
 * - zip functions are not variadic.
 * - the helper function accepted by zipWith functions cannot be variadic.
 * In Lodash,
 * - '_.zip' and '_.zipWith' are variadic as well as the helper function
 *   they accept.
 * In Python 3,
 * - 'zip' is variadic; it accepts iterables  and returns an iterator.
 * In Ramda,
 * - R.zip and R.zipWith are diadic as well as the helper function it accepts.
 * In RxJs,
 * - 'zipArray' is the equivalent of 'zip'
 * - 'zip' is the equivalent of 'zipWith'.
 * - 'zip' is variadic as well as the helper function it accepts.
 * In RxJava and RxGroovy,
 * - 'zip' is the equivalent of 'zipWith'.
 * - 'zip' accepts either from 2 to 9 observables as well as
 *     an helper function of the same arity,
 *     or an iterable of observables and a variadic helper function.
 */

/**
 * @template T
 * @generator
 * @param {...Iterable<T>} iterables
 * @yields {T[]}
 */
export function* zip<T>(...iterables: Iterable<T>[]) {
	tc.expectIterables(iterables);
	const iterators = iterables.map(Iterators.fromIterable);
	while(true) {
		const rv = [] as T[];
		for(const iterator of iterators) {
			const {done, value} = iterator.next();
			if(done) return;
			rv[rv.length] = value;
		}
		yield rv;
	}
}

/**
 * @template T, U
 * @generator
 * @param {function(...T): U} fn
 * @param {...Iterable<T>} iterables
 * @yields {U}
 */
export function* zipWith<T, U>(fn: (...args: T[]) => U, ...iterables: Iterable<T>[]) {
	tc.expectFunction(fn);
	tc.expectIterables(iterables);
	const iterators = iterables.map(Iterators.fromIterable);
	while(true) {
		const values = [] as T[];
		for(const iterator of iterators) {
			const {done, value} = iterator.next();
			if(done) return;
			values[values.length] = value;
		}
		yield fn(...values);
	}
}

export default Iterables;
