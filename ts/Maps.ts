/**
 * @file Maps.js - Utilities for Map objects.
 *
 */

/**
 * An object whose prototype is the null value.
 * - Unfortunately, TypeScript does not allow to express this type exactly
 *   ([#1108](https://github.com/microsoft/TypeScript/issues/1108)).
 *
 * @template T
 * @typedef {Record<PropertyKey, T>} BareObject
 */
type MapCallback<K, V> = (value: V, key: K, map: Map<K, V>) => void;
type MapPredicate<K, V> = (value: V, key: K, map: Map<K, V>) => boolean; 


import * as tc from "./tc.js";


const call = Function.prototype.call.bind(Function.prototype.call);

/**
 * @param {Iterable<*>} [iterable]
 * @returns {Map<*, *>}
 */
export const createMap = (() => {
	/**
	 * @this {object} this
	 * @param {number} depth
	 * @param {{stylize: function(string, string): *}} options
	 * @returns {string}
	 */
	const customInspect = function custom(depth, options) {
		void depth;
		return options.stylize(
			// @ts-ignore
			`[Map <${this.size}>]`,
			"special",
		);
	};
	return function createMap(iterable = undefined) {
		const rv = new Map(iterable);
		const customSymbol = Symbol.for("nodejs.util.inspect.custom");
		rv[customSymbol] = customInspect;
		return rv;
	};
})();

/**
 * @template V
 * @param {Record<PropertyKey, V>} object
 * @returns {Map<string, V>}
 */
