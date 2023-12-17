/**
 * @file Tc.ts - A runtime type checking library.
 */
const areSymbolsSupported = typeof Symbol === "function";
const areTypedArraysSupported = typeof Int8Array === "function";
const isSymbolIteratorSupported = (areSymbolsSupported
    && typeof Symbol.iterator === "symbol");
const isSymbolToStringTagSupported = (areSymbolsSupported
    && typeof Symbol.toStringTag === "symbol");
const TypedArray = (areTypedArraysSupported
    ? Object.getPrototypeOf(Int8Array)
    : undefined);
const TypedArrayPrototype = (areTypedArraysSupported
    ? TypedArray.prototype
    : undefined);

/**
 * @private
 * @param {Function} errorType
 * @param {string} parameterName
 * @param {string} readableTypeDescription
 */
const makeErrorMessage = (errorType, parameterName, readableTypeDescription) => (
    `An instance of '${errorType.name}' was about to be thrown but the error constructor was called incorrectly: argument '${parameterName}' was not ${readableTypeDescription}.`
);

export class AssertionError extends Error {
    name = "AssertionError";
    constructor(message = "") {
        super(message);
        if (typeof message !== "string") {
            // Do not modify the 'stack' property in this case.
            throw new TypeError(makeErrorMessage(AssertionError, "message", "a string"));
        }
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, AssertionError);
        }
    }
}

/**
 * Creates and throws a custom 'AssertionError' instance.
 * @param {string} [message]
 * @param {Function} [thrower] - A function that should not show up in the
 *   stack trace of the generated error.
 * @throws {AssertionError}
 */
export function throwNewAssertionError(message, thrower = undefined) {
    if (typeof message !== "string") {
        // Do not attempt to modify the 'stack' property in this case.
        throw new TypeError(makeErrorMessage(AssertionError, "message", "a string"));
    }
    const error = new AssertionError(message);
    if ("1" in arguments) {
        if (typeof thrower !== "function") {
            throw new TypeError(makeErrorMessage(TypeError, "thrower", "a function"));
        }
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(error, thrower);
        }
    }
    throw error;
}

/**
 * Creates and throws a custom 'TypeError' instance.
 * @param {string} typeDescription - A non-empty and preferably readable
 *   description of the type which was expected.
 * @param {Function} [thrower] - A function that should not show up in the
 *   stack trace of the generated error.
 * @throws {TypeError}
 */
export function throwNewTypeError(typeDescription, thrower = undefined) {
    if (typeof typeDescription !== "string" || typeDescription === "") {
        // Do not attempt to modify the 'stack' property in this case.
        throw new TypeError(makeErrorMessage(TypeError, "typeDescription", "a non-empty string"));
    }
    const error = new TypeError(`expected ${typeDescription}.`);
    if ("1" in arguments) {
        if (typeof thrower !== "function") {
            throw new TypeError(makeErrorMessage(TypeError, "thrower", "a function"));
        }
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(error, thrower);
        }
    }
    throw error;
}

/**
 * @member assert
 * @param {boolean} arg - A value to test.
 * @param {string} [message]
 * @throws {AssertionError} If 'arg' is not 'true'.
 */
export function assert(arg, message = "") {
    if (typeof arg !== "boolean") throwNewTypeError("a boolean value");
    if (typeof message !== "string") throwNewTypeError("a string");
    if (arg !== true) throwNewAssertionError(message);
}

// ====== Predicates ====== //

/**
 * @param {any} arg
 */
export function isArray(arg) {
    return Array.isArray(arg);
}

/**
 * @param {any} arg
 */
