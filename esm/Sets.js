/**
 * @file Sets.js - Utilities for Set objects.
 *
 */

/**
 * @typedef {number} int
 */
/**
 * @typedef {number} uint
 */

import * as tc from "tc";
import Arrays from "./Arrays";

/**
 * @module core/Sets
 */
const Sets = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	Sets[Symbol.toStringTag] = "core.Sets";
}


const call = Function.prototype.call.bind(Function.prototype.call);


/**
 * Like 'Arrays.from()', but for sets.
 *
 * @template T, U
 * @param {(Array<T> | Iterable<T>)} arrayLikeOrIterable
 * @param {function(T, uint?): U} [mapfn]
 * @returns {(Set<T> | Set<U>)}
 */
Sets.from = function from(arrayLikeOrIterable, mapfn) {
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
};

/**
 * @param {object} object
 * @returns {Set<*>}
 */
Sets.fromKeysOf = function fromKeysOf(object) {
	tc.expectNonPrimitive(object);
	if(typeof object.keys === "function") {
		const keys = object.keys();
		if(tc.isIterable(keys)) {
			return new Set(keys);
		}
	}
	return new Set(Object.keys(object));
};

/**
 * @param {object} object
 * @returns {Set<*>}
 */
Sets.fromValuesOf = function fromValuesOf(object) {
	tc.expectNonPrimitive(object);
	if(typeof object.values === "function") {
		const values = object.values();
		if(tc.isIterable(values)) {
			return new Set(values);
		}
	}
	return new Set(Object.values(object));
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T, Set<T>): boolean} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
Sets.every = function every(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	for(const element of set) {
		if(!call(fn, thisArg, element, element, set)) {
			return false;
		}
	}
	return true;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T, Set<T>): boolean} fn
 * @param {*} [thisArg]
 * @returns {Set<*>}
 */
Sets.filter = function filter(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	return new Set([...set].filter(
		(element) => call(fn, thisArg, element, element, set),
		thisArg,
	));
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T, Set<T>): *} fn
 * @param {*} [thisArg]
 */
Sets.forEach = function forEach(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	for(const element of set) {
		call(fn, thisArg, element, element, set);
	}
};

/**
 * @template T, U
 * @param {Set<T>} set
 * @param {function(T, uint): U} mapfn
 * @returns {Set<U>}
 */
Sets.map = function map(set, mapfn) {
	tc.expectSet(set);
	tc.expectFunction(mapfn);
	return new Set(Array.from(set, mapfn));
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(*, T, T, Set<T>): *} fn
 * @param {*} [initialValue]
 * @returns {*}
 */
Sets.reduce = function reduce(set, fn, initialValue = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	if("2" in arguments && initialValue !== undefined) return [...set].reduce(
		(acc, element) => fn(acc, element, element, set),
		initialValue,
	);
	return [...set].reduce((acc, element) => fn(acc, element, element, set));
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T, T?, Set<T>?): boolean} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
Sets.some = function some(set, fn, thisArg = undefined) {
	tc.expectSet(set);
	tc.expectFunction(fn);
	return [...set].some(
		(value) => call(fn, thisArg, value, value, set),
		thisArg,
	);
};

// ====== Other functions ====== //

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]} args
 */
Sets.addAll = function addAll(set, args) {
	tc.expectSet(set);
	for(let i = 0; i < args.length; i++) set.add(args[i]);
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {boolean}
 */
Sets.areDisjoint = function areDisjoint(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	return Sets.intersection(set, ...otherSets).size === 0;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]} args
 */
Sets.deleteAll = function deleteAll(set, args) {
	tc.expectSet(set);
	tc.expectArrayLike(args);
	for(let i = 0; i < args.length; i++) set.delete(args[i]);
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]} args
 * @returns {boolean}
 */