export function fromPlainObject(object) {
	tc.expectNonPrimitive(object);
	return new Map(Object.entries(object));
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {MapPredicate<K, V>} predicate
 * @param {*=} thisArg
 * @returns {boolean}
 */
export function every<K, V>(map, predicate: MapPredicate<K, V>, thisArg?) {
	tc.expectMap(map);
	tc.expectFunction(predicate);
	for(const [key, value] of map) {
		if(!call(predicate, thisArg, value, key, map)) return false;
	}
	return true;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {MapPredicate<K, V>} predicate
 * @param {*=} thisArg
 * @returns {Map<K, V>}
 */
export function filter<K, V>(map, predicate: MapPredicate<K, V>, thisArg?) {
	tc.expectMap(map);
	tc.expectFunction(predicate);
	const rv = new Map();
	for(const [key, value] of map) {
		if(call(predicate, thisArg, value, key, map)) {
			rv.set(key, value);
		}
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {MapCallback<K, V>} fn
 * @param {*=} thisArg
 */
export function forEach<K, V>(map: Map<K, V>, fn: MapCallback<K, V>, thisArg?) {
	tc.expectMap(map);
	tc.expectFunction(fn);
	Map.prototype.forEach.call(map, fn, thisArg);
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {Function} mapfn
 * @param {*=} thisArg
 * @returns {Map<K, V>}
 */
// eslint-disable-next-line no-shadow
export function map<K, V>(map: Map<K, V>, mapfn, thisArg?) {
	tc.expectMap(map);
	tc.expectFunction(mapfn);
	return new Map(Array.from(
		map,
		([key, value]) => [key, call(mapfn, thisArg, value, key, map)],
		thisArg,
	));
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {Function} fn
 * @param {*=} initialValue
 * @returns {*}
 */
export function reduce(map, fn, initialValue?) {
	tc.expectMap(map);
	tc.expectFunction(fn);
	if("2" in arguments) return [...map].reduce(
		(acc, [key, value]) => call(fn, undefined, acc, value, key, map),
		initialValue,
	);
	return [...map].reduce(
		(acc, [key, value]) => call(fn, undefined, acc, value, key, map),
	);
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {MapPredicate<K, V>} predicate
 * @param {*=} thisArg
 * @returns {boolean}
 */
export function some(map, predicate, thisArg?) {
	tc.expectMap(map);
	tc.expectFunction(predicate);
	for(const [key, value] of map) {
		if(call(predicate, thisArg, value, key, map)) return true;
	}
	return false;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 */
export function clear(map) {
	tc.expectMap(map);
	Map.prototype.clear.call(map);
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @returns {Map<K, V>}
 */
export function copy(map) {
	tc.expectMap(map);
	return new Map(map);
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {[*]} keys
 */
export function deleteAll(map, keys) {
	tc.expectMap(map);
	tc.expectArrayLike(keys);
	for(let i = 0; i < keys.length; i++) map.delete(keys[i]);
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {Map<K, V>} otherMap
 * @returns {boolean}
 */
export function equals(map, otherMap) {
	tc.expectMap(map);
	tc.expectMap(otherMap);
	if(map.size !== otherMap.size) return false;
	for(const [key, value] of map) {
		if(!otherMap.has(key)) return false;
		if(!Object.is(value, otherMap.get(key))) return false;
	}
	return true;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {...Map<K, V>} otherMaps
 * @returns {Map<K, V>}
 */
export function extend(map, ...otherMaps) {
	tc.expectMap(map);
	tc.expectMaps(otherMaps);
	for(const otherMap of otherMaps) {
		for(const entry of otherMap) {
			map.set(entry[0], entry[1]);
		}
	}
	return map;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {*} keys
 * @returns {boolean}
 */
export function hasKeys(map, keys) {
	tc.expectMap(map);
	tc.expectNonEmptyArrayLike(keys);
	for(const key of keys) {
		if(!map.has(key)) return false;
	}
	return true;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {[*, *]} entries
 * @returns {boolean}
 */
export function hasEntry(map, entry): boolean {
	tc.expectMap(map);
	tc.expectNonEmptyArrayLike(entry);
	const [key, value] = entry;
	if(value === undefined) {
		if(!map.has(key)) return false;
	}
	if(!Object.is(map.get(key), value)) return false;
	return true;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {[*, *]} entries
 * @returns {boolean}
 */
export function hasEntries(map, entries) {
	tc.expectMap(map);
	tc.expectNonEmptyArrayLike(entries);
	for(let i = 0; i < entries.length; i++) {
		const [key, value] = entries[i];
		if(value === undefined) {
			if(!map.has(key)) return false;
		}
		if(!Object.is(map.get(key), value)) return false;
	}
	return true;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {...Map<K, V>} otherMaps
 * @returns {Map<K, V>}
 */
export function intersection(map, ...otherMaps) {
	tc.expectMap(map);
	tc.expectMaps(otherMaps);
	const rv = new Map(map);
	for(const otherMap of otherMaps) {
		for(const key of rv.keys()) {
			if(!otherMap.has(key)) rv.delete(key);
		}
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @returns {Map<V, K>}
 */
export function inverse(map) {
	tc.expectMap(map);
	const rv = new Map();
	for(const key of map.keys()) rv.set(map.get(key), key);
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @returns {Map<V, Set<K>>}
 */
export function inverseWithSet(map) {
	tc.expectMap(map);
	const rv = new Map();
	for(const key of map.keys()) {
		const value = map.get(key);
		if(!rv.has(value)) rv.set(value, new Set());
		const inverseValue = rv.get(value);
		inverseValue.add(key);
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @returns {boolean}
 */
export function isEmpty(map) {
	tc.expectMap(map);
	return map.size === 0;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {Map<K, V>} otherMap
 * @returns {boolean}
 */
export function isSubmapOf(map, otherMap) {
	tc.expectMap(map);
	tc.expectMap(otherMap);
	if(map.size > otherMap.size) return false;
	for(const key of map.keys()) {
		if(!otherMap.has(key)) return false;
	}
	return true;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {Map<K, V>} otherMap
 * @returns {boolean}
 */
export function isSupermapOf(map, otherMap) {
	tc.expectMap(map);
	tc.expectMap(otherMap);
	return Maps.isSubmapOf(otherMap, map);
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {...Map<K, V>} otherMaps
 * @returns {Map<K, V>}
 */
export function merge(map, ...otherMaps) {
	tc.expectMap(map);
	tc.expectMaps(otherMaps);
	const rv = new Map(map);
	for(const otherMap of otherMaps) {
		for(const [key, value] of otherMap) {
			rv.set(key, value);
		}
	}
	return rv;
}

/**
 * @template K, V
 * @param {Function} fn
 * @param {...Map<K, V>} maps
 * @returns {Map<K, V>}
 */
export function mergeWith(fn, ...maps) {
	tc.expectFunction(fn);
	tc.expectMaps(maps);
	const rv = new Map();
	for(const map of maps) {
		for(const [key, value] of map) {
			if(rv.has(key)) {
				rv.set(key, fn(rv.get(key), value));
			} else {
				rv.set(key, value);
			}
		}
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {[*, *][]} entries
 */
export function setAll(map, entries) {
	tc.expectMap(map);
	tc.expectArrays(entries);
	for(let i = 0; i < entries.length; i++) {
		map.set(entries[i][0], entries[i][1]);
	}
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {function(*, *): *} [comparator]
 * @returns {Map<K, V>}
 */
export function sortByKeys(map, comparator = undefined) {
	tc.expectMap(map);
	if(comparator) tc.expectFunction(comparator);
	const rv = new Map();
	const sortedKeys = [...map.keys()].sort(comparator);
	for(const key of sortedKeys) {
		rv.set(key, map.get(key));
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {Iterable<*>} keysToKeep
 * @returns {Map<K, V>}
 */
export function submap(map, keysToKeep) {
	tc.expectMap(map);
	const rv = new Map();
	for(const key of keysToKeep) {
		if(map.has(key)) rv.set(key, map.get(key));
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {K} key
 * @param {K} otherKey
 */
export function swap(map, key, otherKey) {
	tc.expectMap(map);
	const value = map.get(key);
	const otherValue = map.get(otherKey);
	if(value === undefined && !map.has(key)) {
		throw new Error("the given map does not have the given keys.");
	}
	if(otherValue === undefined && !map.has(otherKey)) {
		throw new Error("the given map does not have the given keys.");
	}
	// @ts-ignore
	map.set(key, otherValue);
	// @ts-ignore
	map.set(otherKey, value);
}

/**
 * @template V
 * @param {Map<PropertyKey, V>} map
 * @returns {BareObject<V>}
 */
export function toBareObject(map) {
	tc.expectMap(map);
	const rv = Object.create(null);
	for(const key of map.keys()) {
		tc.expectPropertyKey(key);
		rv[key] = map.get(key);
	}
	return rv;
}

/**
 * @template V
 * @param {Map<PropertyKey, V>} map
 * @returns {object}
 */
export function toPlainObject(map) {
	tc.expectMap(map);
	const rv = {};
	for(const key of map.keys()) {
		tc.expectPropertyKey(key);
		rv[key] = map.get(key);
	}
	return rv;
}

/**
 * @template K, V
 * @param {Map<K, V>} map
 * @param {...Map<K, V>} otherMaps
 * @returns {Map<K, V>}
 */
export function unextend(map, ...otherMaps) {
	tc.expectMap(map);
	tc.expectMaps(otherMaps);
	for(const otherMap of otherMaps) {
		for(const key of otherMap.keys()) {
			map.delete(key);
		}
	}
	return map;
}

const Maps = {
	every,
	filter,
	forEach,
	map,
	reduce,
	some,
	
	clear,
	copy,
	createMap,
	deleteAll,
	equals,
	extend,
	fromPlainObject,
	hasEntries,
	hasEntry,
	intersection,
	inverse,
	inverseWithSet,
	isEmpty,
	isSubmapOf,
	isSupermapOf,
	merge,
	mergeWith,
	setAll,
	sortByKeys,
	swap,
	toBareObject,
	toPlainObject,
	unextend,
	[Symbol.toStringTag]: "snowdash.Maps"
};

export default Maps;
