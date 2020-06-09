/**
 * @file Strings.js - Utilities to work with strings.
 */

/**
 * @typedef {number} uint
 */

import * as tc from "tc";
import RegExps from "./RegExps";

const Strings = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	Strings[Symbol.toStringTag] = "core.Strings";
}


// Used by 'Strings.escape(s)'.
const escapeSequencesByCharacter = {
	"\b": "\\b",
	"\f": "\\f",
	"\n": "\\n",
	"\r": "\\r",
	"\t": "\\t",
	"'": "\\'",
	"\"": "\\\"",
	"\\": "\\\\",
};

Strings.ALPHABET = "abcdefghijklmnopqrstuvwxyz";

/**
 * @param {string} text
 * @param {object} [options]
 * @param {string} [options.newline="\n"]
 * @param {string} [options.tab="\t"]
 * @returns {string}
 */
Strings.collapseWhiteSpace = function collapseWhiteSpace(
	text,
	options = {newline: "\n", tab: "\t"},
) {
	tc.expectString(text);
	tc.expectString(options.newline);
	tc.expectString(options.tab);
	return text.replace(
		/\s{2,}/g,
		(ws) => (
			/[\n\r]/.test(ws)
			? options.newline
			: /\t/.test(ws)
			? options.tab
			: " "
		),
	);
};

/**
 * @param {string} s1
 * @param {string | RegExp} s2
 * @returns {uint}
 */
Strings.countOccurencesOf = function countOccurencesOf(s1, s2) {
	tc.expectString(s1);
	tc.expectNonEmptyString(s2);
	return (s1.match(new RegExp(s2, "g")) || "").length;
};

/**
 * @param {string} s
 * @param {RegExp} re
 * @returns {uint}
 */
Strings.countRegExpMatches = function countRegExpMatches(s, re) {
	tc.expectString(s);
	tc.expectRegExp(re);
	const globalRegExp = (re.global ? re : new RegExp(re.source, "g"));
	return (s.match(globalRegExp) || "").length;
};

/**
 * @param {string} s
 * @param {uint} n
 * @returns {string}
 */
Strings.ellipsis = function ellipsis(s, n) {
	tc.expectString(s);
	tc.expectPositiveInteger(n);
	return n && s.length > n ? `${s.slice(0, n - (1 + "...".length))}...` : s;
};

/**
 * @param {string} s1
 * @param {string} s2
 * @returns {boolean}
 */
Strings.equalsIgnoreCase = function equalsIgnoreCase(s1, s2) {
	tc.expectString(s1);
	tc.expectString(s2);
	return s1.toLowerCase() === s2.toLowerCase();
};

/**
 * Escapes control characters, using default escape sequences.
 *
 * @param {string} s
 * @returns {string}
 */
