/**
 * @file Functions.ts - Utilities for Function objects.
 */

/* eslint-disable no-invalid-this */

/**
 * @typedef {!object} NonPrimitive
 */
/* 
type int = number;
type uint = number;
 */
import * as tc from "./tc.js";


/**
 * @module snowdash/Functions
 */

export const cachesByFunction = new WeakMap();
export const wrappedFunctionsByCache = new WeakMap();
export const wrapperFunctionsByCache = new WeakMap();

// const call = Function.prototype.call.bind(Function.prototype.call);


/**
 * @param {Function} arg
 * @returns {string}
 */
export function getName(arg: any) {
	tc.expectFunction(arg);
	return arg.name;
}

/**
 * @param {*} arg
 * @returns {boolean}
 */
export function isFunction(arg: any) {
	return typeof arg === "function";
}

/**
 * @param {*} arg
 * @returns {boolean}
 */
export function isNativeFunction(arg: any) {
	if(typeof arg !== "function") return false;
	const code = Function.prototype.toString.call(arg);
	return /{\s*\[native code]\s*}\s*$/.test(code);
}


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
export function call(fn: Function, thisArg: any, ...args: any[]): any {
	tc.expectFunction(fn);
	return Function.prototype.call.call(fn, thisArg, ...args);
}

/**
 * @param {*} arg
 * @returns {*}
 */
export function identity(arg: any) {
	return arg;
}
export function noop() {
}
export function not(arg: any) {
	return !arg;
}
// eslint-disable-next-line no-implicit-coercion
export function nonZero(arg: any) {
	return !!arg;
}

// ====== Relational operators ====== //

export function is(x, y) {
	return x === y;
}
export function isEqualTo(x, y) {
	// eslint-disable-next-line eqeqeq
	return x == y;
}
export function isGreaterThan(x, y) {
	return x > y;
}
export function isGreaterThanOrEqualTo(x, y) {
	return x >= y;
}
export function isLowerThan(x, y) {
	return x < y;
}
export function isLowerThanOrEqualTo(x, y) {
	return x <= y;
}
export function isNot(x, y) {
	return x !== y;
}
export function isNotEqualTo(x, y) {
	// eslint-disable-next-line eqeqeq
	return x != y;
}
export function isInstanceOf(x, y) {
	return x instanceof y;
}

// ===== end of 'Relational operators' ===== //

/**
 * @param {string} name
 * @returns {Function}
 */
