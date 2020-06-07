/**
 * @file Functions.js - Utilities for Function objects.
 */

/* eslint-disable no-invalid-this */

/**
 * @typedef {number} uint
 */

import * as tc from "tc";


/**
 * @module core/Functions
 */
const Functions = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	Functions[Symbol.toStringTag] = "core.Functions";
}

// const call = Function.prototype.call.bind(Function.prototype.call);


/**
 * @param {Function} arg
 * @returns {string}
 */
Functions.getName = function getName(arg) {
	tc.expectFunction(arg);
	return arg.name;
};

/**
 * @param {*} arg
 * @returns {boolean}
 */
Functions.isFunction = function isFunction(arg) {
	return typeof arg === "function";
};

/**
 * @param {*} arg
 * @returns {boolean}
 */
Functions.isNativeFunction = function isNativeFunction(arg) {
	if(typeof arg !== "function") return false;
	const code = Function.prototype.toString.call(arg);
	return /{\s*\[native code]\s*}\s*$/.test(code);
};


// ===== begin 'Operators' section ===== //


/**
 * @see Pythons's 'operator' module - https://docs.python.org/2/library/operator.html
 */

/**
 * @param {Function} fn
 * @param {*} thisArg
 * @param {...*} args
 * @returns {*}
 */
Functions.call = function call(fn, thisArg, ...args) {
	tc.expectFunction(fn);
	return Function.prototype.call.call(fn, thisArg, ...args);
};

/**
 * @param {*} arg
 * @returns {*}
 */
Functions.identity = function identity(arg) {
	return arg;
};
Functions.noop = function noop() {
	;
};
Functions.not = function not(arg) {
	return !arg;
};
// eslint-disable-next-line no-implicit-coercion
Functions.nonZero = function nonZero(arg) {
	return !!arg;
};

// ====== Relational operators ====== //

Functions.is = function is(x, y) {
	return x === y;
};
Functions.isEqualTo = function isEqualTo(x, y) {
	// eslint-disable-next-line eqeqeq
	return x == y;
};
Functions.isGreaterThan = function isGreaterThan(x, y) {
	return x > y;
};
Functions.isGreaterThanOrEqualTo = function isGreaterThanOrEqualTo(x, y) {
	return x >= y;
};
Functions.isLowerThan = function isLowerThan(x, y) {
	return x < y;
};
Functions.isLowerThanOrEqualTo = function isLowerThanOrEqualTo(x, y) {
	return x <= y;
};
Functions.isNot = function isNot(x, y) {
	return x !== y;
};
Functions.isNotEqualTo = function isNotEqualTo(x, y) {
	// eslint-disable-next-line eqeqeq
	return x != y;
};
Functions.isInstanceOf = function isInstanceOf(x, y) {
	return x instanceof y;
};

// ===== end of 'Relational operators' ===== //

/**
 * @param {string} name
 * @returns {Function}
 */
Functions.abstractMethod =
	function abstractMethod(name) {
		tc.expectString(name);
		return function wrapper() {
			throw new Error(`The function '${name}' is an abstract method.`);
		};
	};

/**
 * Creates a wrapper around the given callback function.
 * - For at most n calls, it will do nothing.
 * - For subsequent calls, it will delegate to the given callback function.
 *
 * @param {Function} callback
 * @param {uint} nTimes
 * @returns {Function}
 * @see https://lodash.com/docs#after
 */
Functions.after =
	function after(callback, nTimes) {
		tc.expectFunction(callback);
		tc.expectPositiveInteger(nTimes);
		let n = nTimes;
		return function wrapper(...args) {
			--n;
			if(n > 0) return undefined;
			// @ts-ignore
			return Function.prototype.call.call(callback, this, ...args);
		};
	};

/**
 * Static shorthand of `.apply()`.
 *
 * @param {Function} f
 * @param {*} thisArg
 * @param {Array} argArray
 * @returns {*}
 */
Functions.apply =
	function apply(f, thisArg, argArray) {
		tc.expectFunction(f);
		return Function.prototype.apply.call(f, thisArg, argArray);
	};

/**
 * @param {Function} callback
 * @param {uint} nTimes
 * @returns {Function}
 * @see https://lodash.com/docs#before
 */
Functions.before =
	function before(callback, nTimes) {
		tc.expectFunction(callback);
		tc.expectPositiveInteger(nTimes);
		let cache;
		let n = nTimes;
		return function wrapper(...args) {
			--n;
			if(n > 0) {
				// @ts-ignore
				const rv = Functions.call(callback, this, ...args);
				if(n === 1) cache = rv;
				return rv;
			}
			return cache;
		};
	};

// ===== begin section 'Memoization utilities' ===== //

Functions.cachesByFunction = new WeakMap();
Functions.wrappedFunctionsByCache = new WeakMap();
Functions.wrapperFunctionsByCache = new WeakMap();

/**
 * @param {Function} fn
 * @returns {boolean}
 */
Functions.isMemoized =
	function isMemoized(fn) {
		return Functions.cachesByFunction.has(fn);
	};

/**
 * @param {Function} fn
 * @param {object} options
 * @param {function(*): string} options.hashFunction
 * @returns {Function}
 */