Strings.escape = function escape(s) {
	tc.expectString(s);
	return s.replace(
		// eslint-disable-next-line no-control-regex
		/[\u0000-\u001F"'\\]/g,
		(x) => escapeSequencesByCharacter[x],
	);
};

const tableTo64 = (
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
);

const tableFrom64 = (
	tableTo64
	.split("")
	.reduce((acc, character, index) => ((acc[character] = index), acc), {})
);

/**
 * @param {string} s
 * @returns {string}
 */
Strings.fromBase64 = function fromBase64(s) {
	tc.expectString(s);
	const binaryString = (
		s.split("")
		.map((character) => (
			character === "="
			? ""
			: tableFrom64[character].toString(2).padStart(6, "0")
		))
		.join("")
	);
	const chunks = binaryString.match(/.{8}|.+/g) || [];
	return (
		chunks
		.map((chunk) => (
			String.fromCharCode(Number.parseInt(chunk.padEnd(8, "0"), 2))
		))
		.join("")
	);
};

/**
 * @param {string} s
 * @param {RegExp} re
 * @returns {uint}
 */
Strings.indexOfRegExp = function indexOfRegExp(s, re) {
	tc.expectString(s);
	tc.expectRegExp(re);
	return s.search(re);
};

/**
 * @param {string} s
 * @param {string} t
 * @param {uint} i
 * @returns {string}
 */
Strings.insertAt = function insertAt(s, t, i) {
	tc.expectString(s);
	tc.expectString(t);
	tc.expectPositiveInteger(i);
	if(i) return s.slice(0, i) + t + s.slice(i);
	return t + s;
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isAlpha = function isAlpha(s) {
	tc.expectString(s);
	return !/[^A-Za-z]/.test(s);
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isAlphanumeric = function isAlphanumeric(s) {
	tc.expectString(s);
	return !/[^\dA-Za-z]/.test(s);
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isDigit = function isDigit(s) {
	tc.expectString(s);
	return RegExps.digit.test(s);
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isLetter = function isLetter(s) {
	tc.expectString(s);
	return s.length === 1 && RegExps.alpha.test(s);
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isLowerCase = function isLowerCase(s) {
	tc.expectString(s);
	return s === s.toLowerCase();
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isNumericString = function isNumericString(s) {
	tc.expectString(s);
	return typeof s === "string" && !Number.isNaN(Number.parseFloat(s));
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isUpperCase = function isUpperCase(s) {
	tc.expectString(s);
	return s === s.toUpperCase();
};

/**
 * @param {string} s
 * @returns {boolean}
 */
Strings.isWhiteSpace = function isWhiteSpace(s) {
	tc.expectString(s);
	return /^\s+$/.test(s);
};

/**
 * @param {string} s
 * @param {uint} n
 * @param {string} paddingString
 * @returns {string}
 */
Strings.padAfter = function padAfter(s, n, paddingString) {
	tc.expectString(s);
	return s.padEnd(n, paddingString);
};

/**
 * @param {string} s
 * @param {uint} n
 * @param {string} paddingString
 * @returns {string}
 */
Strings.padBefore = function padBefore(s, n, paddingString) {
	tc.expectString(s);
	return s.padStart(n, paddingString);
};

/**
 * @param {string} s
 * @param {uint} n
 * @returns {string}
 */
Strings.repeat = function repeat(s, n) {
	tc.expectString(s);
	return s.repeat(n);
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.reverse = function reverse(s) {
	tc.expectString(s);
	return s.split("").reverse().join("");
};

/**
 * @param {string} s
 * @returns {string[]}
 */
Strings.splitCharacters = function splitCharacters(s) {
	tc.expectString(s);
	return s.split("");
};

/**
 * @param {string} s
 * @returns {string[]}
 */
Strings.splitLines = function splitLines(s) {
	tc.expectString(s);
	return s.split(/\r\n?|\n/g);
};

/**
 * @param {string} s
 * @returns {string[]}
 */
Strings.splitNonEmptyLines = function splitLines(s) {
	tc.expectString(s);
	return s.split(/[\n\r]+/g);
};

/**
 * @param {string} s
 * @param {RegExp} re
 * @returns {boolean}
 */
Strings.startsWithRegExp = function startsWithRegExp(s, re) {
	tc.expectString(s);
	tc.expectRegExp(re);
	return s.search(re) === 0;
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.swapCase = function swapCase(s) {
	tc.expectString(s);
	const chars = [];
	for(const c of s) {
		chars[chars.length] = (
			c === c.toLowerCase()
			? c.toUpperCase()
			: c.toLowerCase()
		);
	}
	return chars.join("");
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toBase64 = function toBase64(s) {
	tc.expectString(s);
	if(!s.length) return "";
	const binaryString = (
		s.split("")
		.map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
		.join("")
	);
	const chunks = binaryString.match(/.{6}|.+/g) || [];
	const padding = "=".repeat(s.length % 3);
	return (
		chunks.map(
			(chunk) => tableTo64[Number.parseInt(chunk.padEnd(6, "0"), 2)],
		)
		.join("")
		+ padding
	);
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toCamelCase = function toCamelCase(s) {
	tc.expectString(s);
	const parts = s.split(/\W+/);
	if(parts.length === 1 && parts[0] === "") return "";
	for(let i = 1; i < parts.length; i++) {
		parts[i] = parts[i][0].toUpperCase() + parts[i].slice(1);
	}
	return parts.join("");
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toLowerCase = function toLowerCase(s) {
	tc.expectString(s);
	return s.toLowerCase();
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toProperCase = function toProperCase(s) {
	tc.expectString(s);
	return s[0].toUpperCase() + s.slice(1);
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toSnakeCase = function toSnakeCase(s) {
	tc.expectString(s);
	return (
		s.split(/[\s_-]|(?=[A-Z])/g)
		.join("_")
		.toLowerCase()
	);
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toSpinalCase = function toSpinalCase(s) {
	tc.expectString(s);
	return (
		s.split(/[\s_-]|(?=[A-Z])/g)
		.join("-")
		.toLowerCase()
	);
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toTitleCase = function toTitleCase(s) {
	tc.expectString(s);
	return s.replace(/\b[A-Za-z]/g, (match) => Strings.toProperCase(match));
};

/**
 * @param {string} s
 * @returns {string}
 */
Strings.toUpperCase = function toUpperCase(s) {
	tc.expectString(s);
	return s.toUpperCase();
};

/**
 * @param {string} s
 * @returns {string}
 * @see http://stackoverflow.com/questions/7225407/convert-camelcasetext-to-camel-case-text
 */
Strings.uncamelize = function uncamelize(s) {
	tc.expectString(s);
	const reCamelEdges = (
		/([A-Z](?=[A-Z][a-zé])|[^A-Z](?=[A-Z])|[A-Za-zé](?=[^A-Za-zé]))/g
	);
	return (
		s.replace(reCamelEdges, "$1 ")
		.split(" ")
		.map((part, i) => {
			if(
				i > 0
				&& part[1]
				&& part[1] === part[1].toLowerCase()
				&& part[1] !== part[1].toUpperCase()
			) return part.toLowerCase();
			return part;
		})
		.join(" ")
	);
};

export default Strings;
