/**
 * @file Arrays.ts - Utilities for array-like objects and values.
 *
 * All these functions expect an array-like value as first argument.
 * Some of these functions expect a mutable array-like object
 *   as first argument.
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
import * as tc from "./tc.js";

const call = Function.prototype.call;

const _call = call.bind(call);
// These native methods have annoying argument coercion issues,
// so we'll provide safer versions.
const _copyWithin = call.bind(Array.prototype.copyWithin);
const _fill = call.bind(Array.prototype.fill);
// const _flat = call.bind(Array.prototype.flat);
// const _indexOf = call.bind(Array.prototype.indexOf);
const _slice = call.bind(Array.prototype.slice);
const _splice = call.bind(Array.prototype.splice);

const _map = call.bind(Array.prototype.map);
const _reduce = call.bind(Array.prototype.reduce);
// const _reduceRight = call.bind(Array.prototype.reduceRight);
const _sort = call.bind(Array.prototype.sort);

export const concat = call.bind(Array.prototype.concat);
export const every = call.bind(Array.prototype.every);
export const filter = call.bind(Array.prototype.filter);
export const find = call.bind(Array.prototype.find);
export const findIndex = call.bind(Array.prototype.findIndex);
export const findLast = call.bind(Array.prototype.findLast);
export const findLastIndex = call.bind(Array.prototype.findLastIndex);
export const flatMap = call.bind(Array.prototype.flatMap);
export const forEach = call.bind(Array.prototype.forEach);
export const keys = call.bind(Array.prototype.keys);
export const map = _map;
export const pop = call.bind(Array.prototype.pop);
export const push = call.bind(Array.prototype.push);
export const reduce = call.bind(Array.prototype.reduce);
export const reduceRight = call.bind(Array.prototype.reduceRight);
export const reverse = call.bind(Array.prototype.reverse);
export const shift = call.bind(Array.prototype.shift);
export const some = call.bind(Array.prototype.some);
export const sort = _sort;
export const unshift = call.bind(Array.prototype.unshift);
export const values = call.bind(Array.prototype.values);

/**
 * @template T
 * @param {MutableArrayLike<T>} list
 * @param {uint} target
 * @param {uint} [start]
 * @param {uint} [end]
 * @returns {MutableArrayLike<T>}
 * @see {@link Array.prototype.copyWithin}
 */
export function copyWithin(list, target, start = 0, end = list.length) {
    tc.expectArrayLike(list);
    tc.expectInteger(target);
    tc.expectInteger(start);
    tc.expectInteger(end);
    const { length } = list;
    if (Math.abs(target) > length) throw new RangeError("Math.abs(target) > length");
    if (Math.abs(start) > length) throw new RangeError("Math.abs(start) > length");
    if (Math.abs(end) > length) throw new RangeError("Math.abs(end) > length");
    if (end < start) throw new RangeError("end < start");
    return _copyWithin(list, target, start, end);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} value
 * @param {uint} [start]
 * @param {uint} [end]
 * @returns {ArrayLike<T>}
 */
export function fill (list, value, start = 0, end = list.length) {
    tc.expectArrayLike(list);
    tc.expectInteger(start);
    tc.expectInteger(end);
    const { length } = list;
    if (Math.abs(start) > length) throw new RangeError("Math.abs(start) > length");
    if (Math.abs(end) > length) throw new RangeError("Math.abs(end) > length");
    if (end < start) throw new RangeError("end < start");
    return _fill(list, value, start, end);
}

// ====== OTHER ====== //

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 */
export function add(list, arg) {
    tc.expectArrayLike(list);
    Array.prototype.push.call(list, arg);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} otherList
 */
export function addAll(list, otherList) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(otherList);
    for (let i = 0; i < otherList.length; i++) {
        Array.prototype.push.call(list, otherList[i]);
    }
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T}
 */
export function choose(list) {
    tc.expectArrayLike(list);
    return list[Math.floor(list.length * Math.random())];
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} n
 * @returns {T[]}
 */
export function chooseTuple(list, n) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(n);
    const rv = new Array(n);
    for (let i = 0; i < n; i++) {
        rv[i] = list[Math.floor(list.length * Math.random())];
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} chunkSize
 * @returns {T[][]}
 * @note The last chunk may be shorter.
 */
