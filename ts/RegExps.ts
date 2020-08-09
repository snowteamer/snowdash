/**
 * @file RegExps.ts - Utilities for RegExp objects.
 */
import * as tc from "./tc.js";

const RegExps = {
	alpha: /[a-zàáâãäçèéêëìíîïñòóôöùúûüýÿ]/i,
	alphanum: /[\da-zàáâãäçèéêëìíîïñòóôöùúûüýÿ]/i,
	digit: /\d/,
	digits: /\d+/,
	paragraphs: /\n\r?|\r/g,
	whiteSpace: /\s/,
	whiteSpaces: /\s+/,

	escapeString,
	fromEndings,
	[Symbol.toStringTag]: "snowdash.RegExps",
};


/**
 * @param {string} s
 * @returns {string}
 */
export function escapeString(s: string): string {
	tc.expectString(s);
	return s.replace(/[!$()*+.?[\\\]^|-]/g, (character) => `\\${character}`);
}

/**
 * @param {object} endings
 * @param {string} [flags=""]
 * @returns {RegExp}
 */
export function fromEndings(endings: {[key: string]: any}, flags = ""): RegExp {
	const pattern = (
		`(${
			Object.keys(endings).sort(
				(a, b) => b.length - a.length
			).join("|")
		})$`
	);
	return new RegExp(pattern, flags);
}

export default RegExps;