Sets.hasAll = function hasAll(set, args) {
	tc.expectSet(set);
	tc.expectArrayLike(args);
	for(let i = 0; i < args.length; i++) {
		if(!set.has(args[i])) return false;
	}
	return true;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {Set<T>}
 */
Sets.difference = function difference(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	const rv = new Set();
	for(const key of set.keys()) {
		if(!otherSet.has(key)) rv.add(key);
	}
	return rv;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {boolean}
 */
Sets.equals = function equals(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	if(set.size !== otherSet.size) return false;
	return Sets.intersection(set, otherSet).size === set.size;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {Set<T>}
 */
Sets.extend = function extend(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	for(const otherSet of otherSets) {
		for(const element of otherSet) {
			set.add(element);
		}
	}
	return set;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {Set<T>}
 */
Sets.intersection = function intersection(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	const rv = new Set(set);
	for(const otherSet of otherSets) {
		for(const key of otherSet) {
			if(!rv.has(key)) rv.delete(key);
		}
	}
	return rv;
};

/**
 * @param {Set<*>} set
 * @returns {boolean}
 */
Sets.isEmpty = function isEmpty(set) {
	tc.expectSet(set);
	return set.size === 0;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {boolean}
 */
Sets.isSubsetOf = function isSubsetOf(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	if(set.size > otherSet.size) return false;
	for(const key of set.keys()) {
		if(!otherSet.has(key)) return false;
	}
	return true;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {boolean}
 */
Sets.isSupersetOf = function isSupersetOf(set, otherSet) {
	tc.expectSet(set);
	tc.expectSet(otherSet);
	return Sets.isSubsetOf(otherSet, set);
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {PropertyKey} propertyKey
 * @returns {T=}
 */
Sets.maxBy = function maxBy(set, propertyKey) {
	tc.expectSet(set);
	tc.expectNonEmptyString(propertyKey);
	let maxPropertyValue;
	let rv;
	for(const key of set) {
		// @ts-ignore
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
};

/**
 * @param {Set<object>} set
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
Sets.maxPropertyValue = function maxPropertyValue(set, propertyKey) {
	tc.expectSet(set);
	tc.expectPropertyKey(propertyKey);
	return Arrays.max(Array.from(set, (element) => element[propertyKey]));
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T): number} fn
 * @returns {T=}
 */
Sets.maxWith = function maxWith(set, fn) {
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
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {PropertyKey} propertyKey
 * @returns {T=}
 */
Sets.minBy = function minBy(set, propertyKey) {
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
};

/**
 * @param {Set<object>} set
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
Sets.minPropertyValue = function minPropertyValue(set, propertyKey) {
	tc.expectSet(set);
	tc.expectPropertyKey(propertyKey);
	return Arrays.min(Array.from(set, (element) => element[propertyKey]));
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(T): number} fn
 * @returns {T=}
 */
Sets.minWith = function minWith(set, fn) {
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
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {function(*, *): number} [comparator]
 * @returns {Set<T>}
 */
Sets.sortByKeys = function sortByKeys(set, comparator = undefined) {
	tc.expectSet(set);
	if(comparator) tc.expectFunction(comparator);
	const rv = new Set();
	const sortedKeys = [...set].sort(comparator);
	for(const key of sortedKeys) {
		rv.add(key);
	}
	return rv;
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {Set<T>} otherSet
 * @returns {Set<T>}
 */
Sets.symmetricDifference = function symmetricDifference(set, otherSet) {
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
};

/**
 * @template T
 * @param {Set<T>} set
 * @param {...Set<T>} otherSets
 * @returns {Set<T>} The given set.
 */
Sets.unextend = function unextend(set, ...otherSets) {
	tc.expectSet(set);
	tc.expectSets(otherSets);
	for(const otherSet of otherSets) {
		for(const element of otherSet) {
			set.delete(element);
		}
	}
	return set;
};

/**
 * @template T
 * @param {...Set<T>} sets
 * @returns {Set<T>}
 */
Sets.union = function union(...sets) {
	tc.expectSets(sets);
	const rv = new Set();
	for(const set of sets) {
		for(const element of set) {
			rv.add(element);
		}
	}
	return rv;
};

export default Sets;
