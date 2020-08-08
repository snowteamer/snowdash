/**
 * @file JsonObjects.js - Utilities for JSON objects.
 *
 * Here, "JSON values" are the values which can be returned by calling
 *  the default 'JSON.parse' function with just one parameter.
 * Also, "JSON objects" are "JSON values" which are objects but are not
 *  'Array' objects.
 *
 * All their own properties are assumed to be data properties which are
 *  writable, enumerable and configurable.
 * All their own property keys are assumed to be strings, not 'Symbol' values.
 * All their own property values are assumed to be JSON values.
 *
 * The functions defined in this module currently accept any objects.
 * However, if they have to return new objects then they should only
 *  return JSON arrays or JSON objects.
 * @namespace JsonObjects
 */

/* eslint guard-for-in: "error" */

/**
 * @typedef {number} int
 * @typedef {number} uint
 */

import * as tc from "./tc";

const JsonObjects = {
	assoc,
	buildPath,
	clone,
	commonKeys,
	copy,
	count,
	cram,
	deleteByPath,
	entries,
	equals,
	every,
	filterInPlace,
	forEach,
	fromEntries,
	getByPath,
	getTransitiveClosure,
	intersection,
	inverse,
	inverseWith,
	isEmpty,
	keys,
	pluck,
	select,
	setByPath,
	submap,
	swap,
	transform,
	values,
	[Symbol.toStringTag]: "snowdash.JsonObjects",
};


/* bound call functions */
const unboundCall = Function.prototype.call;
const call = unboundCall.bind(Function.prototype.call);
const hasOwnProperty = unboundCall.bind(Object.prototype.hasOwnProperty);
const slice = unboundCall.bind(Array.prototype.slice);


/**
 * @template V
 * @param {Map<string, V>} map
 * @returns {Record<string, V>}
 */
export function fromEntries(map) {
	tc.expectMap(map);
	return Object.fromEntries(map);
}

/**
 * @param {object} object
 * @param {string} key
 * @param {*} value
 * @returns {object}
 * @see 'assoc' in Haskell.
 * In Immutable.js, 'set' is equivalent to 'assoc'.
 * In Common Lisp, 'assoc' is similar to 'find'.
 */
export function assoc(object, key, value) {
	tc.expectNonPrimitive(object);
	tc.expectString(key);
	const rv = JsonObjects.clone(object);
	rv[key] = value;
	return rv;
}

/**
 * @param {object} object
 * @returns {[string, any][]}
 */
export function entries(object) {
	tc.expectNonPrimitive(object);
	return Object.entries(object);
}

/**
 * @param {object} object
 * @returns {string[]}
 */
export function keys(object) {
	tc.expectNonPrimitive(object);
	return Object.keys(object);
}

/**
 * @param {object} object
 * @returns {any[]}
 */
export function values(object) {
	tc.expectNonPrimitive(object);
	return Object.values(object);
}

/**
 * @param {object} object
 * @param {string[]} keys
 * @returns {object}
 */
export function buildPath(object, keys) {
	tc.expectNonPrimitive(object);
	tc.expectStrings(keys);
	let node = object;
	for(let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if(hasOwnProperty(node, key)) {
			node = node[key];
		} else {
			node[key] = {};
			node = node[key];
		}
	}
	return node;
}

/**
 * @param {object} object
 * @returns {object}
 */
export function clone(object) {
	tc.expectNonPrimitive(object);
	return JSON.parse(JSON.stringify(object));
}

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {string[]}
 */
export function commonKeys(object, otherObject) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitive(otherObject);
	const rv = [] as string[];
	for(const key of Object.keys(object)) {
		if(hasOwnProperty(otherObject, key)) rv[rv.length] = key;
	}
	return rv;
}

/**
 * @param {object} object
 * @returns {object}
 */
export function copy(object) {
	tc.expectNonPrimitive(object);
	return {...object};
}

/**
 * Counts enumerable properties, not including inherited ones.
 *
 * @param {object} object
 * @returns {uint}
 */
export function count(object) {
	tc.expectNonPrimitive(object);
	let rv = 0;
	for(const key in object) if(hasOwnProperty(object, key)) ++rv;
	return rv;
}

/**
 * @param {Record<string, any[]>} object
 * @param {string} key
 * @param {...*} values
 */
export function cram(object, key, ...values) {
	tc.expectNonPrimitive(object);
	tc.expectString(key);
	if(hasOwnProperty(object, key)) {
		const entryValue = object[key];
		if(Array.isArray(entryValue)) entryValue.push(...values);
		else object[key] = [entryValue, ...values];
	} else object[key] = values;
}

/**
 * @param {object} object
 * @param {string[]} keys
 * @returns {boolean}
 */
export function deleteByPath(object, keys) {
	tc.expectNonPrimitive(object);
	tc.expectNonEmptyArrayLike(keys);
	let node = object;
	let parentNode = undefined;
	let key = "";
	for(let i = 0; i < keys.length; i++) {
		key = keys[i];
		if(!hasOwnProperty(node, key)) {
			const currentPath = [].slice.call(keys, 0, i + 1);
			throw new ReferenceError(
				`No property found at ${JSON.stringify(currentPath)}`,
			);
		}
		parentNode = node;
		node = node[key];
	}
	if(parentNode === undefined) return false;
	return delete parentNode[key];
}

