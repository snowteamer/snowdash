/**
 * @file Objects.js - Utilities for Object objects.
 */

/**
 * An object whose prototype is the null value.
 * - Unfortunately, TypeScript does not allow to express this type exactly
 *   ([#1108](https://github.com/microsoft/TypeScript/issues/1108)).
 *
 * @template T
 * @typedef {Record<PropertyKey, T>} BareObject
 */

/**
 * @typedef {!object} NonPrimitive
 */

/**
 * @typedef {function(*): boolean} Predicate
 */

import * as tc from "./tc.js";

/* eslint-disable no-new-object, no-new-wrappers */

/**
 * @type {Record<string, function(*): *>}
 */
const factoriesByTag = {
	"Array": (x) => new Array(x.length),
	// Most functions are not clonable.
	"AsyncFunction": (x) => x,
	"AsyncGeneratorFunction": (x) => x,
	"Boolean": (x) => new Boolean(x),
	"Date": (x) => new Date(x),
	// Error objects have an [[ErrorData]] internal slot
	// whose value is 'undefined'.
	// The only specified use of [[ErrorData]] is by
	// 'Object.prototype.toString()' (19.1.3.6)
	// to identify Error or NativeError instances.
	"Error": (x) => new Error(x.message),
	"Float32Array": (x) => new Float32Array(x),
	"Float64Array": (x) => new Float64Array(x),
	// Most functions are not clonable.
	"Function": (x) => x,
	"GeneratorFunction": (x) => x,
	"Int8Array": (x) => new Int8Array(x),
	"Int16Array": (x) => new Int16Array(x),
	"Int32Array": (x) => new Int32Array(x),
	"Map": () => new Map(),
	"Number": (x) => new Number(x),
	// The expression 'new Object(arg)' does not create a new object
	// when 'arg' is already an object.
	"Object": () => new Object(),
	"RegExp": (x) => new RegExp(x.source, x.flags),
	"Set": () => new Set(),
	"Uint8Array": (x) => new Uint8Array(x),
	"Uint8ClampedArray": (x) => new Uint8ClampedArray(x),
	"Uint16Array": (x) => new Uint16Array(x),
	"Uint32Array": (x) => new Uint32Array(x),
	"WeakMap": () => new WeakMap(),
	"WeakSet": () => new WeakSet(),
};

/* eslint-enable no-new-object, no-new-wrappers */

/**
 * A stricter version of the native 'Object.assign()' method,
 *   which throws if some argument is null or a primitive value.
 *
 * @param {NonPrimitive} object
 * @param {...NonPrimitive} otherObjects
 * @returns {NonPrimitive} The given object.
 */
export function assign(object, ...otherObjects) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitives(otherObjects);
	return Object.assign(object, ...otherObjects);
};

/**
 * Same as 'Objects.assign()' but updates only existing properties.
 *
 * @param {NonPrimitive} object
 * @param {...NonPrimitive} otherObjects
 * @returns {NonPrimitive} The given object.
 */
export function assignNoNew(object, ...otherObjects) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitives(otherObjects);
	for(const otherObject of otherObjects) {
		for(const key of Object.keys(otherObject)) {
			if(key in object) object[key] = otherObject[key];
		}
	}
	return object;
};

/**
 * Deletes all the enumerable own properties of the given object.
 *
 * @param {NonPrimitive} object
 */
export function clear(object) {
	tc.expectNonPrimitive(object);
	for(const key of Object.keys(object)) {
		delete object[key];
	}
};

/*
 * A 'copy' function or method must be shallow.
 * A 'clone' function or method must be deep.
 *
 * Closures do not allow implementation of a 'clone' method for
 *   function objects while preserving their internal state.
 */

