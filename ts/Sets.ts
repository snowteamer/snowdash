/**
 * @file Sets.ts - Utilities for Set objects.
 *
 */
/* 
type int = number;
type uint = number;
 */
import * as tc from "tc";
import Arrays from "./Arrays";

/**
 * @module snowdash/Sets
 */
const Sets = {
	[Symbol.toStringTag]: "snowdash.Sets",
	addAll,
	areDisjoint,
	deleteAll,
	difference,
	equals,
	extend,
	from,
	fromKeysOf,
	fromValuesOf,
	hasAll,
	intersection,
	isEmpty,
	isSubsetOf,
	isSupersetOf,
	maxBy,
	maxPropertyValue,
	maxWith,
	minBy,
	minPropertyValue,
	minWith,
	sortByKeys,
	symmetricDifference,
	unextend,
	union,
};


const call = Function.prototype.call.bind(Function.prototype.call);


/**
 * Like 'Arrays.from()', but for sets.
 *
 * @template T, U
 * @param {(Array<T> | Iterable<T>)} arrayLikeOrIterable
 * @param {function(T, uint?): U} [mapfn]
 * @returns {(Set<T> | Set<U>)}
 */
export function from(arrayLikeOrIterable, mapfn) {
	if(
		!tc.isArray(arrayLikeOrIterable)
		&& !tc.isIterable(arrayLikeOrIterable)
	) {
		tc.throwNewTypeError("an array-like or iterable");
	}
	if(typeof mapfn !== "undefined") {
		tc.expectFunction(mapfn);
		return new Set(Array.from(arrayLikeOrIterable, mapfn));
	}
	return new Set(Array.from(arrayLikeOrIterable));
}

/**
 * @param {object} object
 * @returns {Set<*>}
 */
export function fromKeysOf(object) {
	tc.expectNonPrimitive(object);
	if(typeof object.keys === "function") {
		const keys = object.keys();
		if(tc.isIterable(keys)) {
			return new Set(keys);
		}
	}
	return new Set(Object.keys(object));
}

/**
 * @param {object} object
 * @returns {Set<*>}
 */
export function fromValuesOf(object) {
	tc.expectNonPrimitive(object);
	if(typeof object.values === "function") {
		const values = object.values();
		if(tc.isIterable(values)) {
			return new Set(values);
		}
	}
	return new Set(Object.values(object));
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T, Set<T>): boolean} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
export function every(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	for(const element of set) {
		if(!call(fn, thisArg, element, element, set)) {
			return false;
		}
	}
	return true;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T, Set<T>): boolean} fn
 * @param {*} [thisArg]
 * @returns {Set<*>}
 */
export function filter(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	return new Set([...set].filter(
		(element) => call(fn, thisArg, element, element, set),
		thisArg,
	));
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T, Set<T>): *} fn
 * @param {*} [thisArg]
 */
export function forEach(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	for(const element of set) {
		call(fn, thisArg, element, element, set);
	}
}

/**
 * @template T, U
 * @param {Set<T>} set
 * @param {function(T, uint): U} mapfn
 * @returns {Set<U>}
 */
export function map(set, mapfn) {
	tc.expectSet(set);
	tc.expectFunction(mapfn);
	return new Set(Array.from(set, mapfn));
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(*, T, T, Set<T>): *} fn
 * @param {*} [initialValue]
 * @returns {*}
 */
export function reduce(set, fn, initialValue = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	if("2" in arguments && initialValue !== undefined) return [...set].reduce(
		(acc, element) => fn(acc, element, element, set),
		initialValue,
	);
	return [...set].reduce((acc, element) => fn(acc, element, element, set));
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T?, Set<T>?): boolean} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
export function some(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	return [...set].some(
		(value) => call(fn, thisArg, value, value, set),
		thisArg,
	);
}

// ====== Other functions ====== //

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]} args
 */
export function addAll(set, args) {
	tc.expectSet(set);
	for(let i = 0; i < args.length; i++) set.add(args[i]);
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {boolean}
 */
export function areDisjoint(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	return Sets.intersection(set, ...otherSets).size === 0;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]} args
 */
export function deleteAll(set, args) {
	tc.expectSet(set);
	tc.expectArrayLike(args);
	for(let i = 0; i < args.length; i++) set.delete(args[i]);
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]} args
 * @returns {boolean}
 */
