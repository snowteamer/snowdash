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

import * as tc from "tc";
import Arrays from "./Arrays";

const JsonObjects = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	JsonObjects[Symbol.toStringTag] = "core.JsonObjects";
}


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
JsonObjects.fromEntries =
	function fromEntries(map) {
		tc.expectMap(map);
		return Object.fromEntries(map);
	};

/**
 * @param {object} object
 * @param {string} key
 * @param {*} value
 * @returns {object}
 * @see 'assoc' in Haskell.
 * In Immutable.js, 'set' is equivalent to 'assoc'.
 * In Common Lisp, 'assoc' is similar to 'find'.
 */
JsonObjects.assoc =
	function assoc(object, key, value) {
		tc.expectNonPrimitive(object);
		tc.expectString(key);
		const rv = JsonObjects.clone(object);
		rv[key] = value;
		return rv;
	};

/**
 * @param {object} object
 * @returns {[string, any][]}
 */
JsonObjects.entries =
	function entries(object) {
		tc.expectNonPrimitive(object);
		return Object.entries(object);
	};

/**
 * @param {object} object
 * @returns {string[]}
 */
JsonObjects.keys =
	function keys(object) {
		tc.expectNonPrimitive(object);
		return Object.keys(object);
	};

/**
 * @param {object} object
 * @returns {any[]}
 */
JsonObjects.values =
	function values(object) {
		tc.expectNonPrimitive(object);
		return Object.values(object);
	};

/**
 * @param {object} object
 * @param {string[]} keys
 * @returns {object}
 */
JsonObjects.buildPath =
	function buildPath(object, keys) {
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
	};

/**
 * @param {object} object
 * @returns {object}
 */
JsonObjects.clone =
	function clone(object) {
		tc.expectNonPrimitive(object);
		return JSON.parse(JSON.stringify(object));
	};

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {string[]}
 */
JsonObjects.commonKeys =
	function commonKeys(object, otherObject) {
		tc.expectNonPrimitive(object);
		tc.expectNonPrimitive(otherObject);
		const rv = [];
		for(const key of Object.keys(object)) {
			if(hasOwnProperty(otherObject, key)) rv[rv.length] = key;
		}
		return rv;
	};

/**
 * @param {object} object
 * @returns {object}
 */
JsonObjects.copy =
	function copy(object) {
		tc.expectNonPrimitive(object);
		return {...object};
	};

/**
 * Counts enumerable properties, not including inherited ones.
 *
 * @param {object} object
 * @returns {uint}
 */
JsonObjects.count =
	function count(object) {
		tc.expectNonPrimitive(object);
		let rv = 0;
		for(const key in object) if(hasOwnProperty(object, key)) ++rv;
		return rv;
	};

/**
 * @param {Record<string, any[]>} object
 * @param {string} key
 * @param {...*} values
 */
JsonObjects.cram =
	function cram(object, key, ...values) {
		tc.expectNonPrimitive(object);
		tc.expectString(key);
		if(hasOwnProperty(object, key)) {
			const entryValue = object[key];
			if(Array.isArray(entryValue)) entryValue.push(...values);
			else object[key] = [entryValue, ...values];
		} else object[key] = values;
	};

/**
 * @param {object} object
 * @param {string[]} keys
 * @returns {boolean}
 */
JsonObjects.deleteByPath =
	function deleteByPath(object, keys) {
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
		return delete parentNode[key];
	};

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {boolean}
 */
JsonObjects.deepEquals =
	function deepEquals(object, otherObject) {
		tc.expectNonPrimitive(object);
		if(object === otherObject) return true;
		if(typeof object !== "object" || typeof otherObject !== "object") {
			return false;
		}
		if(object === null || otherObject === null) return false;
		if(Array.isArray(object)) {
			return Arrays.deepEquals(object, otherObject);
		}
		for(const key in object) {
			if(hasOwnProperty(object, key)) {
				if(!deepEquals(object[key], otherObject[key])) return false;
			}
		}
		for(const otherKey in otherObject) {
			if(hasOwnProperty(otherObject, otherKey)) {
				if(!deepEquals(otherObject[otherKey], object[otherKey])) {
					return false;
				}
			}
		}
		return true;
	};

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {object}
 */
