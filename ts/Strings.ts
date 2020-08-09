/**
 * @file Strings.ts - Utilities to work with strings.
 */
type uint = number;


import * as tc from "./tc.js";
import RegExps from "./RegExps.js";

export const [Symbol.toStringTag] = "snowdash.Strings";


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
} as {[key: string]: string};

export const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

/**
 * @param {string} text
 * @param {object} [options]
 * @param {string} [options.newline="\n"]
 * @param {string} [options.tab="\t"]
 * @returns {string}
 */
export function collapseWhiteSpace(
	text: string,
	options = {newline: "\n", tab: "\t"},
): string {
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
}

/**
 * @param {string} s1
 * @param {string | RegExp} s2
 * @returns {uint}
 */
export function countOccurencesOf(s1: string, s2: string): uint {
	tc.expectString(s1);
	tc.expectNonEmptyString(s2);
	return (s1.match(new RegExp(s2, "g")) || "").length;
}

/**
 * @param {string} s
 * @param {RegExp} re
 * @returns {uint}
 */
export function countRegExpMatches(s: string, re: RegExp): uint {
	tc.expectString(s);
	tc.expectRegExp(re);
	const globalRegExp = (re.global ? re : new RegExp(re.source, "g"));
	return (s.match(globalRegExp) || "").length;
}

/**
 * @param {string} s
 * @param {uint} n
 * @returns {string}
 */
export function ellipsis(s: string, n: uint) {
	tc.expectString(s);
	tc.expectPositiveInteger(n);
	return n && s.length > n ? `${s.slice(0, n - (1 + "...".length))}...` : s;
}

/**
 * @param {string} s1
 * @param {string} s2
 * @returns {boolean}
 */
export function equalsIgnoreCase(s1: string, s2: string): boolean {
	tc.expectString(s1);
	tc.expectString(s2);
	return s1.toLowerCase() === s2.toLowerCase();
}

/**
 * Escapes control characters, using default escape sequences.
 *
 * @param {string} s
 * @returns {string}
 */
export function escape(s: string): string {
	tc.expectString(s);
	return s.replace(
		// eslint-disable-next-line no-control-regex
		/[\u0000-\u001F"'\\]/g,
		(x) => escapeSequencesByCharacter[x],
	);
}

const tableTo64 = (
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
);

const tableFrom64 = (
	tableTo64
	.split("")
	.reduce(
		(acc, character, index) => ((acc[character] = index), acc), {} as {[key: string]: number}
	)
);

/**
 * @param {string} s
 * @returns {string}
 */
export function fromBase64(s: string): string {
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
}

/**
 * @param {string} s
 * @param {RegExp} re
 * @returns {uint}
 */
export function indexOfRegExp(s: string, re: RegExp): uint {
	tc.expectString(s);
	tc.expectRegExp(re);
	return s.search(re);
}

/**
 * @param {string} s
 * @param {string} t
 * @param {uint} i
 * @returns {string}
 */
export function insertAt(s: string, t: string, i: uint): string {
	tc.expectString(s);
	tc.expectString(t);
	tc.expectPositiveInteger(i);
	if(i) return s.slice(0, i) + t + s.slice(i);
	return t + s;
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isAlpha(s: string): boolean {
	tc.expectString(s);
	return !/[^A-Za-z]/.test(s);
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isAlphanumeric(s: string): boolean {
	tc.expectString(s);
	return !/[^\dA-Za-z]/.test(s);
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isDigit(s: string): boolean {
	tc.expectString(s);
	return RegExps.digit.test(s);
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isLetter(s: string): boolean {
	tc.expectString(s);
	return s.length === 1 && RegExps.alpha.test(s);
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isLowerCase(s: string): boolean {
	tc.expectString(s);
	return s === s.toLowerCase();
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isNumericString(s: string): boolean {
	tc.expectString(s);
	return typeof s === "string" && !Number.isNaN(Number.parseFloat(s));
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isUpperCase(s: string): boolean {
	tc.expectString(s);
	return s === s.toUpperCase();
}

/**
 * @param {string} s
 * @returns {boolean}
 */
export function isWhiteSpace(s: string): boolean {
	tc.expectString(s);
	return /^\s+$/.test(s);
}

/**
 * @param {string} s
 * @param {uint} n
 * @param {string} paddingString
 * @returns {string}
 */
export function padAfter(s: string, n: uint, paddingString: string): string {
	tc.expectString(s);
	return s.padEnd(n, paddingString);
}

/**
 * @param {string} s
 * @param {uint} n
 * @param {string} paddingString
 * @returns {string}
 */
export function padBefore(s: string, n: uint, paddingString: string): string {
	tc.expectString(s);
	return s.padStart(n, paddingString);
}

/**
 * @param {string} s
 * @param {uint} n
 * @returns {string}
 */
export function repeat(s: string, n: uint): string {
	tc.expectString(s);
	return s.repeat(n);
}

/**
 * @param {string} s
 * @returns {string}
 */
export function reverse(s: string): string {
	tc.expectString(s);
	return s.split("").reverse().join("");
}

/**
 * @param {string} s
 * @returns {string[]}
 */
export function splitCharacters(s: string): string[] {
	tc.expectString(s);
	return s.split("");
}

/**
 * @param {string} s
 * @returns {string[]}
 */
export function splitLines(s: string): string[] {
	tc.expectString(s);
	return s.split(/\r\n?|\n/g);
}

/**
 * @param {string} s
 * @param {RegExp} re
 * @returns {boolean}
 */
export function startsWithRegExp(s: string,re: RegExp): boolean {
	tc.expectString(s);
	tc.expectRegExp(re);
	return s.search(re) === 0;
}

/**
 * @param {string} s
 * @returns {string}
 */
export function swapCase(s: string): string {
	tc.expectString(s);
	const chars = [] as string[];
	for(const c of s) {
		chars[chars.length] = (
			c === c.toLowerCase()
			? c.toUpperCase()
			: c.toLowerCase()
		);
	}
	return chars.join("");
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toBase64(s: string): string {
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
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toCamelCase(s: string): string {
	tc.expectString(s);
	const parts = s.split(/\W+/);
	if(parts.length === 1 && parts[0] === "") return "";
	for(let i = 1; i < parts.length; i++) {
		parts[i] = parts[i][0].toUpperCase() + parts[i].slice(1);
	}
	return parts.join("");
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toLowerCase(s: string): string {
	tc.expectString(s);
	return s.toLowerCase();
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toProperCase(s: string): string {
	tc.expectString(s);
	return s[0].toUpperCase() + s.slice(1);
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toSnakeCase(s: string): string {
	tc.expectString(s);
	return (
		s.split(/[\s_-]|(?=[A-Z])/g)
		.join("_")
		.toLowerCase()
	);
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toSpinalCase(s: string): string {
	tc.expectString(s);
	return (
		s.split(/[\s_-]|(?=[A-Z])/g)
		.join("-")
		.toLowerCase()
	);
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toTitleCase(s: string): string {
	tc.expectString(s);
	return s.replace(/\b[A-Za-z]/g, (match) => toProperCase(match));
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toUpperCase(s: string): string {
	tc.expectString(s);
	return s.toUpperCase();
}

/**
 * @param {string} s
 * @returns {string}
 * @see http://stackoverflow.com/questions/7225407/convert-camelcasetext-to-camel-case-text
 */
export function uncamelize(s: string): string {
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
}