/**
 * Tries to create a deep clone of the given object.
 *
 * - Functions are not cloned and cause an error unless
 *     the 'allowFunctions' option is 'true'.
 * - Property accessors are not cloned and cause an error unless
 *     the 'allowAccessors' option is 'true'.
 * - Property attributes are preserved by default.
 * - Prototype chains are not cloned.
 * - WeakSet and WeakMap objects are cloned but without contents.
 *
 * This differs from the Structured_clone_algorithm which always
 *   ignore property attributes and always throws on functions
 *   and property accessors.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @param {NonPrimitive} object
 * @param {object} [options]
 * @param {boolean} [options.allowAccessors]
 * @param {boolean} [options.allowFunctions]
 * @param {boolean} [options.ignoreAttributes]
 * @param {boolean} [options.ignoreExtensibility]
 * @param {boolean} [options.ignoreSymbols]
 * @returns {NonPrimitive}
 */
export function clone(
	object,
	options = {
		"allowAccessors": false,
		"allowFunctions": false,
		"ignoreAttributes": false,
		"ignoreExtensibility": false,
		"ignoreSymbols": false,
	},
) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitive(options);
	const {
		allowAccessors = false,
		allowFunctions = false,
		ignoreAttributes = false,
		ignoreExtensibility = false,
		ignoreSymbols = false,
	} = options;
	tc.expectBoolean(allowAccessors);
	tc.expectBoolean(allowFunctions);
	tc.expectBoolean(ignoreAttributes);
	tc.expectBoolean(ignoreExtensibility);
	tc.expectBoolean(ignoreSymbols);
	const clonesByVisitedObject = new WeakMap();
	const path = [] as PropertyKey[];
	const setOfVisitedPrototypes = new WeakSet();
	/**
	 * @param {object} node
	 * @returns {object}
	 */
	const main = function main(node) {
		if(typeof node === "function") {
			if(allowFunctions) return node;
			throw Object.assign(
				new TypeError("Cannot clone a function."),
				{path: [...path]},
			);
		}
		if(clonesByVisitedObject.has(node)) {
			return clonesByVisitedObject.get(node);
		}
		if(setOfVisitedPrototypes.has(node)) return node;

		const proto = Reflect.getPrototypeOf(node);
		setOfVisitedPrototypes.add(proto);

		const tag = getTag(node);
		const factory = factoriesByTag[tag];
		const rv = (factory ? factory(node) : Object.create(proto));

		if(Object.getPrototypeOf(rv) !== proto) {
			Reflect.setPrototypeOf(rv, proto);
		}
		clonesByVisitedObject.set(node, rv);

		const keys = (
			ignoreSymbols
			? Object.getOwnPropertyNames(node)
			: Reflect.ownKeys(node)
		);
		for(const key of keys) {
			path[path.length] = key;
			const descriptor = Reflect.getOwnPropertyDescriptor(node, key);
			if(typeof descriptor === "undefined") continue;

			if("value" in descriptor) {
				const value = main(descriptor.value);
				if(ignoreAttributes) {
					rv[key] = value;
				} else {
					Reflect.defineProperty(rv, key, {...descriptor, value});
				}
			} else if(allowAccessors) {
				Reflect.defineProperty(rv, key, descriptor);
			} else {
				throw Object.assign(
					new TypeError("Cannot clone property accessors."),
					{path: [...path]},
				);
			}
			if(tc.isMap(node) || tc.isSet(node)) {
				for(const [key, value] of node.entries()) {
					path[path.length] = key;
					rv.set(key, main(value));
					path.length--;
				}
			}
			path.length--;
		}
		if(!ignoreExtensibility) {
			if(!Reflect.isExtensible(node)) Reflect.preventExtensions(rv);
		}
		return rv;
	};
	return main(object);
};

/**
 * While copying non-primitive values, this version tries to preserve internal
 *  slots by calling an appropriate constructor.
 *
 * @param {NonPrimitive} object
 * @param {object} options
 * @param {boolean} [options.ignoreAttributes]
 * @param {boolean} [options.ignoreExtensibility]
 * @param {boolean} [options.ignoreSymbols]
 * @returns {NonPrimitive}
 */