export function chunk(list, chunkSize) {
    tc.expectArrayLike(list);
    tc.expectStrictlyPositiveInteger(chunkSize);
    const n = chunkSize;
    const rv = [];
    for (let i = 0; i < list.length; i += n) {
        rv[rv.length] = _slice(list, i, i + n);
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]} A new array in which subsequences of
 *   consecutive and identical elements are replaced by their first element.
 * @example Arrays.condense([1, 0, 1, 1, 2, 2, 2, 0]);
 * // [ 1, 0, 1, 2, 0 ]
 */
export function condense(list) {
    if (list.length === 0) return [];
    let currentValue = list[0];
    const rv = [currentValue];
    for (let i = 1; i < list.length; i++) {
        if (list[i] !== currentValue) {
            currentValue = list[i];
            rv[rv.length] = list[i];
        }
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @returns {boolean}
 */
export function contains(list, arg) {
    tc.expectArrayLike(list);
    return Array.prototype.includes.call(list, arg);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} otherList
 * @returns {boolean}
 */
export function containsAll(list, otherList) {
    tc.expectArrayLike(list);
    for (let i = 0; i < otherList.length; i++) {
        if (!Array.prototype.includes.call(list, otherList[i])) {
            return false;
        }
    }
    return true;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 */
export function copy(list) {
    tc.expectArrayLike(list);
    return Array.prototype.slice.call(list, 0);
}

/**
 * Returns the number of occurences of the given value among
 * the elements of the given array-like value, using strict equality.
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @returns {uint}
 */
export function count(list, arg) {
    tc.expectArrayLike(list);
    let rv = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i] === arg) ++rv;
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {[T, T]} bigram
 * @returns {uint}
 */
export function countBigram(list, bigram) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(bigram);
    const [a, b] = bigram;
    let rv = 0;
    for (let i = 0; i < list.length - 1; i++) {
        if (list[i] === a && list[i + 1] === b) {
            ++rv;
        }
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayPredicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {uint}
 */
export function countWith(list, predicate, thisArg) {
    tc.expectArrayLike(list);
    tc.expectFunction(predicate);
    let rv = 0;
    for (let i = 0; i < list.length; ++i) {
        if (_call(predicate, thisArg, list[i], i, list)) rv++;
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @returns {uint}
 * @example Arrays.countNgram("mississippi", "si"); // 2
 */
export function countNgram(list, ngram) {
    tc.expectArrayLike(list);
    if (!list.length) return 0;
    tc.expectNonEmptyArrayLike(ngram);
    let rv = 0;
    const listLength = list.length;
    const ngramLength = ngram.length;

    outer: for (let i = 0; i < listLength - ngramLength + 1; i++) {
        if (list[i] === ngram[0]) {
            for (let j = 1; j < ngramLength; j++) {
                if (list[i + j] !== ngram[j]) continue outer;
            }
            ++rv;
        }
    }
    return rv;
}

/**
 * @template T
 * @param {uint} m
 * @param {uint} n
 * @param {T=} defaultValue
 * @returns {T[][]}
 */
export function createArray2D(m, n, defaultValue = undefined) {
    tc.expectPositiveInteger(m);
    tc.expectPositiveInteger(n);
    const rv = new Array(m);
    for (let i = 0; i < m; i++) rv[i] = new Array(n);
    if (typeof defaultValue !== "undefined") {
        if (tc.isPrimitive(defaultValue)) {
            for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
                rv[i][j] = defaultValue;
            }
        } else {
            for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
                rv[i][j] = Object.create(defaultValue);
            }
        }
    }
    return rv;
}

/**
 * @template T
 * @param {T[]} list
 * @returns {T[][]}
 * @example Arrays.createBigrams([1, 2, 3, 4]);
 * // [[1, 2], [2, 3], [3, 4]]
 * @note Returned bigrams will always be plain 2-element arrays,
 *   notwithstanding the constructor of the given list.
 */
export function createBigrams(list) {
    tc.expectArrayLike(list);
    const rv = [];
    for (let i = 0; i < list.length - 1; ++i) {
        rv[rv.length] = [list[i], list[i + 1]];
    }
    return rv;
}

/**
 * @param {(number[] | string[])} list
 * @returns {(number[] | string[])}
 * @example Arrays.createCumulativeSums([1, 2, 3, 4]); // [1, 3, 6, 10]
 */
export function createCumulativeSums(list) {
    tc.expectArrayLike(list);
    return /** @type {(number[] | string[])} */ (reduce(
        list,
        (acc, element, index) => {
            acc[index] = (index > 0 ? acc[index - 1] + element : element);
            return acc;
        },
        []
    ));
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {Set<T>}
 */
export function createDuplicateSet(list) {
    tc.expectArrayLike(list);
    const rv = new Set();
    const visitedValues = new Set();
    for (let i = 0; i < list.length; ++i) {
        const element = list[i];
        if (visitedValues.has(element)) {
            rv.add(element);
        } else visitedValues.add(element);
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {Map<T, uint>}
 */
export function createFrequencyMap(list) {
    tc.expectArrayLike(list);
    const rv = new Map();
    for (let i = 0; i < list.length; ++i) {
        const element = list[i];
        rv.set(element, (rv.get(element) || 0) + 1);
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {Map<T, uint[]>}
 */
export function createIndexMap(list) {
    tc.expectArrayLike(list);
    const rv = new Map();
    for (let i = 0; i < list.length; ++i) {
        const element = list[i];
        if (rv.has(element)) rv.get(element).push(i);
        else rv.set(element, [i]);
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {uint[][]}
 */
export function createIndexPairs(list) {
    tc.expectArrayLike(list);
    const rv = [];
    const { length } = list;
    for (let i = 0; i < length - 1; ++i) {
        for (let j = i + 1; j < length; ++j) {
            rv[rv.length] = [i, j];
        }
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} ngramLength
 * @returns {T[][]}
 * @note The last ngram may be shorter.
 */
export function createNgrams(list, ngramLength) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(ngramLength);
    const rv = [];
    for (let i = 0; i < list.length; ++i) {
        rv[rv.length] = _slice(list, i, i + ngramLength);
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[][]}
 */
export function createPairs(list) {
    tc.expectArrayLike(list);
    const rv = [];
    for (let i = 0; i < list.length - 1; ++i) {
        for (let j = i + 1; j < list.length; ++j) {
            rv[rv.length] = [list[i], list[j]];
        }
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<uint>} indices
 * @returns {T[]}
 */
export function createPermutation(list, indices) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(indices);
    if (list.length !== new Set(Array.from(indices)).size) {
        throw new TypeError("Invalid permutation indices.");
    }
    return _map(indices, (index) => list[index]);
}

/**
 * @param {uint} to
 * @returns {uint[]}
 */
export function createRange(to) {
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
export function cross(list, otherList) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(otherList);
    return _map(list, (e) => _map(otherList, (f) => [e, f]));
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 * @see nub (Haskell), uniq (Lodash)
 */
export function dedupe(list) {
    tc.expectArrayLike(list);
    if (typeof list === "string" || Array.isArray(list)) {
        return [...new Set(list)];
    }
    return [...new Set(_slice(list))];
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} n
 * @returns {T[]}
 * @see https://lodash.com/docs/#drop
 */
export function drop(list, n) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(n);
    return _slice(list, n);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {Predicate<T>} predicate
 * @param {*} [thisArg]
 * @returns {T[]}
 * @see https://lodash.com/docs/#dropWhile
 */
export function dropWhile(list, predicate, thisArg) {
    tc.expectArrayLike(list);
    tc.expectFunction(predicate);
    const index = Array.prototype.findIndex.call(list, (element) => !predicate(element), thisArg);
    if (index === -1) return [];
    return _slice(list, index);
}

/**
 * @generator
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} k
 * @yields {T[]}
 * @see https://en.wikipedia.org/wiki/Combination
 * @example
 * [...Arrays.generateCombinations(["A", "B", "C", "D", "E"], 3)];
 */
export function* generateCombinations(list, k) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(k);
    tc.expectPositiveInteger(list.length - k);
    const n = list.length;
    for (const indices of generateIndexCombinations(n, k)) {
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
export function* generateIndexCombinations(n, k) {
    tc.expectPositiveInteger(n);
    tc.expectPositiveInteger(k);
    const indices = createRange(k);
    yield indices.slice();
    if (!k || !n) return;
    while (true) {
        let i = k - 1;
        let max = n - 1;
        while (indices[i] === max) {
            --i;
            --max;
            if (i < 0) return;
        }
        let x = ++indices[i];
        while (i < indices.length - 1) {
            indices[++i] = ++x;
        }
        yield indices.slice();
    }
}

/**
 * @generator
 * @param {uint} n
 * @param {uint} k
 * @yields {uint[]}
 * @example [...Arrays.generateIndexPermutations(5, 3)];
 */
export function* generateIndexPermutations(n, k) {
    const indices = new Array(k).fill(0);
    yield indices.slice();
    if (!k || !n) return;
    while (true) {
        let i = k - 1;
        const max = n - 1;
        while (indices[i] === max) {
            --i;
            if (i < 0) return;
        }
        ++indices[i];
        while (i < indices.length - 1) {
            indices[++i] = 0;
        }
        yield indices.slice();
    }
}

/**
 * @generator
 * @template T
 * @param {ArrayLike<T>} list
 * @yields {T[]}
 * @see https://en.wikipedia.org/wiki/Heap%27s_algorithm
 * @example [...Arrays.generatePermutations(["A", "B", "C"])];
 */
export function* generatePermutations(list) {
    tc.expectArrayLike(list);
    const perm = _slice(list);
    const generate = function* generate(n) {
        if (!n) yield perm.slice();
        else for (let i = 0; i < n; i++) {
            yield* generate(n - 1);
            if (n % 2 === 0) swap(perm, i, n - 1);
            else swap(perm, 0, n - 1);
        }
    };
    yield* generate(list.length);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} k
 * @yields {T[]}
 * @example [...Arrays.generateTuples(["A", "B", "C", "D", "E"], 3)];
 */
export function* generateTuples(list, k) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(k);
    const n = list.length;
    for (const indices of generateIndexPermutations(n, k)) {
        yield indices.map((index) => list[index]);
    }
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {int} index
 * @param {uint} [radius]
 * @returns {T[]}
 * @example
 * Arrays.getNeighborhood("azertyuiop", 3, 2); // [ 'z', 'e', 'r', 't', 'y' ]
 */
export function getNeighborhood(list, index, radius = 1) {
    tc.expectInteger(index);
    tc.expectPositiveInteger(radius);
    const origin = (index >= 0 ? index : list.length + index);
    return _slice(list, Math.max(0, origin - radius), origin + radius + 1);
}

/**
 * The returned slice may be shorter if a boundary was encountered.
 * @template T
 * @param {ArrayLike<T>} list
 * @param {int} sliceStart
 * @param {int} sliceEnd
 * @param {uint} [radius]
 * @returns {T[]}
 * @example
 * Arrays.getNeighborhoodOfSlice("azertyuiop", 2, 3); // [ 'z', 'e', 'r', 't', 'y' ]
 */
export function getNeighborhoodOfSlice(list, sliceStart, sliceEnd, radius = 1) {
    tc.expectInteger(sliceStart);
    tc.expectInteger(sliceEnd);
    tc.expectPositiveInteger(radius);
    const slice0 = (sliceStart >= 0 ? sliceStart : list.length + sliceStart);
    const slice1 = (sliceEnd >= 0 ? sliceEnd : list.length + sliceEnd);
    return _slice(list, Math.max(0, slice0 - radius), slice1 + radius);
}

/**
 * Like 'Object.getOwnPropertyNames()', but does not include element indices.
 * @param {ArrayLike<*>} list
 * @returns {string[]}
 */
export function getOwnPropertyNames(list) {
    tc.expectArrayLike(list);
    const { length } = list;
    const maxLength = 2 ** 32 - 1;
    const rv = [];
    for (const key of Object.getOwnPropertyNames(list)) {
        if (/^0$|^[1-9]\d*$/.test(key)) {
            const keyAsInt = Number.parseInt(key, 10);
            if (keyAsInt > maxLength || keyAsInt >= length) rv[rv.length] = key;
        } else rv[rv.length] = key;
    }
    return rv;
}

/**
 * Same as 'Arrays.chunk', but starts a new chunk whenever the visited element
 * is distinct from the previous one.
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[][]}
 */
export function group(list) {
    tc.expectArrayLike(list);
    const rv = [];
    if (!list.length) return rv;
    let currentValue = list[0];
    let currentChunk = [currentValue];
    rv[0] = currentChunk;
    for (let i = 1; i < list.length; i++) {
        if (list[i] === currentValue) {
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
export function groupWith(list, f, thisArg) {
    tc.expectArrayLike(list);
    tc.expectFunction(f);
    const rv = new Array();
    if (!list.length) return rv;
    let currentValue = _call(f, thisArg, list[0], 0, list);
    let currentChunk = [currentValue];
    rv[0] = currentChunk;
    for (let i = 1; i < list.length; i++) {
        const newValue = _call(f, thisArg, list[i], i, list);
        if (newValue === currentValue) {
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
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 * @param {uint} [from]
 * @returns {uint[]}
 */
export function indicesOf(list, arg, from = 0) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(from);
    let i = from;
    const rv = [];
    do {
        i = Array.prototype.indexOf.call(list, arg, i);
        if (i === -1) break;
        rv[rv.length] = i;
        i += 1;
    } while (i !== -1);
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @param {uint} [from]
 * @returns {uint[]}
 */
export function indicesOfNgram(list, ngram, from = 0) {
    tc.expectArrayLike(list);
    tc.expectNonEmptyArrayLike(ngram);
    tc.expectPositiveInteger(from);
    const rv = [];
    const element = ngram[0];
    const to = list.length - ngram.length + 1;

    outer: for (let i = from; i < to; i++) {
        if (list[i] === element) {
            for (let j = 1; j < ngram.length; j++) {
                if (list[i + j] !== ngram[j]) continue outer;
            }
            rv[rv.length] = i;
        }
    }
    return rv;
}

/**
 * @template T
 * @param {MutableArrayLike<T>} list
 * @param {T} arg
 * @param {uint} index
 */
export function insertAt(list, arg, index) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(index);
    if (index >= list.length) list[index] = arg;
    else _splice(list, index, 0, arg);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} listToInsert
 * @param {uint} index
 */
export function insertSliceAt(list, listToInsert, index) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(index);
    _splice(list, index, 0, ..._slice(listToInsert));
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {boolean}
 */
export function isClean(list) {
    tc.expectArrayLike(list);
    if (typeof list === "string") return true;
    const names = getOwnPropertyNames(list);
    if (names.length !== 1 || names[0] !== "length") return false;
    const descriptor = Object.getOwnPropertyDescriptor(list, "length");
    return (descriptor !== undefined
        && "value" in descriptor
        && descriptor.writable === true
        && !descriptor.configurable
        && !descriptor.enumerable);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {boolean}
 */
export function isUnique(list) {
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
export function map2(list, other, binaryFunction, thisArg) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(other);
    tc.expectFunction(binaryFunction);
    const length = Math.max(list.length, other.length);
    const rv = new Array(length);
    for (let i = 0; i < length; i++) {
        if (i in list && i in other) {
            rv[i] = _call(binaryFunction, thisArg, list[i], other[i]);
        }
    }
    return rv;
}

/**
 * Like the native 'Math.max()' function, but without quirks:
 *
 * - If the given argument is empty,
 * throws an error instead of returning '-Infinity'.
 * - If some element is not a JavaScript number,
 * throws an error instead of trying to coerce it to a number.
 * - If some element is missing or is 'NaN',
 * throws an error instead of returning 'NaN'.
 * @param {ArrayLike<number>} list
 * @returns {number}
 */
export function max(list) {
    tc.expectNonEmptyArrayLike(list);
    // Don't call 'tc.expectNumbers()' here.
    let rv = list[0];
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (typeof element !== "number") tc.throwNewTypeError("a number");
        // Checks for 'NaN'.
        if (element !== element) tc.throwNewTypeError("a regular number");
        if (element > rv) rv = element;
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T}
 */
export function maxBy(list, propertyKey) {
    tc.expectNonEmptyArrayLike(list);
    tc.expectPropertyKey(propertyKey);
    let rv = list[0];
    tc.expectNonNullable(rv);
    let max = rv[propertyKey];
    tc.expectNumber(max);
    if (Number.isNaN(max)) tc.throwNewTypeError("a regular number");
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (element === null || element === undefined) {
            tc.throwNewTypeError("neither 'null' nor 'undefined'");
        }
        const propertyValue = element[propertyKey];
        if (typeof propertyValue !== "number") {
            tc.throwNewTypeError("a regular number");
        }
        if (Number.isNaN(propertyValue)) {
            tc.throwNewTypeError("a regular number");
        }
        if (propertyValue > max) {
            max = propertyValue;
            rv = element;
        }
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function maxPropertyValue(list, propertyKey) {
    tc.expectArrayLike(list);
    tc.expectPropertyKey(propertyKey);
    return min(_map(list, (element) => element[propertyKey]));
}

/**
 * Like the native 'Math.min()' function, but without quirks:
 *
 * - If the given argument is empty,
 * throws an error instead of returning 'Infinity'.
 * - If some element is not a JavaScript number,
 * throws an error instead of trying to coerce it to a number.
 * - If some element is missing or is 'NaN',
 * throws an error instead of returning 'NaN'.
 * @param {ArrayLike<number>} list
 * @returns {number}
 */
export function min(list) {
    tc.expectNonEmptyArrayLike(list);
    // Don't call 'tc.expectNumbers()' here.
    let rv = list[0];
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (typeof element !== "number") tc.throwNewTypeError("a number");
        // Checks for 'NaN'.
        if (element !== element) tc.throwNewTypeError("a regular number");
        if (element < rv) rv = element;
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T}
 * @example Arrays.minBy("Lorem ipsum sit amet".split(" "), "length");
 */
export function minBy(list, propertyKey) {
    tc.expectNonEmptyArrayLike(list);
    tc.expectPropertyKey(propertyKey);
    let rv = list[0];
    tc.expectNonNullable(rv);
    let min = rv[propertyKey];
    tc.expectNumber(min);
    if (Number.isNaN(min)) tc.throwNewTypeError("a regular number");
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (element === null || element === undefined) {
            tc.throwNewTypeError("neither 'null' nor 'undefined'");
        }
        const propertyValue = element[propertyKey];
        if (typeof propertyValue !== "number") {
            tc.throwNewTypeError("a regular number");
        }
        if (Number.isNaN(propertyValue)) {
            tc.throwNewTypeError("a regular number");
        }
        if (propertyValue < min) {
            min = propertyValue;
            rv = element;
        }
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function minPropertyValue(list, propertyKey) {
    tc.expectArrayLike(list);
    tc.expectPropertyKey(propertyKey);
    return min(_map(list, (element) => element[propertyKey]));
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {PropertyKey} propertyKey
 * @returns {T[]}
 */
export function pluck(list, propertyKey) {
    tc.expectArrayLike(list);
    tc.expectPropertyKey(propertyKey);
    return _map(list, (element) => element[propertyKey]);
}

/**
 * Removes the first occurence of the given value.
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} arg
 */
export function remove(list, arg) {
    tc.expectArrayLike(list);
    const index = Array.prototype.indexOf.call(list, arg);
    if (index === -1) return;
    _splice(list, index, 1);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} index
 */
export function removeByIndex(list, index) {
    tc.expectArrayLike(list);
    _splice(list, index, 1);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} i1
 * @param {uint} i2
 */
export function removeSlice(list, i1, i2) {
    tc.expectArrayLike(list);
    if (Array.isArray(list)) _splice(list, i1, i2 - i1);
    else throw new TypeError("Not implemented.");
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} nTimes
 * @returns {T[]}
 */
export function repeat(list, nTimes) {
    tc.expectArrayLike(list);
    tc.expectPositiveInteger(nTimes);
    const rv = new Array();
    let n = nTimes;
    while (n--) {
        for (let i = 0; i < list.length; i++) {
            rv[rv.length] = list[i];
        }
    }
    return rv;
}

/**
 * Replace any occurence of 'element' with 'replacement'.
 * @template T
 * @param {ArrayLike<T>} list
 * @param {T} element
 * @param {T} replacement
 * @returns {T[]}
 */
export function replace(list, element, replacement) {
    tc.expectArrayLike(list);
    const rv = _slice(list);
    for (let i = 0; i < list.length; i++) {
        if (list[i] === element) rv[i] = replacement;
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {ArrayLike<T>} ngram
 * @returns {ArrayLike<T>}
 */
export function replaceNgram(list, ngram) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(ngram);
    const rv = _slice(list);
    const indices = indicesOfNgram(list, ngram);
    for (const index of indices) {
        for (let j = 0; j < ngram.length; j++) {
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
export function shallowEquals(list, otherList) {
    tc.expectArrayLike(list);
    tc.expectArrayLike(otherList);
    if (list === otherList) return true;
    if (list.length !== otherList.length) return false;
    for (let i = 0; i < list.length; i++) {
        if (list[i] !== otherList[i]) return false;
    }
    return true;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @returns {T[]}
 */
export function shuffle(list) {
    tc.expectArrayLike(list);
    const rv = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        const n = i + Math.floor((list.length - i) * Math.random());
        const element = rv[i];
        rv[i] = (rv[n] === null || rv[n] === undefined
            ? list[n]
            : rv[n]);
        rv[n] = (element === null || element === undefined
            ? list[i]
            : element);
    }
    return rv;
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {uint} [from]
 * @param {uint} [to]
 * @returns {T[]}
 */
export function slice(list, from = 0, to = list.length) {
    tc.expectArrayLike(list);
    tc.expectInteger(from);
    tc.expectInteger(to);
    if (Math.abs(from) > list.length) {
        throw new RangeError("'Math.abs(from)' is greater than 'list.length'.");
    }
    if (Math.abs(to) > list.length) {
        throw new RangeError("'Math.abs(to)' is greater than 'list.length'.");
    }
    return Array.prototype.slice.call(list, from, to);
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {string} propertyKey
 * @returns {ArrayLike<T>}
 */
export function sortBy(list, propertyKey) {
    tc.expectArrayLike(list);
    tc.expectPropertyKey(propertyKey);
    return _sort(list, (a, b) => (a[propertyKey] >= b[propertyKey] ? 1 : -1));
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {Function} f
 * @returns {ArrayLike<T>}
 */
export function sortWith(list, f) {
    tc.expectArrayLike(list);
    tc.expectFunction(f);
    return _sort(list, (a, b) => (f(a) >= f(b) ? 1 : -1));
}

/**
 * @param {ArrayLike<number>} list
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
export function sum(list) {
    tc.expectNumbers(list);
    return /** @type {number} */ (
        _reduce(list, (acc, element) => acc + element, 0)
    );
}

/**
 *
 * @param {ArrayLike<*>} list
 * @param {PropertyKey} propertyKey
 * @returns {number}
 */
export function sumBy(list, propertyKey) {
    tc.expectNonPrimitives(list);
    tc.expectPropertyKey(propertyKey);
    return /** @type {number} */ (_reduce(list, (acc, element) => {
        if (typeof element[propertyKey] === "number") {
            return acc + element[propertyKey];
        }
        throw new TypeError("element[propertyKey] is not a number");
    }, 0));
}

/**
 * @template T
 * @param {ArrayLike<T>} list
 * @param {function(T): number} fn
 * @returns {number}
 * @note If the argument is empty, then 0 will be returned.
 */
export function sumWith(list, fn) {
    tc.expectArrayLike(list);
    tc.expectFunction(fn);
    return /** @type {number} */ (
        _reduce(list, (acc, element) => acc + fn(element), 0)
    );
}

/**
 * @template T
 * @param {MutableArrayLike<T>} list
 * @param {uint} i1
 * @param {uint} i2
 */
export function swap(list, i1, i2) {
    tc.expectArrayLike(list);
    const element = list[i1];
    list[i1] = list[i2];
    list[i2] = element;
}

/**
 * @template T
 * @param {...ArrayLike<T>} lists
 * @returns {(T[][] | never[])}
 */
export function zip(...lists) {
    tc.expectArrayLikes(lists);
    const minLength = minPropertyValue(lists, "length");
    const rv = new Array(minLength);
    for (let i = 0; i < minLength; i++) {
        rv[i] = _map(lists, (list) => list[i]);
    }
    return rv;
}