export function isArrayBuffer(arg) {
    try {
        // Checks for an [[ArrayBufferByteLength]] internal slot.
        // @ts-ignore
        Reflect.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get.call(arg);
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks if a value is array-like.
 *
 * A JavaScript value is array-like object if:
 * - it has a "length" property whose value is a positive safe integer.
 * @note In particular, strings are array-like.
 * @param {any} arg
 * @returns {arg is ArrayLike}
 */
export function isArrayLike(arg) {
    // Fortunately 'String.prototype.length' is not configurable.
    if (typeof arg === "string") return true;
    return (((typeof arg === "object" && arg !== null) || typeof arg === "function")
        && "length" in arg
        && Number.isSafeInteger(arg.length)
        && arg.length >= 0);
}

/**
 * Checks if a value is an array-like object.
 *
 * A JavaScript value is an array-like object if:
 * - it is not a primitive value;
 * - it has a "length" property whose value is a positive safe integer.
 * @note An object being array-like does not guarantee that all generic 'Array'
 * methods will work on it:
 * some of those methods require their argument's length to be less than 2^32.
 * @param {any} arg
 */
export function isArrayLikeObject(arg) {
    return (((typeof arg === "object" && arg !== null)
        || typeof arg === "function")
        && "length" in arg
        && Number.isSafeInteger(arg.length)
        && arg.length >= 0);
}

/**
 * @param {any} arg
 */
export function isBareObject(arg) {
    return typeof arg === "object" && Reflect.getPrototypeOf(arg) === null;
}

/**
 * @param {any} arg
 */
export function isBigInt(arg) {
    return typeof arg === "bigint";
}

/**
 * @param {any} arg
 */
export function isBoolean(arg) {
    return typeof arg === "boolean";
}

/**
 * @param {any} arg
 */
export function isDataView(arg) {
    try {
        // @ts-ignore
        Object.getOwnPropertyDescriptor(DataView.prototype, "buffer").get.call(arg);
        return true;
    } catch {
        return false;
    }
}

/**
 * @param {any} arg
 */
export function isDate(arg) {
    try {
        Date.prototype.getDate.call(arg);
        return true;
    } catch {
        return false;
    }
}

/**
 * @param {any} arg
 */
export function isGeneratorFunction(arg) {
    if (!isSymbolIteratorSupported) return false;
    if (typeof arg !== "function") return false;
    try {
        return Function.prototype.toString.call(arg).startsWith("function*");
    } catch {
        return false;
    }
}

/**
 * @param {any} arg
 */
export function isFunction(arg) {
    return typeof arg === "function";
}

/**
 * @param {any} arg
 */
export function isImmutable(arg) {
    return (isPrimitive(arg)
        || (Object.isSealed(arg) && Object.isFrozen(arg)));
}

/**
 * @param {any} arg
 */
export function isInteger(arg) {
    return typeof arg === "number" && arg % 1 === 0;
}

/**
 * @param {any} arg
 */
export function isIterable(arg) {
    if (!isSymbolIteratorSupported) return false;
    if (arg === null || typeof arg === "undefined") return false;
    return Symbol.iterator in new Object(arg);
}

/**
 * @param {any} arg
 */
export function isMap(arg) {
    try {
        // Checks for an [[MapData]] internal slot.
        Map.prototype.has.call(arg, undefined);
        return true;
    } catch {
        return false;
    }
}

/**
 * @param {any} arg
 */
export function isMutable(arg) {
    return !isImmutable(arg);
}

/**
 * @param {any} arg
 */
export function isMutableArrayLikeObject(arg) {
    return isArrayLikeObject(arg) && !isImmutable(arg);
}

/**
 * @param {any} arg
 */
export function isNegativeBigInt(arg) {
    return typeof arg === "bigint" && arg <= BigInt(0);
}

/**
 * @param {any} arg
 */
export function isNegativeInteger(arg) {
    return (typeof arg === "number"
        && arg % 1 === 0
        && arg <= 0
        && arg > Number.NEGATIVE_INFINITY
        && !Object.is(arg, 0));
}

/**
 * @param {any} arg
 */
export function isNegativeNumber(arg) {
    return typeof arg === "number" && arg <= 0 && !Object.is(arg, 0);
}

/**
 * @param {any} arg
 */
export function isNil(arg) {
    return arg === null || arg === undefined;
}

/**
 * @param {any} arg
 */
export function isNonEmptyArray(arg) {
    return Array.isArray(arg) && arg.length > 0;
}

/**
 * @param {any} arg
 */
export function isNonEmptyArrayLike(arg) {
    return isArrayLike(arg) && arg.length > 0;
}

/**
 * @param {any} arg
 */
export function isNonEmptySet(arg) {
    return isSet(arg) && arg.size !== 0;
}

/**
 * @param {any} arg
 */
export function isNonEmptyString(arg) {
    return typeof arg === "string" && arg !== "";
}

/**
 * @param {any} arg
 */
export function isNonNullable(arg) {
    return arg !== null && arg !== undefined;
}

/**
 * @param {any} arg
 */
export function isNullOrUndefined(arg) {
    return arg === null || arg === undefined;
}
/**
 * @param {any} arg
 */
export function isNonPrimitive(arg) {
    return !isPrimitive(arg);
}
/**
 * @param {any} arg
 */
export function isNumber(arg) {
    return typeof arg === "number";
}
/**
 * @param {any} arg
 */
export function isObject(arg) {
    switch (typeof arg) {
        case "function":
        case "object": return true;
        default: return false;
    }
}
/**
 * Checks if a value is a plain object.
 *
 * - A given value is not a plain object if it has a [Symbol.toStringTag]
 * property.
 * - If you define a '[Symbol.toStringTag]' property on a plain object, it is no
 * longer a plain object.
 * - The prototype of a plain object is either 'null', 'Object.prototype',
 * or another plain object.
 * @param {any} arg
 * @example isPlainObject({}); // -> true
 * @example isPlainObject(Object.create(null)); // -> true
 * @example isPlainObject(Object.create({})); // -> true
 * @example isPlainObject([]); // -> false
 */
export function isPlainObject(arg) {
    if (typeof arg !== "object" || arg === null) return false;
    if (Object.prototype.toString.call(arg) !== "[object Object]") return false;
    if (areSymbolsSupported && Symbol.toStringTag in arg) return false;
    const proto = Reflect.getPrototypeOf(arg);
    if (proto === null) return true;
    if (proto === Object.prototype) return true;
    // This is safe from recursion since cyclic prototype chains are impossible.
    if (isPlainObject(proto)) return true;
    return false;
}
/**
 * @param {any} arg
 */
export function isPositiveBigInt(arg) {
    return typeof arg === "bigint" && arg >= BigInt(0);
}
/**
 * @param {any} arg
 */
export function isPositiveInteger(arg) {
    return (typeof arg === "number" && arg % 1 === 0
        && arg >= 0
        && arg < Number.POSITIVE_INFINITY
        && !Object.is(arg, -0));
}
/**
 * @param {any} arg
 */
export function isPositiveNumber(arg) {
    return typeof arg === "number" && arg >= 0 && !Object.is(arg, -0);
}
/**
 * @param {any} arg
 */
export function isPrimitive(arg) {
    switch (typeof arg) {
        case "function":
        case "object": return false;
        default: return true;
    }
}
/**
 * @param {any} arg
 */
export function isPropertyDescriptor(arg) {
    if (isPrimitive(arg)) return false;
    if ("value" in arg && !("get" in arg || "set" in arg)) return true;
    if (!("value" in arg) && ("get" in arg || "set" in arg)) return true;
    return false;
}
/**
 * @param {any} arg
 */
export function isPropertyKey(arg) {
    switch (typeof arg) {
        case "string":
        case "symbol": return true;
        case "number": return arg >= 0 && arg < 2 ** 32;
        default: return false;
    }
}
/**
 * @param {any} arg
 */
export function isRegExp(arg) {
    if (isSymbolToStringTagSupported) {
        try {
            // 21.2.5.10 get RegExp.prototype.source
            // @ts-ignore
            Reflect.getOwnPropertyDescriptor(RegExp.prototype, "source").get.call(arg);
            // Now 'arg' is either a 'RegExp' instance or the
            // 'RegExp.prototype' object, which is not a 'RegExp' instance.
            return arg !== RegExp.prototype;
        } catch {
            return false;
        }
    }
    return Object.prototype.toString.call(arg) === "[object RegExp]";
}
/**
 * @param {any} arg
 */
export function isRegularNumber(arg) {
    if (typeof arg !== "number") return false;
    // Checks for NaN
    if (arg !== arg) return false;
    return arg < Number.POSITIVE_INFINITY && arg > Number.NEGATIVE_INFINITY;
}
/**
 * @param {any} arg
 */
export function isSafeInteger(arg) {
    return (typeof arg === "number"
        && arg % 1 === 0
        && arg >= Number.MIN_SAFE_INTEGER
        && arg <= Number.MAX_SAFE_INTEGER);
}
/**
 * @param {any} arg
 */
export function isSet(arg) {
    try {
        // Checks for an [[SetData]] internal slot.
        Set.prototype.has.call(arg, 0);
        return true;
    } catch {
        return false;
    }
}
/**
 * @param {any} arg
 */
export function isSharedArrayBuffer(arg) {
    try {
        // Checks for an [[ArrayBufferByteLength]] internal slot.
        // @ts-ignore
        Reflect.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get.call(arg);
        return true;
    } catch {
        return false;
    }
}
/**
 * @param {any} arg
 */
export function isStrictlyNegativeBigInt(arg) {
    return typeof arg === "bigint" && arg < BigInt(0);
}
/**
 * @param {any} arg
 */
export function isStrictlyNegativeInteger(arg) {
    return (typeof arg === "number"
        && arg % 1 === 0
        && arg < 0
        && arg > Number.NEGATIVE_INFINITY);
}
/**
 * @param {any} arg
 */
export function isStrictlyNegativeNumber(arg) {
    return typeof arg === "number" && arg < 0;
}
/**
 * @param {any} arg
 */
export function isStrictlyPositiveBigInt(arg) {
    return typeof arg === "bigint" && arg > BigInt(0);
}
/**
 * @param {any} arg
 */
export function isStrictlyPositiveInteger(arg) {
    return (typeof arg === "number"
        && arg % 1 === 0
        && arg > 0
        && arg < Number.POSITIVE_INFINITY);
}

/**
 * @param {any} arg
 */
export function isStrictlyPositiveNumber(arg) {
    return typeof arg === "number" && arg > 0;
}

/**
 * @param {any} arg
 * @returns {arg is string}
 */
export function isString(arg) {
    return typeof arg === "string";
}
/**
 * @param {any} arg
 */
export function isSymbol(arg) {
    return typeof arg === "symbol";
}
/**
 * @param {any} arg
 */
export function isTypedArray(arg) {
    if (typeof arg !== "object" || arg === null) return false;
    try {
        // @ts-ignore
        Reflect.getOwnPropertyDescriptor(TypedArrayPrototype, "byteLength").get.call(arg);
        return true;
    } catch {
        return false;
    }
}
/**
 * @param {any} arg
 * @returns {arg is WeakMap}
 */
export function isWeakMap(arg) {
    try {
        WeakMap.prototype.has.call(arg, {});
        return true;
    } catch {
        return false;
    }
}
/**
 * @param {any} arg
 * @returns {arg is WeakSet}
 */
export function isWeakSet(arg) {
    void descriptionsByTypeName;
    try {
        WeakSet.prototype.has.call(arg, {});
        return true;
    } catch {
        return false;
    }
}
const descriptionsByTypeName = {
    "Array": "an 'Array' object",
    "ArrayBuffer": "an 'ArrayBuffer' object",
    "ArrayLike": "an array-like value",
    "ArrayLikeObject": "an array-like object",
    "BareObject": "an object whose prototype is 'null'",
    "BigInt": "a BigInt integer",
    "Boolean": "a boolean",
    "Date": "a 'Date' object",
    "Function": "a function",
    "GeneratorFunction": "a generator function",
    "Integer": "an integer",
    "Iterable": "an iterable",
    "Map": "a 'Map' object",
    "MutableArrayLikeObject": "a mutable array-like object",
    "NegativeBigInt": "a negative BigInt integer",
    "NegativeInteger": "a negative integer",
    "NegativeNumber": "a negative number",
    "NonEmptyArray": "a non-empty Array object",
    "NonEmptyArrayLike": "a non-empty array-like value",
    "NonEmptyString": "a non-empty string",
    "NonNullable": "neither 'null' nor 'undefined'",
    "NonPrimitive": "a non-primitive value",
    "Number": "a number",
    "Object": "a non-primitive value",
    "PlainObject": "a plain object",
    "PositiveBigInt": "a positive BigInt integer",
    "PositiveInteger": "a positive integer",
    "PositiveNumber": "a positive number",
    "Primitive": "a primitive value",
    "PropertyDescriptor": "a property descriptor",
    "PropertyKey": "a property key",
    "RegularNumber": "a regular number",
    "RegExp": "a 'RegExp' object",
    "SafeInteger": "a safe integer",
    "Set": "a 'Set' object",
    "SharedArrayBuffer": "a 'SharedArrayBuffer' object",
    "StrictlyNegativeBigInt": "a strictly negative BigInt integer",
    "StrictlyNegativeInteger": "a strictly negative integer",
    "StrictlyNegativeNumber": "a strictly negative number",
    "StrictlyPositiveBigInt": "a strictly positive BigInt integer",
    "StrictlyPositiveInteger": "a strictly positive integer",
    "StrictlyPositiveNumber": "a strictly positive number",
    "String": "a string",
    "Symbol": "a symbol",
    "TypedArray": "a typed array",
    "WeakMap": "a 'WeakMap' object",
    "WeakSet": "a 'WeakSet' object",
};
const predicatesByName = {
    isArray,
    isArrayBuffer,
    isArrayLike,
    isArrayLikeObject,
    isBareObject,
    isBigInt,
    isBoolean,
    isDataView,
    isDate,
    isGeneratorFunction,
    isFunction,
    isImmutable,
    isInteger,
    isIterable,
    isMap,
    isMutable,
    isMutableArrayLikeObject,
    isNegativeBigInt,
    isNegativeInteger,
    isNegativeNumber,
    isNil,
    isNonEmptyArray,
    isNonEmptyArrayLike,
    isNonEmptyString,
    isNonNullable,
    isNonPrimitive,
    isNullOrUndefined,
    isNumber,
    isObject,
    isPlainObject,
    isPositiveBigInt,
    isPositiveInteger,
    isPositiveNumber,
    isPrimitive,
    isPropertyDescriptor,
    isPropertyKey,
    isRegExp,
    isRegularNumber,
    isSafeInteger,
    isSet,
    isSharedArrayBuffer,
    isStrictlyNegativeBigInt,
    isStrictlyNegativeInteger,
    isStrictlyNegativeNumber,
    isStrictlyPositiveBigInt,
    isStrictlyPositiveInteger,
    isStrictlyPositiveNumber,
    isString,
    isSymbol,
    isTypedArray,
    isWeakMap,
    isWeakSet,
};
const typeNames = Object.keys(descriptionsByTypeName);
// Validates the 'descriptionsByTypeName' object.
// Do not call 'tc' public functions here.
for (const name of typeNames) {
    const objectName = "descriptionsByTypeName";
    let reason = "";
    if (!/^[A-Z]/.test(name)) {
        reason = "it does not start with an uppercase ASCII letter";
    } else if (/[^\w$]/.test(name)) {
        reason = "it includes a forbidden character";
    }
    if (reason) {
        throw new TypeError(`Invalid key ${JSON.stringify(name)} in '${objectName}': ${reason}.`);
    }
    const description = descriptionsByTypeName[name];
    if (typeof description !== "string" || description === "") {
        throw new TypeError(`Invalid value in '${objectName}' for the ${JSON.stringify(name)} key.`);
    }
    const predicateName = `is${  name}`;
    const predicate = predicatesByName[predicateName];
    if (typeof predicate !== "function") {
        throw new TypeError(`Invalid or missing '${predicateName}' predicate for the '${name}' type.`);
    }
}
/**
 *
 * @param {Function} predicate
 */
export function makeExpectation(predicate) {
    const typeName = predicate.name.slice(2);
    const description = descriptionsByTypeName[typeName];
    if (description === undefined) {
        throw new TypeError("expected a known predicate.");
    }
    return (function expectation(arg) {
        if (!predicate(arg)) {
            throwNewTypeError(description, expectation);
        }
    });
}
/**
 *
 * @param {Function} predicate
 */
export function makePluralExpectation(predicate) {
    const typeName = predicate.name.slice(2);
    const description = descriptionsByTypeName[typeName];
    if (description === undefined) {
        throw new TypeError("expected a known predicate.");
    }
    const elementTypeDescription = `every element to be ${description}`;
    const pluralTypeDescription = (`an array or array-like object where every element is ${description}`);
    return (function expectation(values) {
        if (!isArrayLikeObject(values)) {
            throwNewTypeError(pluralTypeDescription, expectation);
        }
        for (let i = 0; i < values.length; i++) {
            if (!predicate(values[i])) {
                throwNewTypeError(elementTypeDescription, expectation);
            }
        }
    });
}

export const expectArray = makeExpectation(isArray);
export const expectArrayBuffer = makeExpectation(isArrayBuffer);
export const expectArrayLike = makeExpectation(isArrayLike);
export const expectArrayLikeObject = makeExpectation(isArrayLikeObject);
export const expectBoolean = makeExpectation(isBoolean);
export const expectDate = makeExpectation(isDate);
export const expectFunction = makeExpectation(isFunction);
export const expectGeneratorFunction = makeExpectation(isGeneratorFunction);
export const expectInteger = makeExpectation(isInteger);
export const expectIterable = makeExpectation(isIterable);
export const expectMap = makeExpectation(isMap);
export const expectMutableArrayLikeObject = makeExpectation(isMutableArrayLikeObject);
export const expectNegativeInteger = makeExpectation(isNegativeInteger);
export const expectNegativeNumber = makeExpectation(isNegativeNumber);
export const expectNonEmptyArray = makeExpectation(isNonEmptyArray);
export const expectNonEmptyArrayLike = makeExpectation(isNonEmptyArrayLike);
export const expectNonEmptyString = makeExpectation(isNonEmptyString);
export const expectNonNullable = makeExpectation(isNonNullable);
export const expectNonPrimitive = makeExpectation(isNonPrimitive);
export const expectNumber = makeExpectation(isNumber);
export const expectObject = makeExpectation(isObject);
export const expectPlainObject = makeExpectation(isPlainObject);
export const expectPositiveInteger = makeExpectation(isPositiveInteger);
export const expectPositiveNumber = makeExpectation(isPositiveNumber);
export const expectPrimitive = makeExpectation(isPrimitive);
export const expectPropertyDescriptor = makeExpectation(isPropertyDescriptor);
export const expectPropertyKey = makeExpectation(isPropertyKey);
export const expectRegularNumber = makeExpectation(isRegularNumber);
export const expectRegExp = makeExpectation(isRegExp);
export const expectSafeInteger = makeExpectation(isSafeInteger);
export const expectSet = makeExpectation(isSet);
export const expectSharedArrayBuffer = makeExpectation(isSharedArrayBuffer);
export const expectStrictlyNegativeInteger = makeExpectation(isStrictlyNegativeInteger);
export const expectStrictlyNegativeNumber = makeExpectation(isStrictlyNegativeNumber);
export const expectStrictlyPositiveInteger = makeExpectation(isStrictlyPositiveInteger);
export const expectStrictlyPositiveNumber = makeExpectation(isStrictlyPositiveNumber);
export const expectString = makeExpectation(isString);
export const expectSymbol = makeExpectation(isSymbol);
export const expectTypedArray = makeExpectation(isTypedArray);
export const expectWeakMap = makeExpectation(isWeakMap);
export const expectWeakSet = makeExpectation(isWeakSet);
export const expectArrays = makePluralExpectation(isArray);
export const expectArrayBuffers = makePluralExpectation(isArrayBuffer);
export const expectArrayLikes = makePluralExpectation(isArrayLike);
export const expectArrayLikeObjects = makePluralExpectation(isArrayLikeObject);
export const expectBigInts = makePluralExpectation(isBigInt);
export const expectBooleans = makePluralExpectation(isBoolean);
export const expectDates = makePluralExpectation(isDate);
export const expectFunctions = makePluralExpectation(isFunction);
export const expectGeneratorFunctions = makePluralExpectation(isGeneratorFunction);
export const expectIntegers = makePluralExpectation(isInteger);
export const expectIterables = makePluralExpectation(isIterable);
export const expectMaps = makePluralExpectation(isMap);
export const expectMutableArrayLikeObjects = makePluralExpectation(isMutableArrayLikeObject);
export const expectNegativeIntegers = makePluralExpectation(isNegativeInteger);
export const expectNegativeNumbers = makePluralExpectation(isNegativeNumber);
export const expectNonEmptyArrays = makePluralExpectation(isNonEmptyArray);
export const expectNonEmptyArrayLikes = makePluralExpectation(isNonEmptyArrayLike);
export const expectNonEmptyStrings = makePluralExpectation(isNonEmptyString);
export const expectNonNullables = makePluralExpectation(isNonNullable);
export const expectNonPrimitives = makePluralExpectation(isNonPrimitive);
export const expectNumbers = makePluralExpectation(isNumber);
export const expectObjects = makePluralExpectation(isObject);
export const expectPlainObjects = makePluralExpectation(isPlainObject);
export const expectPositiveIntegers = makePluralExpectation(isPositiveInteger);
export const expectPositiveNumbers = makePluralExpectation(isPositiveNumber);
export const expectPrimitives = makePluralExpectation(isPrimitive);
export const expectPropertyDescriptors = makePluralExpectation(isPropertyDescriptor);
export const expectPropertyKeys = makePluralExpectation(isPropertyKey);
export const expectRegularNumbers = makePluralExpectation(isRegularNumber);
export const expectRegExps = makePluralExpectation(isRegExp);
export const expectSafeIntegers = makePluralExpectation(isSafeInteger);
export const expectSets = makePluralExpectation(isSet);
export const expectSharedArrayBuffers = makePluralExpectation(isSharedArrayBuffer);
export const expectStrictlyNegativeIntegers = makePluralExpectation(isStrictlyNegativeInteger);
export const expectStrictlyNegativeNumbers = makePluralExpectation(isStrictlyNegativeNumber);
export const expectStrictlyPositiveIntegers = makePluralExpectation(isStrictlyPositiveInteger);
export const expectStrictlyPositiveNumbers = makePluralExpectation(isStrictlyPositiveNumber);
export const expectStrings = makePluralExpectation(isString);
export const expectSymbols = makePluralExpectation(isSymbol);
export const expectTypedArrays = makePluralExpectation(isTypedArray);
export const expectWeakMaps = makePluralExpectation(isWeakMap);
export const expectWeakSets = makePluralExpectation(isWeakSet);
