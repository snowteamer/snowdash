/**
 * @file RegExps.js - Utilities for RegExp objects.
 */
import * as tc from "tc";

const RegExps = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	RegExps[Symbol.toStringTag] = "core.RegExps";
}


RegExps.alpha = /[a-zàáâãäçèéêëìíîïñòóôöùúûüýÿ]/i;
RegExps.alphanum = /[\da-zàáâãäçèéêëìíîïñòóôöùúûüýÿ]/i;
RegExps.digit = /\d/;
RegExps.digits = /\d+/;
RegExps.paragraphs = /\n\r?|\r/g;
RegExps.whiteSpace = /\s/;
RegExps.whiteSpaces = /\s+/;


/**
 * @param {string} s
 * @returns {string}
 */
RegExps.escapeString = function escapeString(s) {
	tc.expectString(s);
	return s.replace(/[!$()*+.?[\\\]^|-]/g, (character) => `\\${character}`);
};

/**
 * @param {object} endings
 * @param {string} [flags=""]
 * @returns {RegExp}
 */
RegExps.fromEndings = function fromEndings(endings, flags = "") {
	const pattern = (
		`(${
			Object.keys(endings).sort(
				(a, b) => b.length - a.length
			).join("|")
		})$`
	);
	return new RegExp(pattern, flags);
};

export default RegExps;