/**
 * Checks whether two JSON objects are deeply equal.
 *
 * - If a property value is 'undefined', no error will be thrown although it is
 *   not a valid JSON value, but 'false' will be returned unless the
 *   corresponding property of the other object is either missing or
 *   also 'undefined'.
 *
 * - If a property value is a function, 'false' will be returned
 *   unless the corresponding property value of the other object is identical
 *   according to 'Object.is()'.
 *
 * @param {object} object
 * @param {object} otherObject
 * @param {{allowUndefined: boolean}}
 * @returns {boolean}
 */
export function equals(object, otherObject, {allowUndefined = false} = {}) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitive(otherObject);
	if(object === otherObject) return true;

	if(Array.isArray(object)) {
		if(!Array.isArray(otherObject)) return false;
		const array = object;
		const otherArray = otherObject;
		if(array.length !== otherArray.length) {
			if(!allowUndefined) return false;
			// Use plain for-loops here since it is not uncommon for sparse
			//   arrays to be of considerable size.
			if(array.length > otherArray.length) {
				for(let i = otherArray.length; i < array.length; i++) {
					if(array[i] !== undefined) return false;
				}
			} else {
				for(let i = array.length; i < otherArray.length; i++) {
					if(otherArray[i] !== undefined) return false;
				}
			}
		}
		const copiedOptions = {allowUndefined};
		for(let i = 0; i < array.length; i++) {
			const element = array[i];
			const otherElement = otherArray[i];
			if(tc.isPrimitive(element)) {
				if(!Object.is(element, otherElement)) return false;
			} else {
				if(!equals(element, otherElement, copiedOptions)) return false;
			}
		}
		return true;
	}
	// If 'object' is neither a primitive nor an array, then it must be a plain
	//   object, otherwise it is not a valid JSON value.
	tc.expectPlainObject(object);
	if(Array.isArray(otherObject)) return false;
	tc.expectPlainObject(otherObject);

	const copiedOptions = {allowUndefined};
	for(const [key, value] of Object.entries(object)) {
		if(tc.isPrimitive(value)) {
			if(allowUndefined && value === undefined) continue;
			if(!Object.is(value, otherObject[key])) return false;
		} else {
			if(!equals(value, otherObject[key], copiedOptions)) return false;
		}
	}
	for(const [key, value] of Object.entries(otherObject)) {
		if(allowUndefined && value === undefined) continue;
		if(!hasOwnProperty(object, key)) return false;
	}
	return true;
}

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {object}
 */
export function difference(object, otherObject) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitive(otherObject);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		if(!hasOwnProperty(otherObject, key)) {
			rv[key] = object[key];
		}
	}
	return rv;
}

/**
 * @param {object} object
 * @param {function(any, string, object): boolean} predicate
 * @param {*} [thisArg]
 * @returns {boolean}
 */
export function every(object, predicate, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(predicate);
	for(const key in object) {
		if(hasOwnProperty(object, key)) {
			if(!call(predicate, thisArg, object[key], key, object)) {
				return false;
			}
		}
	}
	return true;
}

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {object}
 */
export function filter(object, predicate, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(predicate);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		if(call(predicate, thisArg, object[key], key, object)) {
			rv[key] = object[key];
		}
	}
	return rv;
}

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {object}
 */
export function filterInPlace(object, predicate, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(predicate);
	for(const key in object) if(hasOwnProperty(object, key)) {
		if(!call(predicate, thisArg, object[key], key, object)) {
			delete object[key];
		}
	}
	return object;
}

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 */
export function forEach(object, predicate, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	for(const key in object) {
		if(hasOwnProperty(object, key)) {
			call(predicate, thisArg, object[key], key, object);
		}
	}
}

/**
 * @param {object} object
 * @param {string[]} keys
 * @returns {*}
 * @see getIn (Lodash)
 * @throws {ReferenceError}
 */
export function getByPath(object, keys) {
	tc.expectNonPrimitive(object);
	tc.expectStrings(keys);
	let node = object;
	for(let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if(!hasOwnProperty(node, key)) {
			const currentPath = slice(keys, 0, i + 1);
			throw new ReferenceError(
				`No property found at ${JSON.stringify(currentPath)}`,
			);
		}
		node = node[key];
	}
	return node;
}

/**
 * @param {object} object
 * @param {string} propertyName
 * @returns {Set<object>}
 * @see https://en.wikipedia.org/wiki/Transitive_closure
 */
export function getTransitiveClosure(object, propertyName) {
	tc.expectNonPrimitive(object);
	tc.expectNonEmptyString(propertyName);
	const rv = new Set();
	let propertyValue = (
		hasOwnProperty(object, propertyName)
		? object[propertyName]
		: undefined
	);
	while(
		propertyValue !== null
		&& propertyValue !== undefined
		&& !rv.has(propertyValue)
	) {
		rv.add(propertyValue);
		propertyValue = propertyValue[propertyName];
	}
	return rv;
}

