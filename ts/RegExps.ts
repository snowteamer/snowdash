/**
 * @file RegExps.ts - Utilities for RegExp objects.
 */
import * as tc from "./tc.js";

export const alpha = /[a-zàáâãäçèéêëìíîïñòóôöùúûüýÿ]/i;
export const alphanum = /[\da-zàáâãäçèéêëìíîïñòóôöùúûüýÿ]/i;
export const digit = /\d/;
export const digits = /\d+/;
export const paragraphs = /\n\r?|\r/g;
export const whiteSpace = /\s/;
export const whiteSpaces = /\s+/;


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