JsonObjects.difference =
	function difference(object, otherObject) {
		tc.expectNonPrimitive(object);
		tc.expectNonPrimitive(otherObject);
		const rv = {};
		for(const key in object) if(hasOwnProperty(object, key)) {
			if(!hasOwnProperty(otherObject, key)) {
				rv[key] = object[key];
			}
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {function(any, string, object): boolean} predicate
 * @param {*} [thisArg]
 * @returns {boolean}
 */
JsonObjects.every =
	function every(object, predicate, thisArg = undefined) {
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
	};

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {object}
 */
JsonObjects.filter =
	function filter(object, predicate, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		tc.expectFunction(predicate);
		const rv = {};
		for(const key in object) if(hasOwnProperty(object, key)) {
			if(call(predicate, thisArg, object[key], key, object)) {
				rv[key] = object[key];
			}
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {object}
 */
JsonObjects.filterInPlace =
	function filterInPlace(object, predicate, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		tc.expectFunction(predicate);
		for(const key in object) if(hasOwnProperty(object, key)) {
			if(!call(predicate, thisArg, object[key], key, object)) {
				delete object[key];
			}
		}
		return object;
	};

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 */
JsonObjects.forEach =
	function forEach(object, predicate, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		for(const key in object) {
			if(hasOwnProperty(object, key)) {
				call(predicate, thisArg, object[key], key, object);
			}
		}
	};

/**
 * @param {object} object
 * @param {string[]} keys
 * @returns {*}
 * @see getIn (Lodash)
 * @throws {ReferenceError}
 */
JsonObjects.getByPath =
	function getByPath(object, keys) {
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
	};

/**
 * @param {object} object
 * @param {string} propertyName
 * @returns {Set<object>}
 * @see https://en.wikipedia.org/wiki/Transitive_closure
 */
JsonObjects.getTransitiveClosure =
	function getTransitiveClosure(object, propertyName) {
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
	};

/**
 * @param {object} o1
 * @param {object} o2
 * @returns {object}
 */
JsonObjects.intersection =
	function intersection(o1, o2) {
		tc.expectNonPrimitive(o1);
		tc.expectNonPrimitive(o2);
		const rv = {};
		for(const key in o1) if(hasOwnProperty(o1, key)) {
			if(o1[key] === o2[key]) rv[key] = o1[key];
		}
		return rv;
	};

/**
 * @param {object} object
 * @returns {object}
 */
JsonObjects.inverse =
	function inverse(object) {
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
	};

/**
 * @param {object} object
 * @param {Function} fn
 * @returns {object}
 */
JsonObjects.inverseWith =
	function inverseWith(object, fn) {
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
	};

JsonObjects.isEmpty =
	function isEmpty(object) {
		tc.expectNonPrimitive(object);
		for(const key in object) if(hasOwnProperty(object, key)) {
			return false;
		}
		return true;
	};

/**
 * @param {object} object
 * @param {Function} fn
 * @param {*=} thisArg
 * @returns {object}
 */
JsonObjects.map =
	function map(object, fn, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		tc.expectFunction(fn);
		const rv = {};
		for(const key in object) if(hasOwnProperty(object, key)) {
			rv[key] = call(fn, thisArg, object[key], key, object);
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {Function} fn
 * @param {*=} thisArg
 * @returns {object}
 */
JsonObjects.mapInPlace =
	function mapInPlace(object, fn, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		tc.expectFunction(fn);
		for(const key in object) if(hasOwnProperty(object, key)) {
			object[key] = call(fn, thisArg, object[key], key, object);
		}
		return object;
	};

/**
 * @param {object} object
 * @param {string} propertyName
 * @returns {object}
 * @throws {TypeError}
 * If a property value of the given object is null or undefined.
 */
JsonObjects.pluck =
	function pluck(object, propertyName) {
		tc.expectNonPrimitive(object);
		tc.expectString(propertyName);
		const rv = {};
		for(const key in object) if(hasOwnProperty(object, key)) {
			rv[key] = object[key][propertyName];
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {object}
 */
JsonObjects.select =
	function select(object, predicate, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		tc.expectFunction(predicate);
		const rv = {};
		for(const key in object) if(hasOwnProperty(object, key)) {
			if(call(predicate, thisArg, object[key], key, object)) {
				rv[key] = object[key];
			}
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {string[]} keys
 * @param {*} value
 * @returns {*}
 */
JsonObjects.setByPath =
	function setByPath(object, keys, value) {
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
	};

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {boolean}
 */
JsonObjects.shallowEquals =
	function shallowEquals(object, otherObject) {
		tc.expectNonPrimitive(object);
		tc.expectNonPrimitive(otherObject);
		if(object === otherObject) return true;
		if(typeof object !== "object" || typeof otherObject !== "object") {
			return false;
		}
		if(object === null || otherObject === null) {
			return false;
		}
		if(Array.isArray(object)) {
			if(!Array.isArray(otherObject)) return false;
			return Arrays.shallowEquals(object, otherObject);
		}
		for(const key in object) if(hasOwnProperty(object, key)) {
			if(object[key] !== otherObject[key]) {
				return false;
			}
		}
		for(const key in otherObject) if(hasOwnProperty(otherObject, key)) {
			if(otherObject[key] !== object[key]) {
				return false;
			}
		}
		return true;
	};

/**
 * @param {object} object
 * @param {Function} predicate
 * @param {*=} thisArg
 * @returns {boolean}
 */
JsonObjects.some =
	function some(object, predicate, thisArg = undefined) {
		tc.expectNonPrimitive(object);
		tc.expectFunction(predicate);
		for(const key in object) if(hasOwnProperty(object, key)) {
			if(call(predicate, thisArg, object[key], key, object)) {
				return true;
			}
		}
		return false;
	};

/**
 * @param {object} object
 * @param {function(*, *): *} [comparator]
 * @returns {object}
 */
JsonObjects.sortByKeys =
	function sortByKeys(object, comparator = undefined) {
		tc.expectNonPrimitive(object);
		if(comparator) tc.expectFunction(comparator);
		const rv = {};
		const sortedKeys = Object.keys(object).sort(comparator);
		for(const key of sortedKeys) {
			rv[key] = object[key];
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {object} otherObject
 * @returns {object}
 */
JsonObjects.submap =
	function submap(object, otherObject) {
		tc.expectNonPrimitive(object);
		tc.expectNonPrimitive(otherObject);
		const rv = {};
		for(const key in otherObject) if(hasOwnProperty(otherObject, key)) {
			if(hasOwnProperty(object, key)) {
				rv[key] = object[key];
			}
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {string} key
 * @param {string} otherKey
 */
JsonObjects.swap =
	function swap(object, key, otherKey) {
		tc.expectNonPrimitive(object);
		const temporary = object[key];
		object[key] = object[otherKey];
		object[key] = temporary;
	};

/**
 * @param {object} object
 * @param {Function} fn1
 * @param {Function} fn2
 * @param {*=} thisArg
 * @returns {object}
 */
JsonObjects.transform =
	function transform(object, fn1, fn2, thisArg = undefined) {
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
	};

export default JsonObjects;
