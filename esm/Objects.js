/**
 * @file Objects.js
 * Utilities for 'Object' objects, that is, objects whose internal class name
 * is "Object".
 * So for example they don't work for 'Array' or 'Function' objects.
 */

/**
 * @typedef {Record<PropertyKey, *>} AnyObject
 */

/**
 * @typedef {!AnyObject} NonPrimitive
 */

/**
 * @typedef {function(*): boolean} Predicate
 */

import * as tc from "tc";

const Objects = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	Objects[Symbol.toStringTag] = "core.Objects";
}

/* eslint-disable no-new-object, no-new-wrappers, unicorn/new-for-builtins */

/**
 * @type {Record<string, function(*): *>}
 */
const factoriesByInternalClassName = {
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

/* eslint-enable no-new-object, no-new-wrappers, unicorn/new-for-builtins */

/**
 * A stricter version of the native 'Object.assign()' method,
 *   which throws if some argument is null or a primitive value.
 *
 * @param {AnyObject} object
 * @param {...AnyObject} otherObjects
 * @returns {object} The given object.
 */
Objects.assign = function assign(object, ...otherObjects) {
	tc.expectNonPrimitive(object);
	tc.expectNonPrimitives(otherObjects);
	return Object.assign(object, ...otherObjects);
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
Objects.clone = function clone(
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
	const path = [];
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

		const className = Objects.getTag(node);
		const factory = factoriesByInternalClassName[className];
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
 * @param {AnyObject} object
 * @param {object} options
 * @param {boolean} [options.ignoreAttributes]
 * @param {boolean} [options.ignoreExtensibility]
 * @param {boolean} [options.ignoreSymbols]
 * @returns {object}
 */
Objects.copy =
	function copy(
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
		for(const propertyKey of propertyKeys) {
			const descriptor = (
				Object.getOwnPropertyDescriptor(object, propertyKey)
			);
			if(typeof descriptor === "undefined") continue;
			// @ts-ignore
			descriptorsByKey[propertyKey] = descriptor;
			if(ignoreAttributes && "value" in descriptor) {
				descriptor.configurable = true;
				descriptor.enumerable = true;
				descriptor.writable = true;
			}
		}
		const className = Objects.getTag(object);
		const factory = factoriesByInternalClassName[className];
		const rv = (factory ? factory(object) : Object.create(proto));
		if(Object.getPrototypeOf(rv) !== proto) {
			Reflect.setPrototypeOf(rv, proto);
		}
		Object.defineProperties(rv, descriptorsByKey);
		if(!ignoreExtensibility) {
			if(!Reflect.isExtensible(object)) Reflect.preventExtensions(rv);
		}
		return rv;
	};

/**
 * @param {AnyObject} object
 * @param {...*} args
 * @returns {object}
 */
Objects.copyAssign =
	function copyAssign(object, ...args) {
		tc.expectNonPrimitive(object);
		tc.expectNonNullables(args);
		return Object.assign(Objects.copy(object), ...args);
	};

/**
 * @returns {object}
 */
Objects.createNullObject = function createNullObject() {
	const rv = Object.create(null);
	const customSymbol = Symbol.for("nodejs.util.inspect.custom");
	/**
	 * @param {number} depth
	 * @param {{ stylize: (arg0: string, arg1: string) => any; }} options
	 * @returns {string}
	 */
	// @ts-ignore
	rv[customSymbol] = function custom(depth, options) {
		return options.stylize(
			`[Object <${Object.keys(this).length}>]`,
			"special",
		);
	};
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
Objects.deepEquals =
	function deepEquals(value1, value2) {
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
 * @param {AnyObject} object
 * @param {object} options
 * @param {string} options.alias
 * @param {string} options.original
 */
Objects.defineAliasProperty =
	function defineAliasProperty(object, options = {alias: "", original: ""}) {
		tc.expectNonPrimitive(object);
		const {alias, original} = options;
		const enumerable = Objects.hasEnumerableProperty(object, original);
		tc.expectNonEmptyString(alias);
		tc.expectNonEmptyString(original);
		if(alias === original) {
			throw new Error("Expected distinct options 'alias' and 'original'.");
		}
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
 * @param {AnyObject} object
 * @param {string} propertyName
 * @param {Function} predicate
 */
Objects.defineCheckedProperty =
	function defineCheckedProperty(object, propertyName, predicate) {
		tc.expectNonPrimitive(object);
		tc.expectNonEmptyString(propertyName);
		tc.expectFunction(predicate);
		let propertyValue = object[propertyName];
		Object.defineProperty(object, propertyName, {
			"get": function get() {
				return propertyValue;
			},
			"set": function set(arg) {
				if(!predicate(arg)) {
					throw Object.assign(
						new TypeError("Bad property value."),
						{propertyName, arg, predicate},
					);
				}
				propertyValue = arg;
			},
			"enumerable": true,
			"configurable": true,
		});
	};

/**
 * @param {object} object
 * @returns {Array<string>}
 */
Objects.getAllPropertyNames =
	function getAllPropertyNames(object) {
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
 * @param {object} object
 * @returns {Record<string, PropertyDescriptor>}
 * Does not include properties whose keys are symbols.
 */
Objects.getOwnPropertyDescriptorsByName =
	function getOwnPropertyDescriptorsByName(object) {
		const rv = Object.create(null);
		const ownPropertyNames = Object.getOwnPropertyNames(object);
		for(const propertyName of ownPropertyNames) {
			rv[propertyName] = (
				Object.getOwnPropertyDescriptor(object, propertyName)
			);
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {object} options
 * @param {boolean} [options.ignoreSymbols]
 * @returns {PropertyKey[][]}
 */
Objects.getOwnPropertyPaths = function getOwnPropertyPaths(
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
	const rv = [];
	const visited = new Set();
	const path = [];
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
};

/**
 * Gets all own named property values of an object.
 * Catches property access errors.
 * Does not include the values of properties whose keys are symbols.
 *
 * @param {Record<string, *>} object
 * @param {*} [fallbackValue] - A value to be used as property value when
 *   accessing a property causes an error.
 * @returns {string[]}
 */
Objects.getOwnPropertyValues =
	function getOwnPropertyValues(object, fallbackValue /* optional */) {
		tc.expectNonPrimitive(object);
		const rv = [];
		const names = Object.getOwnPropertyNames(object);
		for(let i = 0; i < names.length; i++) {
			try {
				rv[i] = object[names[i]];
			} catch{
				rv[i] = fallbackValue;
			}
		}
		return rv;
	};

/**
 * @param {object} object
 * @param {(string|symbol)} key
 * @returns {PropertyDescriptor?}
 */
Objects.getPropertyDescriptor =
	function getPropertyDescriptor(object, key) {
		tc.expectNonPrimitive(object);
		if(!tc.isString(key) && !tc.isSymbol(key)) {
			tc.throwNewTypeError("a property key");
		}
		if(!(key in object)) return undefined;
		let descriptor = Object.getOwnPropertyDescriptor(object, key);
		let proto = object;
		while(descriptor === undefined) {
			proto = Object.getPrototypeOf(proto);
			descriptor = Object.getOwnPropertyDescriptor(proto, key);
		}
		return descriptor;
	};

/**
 * @param {Record<string, *>} object
 * @param {string} propertyName
 * @returns {Array<*>}
 */
Objects.getPropertyValueChain =
	function getPropertyValueChain(object, propertyName) {
		if(typeof Objects.iterPropertyValueChain === "function") {
			return [...Objects.iterPropertyValueChain(object, propertyName)];
		}
		tc.expectNonPrimitive(object);
		tc.expectNonEmptyString(propertyName);
		let propertyValue = object[propertyName];
		const rv = [];
		const visitedValueSet = new Set();
		while(
			tc.isNonPrimitive(propertyValue)
			&& !visitedValueSet.has(propertyValue)
		) {
			visitedValueSet.add(propertyValue);
			rv[rv.length] = propertyValue;
			propertyValue = propertyValue[propertyName];
		}
		return rv;
	};

/**
 * @generator
 * @param {Record<string, *>} object
 * @param {string} propertyName
 * @yields {*}
 */
Objects.iterPropertyValueChain =
	function* iterPropertyValueChain(object, propertyName) {
		tc.expectNonPrimitive(object);
		tc.expectNonEmptyString(propertyName);
		let currentValue = object;
		const visitedObjects = new WeakSet();
		while(propertyName in currentValue) {
			currentValue = currentValue[propertyName];
			if(visitedObjects.has(currentValue)) return;
			if(new Object(currentValue) === currentValue) {
				visitedObjects.add(currentValue);
			}
			yield currentValue;
			if(currentValue === undefined || currentValue === null) return;
		}
	};

/**
 * @param {object} object
 * @returns {string=}
 */
Objects.getTag =
	function getTag(object) {
		tc.expectNonPrimitive(object);
		if(typeof Symbol !== "function" || Symbol.toStringTag !== "symbol") {
			return undefined;
		}
		const tag = object[Symbol.toStringTag];
		if(typeof tag === "string") return tag;
		return undefined;
	};

/**
 * @param {object} object
 * @param {string} key
 * @returns {boolean}
 */
Objects.hasAccessorProperty =
	function hasAccessorProperty(object, key) {
		tc.expectNonPrimitive(object);
		if(!tc.isString(key) && !tc.isSymbol(key)) {
			tc.throwNewTypeError("a property key");
		}
		if(!(key in object)) return false;
		const descriptor = Objects.getPropertyDescriptor(object, key);
		if(descriptor === null) return false;
		return "get" in descriptor || "set" in descriptor;
	};

/**
 * @param {Record<string, *>} object
 * @param {string} propertyKey
 * @returns {boolean}
 */
Objects.hasConfigurableProperty =
	function hasConfigurableProperty(object, propertyKey) {
		tc.expectInstanceOf(object, Object);
		const descriptor = (
			Object.getOwnPropertyDescriptor(object, propertyKey)
		);
		return descriptor ? descriptor.configurable === true : false;
	};

/**
 * @param {Record<string, *>} object
 * @param {string} key
 * @returns {boolean}
 */
Objects.hasDataProperty =
	function hasDataProperty(object, key) {
		tc.expectNonPrimitive(object);
		if(!tc.isString(key) && !tc.isSymbol(key)) {
			tc.throwNewTypeError("a property key");
		}
		if(!(key in object)) return false;
		const descriptor = Objects.getPropertyDescriptor(object, key);
		if(descriptor === null) return false;
		return "value" in descriptor;
	};

/**
 * @param {Record<string, *>} object
 * @param {string} propertyKey
 * @returns {boolean}
 */
Objects.hasEnumerableProperty =
	function hasEnumerableProperty(object, propertyKey) {
		return Object.prototype.propertyIsEnumerable.call(object, propertyKey);
	};

/**
 * @param {object} object
 * @param {string} key
 * @returns {boolean}
 */
Objects.hasOwnAccessorProperty =
	function hasOwnAccessorProperty(object, key) {
		tc.expectNonPrimitive(object);
		if(!tc.isString(key) && !tc.isSymbol(key)) {
			tc.throwNewTypeError("a property key");
		}
		const descriptor = Object.getOwnPropertyDescriptor(object, key);
		if(descriptor === undefined) return false;
		return "get" in descriptor || "set" in descriptor;
	};

/**
 * @param {Record<string, *>} object
 * @param {string} key
 * @returns {boolean}
 */
Objects.hasOwnDataProperty =
	function hasOwnDataProperty(object, key) {
		tc.expectNonPrimitive(object);
		if(!tc.isString(key) && !tc.isSymbol(key)) {
			tc.throwNewTypeError("a property key");
		}
		const descriptor = Object.getOwnPropertyDescriptor(object, key);
		if(descriptor === undefined) return false;
		return "value" in descriptor;
	};

/**
 * @param {Record<string, *>} object
 * @param {string} key
 * @returns {boolean}
 */
Objects.hasOwnProperty =
	function hasOwnProperty(object, key) {
		tc.expectNonPrimitive(object);
		if(!tc.isString(key) && !tc.isSymbol(key)) {
			tc.throwNewTypeError("a property key");
		}
		return Object.prototype.hasOwnProperty.call(object, key);
	};

/**
 * @returns {boolean}
 * @param {object} object
 * @param {string} propertyKey
 */
Objects.hasWritableProperty =
	function hasWritableProperty(object, propertyKey) {
		tc.expectNonPrimitive(object);
		const descriptor = (
			Object.getOwnPropertyDescriptor(object, propertyKey)
		);
		return descriptor ? descriptor.writable === true : false;
	};

/**
 * @param {any} arg
 * @returns {string}
 */
Objects.toString =
	function toString(arg) {
		return Object.prototype.toString.call(arg);
	};

/**
 * @param {Record<string, *>} object
 * @param {...*} args
 * @returns {object}
 */
Objects.unassign =
	function unassign(object, ...args) {
		tc.expectNonPrimitive(object);
		for(const arg of args) {
			if(arg === null || arg === undefined) continue;
			for(const key of Object.keys(arg)) delete object[key];
		}
		return object;
	};

export default Objects;