/**
 * @param {object} o1
 * @param {object} o2
 * @returns {object}
 */
export function intersection(o1, o2) {
	tc.expectNonPrimitive(o1);
	tc.expectNonPrimitive(o2);
	const rv = {};
	for(const key in o1) if(hasOwnProperty(o1, key)) {
		if(o1[key] === o2[key]) rv[key] = o1[key];
	}
	return rv;
}

/**
 * @param {object} object
 * @returns {object}
 */
export function inverse(object) {
	tc.expectNonPrimitive(object);
	const rv = {};
	for(const key in object) {
		if(hasOwnProperty(object, key)) {
			const value = object[key];
			if(hasOwnProperty.call(rv, value)) {
				throw new TypeError(
					"Given object is not invertible because its values are not unique.",
				);
			}
			rv[value] = key;
		}
	}
	return rv;
}

/**
 * @param {object} object
 * @param {Function} fn
 * @returns {object}
 */
export function inverseWith(object, fn) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(fn);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		let value = object[key];
		if(hasOwnProperty(rv, value)) {
			value = fn(rv[value], value);
		}
		rv[value] = key;
	}
	return rv;
}

export function isEmpty(object) {
	tc.expectNonPrimitive(object);
	for(const key in object) if(hasOwnProperty(object, key)) {
		return false;
	}
	return true;
}

/**
 * @param {object} object
 * @param {Function} fn
 * @param {*=} thisArg
 * @returns {object}
 */
export function map(object, fn, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(fn);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		rv[key] = call(fn, thisArg, object[key], key, object);
	}
	return rv;
}

/**
 * @param {object} object
 * @param {Function} fn
 * @param {*=} thisArg
 * @returns {object}
 */
export function mapInPlace(object, fn, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(fn);
	for(const key in object) if(hasOwnProperty(object, key)) {
		object[key] = call(fn, thisArg, object[key], key, object);
	}
	return object;
}

/**
 * @param {object} object
 * @param {string} propertyName
 * @returns {object}
 * @throws {TypeError}
 * If a property value of the given object is null or undefined.
 */
export function pluck(object, propertyName) {
	tc.expectNonPrimitive(object);
	tc.expectString(propertyName);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		rv[key] = object[key][propertyName];
	}
	return rv;
}

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {object}
 */
export function select(object, predicate, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(predicate);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		if(call(predicate, thisArg, object[key], key, object)) {
			rv[key] = object[key];
		}
	}
	return rv;
}

/**
 * @param {object} object
 * @param {string[]} keys
 * @param {*} value
 * @returns {*}
 */
export function setByPath(object, keys, value) {
	tc.expectNonPrimitive(object);
	tc.expectNonEmptyArrayLike(keys);
	const parent = JsonObjects.getByPath(
		object,
		[].slice.call(keys, 0, -1),
	);
	if(parent === null || parent === undefined) {
		throw new ReferenceError(`keys: ${keys}`);
	}
	parent[keys[keys.length - 1]] = value;
	return value;
}

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {boolean}
 */
export function some(object, predicate, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(predicate);
	for(const key in object) if(hasOwnProperty(object, key)) {
		if(call(predicate, thisArg, object[key], key, object)) {
			return true;
		}
	}
	return false;
}

/**
 * @param {object} object
 * @param {function(*, *): *} [comparator]
 * @returns {object}
 */
export function sortByKeys(object, comparator = undefined) {
	tc.expectNonPrimitive(object);
	if(comparator) tc.expectFunction(comparator);
	const rv = {};
	const sortedKeys = Object.keys(object).sort(comparator);
	for(const key of sortedKeys) {
		rv[key] = object[key];
	}
	return rv;
}

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {object}
 */
export function submap(object, otherObject) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitive(otherObject);
	const rv = {};
	for(const key in otherObject) if(hasOwnProperty(otherObject, key)) {
		if(hasOwnProperty(object, key)) {
			rv[key] = object[key];
		}
	}
	return rv;
}

/**
 * @param {object} object
 * @param {string} key
 * @param {string} otherKey
 */
export function swap(object, key, otherKey) {
	tc.expectNonPrimitive(object);
	const temporary = object[key];
	object[key] = object[otherKey];
	object[key] = temporary;
}

/**
 * @param {object} object
 * @param {Function} fn1
 * @param {Function} fn2
 * @param {*=} thisArg
 * @returns {object}
 */
export function transform(object, fn1, fn2, thisArg = undefined) {
	tc.expectNonPrimitive(object);
	tc.expectFunction(fn1);
	tc.expectFunction(fn2);
	const rv = {};
	for(const key in object) if(hasOwnProperty(object, key)) {
		const x = object[key];
		const a = call(fn1, thisArg, x, key, object);
		const b = call(fn2, thisArg, x, key, object);
		rv[a] = b;
	}
	return rv;
}

export default JsonObjects;
