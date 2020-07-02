/**
 * @file Arrays.js - Utilities for array-like objects and values.
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

import * as tc from "tc";

const Arrays = {};

if(typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
	Arrays[Symbol.toStringTag] = "core.Arrays";
}

const call = Function.prototype.call.bind(Function.prototype.call);
const map = Function.prototype.call.bind(Array.prototype.map);
const reduce = Function.prototype.call.bind(Array.prototype.reduce);
const slice = Function.prototype.call.bind(Array.prototype.slice);
const sort = Function.prototype.call.bind(Array.prototype.sort);
const splice = Function.prototype.call.bind(Array.prototype.splice);

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
Arrays.every = function every(list, fn, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.every.call(list, fn, thisArg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uint} [from=0]
 * @param {uint} [to]
 * @returns {ArrayLike<T>}
 */
Arrays.fill = function fill(list, arg, from = 0, to = undefined) {
	tc.expectArrayLike(list);
	return Array.prototype.fill.call(list, arg, from, to);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {ArrayLike<T>}
 */
Arrays.filter = function filter(list, predicate, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	return Array.prototype.filter.call(list, predicate, thisArg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} thisArg
 * @returns {T}
 */
Arrays.find = function find(list, predicate, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	return Array.prototype.find.call(list, predicate, thisArg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} fn
 * @param {*} thisArg
 * @returns {int}
 */
Arrays.findIndex = function findIndex(list, fn, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.findIndex.call(list, fn, thisArg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayCallback<T>} fn
 * @param {*} [thisArg]
 */
Arrays.forEach = function forEach(list, fn, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	Array.prototype.forEach.call(list, fn, thisArg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uint} [start=0]
 * @returns {int}
 */
Arrays.indexOf = function indexOf(list, arg, start = 0) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(start);
	return Array.prototype.indexOf.call(list, arg, start);
};

/**
 * @template T, U
 * @param {ArrayLike<T>} list
 * @param {ArrayMappingFunction<T, U>} mapfn
 * @param {*} [thisArg]
 * @returns {U[]}
 */
Arrays.map = function map(list, mapfn, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(mapfn);
	// @ts-ignore
	return Array.prototype.map.call(list, mapfn, thisArg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} [from]
 * @param {uint} [to]
 * @returns {T[]}
 */
Arrays.slice = function slice(list, from = 0, to = undefined) {
	tc.expectArrayLike(list);
	if("1" in arguments) tc.expectInteger(from);
	if("2" in arguments) tc.expectInteger(to);
	return Array.prototype.slice.call(list, from, to);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} fn
 * @param {*} [thisArg]
 * @returns {boolean}
 */
Arrays.some = function some(list, fn, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.some.call(list, fn, thisArg);
};

/**
 * @template T, U
 * @param {ArrayLike<T>} list
 * @param {function(*, T, uint, ArrayLike<T>): *} fn
 * @param {U} [initialValue]
 * @returns {*}
 */
Arrays.reduce = function reduce(list, fn, initialValue = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	return Array.prototype.reduce.call(list, fn, initialValue);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T}
 */
Arrays.shift = function shift(list) {
	tc.expectArrayLike(list);
	return Array.prototype.shift.call(list);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {*} arg
 * @returns {uint} The new length of the given object,
 *   like the native '.unshift()' method does.
 */
Arrays.unshift = function unshift(list, arg) {
	tc.expectArrayLike(list);
	return Array.prototype.unshift.call(list, arg);
};


// ====== OTHER ====== //


/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 */
Arrays.add = function add(list, arg) {
	tc.expectArrayLike(list);
	Array.prototype.push.call(list, arg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} otherList
 */
Arrays.addAll = function addAll(list, otherList) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(otherList);
	Array.prototype.push.call(list, otherList);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T}
 */
Arrays.choose = function choose(list) {
	tc.expectArrayLike(list);
	return list[Math.floor(list.length * Math.random())];
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} n
 * @returns {T[]}
 */
Arrays.chooseTuple = function chooseTuple(list, n) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(n);
	const rv = new Array(n);
	for(let i = 0; i < n; i++) {
		rv[i] = list[Math.floor(list.length * Math.random())];
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} chunkSize
 * @returns {T[][]}
 * @note The last chunk may be shorter.
 */
Arrays.chunk = function chunk(list, chunkSize) {
	tc.expectArrayLike(list);
	tc.expectStrictlyPositiveInteger(chunkSize);
	const n = chunkSize;
	const rv = [];
	for(let i = 0; i < list.length; i += n) {
		rv[rv.length] = slice(list, i, i + n);
	}
	return rv;
};

/**
 * A static version of `.concat()`.
 * Useful if the first argument has no '.concat()' method.
 *
 * @param {ArrayLike<*>} list
 * @param {...*} args
 * @returns {*[]}
 */
Arrays.concat = function concat(list, ...args) {
	tc.expectArrayLike(list);
	return Array.prototype.concat.apply(list, args);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]} A new array in which subsequences of
 *   consecutive and identical elements are replaced by their first element.
 * @example Arrays.condense([1, 0, 1, 1, 2, 2, 2, 0]);
 * // [ 1, 0, 1, 2, 0 ]
 */
Arrays.condense = function condense(list) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @returns {boolean}
 */
Arrays.contains = function contains(list, arg) {
	tc.expectArrayLike(list);
	return Array.prototype.includes.call(list, arg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 */
Arrays.copy = function copy(list) {
	tc.expectArrayLike(list);
	return Array.prototype.slice.call(list, 0);
};

/**
 * Returns the number of occurences of the given value among
 * the elements of the given array-like value, using strict equality.
 *
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @returns {uint}
 */
Arrays.count = function count(list, arg) {
	tc.expectArrayLike(list);
	let rv = 0;
	for(let i = 0; i < list.length; i++) {
		if(list[i] === arg) ++rv;
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {[T, T]} bigram
 * @returns {uint}
 */
Arrays.countBigram = function countBigram(list, bigram) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {uint}
 */
Arrays.countWith = function countWith(list, predicate, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	let rv = 0;
	for(let i = 0; i < list.length; ++i) {
		if(call(predicate, thisArg, list[i], i, list)) rv++;
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @returns {uint}
 * @example Arrays.countNgram("mississippi", "si"); // 2
 */
Arrays.countNgram = function countNgram(list, ngram) {
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
};

/**
 * @template T
 * @param {uint} m
 * @param {uint} n
 * @param {*=} defaultValue
 * @returns {T[][]}
 */
Arrays.createArray2D = function createArray2D(
	m,
	n,
	defaultValue = undefined,
) {
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
};

/**
 * @template T
 * @param {T[]} list
 * @returns {T[][]}
 * @example Arrays.createBigrams([1, 2, 3, 4]);
 * // [[1, 2], [2, 3], [3, 4]]
 * @note Returned bigrams will always be plain 2-element arrays,
 *   notwithstanding the constructor of the given list.
 */
Arrays.createBigrams = function createBigrams(list) {
	tc.expectArrayLike(list);
	const rv = [];
	for(let i = 0; i < list.length - 1; ++i) {
		rv[rv.length] = [list[i], list[i + 1]];
	}
	return rv;
};

/**
 * @param {(number[] | string[])} list
 * @returns {(number[] | string[])}
 * @example Arrays.createCumulativeSums([1, 2, 3, 4]); // [1, 3, 6, 10]
 */
Arrays.createCumulativeSums = function createCumulativeSums(list) {
	tc.expectArrayLike(list);
	return reduce(
		list,
		(acc, element, index) => {
			acc[index] = (index > 0 ? acc[index - 1] + element : element);
			return acc;
		},
		[],
	);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {Set<T>}
 */
Arrays.createDuplicateSet = function createDuplicateSet(list) {
	tc.expectArrayLike(list);
	const rv = new Set();
	const visitedValues = new Set();
	for(let i = 0; i < list.length; ++i) {
		const element = list[i];
		if(visitedValues.has(element)) {
			rv.add(element);
		}
		else visitedValues.add(element);
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {Map<T, uint>}
 */
Arrays.createFrequencyMap = function createFrequencyMap(list) {
	tc.expectArrayLike(list);
	const rv = new Map();
	for(let i = 0; i < list.length; ++i) {
		const element = list[i];
		rv.set(element, (rv.get(element) || 0) + 1);
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {Map<T, uint[]>}
 */
Arrays.createIndexMap = function createIndexMap(list) {
	tc.expectArrayLike(list);
	const rv = new Map();
	for(let i = 0; i < list.length; ++i) {
		const element = list[i];
		if(rv.has(element)) rv.get(element).push(i);
		else rv.set(element, [i]);
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {uint[][]}
 */
Arrays.createIndexPairs = function createIndexPairs(list) {
	tc.expectArrayLike(list);
	const rv = [];
	const {length} = list;
	for(let i = 0; i < length - 1; ++i) {
		for(let j = i + 1; j < length; ++j) {
			rv[rv.length] = [i, j];
		}
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} ngramLength
 * @returns {T[][]}
 * @note The last ngram may be shorter.
 */
Arrays.createNgrams = function createNgrams(list, ngramLength) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(ngramLength);
	const rv = [];
	for(let i = 0; i < list.length; ++i) {
		rv[rv.length] = slice(list, i, i + ngramLength);
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[][]}
 */
Arrays.createPairs = function createPairs(list) {
	tc.expectArrayLike(list);
	const rv = [];
	for(let i = 0; i < list.length - 1; ++i) {
		for(let j = i + 1; j < list.length; ++j) {
			rv[rv.length] = [list[i], list[j]];
		}
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<uint>} indices
 * @returns {T[]}
 */
Arrays.createPermutation = function createPermutation(list, indices) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(indices);
	if(list.length !== indices.length) {
		throw new TypeError("'list.length !== indices.length'");
	}
	return map(indices, (_, i) => list[indices[i]]);
};

/**
 * @template T, U
 * @param {T[]} list
 * @param {U[]} otherList
 * @returns {[T, U]} The cartesian product of the given collections.
 * @example Arrays.cross("ABCD", "1234");
 */
Arrays.cross = function cross(list, otherList) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(otherList);
	// @ts-ignore
	return map(list, (element) => map(otherList, (f) => [element, f]));
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 * @see nub (Haskell), uniq (Lodash)
 */
Arrays.dedupe = function dedupe(list) {
	tc.expectArrayLike(list);
	return [...new Set(slice(list))];
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} n
 * @returns {T[]}
 * @see https://lodash.com/docs/#drop
 */
Arrays.drop = function drop(list, n) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(n);
	return slice(list, n);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {Predicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {T[]}
 * @see https://lodash.com/docs/#dropWhile
 */
Arrays.dropWhile = function dropWhile(list, predicate, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(predicate);
	const index = Array.prototype.findIndex.call(
		list,
		(element) => !predicate(element),
		thisArg,
	);
	if(index === -1) return [];
	return slice(list, index);
};

/**
 * @template T
 * @generator
 * @param {ArrayLike<T>} list
 * @param {uint} k
 * @yields {T[]}
 * @see https://en.wikipedia.org/wiki/Combination
 * @example
 * [...Arrays.generateCombinations(["A", "B", "C", "D", "E"], 3)];
 */
Arrays.generateCombinations = function* generateCombinations(list, k) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(k);
	tc.expectPositiveInteger(list.length - k);
	const n = list.length;
	for(const indices of Arrays.generateIndexCombinations(n, k)) {
		yield indices.map((i) => list[i]);
	}
};

/**
 * @generator
 * @param {uint} n
 * @param {uint} k
 * @yields {uint[]}
 * @see https://en.wikipedia.org/wiki/Combination
 * @example
 * [...Arrays.generateIndexCombinations(5, 3)];
 */
Arrays.generateIndexCombinations = function* generateIndexCombinations(n, k) {
	tc.expectPositiveInteger(n);
	tc.expectPositiveInteger(k);
	const indices = Arrays.createRange(0, k);
	yield indices.slice();
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
		yield indices.slice();
	}
};

/**
 * @generator
 * @param {uint} n
 * @param {uint} k
 * @yields {uint[]}
 * @example [...Arrays.generateIndexPermutations(5, 3)];
 */
Arrays.generateIndexPermutations = function* generateIndexPermutations(n, k) {
	const indices = new Array(k).fill(0);
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
};

/**
 * @template T
 * @generator
 * @param {ArrayLike<T>} list
 * @yields {T[]}
 * @see Heap's algorithm - https://en.wikipedia.org/wiki/Heap%27s_algorithm
 * @example [...Arrays.generatePermutations(["A", "B", "C"])];
 */
Arrays.generatePermutations = function* generatePermutations(list) {
	tc.expectArrayLike(list);
	const perm = slice(list);
	const generate = function* generate(n) {
		if(!n) yield perm.slice();
		else for(let i = 0; i < n; i++) {
			yield* generate(n - 1);
			if(n % 2 === 0) Arrays.swap(perm, i, n - 1);
			else Arrays.swap(perm, 0, n - 1);
		}
	};
	yield* generate(list.length);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} k
 * @yields {T[]}
 * @example [...Arrays.generateTuples(["A", "B", "C", "D", "E"], 3)];
 */
Arrays.generateTuples = function* generateTuples(list, k) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(k);
	const n = list.length;
	for(const indices of Arrays.generateIndexPermutations(n, k)) {
		yield indices.map((index) => list[index]);
	}
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {int} index
 * @param {uint} [radius=1]
 * @returns {T[]}
 * @example
 * Arrays.getNeighborhood("azertyuiop", 3, 2); // [ 'z', 'e', 'r', 't', 'y' ]
 */
Arrays.getNeighborhood = function getNeighborhood(list, index, radius = 1) {
	tc.expectInteger(index);
	tc.expectPositiveInteger(radius);
	const origin = (index >= 0 ? index : list.length + index);
	return slice(
		list,
		Math.max(0, origin - radius),
		origin + radius + 1
	);
};

/**
 * The returned slice may be shorter if a boundary was encountered.
 *
 * @template T
 * @param {ArrayLike<T>} list
 * @param {int} sliceStart
 * @param {int} sliceEnd
 * @param {uint} [radius=1]
 * @returns {T[]}
 * @example
 * Arrays.getNeighborhoodOfSlice("azertyuiop", 2, 3); // [ 'z', 'e', 'r', 't', 'y' ]
 */
Arrays.getNeighborhoodOfSlice = function getNeighborhoodOfSlice(
	list,
	sliceStart,
	sliceEnd,
	radius = 1
) {
	tc.expectInteger(sliceStart);
	tc.expectInteger(sliceEnd);
	tc.expectPositiveInteger(radius);
	const slice0 = (sliceStart >= 0 ? sliceStart : list.length + sliceStart);
	const slice1 = (sliceEnd >= 0 ? sliceEnd: list.length + sliceEnd);
	return slice(
		list,
		Math.max(0, slice0 - radius),
		slice1 + radius
	);
};

/**
 * Same as 'Arrays.chunk', but starts a new chunk whenever the visited element
 * is distinct from the previous one.
 *
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[][]}
 */
Arrays.group = function group(list) {
	tc.expectArrayLike(list);
	const rv = [];
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
};

/**
 * @template T, U
 * @param {ArrayLike<T>} list
 * @param {function(T, uint, ArrayLike<T>): U} f
 * @param {*} [thisArg]
 * @returns {T[][]}
 * @see https://docs.python.org/3/library/itertools.html#itertools.groupby
 */
Arrays.groupWith = function groupWith(list, f, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectFunction(f);
	const rv = [];
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uint} [from=0]
 * @returns {uint[]}
 */
Arrays.indicesOf = function indicesOf(list, arg, from = 0) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(from);
	let i = from;
	const rv = [];
	do {
		i = Array.prototype.indexOf.call(list, arg, i);
		if(i === -1) break;
		rv[rv.length] = i;
		i += 1;
	} while(i !== -1);
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @param {uint} [from]
 * @returns {uint[]}
 */
Arrays.indicesOfNgram = function indicesOfNgram(list, ngram, from = 0) {
	tc.expectArrayLike(list);
	tc.expectNonEmptyArrayLike(ngram);
	tc.expectPositiveInteger(from);
	const rv = [];
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
};

/**
 * @template T
 * @param {MutableArrayLike<T>} list
 * @param {T} arg
 * @param {uint} index
 */
Arrays.insertAt = function insertAt(list, arg, index) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(index);
	if(index >= list.length) list[index] = arg;
	else splice(list, index, 0, arg);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} listToInsert
 * @param {uint} index
 */
Arrays.insertSliceAt = function insertSliceAt(list, listToInsert, index) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(index);
	splice(list, index, 0, ...slice(listToInsert));
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {boolean}
 */
Arrays.isClean = function isClean(list) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {boolean}
 */
Arrays.isUnique = function isUnique(list) {
	return new Set(slice(list)).size === list.length;
};

/**
 * @template T, U, V
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<U>} other
 * @param {function(T, U): V} binaryFunction
 * @param {*} [thisArg]
 * @returns {V[]}
 */
Arrays.map2 = function map2(list, other, binaryFunction, thisArg = undefined) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(other);
	tc.expectFunction(binaryFunction);
	const rv = [];
	const length = Math.max(list.length, other.length);
	for(let i = 0; i < length; i++) {
		if(i in list && i in other) {
			rv[i] = call(binaryFunction, thisArg, list[i], other[i]);
		}
	}
	return rv;
};

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
Arrays.max = function max(list) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T}
 */
Arrays.maxBy = function maxBy(list, propertyKey) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
Arrays.maxPropertyValue = function maxPropertyValue(list, propertyKey) {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	return Arrays.min(map(list, (element) => element[propertyKey]));
};

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
Arrays.min = function min(list) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T}
 * @example Arrays.minBy("Lorem ipsum sit amet".split(" "), "length");
 */
Arrays.minBy = function minBy(list, propertyKey) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
Arrays.minPropertyValue = function minPropertyValue(list, propertyKey) {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	return Arrays.min(map(list, (element) => element[propertyKey]));
};

/**
 * @param {ArrayLike<*>} list
 * @param {PropertyKey} propertyKey
 * @returns {any[]}
 */
Arrays.pluck = function pluck(list, propertyKey) {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	// @ts-ignore
	return map(list, (element) => element[propertyKey]);
};

/**
 * Removes the first occurence of the given value.
 *
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 */
Arrays.remove = function remove(list, arg) {
	tc.expectArrayLike(list);
	const index = Array.prototype.indexOf.call(list, arg);
	if(index === -1) return;
	splice(list, index, 1);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} index
 */
Arrays.removeByIndex = function removeByIndex(list, index) {
	tc.expectArrayLike(list);
	splice(list, index, 1);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} i1
 * @param {uint} i2
 */
Arrays.removeSlice = function removeSlice(list, i1, i2) {
	tc.expectArrayLike(list);
	if(Array.isArray(list)) splice(list, i1, i2 - i1);
	else throw new TypeError("Not implemented.");
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} nTimes
 * @returns {T[]}
 */
Arrays.repeat = function repeat(list, nTimes) {
	tc.expectArrayLike(list);
	tc.expectPositiveInteger(nTimes);
	const rv = [];
	let n = nTimes;
	while(n--) {
		for(let i = 0; i < list.length; i++) {
			rv[rv.length] = list[i];
		}
	}
	return rv;
};

/**
 * Replace any occurence of 'element' with 'replacement'.
 *
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} element
 * @param {T} replacement
 * @returns {T[]}
 */
Arrays.replace = function replace(list, element, replacement) {
	tc.expectArrayLike(list);
	const rv = slice(list);
	for(let i = 0; i < list.length; i++) {
		if(list[i] === element) rv[i] = replacement;
	}
	return rv;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @returns {ArrayLike<T>}
 */
Arrays.replaceNgram = function replaceNgram(list, ngram) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(ngram);
	const rv = slice(list);
	const indices = Arrays.indicesOfNgram(list, ngram);
	for(const index of indices) {
		for(let j = 0; j < ngram.length; j++) {
			rv[index + j] = ngram[j];
		}
	}
	return rv;
};

/**
 * @param {ArrayLike<*>} list
 * @param {ArrayLike<*>} otherList
 * @returns {boolean}
 */
Arrays.shallowEquals = function shallowEquals(list, otherList) {
	tc.expectArrayLike(list);
	tc.expectArrayLike(otherList);
	if(list === otherList) return true;
	if(list.length !== otherList.length) return false;
	for(let i = 0; i < list.length; i++) {
		if(list[i] !== otherList[i]) return false;
	}
	return true;
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 */
Arrays.shuffle = function shuffle(list) {
	tc.expectArrayLike(list);
	const rv = [];
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} [from=0]
 * @param {uint} [to]
 * @returns {T[]}
 */
Arrays.slice = function slice(list, from = 0, to = undefined) {
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
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {string} propertyKey
 * @returns {ArrayLike<T>}
 */
Arrays.sortBy = function sortBy(list, propertyKey) {
	tc.expectArrayLike(list);
	tc.expectPropertyKey(propertyKey);
	return sort(list, (a, b) => (a[propertyKey] >= b[propertyKey] ? 1 : -1));
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {Function} f
 * @returns {ArrayLike<T>}
 */
Arrays.sortWith = function sortWith(list, f) {
	tc.expectArrayLike(list);
	tc.expectFunction(f);
	return sort(list, (a, b) => (f(a) >= f(b) ? 1 : -1));
};

/**
 * @param {ArrayLike<number>} list
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
Arrays.sum = function sum(list) {
	tc.expectNumbers(list);
	// @ts-ignore
	return reduce(list, (acc, element) => acc + element, 0);
};

/**
 * @param {ArrayLike<object>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
Arrays.sumBy = function sum(list, propertyKey) {
	tc.expectNonPrimitives(list);
	tc.expectPropertyKey(propertyKey);
	// @ts-ignore
	return reduce(
		list,
		(acc, element) => {
			tc.expectNumber(element[propertyKey]);
			return acc + element[propertyKey];
		},
		0
	);
};

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {function(T): number} fn
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
Arrays.sumWith = function sumWith(list, fn) {
	tc.expectArrayLike(list);
	tc.expectFunction(fn);
	// @ts-ignore
	return reduce(list, (acc, element) => acc + fn(element), 0);
};

/**
 * @template T
 * @param {MutableArrayLike<T>} list
 * @param {uint} i1
 * @param {uint} i2
 * @returns {ArrayLike<T>}
 */
Arrays.swap = function swap(list, i1, i2) {
	tc.expectArrayLike(list);
	const element = list[i1];
	list[i1] = list[i2];
	list[i2] = element;
	return list;
};

/**
 * @template T
 * @param {...ArrayLike<T>} lists
 * @returns {(T[][] | never[])}
 */
Arrays.zip = function zip(...lists) {
	tc.expectArrayLikes(lists);
	const minLength = Arrays.minPropertyValue(lists, "length");
	const rv = [];
	for(let i = 0; i < minLength; i++) {
		rv[i] = map(lists, (list) => list[i]);
	}
	return rv;
};

export default Arrays;