Functions.memoize =
	function memoize(fn, options = {"hashFunction": JSON.stringify}) {
		tc.expectFunction(fn);
		if(Functions.isMemoized(fn)) {
			throw new Error("The given function is already memoized.");
		}
		const hashFunction = options && options.hashFunction;
		tc.expectFunction(hashFunction);
		const cache = new Map();
		const wrapper = function wrapper(...args) {
			// @ts-ignore
			if(wrapper.closed) return Functions.call(fn, this, ...args);
			const cacheKey = hashFunction(args);
			// @ts-ignore
			if(!cache.has(cacheKey)) {
				cache.set(cacheKey, Functions.call(fn, this, ...args));
			}
			return cache.get(cacheKey);
		};
		wrapper.closed = false;
		Functions.cachesByFunction.set(fn, cache);
		Functions.cachesByFunction.set(wrapper, cache);
		Functions.wrappedFunctionsByCache.set(cache, fn);
		Functions.wrapperFunctionsByCache.set(cache, wrapper);
		// wrapper.wrapped = fn;
		// wrapper.cache = cache;
		return wrapper;
	};

/**
 * Replaces the given method of the given object
 *   by a memoized version.
 * - Currently does not take property attributes into account.
 *
 * @param {object} object
 * @param {string} propertyName
 */
Functions.memoizeMethod =
	function memoizeMethod(object, propertyName) {
		tc.expectNonPrimitive(object);
		tc.expectString(propertyName);
		tc.expectFunction(object[propertyName]);
		object[propertyName] = Functions.memoize(object[propertyName]);
	};

/**
 * @param {Function} fn
 * @returns {Function}
 */
Functions.unmemoize =
	function unmemoize(fn) {
		tc.expectFunction(fn);
		if(!Functions.isMemoized(fn)) {
			throw new Error("The given function is not a memoization wrapper.");
		}
		const cache = Functions.cachesByFunction.get(fn);
		const wrapped = Functions.wrappedFunctionsByCache.get(cache);
		const wrapper = Functions.wrapperFunctionsByCache.get(cache);
		Functions.cachesByFunction.delete(wrapped);
		Functions.cachesByFunction.delete(wrapper);
		Functions.wrappedFunctionsByCache.delete(cache);
		Functions.wrapperFunctionsByCache.delete(cache);
		cache.clear();
		wrapper.closed = true;
		return wrapped;
	};

/**
 * Currently does not take property attributes into account.
 *
 * @param {object} object
 * @param {string} propertyName
 */
Functions.unmemoizeMethod =
	function unmemoizeMethod(object, propertyName) {
		tc.expectNonPrimitive(object);
		tc.expectString(propertyName);
		object[propertyName] = Functions.unmemoize(object[propertyName]);
	};

// ===== end of section 'Memoization utilities' ===== //

/**
 * Calls the given function `n` times,
 *   then returns an array of the results.
 *
 * @param {Function} f
 * @param {uint} n
 * @param {*} thisArg
 * @param {...*} args
 * @returns {Array}
 */
Functions.callNTimes =
	function callNTimes(f, n, thisArg, ...args) {
		tc.expectFunction(f);
		tc.expectPositiveInteger(n);
		const rv = [];
		for(let i = 0; i < n; i++) {
			rv[i] = Functions.call(f, thisArg, ...args);
		}
		return rv;
	};

/**
 * @param {function(*): boolean} predicate
 * @returns {function(*): boolean}
 * @see https://lodash.com/docs/#negate
 */
Functions.complement =
	function complement(predicate) {
		tc.expectFunction(predicate);
		return function wrapper(...args) {
			// @ts-ignore
			return !Functions.apply(predicate, this, args);
		};
	};

/**
 * @param {...Function} functions
 * @returns {Function}
 * @example
 * const inverseMax = Functions.compose((x) => 1 / x, Math.max);
 * assert(inverseMax(1, 5, 2) === 0.2);
 */
Functions.compose =
	function compose(...functions) {
		tc.expectFunctions(functions);
		return function wrapper(...args) {
			return functions.slice(0, -1).reduce(
				// @ts-ignore
				(acc, fn) => Functions.call(fn, this, acc),
				// @ts-ignore
				Functions.call(
					functions[functions.length - 1],
					this,
					...args
				),
			);
		};
	};

/**
 * Shorthand for `Functions.withLimit(callback, 1);`.
 *
 * @param {Function} callback
 * @returns {Function}
 */
Functions.once =
	function once(callback) {
		tc.expectFunction(callback);
		return Functions.withLimit(callback, 1);
	};

/**
 * @param {Function} fn
 * @param {...*} args
 * @returns {Function} A wrapper around the given function,
 *  with the given arguments partially applied.
 * Does not bind a 'this' value to the returned function.
 */
Functions.partial =
	function partial(fn, ...args) {
		tc.expectFunction(fn);
		const partialArguments = args;
		return function wrapper(...args) {
			// @ts-ignore
			return Functions.call(fn, this, ...partialArguments, ...args);
		};
	};

/**
 * @param {Function} f
 * @param {uint} n
 * @returns {Function}
 */
Functions.withArity =
	function withArity(f, n) {
		tc.expectFunction(f);
		tc.expectPositiveInteger(n);
		return function wrapper(...args) {
			// @ts-ignore
			return Functions.call(f, this, ...args.slice(0, n));
		};
	};

/**
 * Creates a wrapper around the given function.
 * - For at most n calls, it will delegate to the given function.
 * - For subsequent calls, it will return the last return value without
 *     invoking the given function.
 *
 * @param {Function} f
 * @param {uint} nTimes
 * @returns {Function}
 */
Functions.withLimit =
	function withLimit(f, nTimes) {
		tc.expectFunction(f);
		tc.expectPositiveInteger(nTimes);
		let cache;
		let n = nTimes;
		return function wrapper(...args) {
			if(n === 0) return cache;
			// @ts-ignore
			const rv = Functions.call(f, this, ...args);
			--n;
			if(n === 0) cache = rv;
			return rv;
		};
	};

export default Functions;
