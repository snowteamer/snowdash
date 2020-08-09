/**
 * @file Arrays.ts - Utilities for array-like objects and values.
 *
 * All these functions expect an array-like value as first argument.
 * Some of these functions expect a mutable array-like object
 *   as first argument.
 *
 *
 * @note
 * Not all array-like values are iterable with a 'for...of' loop.
 * Not all indexable values are iterable with a 'for...of' loop.
 * Not all iterable values are array-like or even indexable.
 *
 * **bare array-like object**: an array-like object whose only own
 *   property names are its indices and its "length" property.
 *
 * Implementation note: since array-like objects are not always iterable,
 *   we often have to use old for-loops in the implementation,
 *   and to avoid using the spread operator or the 'Array.from()' function
 *   when copying or slicing them.
 */

/* eslint-disable unicorn/no-for-loop, unicorn/prefer-spread */

/**
 * @typedef {number} int
 */
/**
 * @typedef {number} uint
 */

/**
 * @template T
 * @typedef {function(T, uint?, ArrayLike<T>?): void} ArrayCallback
 */

/**
 * @template T, U
 * @typedef {function(T, uint?, ArrayLike<T>?): U} ArrayMappingFunction
 */

/**
 * @template T
 * @typedef {function(T, uint?, ArrayLike<T>?): boolean} ArrayPredicate
 */

/* eslint-disable jsdoc/valid-types */
/**
 * @template T
 * @typedef {T & {-readonly[P in keyof T]: T[P]}} Mutable<T>
 */
/* eslint-enable jsdoc/valid-types */

/**
 * @template T
 * @typedef {Mutable<ArrayLike<T>>} MutableArrayLike<T>
 */

/**
 * @template T
 * @typedef {function(T): boolean} Predicate
 */

type index = number;
type int = number;
type length = number;
type uint = number;

type ArrayCallback<T> = (element: T, index?: index, source?: T[]) => void;
type ArrayMappingFunction<T, U> = (element: T, index?: index, source?: T[]) => U;
type ArrayPredicate<T> = (element: T, index?: index, source?: T[]) => boolean;
type ArrayReducer<T, U> = (acc: U, element: T, index: index, source: T[]) => U;
type ArraySortFunction<T> = (element: T, other: T) => number;
type List<T> = ArrayLike<T>;
type Mutable<T> = T & {-readonly[P in keyof T]: T[P]};
type MutableArrayLike<T> = Mutable<ArrayLike<T>>; 
type NumberPropertyKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];
type Predicate<T> = (arg: T) => boolean;

import * as tc from "./tc.js";


const Arrays = {
	concat,
	every,
	filter,
	fill,
	find,
	findIndex,
	forEach,
	indexOf,
	map,
	reduce,
	shift,
	unshift,
	slice,
	some,
	sort,

	add,
	addAll,
	chunk,
	condense,
	contains,
	containsAll,
	copy,
	count,
	countBigram,
	countNgram,
	countWith,
	createArray2D,
	createBigrams,
	createCumulativeSums,
	createDuplicateSet,
	createFrequencyMap,
	createIndexMap,
	createIndexPairs,
	createNgrams,
	createPairs,
	createPermutation,
	createRange,
	cross,
	dedupe,	
	drop,
	dropWhile,
	generateCombinations,
	generateIndexCombinations,
	generateIndexPermutations,
	generatePermutations,
	generateTuples,
	getNeighborhood,
	getNeighborhoodOfSlice,
	getOwnPropertyNames,
	group,
	groupWith,
	indicesOf,
	indicesOfNgram,
	insertAt,
	isClean,
	isUnique,
	max,
	maxBy,
	maxPropertyValue,
	min,
	minBy,
	minPropertyValue,
	pluck,
	shallowEquals,
	sortBy,
	sortWith,
	swap,
	zip,
	[Symbol.toStringTag]: "snowdash.Arrays",
}