export function copy(
	object,
	options = {
		"ignoreAttributes": false,
		"ignoreExtensibility": false,
		"ignoreSymbols": false,
	},
) {
	tc.expectNonPrimitive(object);
	const {ignoreAttributes, ignoreExtensibility, ignoreSymbols} = options;
	tc.expectBoolean(ignoreAttributes);
	tc.expectBoolean(ignoreExtensibility);
	tc.expectBoolean(ignoreSymbols);
	const proto = Object.getPrototypeOf(object);
	const propertyKeys = (
		ignoreSymbols
		? Object.getOwnPropertyNames(object)
		: Reflect.ownKeys(object)
	);
	/** @type {Record<PropertyKey, PropertyDescriptor>} */
	const descriptorsByKey = {};
	for(const key of propertyKeys) {
		const descriptor = (
			Object.getOwnPropertyDescriptor(object, key)
		);
		if(typeof descriptor === "undefined") continue;
		// @ts-ignore
		descriptorsByKey[key] = descriptor;
		if(ignoreAttributes && "value" in descriptor) {
			descriptor.configurable = true;
			descriptor.enumerable = true;
			descriptor.writable = true;
		}
	}
	const tag = getTag(object);
	const factory = factoriesByTag[tag];
	const rv = (factory ? factory(object) : Object.create(proto));
	if(Object.getPrototypeOf(rv) !== proto) {
		Reflect.setPrototypeOf(rv, proto);
	}
	Object.defineProperties(rv, descriptorsByKey);
	if(!ignoreExtensibility) {
		if(!Reflect.isExtensible(object)) Reflect.preventExtensions(rv);
	}
	return rv;
}

/**
 * @param {NonPrimitive} object
 * @param {...!*} args
 * @returns {object}
 */
export function copyAssign(object, ...args) {
	tc.expectNonPrimitive(object);
	tc.expectNonNullables(args);
	return Object.assign(copy(object), ...args);
};

/**
 * @this {object} this
 * @param {number} depth
 * @param {{stylize: function(string, string): *}} options
 * @returns {string}
 */
const customInspect = function custom(this: any, depth, options): string {
	void depth;
	return options.stylize(
		`[Object <${Object.keys((<any>this)).length}>]`,
		"special",
	);
};

/**
 * @returns {object}
 */
export function createNullObject() {
	const rv = Object.create(null);
	const customSymbol = Symbol.for("nodejs.util.inspect.custom");
	rv[customSymbol] = customInspect;
	return rv;
};

/**
 * Compares two values for deep equality.
 * - Returns 'false' if their prototypes are not identical.
 * - Data properties whose value is 'undefined' are ignored by default.
 * - Non enumerable properties are ignored.
 * - For functions, always returns 'false' unless they are identical.
 * - For arrays, only their elements are compared:
 *    other properties are ignored.
 * Circular references in compared objects are not yet supported.
 *
 * @param {*} value1
 * @param {*} value2
 * @returns {boolean}
 */
export function deepEquals(value1, value2) {
	if(Object.is(value1, value2)) return true;
	if(typeof value1 !== "object" || typeof value2 !== "object") {
		return false;
	}
	if(Object.getPrototypeOf(value1) !== Object.getPrototypeOf(value2)) {
		return false;
	}
	if(Array.isArray(value1)) {
		if(!Array.isArray(value2)) return false;
		if(value1.length !== value2.length) return false;
		for(let i = 0; i < value1.length; i++) {
			if(!deepEquals(value1[i], value2[i])) return false;
		}
		return true;
	}
	for(const key1 in value1) {
		if(value1[key1] === value2[key1]) continue;
		if(!deepEquals(value1[key1], value2[key1])) return false;
	}
	for(const key2 in value2) {
		if(value1[key2] === value2[key2]) continue;
		if(!deepEquals(value1[key2], value2[key2])) return false;
	}
	return true;
};

/**
 * @param {NonPrimitive} object
 * @param {object} options
 * @param {string} options.alias
 * @param {string} options.original
 */
export function defineAliasProperty(object, options = {alias: "", original: ""}) {
	tc.expectNonPrimitive(object);
	tc.expectNonEmptyString(options.alias);
	tc.expectNonEmptyString(options.original);
	const {alias, original} = options;
	if(alias === original) {
		throw new Error("Expected distinct options 'alias' and 'original'.");
	}
	const enumerable = hasEnumerableProperty(object, original);
	Object.defineProperty(object, alias, {
		"get"() {
			return this[original];
		},
		"set"(arg) {
			this[original] = arg;
		},
		enumerable,
		"configurable": true,
	});
};

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @param {Function} predicate
 */
