
type index = number
type int = number
type uint = number

type ArrayCallback<T> = (element: T, index?: index, source?: T[]) => void
type ArrayMappingFunction<T, U> = (element: T, index?: index, source?: ArrayLike<T>) => U
type ArrayPredicate<T> = (element: T, index?: index, source?: T[]) => boolean
type ArrayReducer<T, U> = (acc: U, element: T, index?: index, source?: ArrayLike<T>) => U
type ArraySortFunction<T> = (a: T, b: T) => number
type BareObject<V> = Record<PropertyKey, V>
type List<T> = ArrayLike<T>;
type MapCallback<K, V> = (value: V, key?: K, map?: Map<K, V>) => void

type Mutable<T> = T & {-readonly[P in keyof T]: T[P]}
type MutableArrayLike<T> = Mutable<ArrayLike<T>>
type NonPrimitive = object
type NumberPropertyKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];
type Predicate<T> = (arg: T) => boolean
