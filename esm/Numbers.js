/**
 * @file Numbers.js - Utilities to work with numbers.
 *
 * @namespace Numbers
 */

/**
 * An unsigned integer number.
 *
 * @typedef {number} uint
 */

/**
 * An integer number.
 *
 * @typedef {number} int
 */

import * as tc from "tc";

const Numbers = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	Numbers[Symbol.toStringTag] = "core.Numbers";
}


/**
 * @memberof Numbers
 * @param {string} numericString
 * @param {uint} base
 * @returns {uint}
 */
Numbers.fromBase = function fromBase(numericString, base) {
	tc.expectNonEmptyString(numericString);
	tc.expectPositiveInteger(base);
	return Number.parseInt(numericString, base);
};

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
Numbers.binaryLength = function binaryLength(number) {
	tc.expectRegularNumber(number);
	const base = 2;
	return number.toString(base).length;
};

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
Numbers.decimalLength = function decimalLength(number) {
	tc.expectRegularNumber(number);
	const base = 10;
	return number.toString(base).length;
};

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
Numbers.hexadecimalLength = function hexadecimalLength(number) {
	tc.expectRegularNumber(number);
	const base = 16;
	return number.toString(base).length;
};

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
Numbers.octalLength = function octalLength(number) {
	tc.expectRegularNumber(number);
	const base = 8;
	return number.toString(base).length;
};

/**
 * @memberof Numbers
 * @param {*} arg
 * @returns {boolean}
 */
Numbers.isNumber = function isNumber(arg) {
	return typeof arg === "number";
};

/**
 * @memberof Numbers
 * @param {*} arg
 * @returns {boolean}
 */
Numbers.isRegularNumber = function isRegularNumber(arg) {
	if(typeof arg !== "number") return false;
	if(arg !== arg) return false; // eslint-disable-line no-self-compare
	return arg < Number.POSITIVE_INFINITY && arg > Number.NEGATIVE_INFINITY;
};

/**
 * @memberof Numbers
 * @param {*} arg
 * @returns {boolean}
 */
Numbers.isSpecialNumber = function isSpecialNumber(arg) {
	if(typeof arg !== "number") return false;
	if(arg !== arg) return true; // eslint-disable-line no-self-compare
	return (
		arg === Number.POSITIVE_INFINITY
		|| arg === Number.NEGATIVE_INFINITY
	);
};

/**
 * Pads a number with "0" characters so that the resulting string has
 * the given number of characters.
 *
 * @memberof Numbers
 * @param {number} number
 * @param {uint} numberOfCharacters
 * @returns {string}
 */
Numbers.pad = function pad(number, numberOfCharacters) {
	tc.expectRegularNumber(number);
	tc.expectPositiveInteger(numberOfCharacters);
	const s = String(number);
	if(s.length >= numberOfCharacters) return s;
	return "0".repeat(numberOfCharacters - s.length) + s;
};

export default Numbers;