export function defineCheckedProperty(object, key, predicate) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(key);
	tc.expectFunction(predicate);
	let propertyValue = object[key];
	Object.defineProperty(object, key, {
		"get"() {
			return propertyValue;
		},
		"set"(arg) {
			if(!predicate(arg)) {
				throw Object.assign(
					new TypeError("Bad property value."),
					{key, arg, predicate},
				);
			}
			propertyValue = arg;
		},
		"enumerable": true,
		"configurable": true,
	});
}

/**
 * @param {NonPrimitive} object
 * @returns {Array<string>}
 */
export function getAllPropertyNames(object) {
		tc.expectNonPrimitive(object);
		const propertyNameSet = new Set(Object.getOwnPropertyNames(object));
		let node = object;
		while(node !== Object.prototype && node !== Function.prototype) {
			node = Object.getPrototypeOf(node);
			for(const name of Object.getOwnPropertyNames(node)) {
				propertyNameSet.add(name);
			}
		}
		return [...propertyNameSet];
	};

/**
 * - Does not include properties whose keys are symbols.
 *
 * @param {NonPrimitive} object
 * @returns {BareObject<PropertyDescriptor>}
 */
export function getOwnPropertyDescriptorsByName(object) {
	tc.expectNonPrimitive(object);
	const rv = Object.create(null);
	const ownPropertyNames = Object.getOwnPropertyNames(object);
	for(const propertyName of ownPropertyNames) {
		rv[propertyName] = (
			Object.getOwnPropertyDescriptor(object, propertyName)
		);
	}
	return rv;
}

/**
 * @param {NonPrimitive} object
 * @param {object} options
 * @param {boolean} [options.ignoreSymbols]
 * @returns {PropertyKey[][]}
 */
export function getOwnPropertyPaths(
	object,
	options = {"ignoreSymbols": false},
) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitive(options);
	const ignoreSymbols = (
		"ignoreSymbols" in options
		? options.ignoreSymbols
		: false
	);
	tc.expectBoolean(ignoreSymbols);
	const rv = [] as PropertyKey[][];
	const visited = new Set();
	const path = [] as PropertyKey[];
	(function collect(node) {
		visited.add(node);
		const ownKeys = (
			ignoreSymbols
			? Object.getOwnPropertyNames(node)
			: Reflect.ownKeys(node)
		);
		for(const key of ownKeys) {
			rv[rv.length] = [...path, key];
			const descriptor = Object.getOwnPropertyDescriptor(node, key);
			// Only recurse on data properties, not on accessor properties.
			if(descriptor && "value" in descriptor) {
				// @ts-ignore
				const value = node[key];
				if(tc.isNonPrimitive(value) && !visited.has(value)) {
					path[path.length] = key;
					collect(value);
					path.length--;
				}
			}
		}
	}(object));
	return rv;
}

/**
 * Gets all own named property values of an object.
 * Catches property access errors.
 * Does not include the values of properties whose keys are symbols.
 *
 * @param {NonPrimitive} object
 * @param {*} [fallbackValue] - A value to be used as property value when
 *   accessing a property causes an error.
 * @returns {string[]}
 */
export function getOwnPropertyValues(object, fallbackValue = undefined) {
	tc.expectNonPrimitive(object);
	const rv = [] as any[];
	const names = Object.getOwnPropertyNames(object);
	for(let i = 0; i < names.length; i++) {
		try {
			rv[i] = object[names[i]];
		} catch{
			rv[i] = fallbackValue;
		}
	}
	return rv;
}

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {(PropertyDescriptor | undefined)}
 */
export function getPropertyDescriptor(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(key);
	if(!(key in object)) return undefined;
	let descriptor = Object.getOwnPropertyDescriptor(object, key);
	let proto = object;
	while(descriptor === undefined) {
		proto = Object.getPrototypeOf(proto);
		descriptor = Object.getOwnPropertyDescriptor(proto, key);
	}
	return descriptor;
}

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {Array<*>}
 */
