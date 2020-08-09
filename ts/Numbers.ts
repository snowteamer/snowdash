/**
 * @file Numbers.ts - Utilities to work with numbers.
 *
 */

type int = number;
type uint = number;


import * as tc from "./tc.js";

export const [Symbol.toStringTag] = "snowdash.Numbers";


/**
 * @memberof Numbers
 * @param {string} numericString
 * @param {uint} base
 * @returns {uint}
 */
export function fromBase(numericString: string, base: uint): int {
	tc.expectNonEmptyString(numericString);
	tc.expectPositiveInteger(base);
	return Number.parseInt(numericString, base);
}

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
export function binaryLength(number: number): uint {
	tc.expectRegularNumber(number);
	const base = 2;
	return number.toString(base).length;
}

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
export function decimalLength(number: number): uint {
	tc.expectRegularNumber(number);
	const base = 10;
	return number.toString(base).length;
}

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
export function hexadecimalLength(number: number): uint {
	tc.expectRegularNumber(number);
	const base = 16;
	return number.toString(base).length;
}

/**
 * @memberof Numbers
 * @param {number} number
 * @returns {uint}
 */
export function octalLength(number: number): uint {
	tc.expectRegularNumber(number);
	const base = 8;
	return number.toString(base).length;
}

/**
 * @memberof Numbers
 * @param {*} arg
 * @returns {boolean}
 */
export function isNumber(arg: any): boolean {
	return typeof arg === "number";
}

/**
 * @memberof Numbers
 * @param {*} arg
 * @returns {boolean}
 */
export function isRegularNumber(arg: any): boolean {
	if(typeof arg !== "number") return false;
	if(arg !== arg) return false; // eslint-disable-line no-self-compare
	return arg < Number.POSITIVE_INFINITY && arg > Number.NEGATIVE_INFINITY;
}

/**
 * @memberof Numbers
 * @param {*} arg
 * @returns {boolean}
 */
export function isSpecialNumber(arg: any): boolean {
	if(typeof arg !== "number") return false;
	if(arg !== arg) return true; // eslint-disable-line no-self-compare
	return (
		arg === Number.POSITIVE_INFINITY
		|| arg === Number.NEGATIVE_INFINITY
	);
}

/**
 * Pads a number with "0" characters so that the resulting string has
 * the given number of characters.
 *
 * @memberof Numbers
 * @param {number} number
 * @param {uint} numberOfCharacters
 * @returns {string}
 */
export function pad(number: number, numberOfCharacters: uint): string {
	tc.expectRegularNumber(number);
	tc.expectPositiveInteger(numberOfCharacters);
	const s = String(number);
	if(s.length >= numberOfCharacters) return s;
	return "0".repeat(numberOfCharacters - s.length) + s;
}
