/**
 * @file Numbers.ts - Utilities to work with numbers.
 */
import * as tc from "./tc.js";


/**
 * @param {string} numericString
 * @param {uint} base
 * @returns {uint}
 */
export function fromBase(numericString, base) {
    tc.expectNonEmptyString(numericString);
    tc.expectPositiveInteger(base);
    return Number.parseInt(numericString, base);
}

/**
 * @param {number} number
 * @returns {uint}
 */
export function binaryLength(number) {
    tc.expectRegularNumber(number);
    const base = 2;
    return number.toString(base).length;
}

/**
 * @param {number} number
 * @returns {uint}
 */
export function decimalLength(number) {
    tc.expectRegularNumber(number);
    const base = 10;
    return number.toString(base).length;
}

/**
 * @param {number} number
 * @returns {uint}
 */
export function hexadecimalLength(number) {
    tc.expectRegularNumber(number);
    const base = 16;
    return number.toString(base).length;
}

/**
 * @param {number} number
 * @returns {uint}
 */
export function octalLength(number) {
    tc.expectRegularNumber(number);
    const base = 8;
    return number.toString(base).length;
}

/**
 * @param {*} arg
 * @returns {boolean}
 */
export function isNumber(arg) {
    return typeof arg === "number";
}

/**
 * @param {*} arg
 * @returns {boolean}
 */
export function isRegularNumber(arg) {
    if (typeof arg !== "number") return false;
    if (arg !== arg) return false;
    return arg < Number.POSITIVE_INFINITY && arg > Number.NEGATIVE_INFINITY;
}

/**
 * @param {*} arg
 * @returns {boolean}
 */
export function isSpecialNumber(arg) {
    if (typeof arg !== "number") return false;
    if (arg !== arg) return true;
    return (arg === Number.POSITIVE_INFINITY
        || arg === Number.NEGATIVE_INFINITY);
}

/**
 * Pads a number with "0" characters so that the resulting string has
 * the given number of characters.
 * @param {number} number
 * @param {uint} numberOfCharacters
 * @returns {string}
 */
export function pad(number, numberOfCharacters) {
    tc.expectRegularNumber(number);
    tc.expectPositiveInteger(numberOfCharacters);
    const s = String(number);
    if (s.length >= numberOfCharacters) return s;
    return "0".repeat(numberOfCharacters - s.length) + s;
}