export function getPropertyValueChain(object, key) {
	return [...iterPropertyValueChain(object, key)];
}

/**
 * @param {NonPrimitive} object
 * @returns {(Function | undefined)}
 */
export function getSpecies(object) {
	tc.expectNonPrimitive(object);
	// @ts-ignore
	if(typeof Symbol !== "function" || Symbol.species !== "symbol") {
		return undefined;
	}
	const species = object[Symbol.species];
	if(typeof species === "function") return species;
	return undefined;
}

/**
 * @param {object} object
 * @returns {string}
 */
export function getTag(object) {
		tc.expectNonPrimitive(object);
		// @ts-ignore
		if(typeof Symbol === "function" && Symbol.toStringTag === "symbol") {
			const tag = object[Symbol.toStringTag];
			if(typeof tag === "string") return tag;
		}
		return Object.prototype.toString.call(object).slice("[object ".length, -1);
	};

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasAccessorProperty(object, key) {
		tc.expectNonPrimitive(object);
		tc.expectPropertyKey(key);
		if(!(key in object)) return false;
		const descriptor = getPropertyDescriptor(object, key);
		if(descriptor === null || descriptor === undefined) return false;
		return "get" in descriptor || "set" in descriptor;
	};

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasConfigurableProperty(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(key);
	const descriptor = (
		Object.getOwnPropertyDescriptor(object, key)
	);
	if(descriptor === null || descriptor === undefined) return false;
	return descriptor.configurable === true;
}

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasDataProperty(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(key);
	if(!(key in object)) return false;
	const descriptor = getPropertyDescriptor(object, key);
	if(descriptor === null || descriptor === undefined) return false;
	return "value" in descriptor;
}

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasEnumerableProperty(object, key) {
		tc.expectNonPrimitive(object);
		tc.expectPropertyKey(key);
		return Object.prototype.propertyIsEnumerable.call(object, key);
	};

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasOwnAccessorProperty(object, key) {
		tc.expectNonPrimitive(object);
		tc.expectPropertyKey(key);
		const descriptor = Object.getOwnPropertyDescriptor(object, key);
		if(descriptor === undefined) return false;
		return "get" in descriptor || "set" in descriptor;
	};

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasOwnDataProperty(object, key) {
		tc.expectNonPrimitive(object);
		tc.expectPropertyKey(key);
		const descriptor = Object.getOwnPropertyDescriptor(object, key);
		if(descriptor === undefined) return false;
		return "value" in descriptor;
	};

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasOwnProperty(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(key);
	return Object.prototype.hasOwnProperty.call(object, key);
}

/**
 * @param {NonPrimitive} object
 * @param {PropertyKey} key
 * @returns {boolean}
 */
export function hasWritableProperty(object, key) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(key);
	const descriptor = (
		Object.getOwnPropertyDescriptor(object, key)
	);
	return descriptor ? descriptor.writable === true : false;
}

/**
 * @generator
 * @param {NonPrimitive} object
 * @param {PropertyKey} propertyKey
 * @yields {*}
 */
export function* iterPropertyValueChain(object, propertyKey) {
	tc.expectNonPrimitive(object);
	tc.expectPropertyKey(propertyKey);
	let currentValue = object;
	const visitedObjects = new WeakSet();
	while(propertyKey in currentValue) {
		currentValue = currentValue[propertyKey];
		if(visitedObjects.has(currentValue)) return;
		if(new Object(currentValue) === currentValue) {
			visitedObjects.add(currentValue);
		}
		yield currentValue;
		if(currentValue === undefined || currentValue === null) return;
	}
}

/**
 * @param {any} arg
 * @returns {string}
 */
export function toString(arg) {
	return Object.prototype.toString.call(arg);
}

/**
 * @param {Record<string, *>} object
 * @param {...*} args
 * @returns {object}
 */
export function unassign(object, ...args) {
	tc.expectNonPrimitive(object);
	for(const arg of args) {
		if(arg === null || arg === undefined) continue;
		for(const key of Object.keys(arg)) delete object[key];
	}
	return object;
}