export function abstractMethod(name) {
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
export function after(callback, nTimes) {
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
export function apply(f, thisArg, argArray) {
	tc.expectFunction(f);
	return Function.prototype.apply.call(f, thisArg, argArray);
};

/**
 * @param {Function} callback
 * @param {uint} nTimes
 * @returns {Function}
 * @see https://lodash.com/docs#before
 */
export function before(callback, nTimes) {
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


/**
 * @param {Function} fn
 * @returns {boolean}
 */
export function isMemoized(fn) {
	return cachesByFunction.has(fn);
};

/**
 * @param {Function} fn
 * @param {object} options
 * @param {function(*): string} options.hashFunction
 * @returns {Function}
 */
export function memoize(fn, options = {"hashFunction": JSON.stringify}) {
	tc.expectFunction(fn);
	if(isMemoized(fn)) {
		throw new Error("The given function is already memoized.");
	}
	const hashFunction = options && options.hashFunction;
	tc.expectFunction(hashFunction);
	const cache = new Map();
	/**
	 * @this {any} any
	 * @param {...*} args
	 * @property {boolean} closed
	 * @returns {*}
	 */
	const wrapper = function wrapper(this: any, ...args) {
		if(wrapper.closed) {
			return call(fn, this, ...args);
		}
		const cacheKey = hashFunction(args);
		if(!cache.has(cacheKey)) {
			cache.set(cacheKey, call(fn, this, ...args));
		}
		return cache.get(cacheKey);
	};
	wrapper.closed = false;
	cachesByFunction.set(fn, cache);
	cachesByFunction.set(wrapper, cache);
	wrappedFunctionsByCache.set(cache, fn);
	wrapperFunctionsByCache.set(cache, wrapper);
	return wrapper;
};

/**
 * Replaces the given method of the given object
 *   by a memoized version.
 * - Currently does not take property attributes into account.
 *
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 */
export function memoizeMethod(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectString(key);
	tc.expectFunction(object[key]);
	object[key] = memoize(object[key]);
};

/**
 * @param {Function} fn
 * @returns {Function}
 */
export function unmemoize(fn) {
	tc.expectFunction(fn);
	if(!isMemoized(fn)) {
		throw new Error("The given function is not a memoization wrapper.");
	}
	const cache = cachesByFunction.get(fn);
	const wrapped = wrappedFunctionsByCache.get(cache);
	const wrapper = wrapperFunctionsByCache.get(cache);
	cachesByFunction.delete(wrapped);
	cachesByFunction.delete(wrapper);
	wrappedFunctionsByCache.delete(cache);
	wrapperFunctionsByCache.delete(cache);
	cache.clear();
	wrapper.closed = true;
	return wrapped;
};

/**
 * Replaces the given memoized method of the given object
 *   by its original version.
 * - Currently does not take property attributes into account.
 *
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 */
export function unmemoizeMethod(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectString(key);
	object[key] = unmemoize(object[key]);
};

// ===== end of section 'Memoization utilities' ===== //

/**
 * @param {function(*): boolean} predicate
 * @returns {function(*): boolean}
 */
export function complement(predicate) {
	tc.expectFunction(predicate);
	return function complementWrapper(...args) {
		// @ts-ignore
		return !apply(predicate, this, args);
	};
};

/**
 * Creates a wrapper around the given function,
 *   which represents the composition of the given functions.
 * - The last given function will be called first.
 *
 * @param {...Function} functions
 * @returns {function(this: *)}
 * @example
 * const inverseMax = Functions.compose((x) => 1 / x, Math.max);
 * assert(inverseMax(1, 5, 2) === 0.2);
 */
export function compose(...functions) {
	tc.expectFunctions(functions);
	return function composeWrapper(this: any, ...args) {
		return functions.slice(0, -1).reduce(
			// @ts-ignore
			(acc, fn) => call(fn, this, acc),
			// @ts-ignore
			call(
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
export function once(callback) {
	tc.expectFunction(callback);
	return withLimit(callback, 1);
};

/**
 * Creates a wrapper around the given function.
 * - When called, it will call the given function `n` times,
 *   then returns an array of the results.
 *
 * @param {Function} f
 * @param {uint} nTimes
 * @returns {function(this: *): *[]}
 */
export function repeat(f, nTimes) {
	tc.expectFunction(f);
	tc.expectPositiveInteger(nTimes);
	return function repeatWrapper(...args) {
		const rv = [];
		for(let i = 0; i < nTimes; i++) {
			// @ts-ignore
			rv[i] = call(f, this, ...args);
		}
		return rv;
	};
};

/**
 * Creates a wrapper around the given function,
 *   with the given arguments partially applied.
 *
 * @param {Function} fn
 * @param {...*} args
 * @returns {Function}
 */
export function partial(fn, ...args) {
	tc.expectFunction(fn);
	const partialArguments = args;
	return function partialWrapper(...args) {
		// @ts-ignore
		return call(fn, this, ...partialArguments, ...args);
	};
};

/**
 * @param {Function} f
 * @param {uint} arity
 * @returns {Function}
 */
export function withArity(f, arity) {
	tc.expectFunction(f);
	tc.expectPositiveInteger(arity);
	return function withArityWrapper(...args) {
		// @ts-ignore
		return call(f, this, ...args.slice(0, arity));
	};
};

/**
 * Creates a wrapper around the given function.
 * - For the given number of calls, it will delegate to the given function.
 * - On subsequent calls, it will return the last return value without
 *     invoking the given function.
 *
 * @param {Function} f
 * @param {uint} nTimes
 * @returns {Function}
 */
export function withLimit(f, nTimes) {
	tc.expectFunction(f);
	tc.expectPositiveInteger(nTimes);
	let cache;
	let n = nTimes;
	return function withLimitWrapper(...args) {
		if(n === 0) return cache;
		// @ts-ignore
		const rv = call(f, this, ...args);
		--n;
		if(n === 0) cache = rv;
		return rv;
	};
};