const call = Function.prototype.call.bind(Function.prototype.call);
const _map: <T, U>(list: List<T>, mapfn: ArrayMappingFunction<T, U>) => U[] = (
	Function.prototype.call.bind(Array.prototype.map)
);
function _reduce<T, U>(list: List<T>, fn: ArrayReducer<T, U>, initialValue: U): U;
function _reduce<T>(list: List<T>, fn: ArrayReducer<T, T>): T;
function _reduce(list: any, fn: any, initialValue?: any) {
	return Array.prototype.reduce.call(list, fn, initialValue);
}
const _slice: <T>(list: List<T>, from?: int, to?: int) => T[] = (
	Function.prototype.call.bind(Array.prototype.slice)
);
const _sort: <T>(list: List<T>, fn: ArraySortFunction<T>) => typeof list = (
	Function.prototype.call.bind(Array.prototype.sort)
);
const _splice = Function.prototype.call.bind(Array.prototype.splice);

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
export function every<T>(list: ArrayLike<T>, fn: ArrayPredicate<T>, thisArg?: any): boolean {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.every.call(list, fn, thisArg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uin} [from=0]
 * @param {uin} [to]
 * @returns {ArrayLike<T>}
 */
export function fill<T>(list: List<T>, arg: any, from: int = 0, to?: int): List<T> {
	tc.expectArrayLike(list);
	return Array.prototype.fill.call(list, arg, from, to);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {ArrayLike<T>}
 */
export function filter<T>(list: List<T>, predicate: ArrayPredicate<T>, thisArg?: any): List<T> {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	return Array.prototype.filter.call(list, predicate, thisArg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} thisArg
 * @returns {T}
 */
export function find<T>(list: List<T>, predicate: ArrayPredicate<T>, thisArg?: any): T | undefined {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	return Array.prototype.find.call(list, predicate, thisArg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} fn
 * @param {*} thisArg
 * @returns {int}
 */
export function findIndex<T>(list: List<T>, fn: ArrayPredicate<T>, thisArg?: any): int {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.findIndex.call(list, fn, thisArg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayCallback<T>} fn
 * @param {*} [thisArg]
 */
export function forEach<T>(list: List<T>, fn: ArrayCallback<T>, thisArg?: any) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	Array.prototype.forEach.call(list, fn, thisArg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uint} [start=0]
 * @returns {int}
 */
export function indexOf<T>(list: List<T>, arg: any, start = 0): int {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(start);
	return Array.prototype.indexOf.call(list, arg, start);
}

/**
 * @template T, U
 * @param {ArrayLike<T>} list
 * @param {ArrayMappingFunction<T, U>} mapfn
 * @param {*} [thisArg]
 * @returns {U[]}
 */
export function map<T, U>(list: List<T>, mapfn: ArrayMappingFunction<T, U>, thisArg?: any): U[] {
	tc.expectArrayLike(list);
	tc.expectFunction(mapfn);
	return Array.prototype.map.call(list, mapfn, thisArg) as U[];
}

/**
 * @template T, U
 * @param {ArrayLike<T>} list
 * @param {function(*, T, uint, ArrayLike<T>): *} fn
 * @param {U} [initialValue]
 * @returns {*}
 */
export function reduce<T, U>(list: List<T>, fn: ArrayReducer<T, U>, initialValue: U): U;
export function reduce<T>(list: List<T>, fn: ArrayReducer<T, T>): T;
export function reduce<T>(list: List<T>, fn: ArrayReducer<T, any>, initialValue?: any): any {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.reduce.call(list, fn, initialValue);
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T}
 */
export function shift<T>(list: List<T>): T {
	tc.expectArrayLike(list);
	return Array.prototype.shift.call(list);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @returns {boolean}
 */
export function some<T>(list: List<T>, predicate: ArrayPredicate<T>): boolean {
	tc.expectArrayLike(list);
	return Array.prototype.some.call(list, predicate);
}

/**
 * @param {MutableArrayLike<T>} list
 * @param {ArraySortFunction<T>} fn
 * @returns {MutableArrayLike<T>}
 */
export function sort<T>(list: MutableArrayLike<T>, fn?: ArraySortFunction<T>): typeof list {
	tc.expectArrayLike(list);
	return Array.prototype.sort.call(list, fn);
}

/**
 * @param {ArrayLike<T>} list
 * @param {*} arg
 * @returns {uint} The new length of the given object,
 *   like the native '.unshift()' method does.
 */
export function unshift<T>(list: List<T>, arg: any): uint {
	tc.expectArrayLike(list);
	return Array.prototype.unshift.call(list, arg);
}


// ====== OTHER ====== //


/**
 * @param {ArrayLike<T>} list
 * @param {T} arg
 */
export function add<T>(list: List<T>, arg: any) {
	tc.expectArrayLike(list);
	Array.prototype.push.call(list, arg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} otherList
 */
export function addAll<T>(list: List<T>, otherList: List<T>) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(otherList);
	for(let i = 0; i < otherList.length; i++) {
		Array.prototype.push.call(list, otherList[i]);
	}
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T}
 */
export function choose<T>(list: List<T>): T {
	tc.expectArrayLike(list);
	return list[Math.floor(list.length * Math.random())];
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} n
 * @returns {T[]}
 */
export function chooseTuple<T>(list: List<T>, n: length): T[] {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(n);
	const rv = new Array(n);
	for(let i = 0; i < n; i++) {
		rv[i] = list[Math.floor(list.length * Math.random())];
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} chunkSize
 * @returns {T[][]}
 * @note The last chunk may be shorter.
 */
export function chunk<T>(list: List<T>, chunkSize: uint): T[][] {
	tc.expectArrayLike(list);
	tc.expectStrictlyPositiveInteger(chunkSize);
	const n = chunkSize;
	const rv = [] as T[][];
	for(let i = 0; i < list.length; i += n) {
		rv[rv.length] = _slice(list, i, i + n);
	}
	return rv;
}

/**
 * A static version of `.concat()`.
 * Useful if the first argument has no '.concat()' method.
 *
 * @param {ArrayLike<*>} list
 * @param {...*} args
 * @returns {*[]}
 */
export function concat<T>(list: List<T>, ...args: any[]): any[] {
	tc.expectArrayLike(list);
	return Array.prototype.concat.apply(list, args);
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T[]} A new array in which subsequences of
 *   consecutive and identical elements are replaced by their first element.
 * @example Arrays.condense([1, 0, 1, 1, 2, 2, 2, 0]);
 * // [ 1, 0, 1, 2, 0 ]
 */
export function condense<T>(list: List<T>): T[] {
	if(list.length === 0) return [];
	let currentValue = list[0];
	const rv = [currentValue];
	for(let i = 1; i < list.length; i++) {
		if(list[i] !== currentValue) {
			currentValue = list[i];
			rv[rv.length] = list[i];
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @returns {boolean}
 */
export function contains<T>(list: List<T>, arg: any): boolean {
	tc.expectArrayLike(list);
	return Array.prototype.includes.call(list, arg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} otherList
 * @returns {boolean}
 */
export function containsAll<T>(list: List<T>, otherList: List<T>): boolean {
	tc.expectArrayLike(list);
	for(let i = 0; i < otherList.length; i++) {
		if(!Array.prototype.includes.call(list, otherList[i])) {
			return false;
		}
	}
	return true;
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 */
export function copy<T>(list: List<T>): List<T> {
	tc.expectArrayLike(list);
	return Array.prototype.slice.call(list, 0);
}

/**
 * Returns the number of occurences of the given value among
 * the elements of the given array-like value, using strict equality.
 *
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @returns {uint}
 */
export function count<T>(list: List<T>, arg: any): uint {
	tc.expectArrayLike(list);
	let rv = 0;
	for(let i = 0; i < list.length; i++) {
		if(list[i] === arg) ++rv;
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {[T, T]} bigram
 * @returns {uint}
 */
export function countBigram<T>(list: List<T>, bigram: [T, T]): uint {
	tc.expectArrayLike(list);
	tc.expectArrayLike(bigram);
	const [a, b] = bigram;
	let rv = 0;
	for(let i = 0; i < list.length - 1; i++) {
		if(list[i] === a && list[i + 1] === b) {
			++rv;
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {uint}
 */
export function countWith<T>(list: List<T>, predicate: ArrayPredicate<T>, thisArg?: any): uint {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	let rv = 0;
	for(let i = 0; i < list.length; ++i) {
		if(call(predicate, thisArg, list[i], i, list)) rv++;
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @returns {uint}
 * @example Arrays.countNgram("mississippi", "si"); // 2
 */
export function countNgram<T>(list: List<T>, ngram: List<T>): uint {
	tc.expectArrayLike(list);
	if(!list.length) return 0;
	tc.expectNonEmptyArrayLike(ngram);
	let rv = 0;
	const listLength = list.length;
	const ngramLength = ngram.length;
	// eslint-disable-next-line no-labels
	outer: for(let i = 0; i < listLength - ngramLength + 1; i++) {
		if(list[i] === ngram[0]) {
			for(let j = 1; j < ngramLength; j++) {
				// eslint-disable-next-line no-labels
				if(list[i + j] !== ngram[j]) continue outer;
			}
			++rv;
		}
	}
	return rv;
}

/**
 * @param {uint} m
 * @param {uint} n
 * @param {*=} defaultValue
 * @returns {T[][]}
 */
export function createArray2D(
	m: uint,
	n: uint,
	defaultValue: any = undefined,
): any[][] {
	tc.expectPositiveInteger(m);
	tc.expectPositiveInteger(n);
	const rv = new Array(m);
	for(let i = 0; i < m; i++) rv[i] = new Array(n);
	if(typeof defaultValue !== "undefined") {
		if(tc.isPrimitive(defaultValue)) {
			for(let i = 0; i < m; i++) for(let j = 0; j < n; j++) {
				rv[i][j] = defaultValue;
			}
		} else {
			for(let i = 0; i < m; i++) for(let j = 0; j < n; j++) {
				rv[i][j] = Object.create(defaultValue);
			}
		}
	}
	return rv;
}

/**
 * @param {T[]} list
 * @returns {T[][]}
 * @example Arrays.createBigrams([1, 2, 3, 4]);
 * // [[1, 2], [2, 3], [3, 4]]
 * @note Returned bigrams will always be plain 2-element arrays,
 *   notwithstanding the constructor of the given list.
 */
export function createBigrams<T>(list: List<T>): T[][] {
	tc.expectArrayLike(list);
	const rv = [] as [T, T][];
	for(let i = 0; i < list.length - 1; ++i) {
		rv[rv.length] = [list[i], list[i + 1]];
	}
	return rv;
}

/**
 * @param {(number[] | string[])} list
 * @returns {(number[] | string[])}
 * @example Arrays.createCumulativeSums([1, 2, 3, 4]); // [1, 3, 6, 10]
 */
export function createCumulativeSums(list: List<number>): number[] {
	tc.expectArrayLike(list);
	return _reduce(
		list,
		(acc, element, index) => {
			acc[index] = (index > 0 ? acc[index - 1] + element : element);
			return acc;
		},
		[] as number[],
	);
}

/**
 * @param {ArrayLike<T>} list
 * @returns {Set<T>}
 */
export function createDuplicateSet<T>(list: List<T>): Set<T> {
	tc.expectArrayLike(list);
	const rv = new Set() as Set<T>;
	const visitedValues = new Set() as Set<T>;
	for(let i = 0; i < list.length; ++i) {
		const element = list[i];
		if(visitedValues.has(element)) {
			rv.add(element);
		}
		else visitedValues.add(element);
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @returns {Map<T, uint>}
 */
export function createFrequencyMap<T>(list: List<T>): Map<T, uint> {
	tc.expectArrayLike(list);
	const rv = new Map();
	for(let i = 0; i < list.length; ++i) {
		const element = list[i];
		rv.set(element, (rv.get(element) || 0) + 1);
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @returns {Map<T, uint[]>}
 */
export function createIndexMap<T>(list: List<T>): Map<T, index[]> {
	tc.expectArrayLike(list);
	const rv = new Map();
	for(let i = 0; i < list.length; ++i) {
		const element = list[i];
		if(rv.has(element)) rv.get(element).push(i);
		else rv.set(element, [i]);
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @returns {uint[][]}
 */
export function createIndexPairs<T>(list: List<T>): [index, index][] {
	tc.expectArrayLike(list);
	const rv = [] as [index, index][];
	const {length} = list;
	for(let i = 0; i < length - 1; ++i) {
		for(let j = i + 1; j < length; ++j) {
			rv[rv.length] = [i, j];
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} ngramLength
 * @returns {T[][]}
 * @note The last ngram may be shorter.
 */
export function createNgrams<T>(list: List<T>, ngramLength: length): T[][] {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(ngramLength);
	const rv = [] as T[][];
	for(let i = 0; i < list.length; ++i) {
		rv[rv.length] = _slice(list, i, i + ngramLength);
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T[][]}
 */
export function createPairs<T>(list: List<T>): T[][] {
	tc.expectArrayLike(list);
	const rv = [] as T[][];
	for(let i = 0; i < list.length - 1; ++i) {
		for(let j = i + 1; j < list.length; ++j) {
			rv[rv.length] = [list[i], list[j]];
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<uint>} indices
 * @returns {T[]}
 */
export function createPermutation<T>(list: List<T>, indices: index[]): T[] {
	tc.expectArrayLike(list);
	tc.expectArrayLike(indices);
	if(list.length !== new Set(indices).size) {
		throw new TypeError("Invalid permutation indices.");
	}
	return _map(indices, index => list[index]);
}

/**
 * @param {index} to
 * @returns {index[]}
 */
export function createRange(to: index): index[] {
	tc.expectPositiveInteger(to);
	return [...new Array(to).keys()];
}

/**
 * @template T, U
 * @param {T[]} list
 * @param {U[]} otherList
 * @returns {[T, U][]} The cartesian product of the given collections.
 * @example Arrays.cross("ABCD", "1234");
 */
export function cross<T, U>(list: List<T>, otherList: List<U>): [T, U][][] {
	tc.expectArrayLike(list);
	tc.expectArrayLike(otherList);
	return _map(list, (element) => _map(otherList, (f) => [element, f]));
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 * @see nub (Haskell), uniq (Lodash)
 */
export function dedupe<T>(list: List<T>): T[] {
	tc.expectArrayLike(list);
	return [...new Set(_slice(list))] as T[];
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} n
 * @returns {T[]}
 * @see https://lodash.com/docs/#drop
 */
export function drop<T>(list: List<T>, n: uint): T[] {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(n);
	return _slice(list, n);
}

/**
 * @param {ArrayLike<T>} list
 * @param {Predicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {T[]}
 * @see https://lodash.com/docs/#dropWhile
 */
export function dropWhile<T>(list: List<T>, predicate: Predicate<T>, thisArg?: any): T[] {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	const index = Array.prototype.findIndex.call(
		list,
		(element) => !predicate(element),
		thisArg,
	);
	if(index === -1) return [];
	return _slice(list, index);
}

/**
 * @generator
 * @param {ArrayLike<T>} list
 * @param {uint} k
 * @yields {T[]}
 * @see https://en.wikipedia.org/wiki/Combination
 * @example
 * [...Arrays.generateCombinations(["A", "B", "C", "D", "E"], 3)];
 */
export function* generateCombinations<T>(list: List<T>, k: uint): Generator<T[]> {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(k);
	tc.expectPositiveInteger(list.length - k);
	const n = list.length;
	for(const indices of Arrays.generateIndexCombinations(n, k)) {
		yield indices.map((i) => list[i]);
	}
}

/**
 * @generator
 * @param {uint} n
 * @param {uint} k
 * @yields {uint[]}
 * @see https://en.wikipedia.org/wiki/Combination
 * @example
 * [...Arrays.generateIndexCombinations(5, 3)];
 */
export function* generateIndexCombinations(n: uint, k: uint): Generator<index[]> {
	tc.expectPositiveInteger(n);
	tc.expectPositiveInteger(k);
	const indices = Arrays.createRange(k);
	yield indices.slice() as index[];
	if(!k || !n) return;
	while(true) {
		let i = k - 1;
		let max = n - 1;
		while(indices[i] === max) {
			--i;
			--max;
			if(i < 0) return;
		}
		let x = ++indices[i];
		while(i < indices.length - 1) {
			indices[++i] = ++x;
		}
		yield indices.slice() as index[];
	}
}

/**
 * @generator
 * @param {uint} n
 * @param {uint} k
 * @yields {uint[]}
 * @example [...Arrays.generateIndexPermutations(5, 3)];
 */
export function* generateIndexPermutations(n: uint, k: uint): Generator<index[]> {
	const indices = new Array(k).fill(0) as index[];
	yield indices.slice();
	if(!k || !n) return;
	while(true) {
		let i = k - 1;
		const max = n - 1;
		while(indices[i] === max) {
			--i;
			if(i < 0) return;
		}
		++indices[i];
		while(i < indices.length - 1) {
			indices[++i] = 0;
		}
		yield indices.slice();
	}
}

/**
 * @generator
 * @param {ArrayLike<T>} list
 * @yields {T[]}
 * @see Heap's algorithm - https://en.wikipedia.org/wiki/Heap%27s_algorithm
 * @example [...Arrays.generatePermutations(["A", "B", "C"])];
 */
export function* generatePermutations<T>(list: List<T>): Generator<T[]> {
	tc.expectArrayLike(list);
	const perm = _slice(list);
	const generate = function* generate(n: length): Generator<T[]> {
		if(!n) yield perm.slice();
		else for(let i = 0; i < n; i++) {
			yield* generate(n - 1);
			if(n % 2 === 0) Arrays.swap(perm, i, n - 1);
			else Arrays.swap(perm, 0, n - 1);
		}
	};
	yield* generate(list.length);
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} k
 * @yields {T[]}
 * @example [...Arrays.generateTuples(["A", "B", "C", "D", "E"], 3)];
 */
export function* generateTuples<T>(list: List<T>, k: uint): Generator<T[]> {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(k);
	const n = list.length;
	for(const indices of Arrays.generateIndexPermutations(n, k)) {
		yield indices.map((index) => list[index]);
	}
}

/**
 * @param {ArrayLike<T>} list
 * @param {int} index
 * @param {uint} [radius=1]
 * @returns {T[]}
 * @example
 * Arrays.getNeighborhood("azertyuiop", 3, 2); // [ 'z', 'e', 'r', 't', 'y' ]
 */
export function getNeighborhood<T>(list: List<T>, index: index, radius = 1): T[] {
	tc.expectInteger(index);
	tc.expectPositiveInteger(radius);
	const origin = (index >= 0 ? index : list.length + index);
	return _slice(
		list,
		Math.max(0, origin - radius),
		origin + radius + 1
	);
}

/**
 * The returned slice may be shorter if a boundary was encountered.
 *
 * @param {ArrayLike<T>} list
 * @param {int} sliceStart
 * @param {int} sliceEnd
 * @param {uint} [radius=1]
 * @returns {T[]}
 * @example
 * Arrays.getNeighborhoodOfSlice("azertyuiop", 2, 3); // [ 'z', 'e', 'r', 't', 'y' ]
 */
export function getNeighborhoodOfSlice<T>(
	list: List<T>,
	sliceStart: int,
	sliceEnd: int,
	radius = 1
): T[] {
	tc.expectInteger(sliceStart);
	tc.expectInteger(sliceEnd);
	tc.expectPositiveInteger(radius);
	const slice0 = (sliceStart >= 0 ? sliceStart : list.length + sliceStart);
	const slice1 = (sliceEnd >= 0 ? sliceEnd: list.length + sliceEnd);
	return _slice(
		list,
		Math.max(0, slice0 - radius),
		slice1 + radius
	);
}

/**
 * Like 'Object.getOwnPropertyNames()', but does not include element indices.
 *
 * @param {ArrayLike<*>} list
 * @returns {string[]}
 */
export function getOwnPropertyNames(list: List<any>): string[] {
	tc.expectArrayLike(list);
	const {length} = list;
	const maxLength = 2 ** 32 - 1;
	const rv = [] as string[];
	for(const key of Object.getOwnPropertyNames(list)) {
		if(/^0$|^[1-9]\d*$/.test(key)) {
			const keyAsInt = Number.parseInt(key, 10);
			if(keyAsInt > maxLength || keyAsInt >= length) rv[rv.length] = key;
		}
		else rv[rv.length] = key;
	}
	return rv;
}

/**
 * Same as 'Arrays.chunk', but starts a new chunk whenever the visited element
 * is distinct from the previous one.
 *
 * @param {ArrayLike<T>} list
 * @returns {T[][]}
 */
export function group<T>(list: List<T>): T[][] {
	tc.expectArrayLike(list);
	const rv = [] as T[][];
	if(!list.length) return rv;
	let currentValue = list[0];
	let currentChunk = [currentValue];
	rv[0] = currentChunk;
	for(let i = 1; i < list.length; i++) {
		if(list[i] === currentValue) {
			currentChunk[currentChunk.length] = currentValue;
		} else {
			currentValue = list[i];
			currentChunk = [currentValue];
			rv[rv.length] = currentChunk;
		}
	}
	return rv;
}

/**
 * @template T, U
 * @param {ArrayLike<T>} list
 * @param {function(T, uint, ArrayLike<T>): U} f
 * @param {*} [thisArg]
 * @returns {T[][]}
 * @see https://docs.python.org/3/library/itertools.html#itertools.groupby
 */
export function groupWith<T, U>(
	list: List<T>,
	f: (element: T, index: index, source: ArrayLike<T>) => U,
	thisArg?: any
): T[][] {
	tc.expectArrayLike(list);
	tc.expectFunction(f);
	const rv = new Array();
	if(!list.length) return rv;
	let currentValue = call(f, thisArg, list[0], 0, list);
	let currentChunk = [currentValue];
	rv[0] = currentChunk;
	for(let i = 1; i < list.length; i++) {
		const newValue = call(f, thisArg, list[i], i, list);
		if(newValue === currentValue) {
			currentChunk[currentChunk.length] = list[i];
		} else {
			currentValue = newValue;
			currentChunk = [list[i]];
			rv[rv.length] = currentChunk;
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uint} [from=0]
 * @returns {uint[]}
 */
export function indicesOf<T>(list: List<T>, arg: any, from = 0): uint[] {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(from);
	let i = from;
	const rv = [] as index[];
	do {
		i = Array.prototype.indexOf.call(list, arg, i);
		if(i === -1) break;
		rv[rv.length] = i;
		i += 1;
	} while(i !== -1);
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @param {uint} [from]
 * @returns {uint[]}
 */
export function indicesOfNgram<T, U extends T>(list: List<T>, ngram: List<U>, from = 0): uint[] {
	tc.expectArrayLike(list);
	tc.expectNonEmptyArrayLike(ngram);
	tc.expectPositiveInteger(from);
	const rv = [] as index[];
	const element = ngram[0];
	const to = list.length - ngram.length + 1;
	// eslint-disable-next-line no-labels
	outer: for(let i = from; i < to; i++) {
		if(list[i] === element) {
			for(let j = 1; j < ngram.length; j++) {
				// eslint-disable-next-line no-labels
				if(list[i + j] !== ngram[j]) continue outer;
			}
			rv[rv.length] = i;
		}
	}
	return rv;
}

/**
 * @param {MutableArrayLike<T>} list
 * @param {T} arg
 * @param {uint} index
 */
export function insertAt<T>(list: MutableArrayLike<T>, arg: any, index: index) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(index);
	if(index >= list.length) list[index] = arg;
	else _splice(list, index, 0, arg);
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} listToInsert
 * @param {uint} index
 */
export function insertSliceAt<T>(list: List<T>, listToInsert: List<T>, index: index) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(index);
	_splice(list, index, 0, ..._slice(listToInsert));
}

/**
 * @param {ArrayLike<T>} list
 * @returns {boolean}
 */
export function isClean<T>(list: List<T>): boolean {
	tc.expectArrayLike(list);
	if(typeof list === "string") return true;
	const names = Arrays.getOwnPropertyNames(list);
	if(names.length !== 1 || names[0] !== "length") return false;
	const descriptor = Object.getOwnPropertyDescriptor(list, "length");
	return (
		descriptor !== undefined
		&& "value" in descriptor
		&& descriptor.writable === true
		&& !descriptor.configurable
		&& !descriptor.enumerable
	);
}

/**
 * @param {ArrayLike<T>} list
 * @returns {boolean}
 */
export function isUnique<T>(list: List<T>): boolean {
	return new Set(_slice(list)).size === list.length;
}

/**
 * @template T, U, V
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<U>} other
 * @param {function(T, U): V} binaryFunction
 * @param {*} [thisArg]
 * @returns {V[]}
 */
export function map2<T, U, V>(
	list: List<T>,
	other: List<U>,
	binaryFunction: (element: T, other: U) => V,
	thisArg?: any
): V[] {
	tc.expectArrayLike(list);
	tc.expectArrayLike(other);
	tc.expectFunction(binaryFunction);
	const length = Math.max(list.length, other.length);
	const rv = new Array(length);
	for(let i = 0; i < length; i++) {
		if(i in list && i in other) {
			rv[i] = call(binaryFunction, thisArg, list[i], other[i]);
		}
	}
	return rv;
}

/**
 * Like the native 'Math.max()' function, but without quirks:
 *
 * - If the given argument is empty,
 *     throws an error instead of returning '-Infinity'.
 * - If some element is not a JavaScript number,
 *     throws an error instead of trying to coerce it to a number.
 * - If some element is missing or is 'NaN',
 *     throws an error instead of returning 'NaN'.
 *
 * @param {ArrayLike<number>} list
 * @returns {number}
 */
export function max(list: List<number>): number {
	tc.expectNonEmptyArrayLike(list);
	// Don't call 'tc.expectNumbers()' here.
	let rv = list[0];
	for(let i = 0; i < list.length; i++) {
		const element = list[i];
		if(typeof element !== "number") tc.throwNewTypeError("a number");
		// Checks for 'NaN'.
		if(element !== element) tc.throwNewTypeError("a regular number");
		if(element > rv) rv = element;
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T}
 */
export function maxBy<T extends any[] & {[key: string]: number}, K extends NumberPropertyKeys<T>>(
	list: List<T>,
	propertyKey: K
): T {
	tc.expectNonEmptyArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	let rv = list[0];
	tc.expectNonNullable(rv);
	let max = rv[propertyKey];
	tc.expectNumber(max);
	if(Number.isNaN(max)) tc.throwNewTypeError("a regular number");
	for(let i = 0; i < list.length; i++) {
		const element = list[i];
		if(element === null || element === undefined) {
			tc.throwNewTypeError("neither 'null' nor 'undefined'");
		}
		const propertyValue = element[propertyKey];
		if(typeof propertyValue !== "number") {
			tc.throwNewTypeError("a regular number");
		}
		if(Number.isNaN(propertyValue)) {
			tc.throwNewTypeError("a regular number");
		}
		if(propertyValue > max) {
			max = propertyValue;
			rv = element;
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function maxPropertyValue<T extends any[] & {[key: string]: number}, K extends NumberPropertyKeys<T>>(
	list: List<T>,
	propertyKey: K
): number {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	return Arrays.min(_map(list, (element) => element[propertyKey]));
}

/**
 * Like the native 'Math.min()' function, but without quirks:
 *
 * - If the given argument is empty,
 *     throws an error instead of returning 'Infinity'.
 * - If some element is not a JavaScript number,
 *     throws an error instead of trying to coerce it to a number.
 * - If some element is missing or is 'NaN',
 *     throws an error instead of returning 'NaN'.
 *
 * @param {ArrayLike<number>} list
 * @returns {number}
 */
export function min(list: List<number>): number {
	tc.expectNonEmptyArrayLike(list);
	// Don't call 'tc.expectNumbers()' here.
	let rv = list[0];
	for(let i = 0; i < list.length; i++) {
		const element = list[i];
		if(typeof element !== "number") tc.throwNewTypeError("a number");
		// Checks for 'NaN'.
		if(element !== element) tc.throwNewTypeError("a regular number");
		if(element < rv) rv = element;
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T}
 * @example Arrays.minBy("Lorem ipsum sit amet".split(" "), "length");
 */
export function minBy<T extends any[] & {[key: string]: number}, K extends NumberPropertyKeys<T>>(
	list: List<T>,
	propertyKey: K
): T {
	tc.expectNonEmptyArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	let rv = list[0];
	tc.expectNonNullable(rv);
	let min = rv[propertyKey];
	tc.expectNumber(min);
	if(Number.isNaN(min)) tc.throwNewTypeError("a regular number");
	for(let i = 0; i < list.length; i++) {
		const element = list[i];
		if(element === null || element === undefined) {
			tc.throwNewTypeError("neither 'null' nor 'undefined'");
		}
		const propertyValue = element[propertyKey];
		if(typeof propertyValue !== "number") {
			tc.throwNewTypeError("a regular number");
		}
		if(Number.isNaN(propertyValue)) {
			tc.throwNewTypeError("a regular number");
		}
		if(propertyValue < min) {
			min = propertyValue;
			rv = element;
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function minPropertyValue<T, K extends NumberPropertyKeys<T>>(
	list: List<T>,
	propertyKey: K
): number {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	try {
		return Arrays.min(_map(list, (element) => (<unknown>element[propertyKey]) as number));
	} catch (error) {
		throw error;
	}
}

/**
 * @param {ArrayLike<*>} list
 * @param {PropertyKey} propertyKey
 * @returns {any[]}
 */
export function pluck<T, K extends keyof T>(
	list: List<T>,
	propertyKey: K
): T[K][] {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	return _map(list, (element) => element[propertyKey]);
}

/**
 * Removes the first occurence of the given value.
 *
 * @param {ArrayLike<T>} list
 * @param {T} arg
 */
export function remove<T>(list: List<T>, arg: any) {
	tc.expectArrayLike(list);
	const index = Array.prototype.indexOf.call(list, arg);
	if(index === -1) return;
	_splice(list, index, 1);
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} index
 */
export function removeByIndex<T>(list: List<T>, index: index) {
	tc.expectArrayLike(list);
	_splice(list, index, 1);
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} i1
 * @param {uint} i2
 */
export function removeSlice<T>(list: List<T>, i1: int, i2: int) {
	tc.expectArrayLike(list);
	if(Array.isArray(list)) _splice(list, i1, i2 - i1);
	else throw new TypeError("Not implemented.");
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} nTimes
 * @returns {T[]}
 */
export function repeat<T>(list: List<T>, nTimes: uint): T[] {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(nTimes);
	const rv = new Array();
	let n = nTimes;
	while(n--) {
		for(let i = 0; i < list.length; i++) {
			rv[rv.length] = list[i];
		}
	}
	return rv;
}

/**
 * Replace any occurence of 'element' with 'replacement'.
 *
 * @param {ArrayLike<T>} list
 * @param {T} element
 * @param {T} replacement
 * @returns {T[]}
 */
export function replace<T>(list: List<T>, element: T, replacement: T): T[] {
	tc.expectArrayLike(list);
	const rv = _slice(list);
	for(let i = 0; i < list.length; i++) {
		if(list[i] === element) rv[i] = replacement;
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @returns {ArrayLike<T>}
 */
export function replaceNgram<T>(list: List<T>, ngram: List<T>): List<T> {
	tc.expectArrayLike(list);
	tc.expectArrayLike(ngram);
	const rv = _slice(list);
	const indices = Arrays.indicesOfNgram(list, ngram);
	for(const index of indices) {
		for(let j = 0; j < ngram.length; j++) {
			rv[index + j] = ngram[j];
		}
	}
	return rv;
}

/**
 * @param {ArrayLike<*>} list
 * @param {ArrayLike<*>} otherList
 * @returns {boolean}
 */
export function shallowEquals<T, U extends T>(list: List<T>, otherList: List<U>): boolean {
	tc.expectArrayLike(list);
	tc.expectArrayLike(otherList);
	if(list === otherList) return true;
	if(list.length !== otherList.length) return false;
	for(let i = 0; i < list.length; i++) {
		if(list[i] !== otherList[i]) return false;
	}
	return true;
}

/**
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 */
export function shuffle<T>(list: List<T>): typeof list {
	tc.expectArrayLike(list);
	const rv = new Array(list.length);
	for(let i = 0; i < list.length; i++) {
		const n = i + Math.floor((list.length - i) * Math.random());
		const element = rv[i];
		rv[i] = (
			rv[n] === null || rv[n] === undefined
			? list[n]
			: rv[n]
		);
		rv[n] = (
			element === null || element === undefined
			? list[i]
			: element
		);
	}
	return rv;
}

/**
 * @param {ArrayLike<T>} list
 * @param {uint} [from=0]
 * @param {uint} [to]
 * @returns {T[]}
 */
export function slice<T>(list: List<T>, from: int = 0, to?: int): T[] {
	tc.expectArrayLike(list);
	tc.expectInteger(from);
	if(Math.abs(from) > list.length) {
		throw new RangeError("'Math.abs(from)' is greater than 'list.length'.");
	}
	if(to === undefined) {
		return Array.prototype.slice.call(list, from);
	}
	tc.expectInteger(to);
	if(to > list.length) {
		throw new RangeError("argument 'to' is greater than 'list.length'.");
	}
	return Array.prototype.slice.call(list, from, to);
}

/**
 * @param {ArrayLike<T>} list
 * @param {string} propertyKey
 * @returns {ArrayLike<T>}
 */
export function sortBy<T, K extends keyof T>(list: List<T>, propertyKey: K): typeof list {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	return _sort(list, (a, b) => (a[propertyKey] >= b[propertyKey] ? 1 : -1));
}

/**
 * @param {ArrayLike<T>} list
 * @param {Function} f
 * @returns {ArrayLike<T>}
 */
export function sortWith<T>(list: List<T>, f: (element: T) => number): typeof list {
	tc.expectArrayLike(list);
	tc.expectFunction(f);
	return _sort(list, (a, b) => (f(a) >= f(b) ? 1 : -1));
}

/**
 * @param {ArrayLike<number>} list
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
export function sum(list: List<number>): number {
	tc.expectNumbers(list);
	return _reduce(list, (acc, element) => acc + element, 0);
}

/**
 * @param {ArrayLike<object>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 * @note If the given array-like is empty, then 0 will be returned.
 */
export function sumBy(list: List<{[key: number]: number}>, propertyKey: index): number | never;
export function sumBy(list: List<{[key: string]: number}>, propertyKey: string): number | never;
export function sumBy(list: List<any>, propertyKey: PropertyKey): number | never {
	tc.expectNonPrimitives(list);
	tc.expectPropertyKey(propertyKey);
	return _reduce(
		list,
		(acc, element) => {
			if(typeof element[propertyKey] === "number") {
				return acc + element[propertyKey];
			}
			throw new TypeError("element[propertyKey] is not a number");
		},
		0
	);
}

/**
 * @param {ArrayLike<T>} list
 * @param {function(T): number} fn
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
export function sumWith<T>(list: List<T>, fn: (element: T) => number): number {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return _reduce(list, (acc: number, element: T) => acc + fn(element), 0);
}

/**
 * @param {MutableArrayLike<T>} list
 * @param {uint} i1
 * @param {uint} i2
 */
export function swap<T>(list: MutableArrayLike<T>, i1: index, i2: index) {
	tc.expectArrayLike(list);
	const element = list[i1];
	list[i1] = list[i2];
	list[i2] = element;
}

/**
 * @param {...ArrayLike<T>} lists
 * @returns {(T[][] | never[])}
 */
export function zip<T>(...lists: List<T>[]): (T[][] | never[]) {
	tc.expectArrayLikes(lists);
	const minLength = Arrays.minPropertyValue(lists, "length") as number;
	const rv = new Array(minLength);
	for(let i = 0; i < minLength; i++) {
		rv[i] = _map(lists, (list) => list[i]);
	}
	return rv;
}

export default Arrays;