export function hasAll(set, args) {
	tc.expectSet(set);
	tc.expectArrayLike(args);
	for(let i = 0; i < args.length; i++) {
		if(!set.has(args[i])) return false;
	}
	return true;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {Set<T>}
 */
export function difference(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	const rv = new Set();
	for(const key of set.keys()) {
		if(!otherSet.has(key)) rv.add(key);
	}
	return rv;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {boolean}
 */
export function equals(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	if(set.size !== otherSet.size) return false;
	return Sets.intersection(set, otherSet).size === set.size;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {Set<T>}
 */
export function extend(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	for(const otherSet of otherSets) {
		for(const element of otherSet) {
			set.add(element);
		}
	}
	return set;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {Set<T>}
 */
export function intersection(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	const rv = new Set(set);
	for(const otherSet of otherSets) {
		for(const key of otherSet) {
			if(!rv.has(key)) rv.delete(key);
		}
	}
	return rv;
}

/**
 * @param {Set<*>} set
 * @returns {boolean}
 */
export function isEmpty(set) {
	tc.expectSet(set);
	return set.size === 0;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {boolean}
 */
export function isSubsetOf(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	if(set.size > otherSet.size) return false;
	for(const key of set.keys()) {
		if(!otherSet.has(key)) return false;
	}
	return true;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {boolean}
 */
export function isSupersetOf(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	return Sets.isSubsetOf(otherSet, set);
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {PropertyKey} propertyKey
 * @returns {T=}
 */
export function maxBy<T, K extends keyof T>(set: Set<T>, propertyKey: K): T | undefined {
	tc.expectSet(set);
	tc.expectNonEmptyString(propertyKey);
	let maxPropertyValue: number | undefined;
	let rv: T | undefined = undefined;
	for(const key of set) {
		const propertyValue = key[propertyKey];
		if(typeof propertyValue !== "number") continue;
		if(Number.isNaN(propertyValue)) continue;
		if(
			maxPropertyValue === undefined
			|| propertyValue > maxPropertyValue
		) {
			maxPropertyValue = propertyValue;
			rv = key;
		}
	}
	return rv;
}

/**
 * @param {Set<object>} set
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function maxPropertyValue<T>(set: Set<T>, propertyKey) {
	tc.expectSet(set);
	tc.expectPropertyKey(propertyKey);
	return Arrays.max(Array.from(set, (element: T) => element[propertyKey]));
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T): number} fn
 * @returns {T=}
 */
export function maxWith(set, fn) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	let maxAssociatedValue;
	let rv;
	for(const key of set) {
		const associatedValue = fn(key);
		if(typeof associatedValue !== "number") continue;
		if(Number.isNaN(associatedValue)) continue;
		if(
			maxAssociatedValue === undefined
			|| associatedValue > maxAssociatedValue
		) {
			maxAssociatedValue = associatedValue;
			rv = key;
		}
	}
	return rv;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {PropertyKey} propertyKey
 * @returns {T=}
 */
export function minBy(set, propertyKey) {
	tc.expectSet(set);
	tc.expectPropertyKey(propertyKey);
	let minPropertyValue;
	let rv;
	for(const key of set) {
		// @ts-ignore
		const propertyValue = key[propertyKey];
		if(typeof propertyValue !== "number") continue;
		if(Number.isNaN(propertyValue)) continue;
		if(
			minPropertyValue === undefined
			|| propertyValue < minPropertyValue
		) {
			minPropertyValue = propertyValue;
			rv = key;
		}
	}
	return rv;
}

/**
 * @param {Set<object>} set
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function minPropertyValue<T>(set: Set<T>, propertyKey): number | undefined {
	tc.expectSet(set);
	tc.expectPropertyKey(propertyKey);
	return Arrays.min(Array.from(set, (element: T) => element[propertyKey]));
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T): number} fn
 * @returns {T=}
 */
export function minWith(set, fn) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	let minAssociatedValue;
	let rv;
	for(const key of set) {
		const associatedValue = fn(key);
		if(typeof associatedValue !== "number") continue;
		if(Number.isNaN(associatedValue)) continue;
		if(
			minAssociatedValue === undefined
			|| associatedValue < minAssociatedValue
		) {
			minAssociatedValue = associatedValue;
			rv = key;
		}
	}
	return rv;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(*, *): number} [comparator]
 * @returns {Set<T>}
 */
export function sortByKeys(set, comparator = undefined) {
	tc.expectSet(set);
	if(comparator) tc.expectFunction(comparator);
	const rv = new Set();
	const sortedKeys = [...set].sort(comparator);
	for(const key of sortedKeys) {
		rv.add(key);
	}
	return rv;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {Set<T>}
 */
export function symmetricDifference(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	const rv = new Set();
	for(const key of set.keys()) {
		if(!otherSet.has(key)) rv.add(key);
	}
	for(const otherKey of otherSet.keys()) {
		if(!set.has(otherKey)) rv.add(otherKey);
	}
	return rv;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {Set<T>} The given set.
 */
export function unextend(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	for(const otherSet of otherSets) {
		for(const element of otherSet) {
			set.delete(element);
		}
	}
	return set;
}

/**
 * @template T
 * @param {...Set<T>} sets
 * @returns {Set<T>}
 */
export function union(...sets) {
	tc.expectSets(sets);
	const rv = new Set();
	for(const set of sets) {
		for(const element of set) {
			rv.add(element);
		}
	}
	return rv;
}

export default Sets;
