/**
 * Hack for union string litteral with string to keep autocomplete.
 *
 * Can be used in mapped type that output unwanted discriminated unions.
 *
 * @example
 * ```ts
 * type Discr = "A" | "B";
 * type DiscrMap = {
 *  "A": "alpha" | "beta",
 *  "B": "beta" | "gamma"
 * }
 * type T1 = {
 *  [P in Discr]: {
 *    discr: P,
 *    prop: DiscrMap[P];
 *  }
 * }[Discr];
 * type T2 = {
 *  [P in Discr]: {
 *    discr: P,
 *    prop: UniqueString<DiscrMap[P]> | DiscrMap[P]; // first part makes unique the litterals, second ensure autocomplete
 *  }
 * }[Discr];
 *
 * const bad: T1 = {
 *  discr: "A",
 *  prop: "gamma" // typed and autocomplete with `"alpha" | "beta" | "gama"`. Bad DX but still type safe.
 * }
 * const good: T2 = {
 *   discr: "A",
 *   prop: "alpha", // typed, autocompleted, and type safed with `"alpha" | "beta"`
 * };
 * ```
 */
export type UniqueString<TStr extends string> = TStr & {
  _?: never & symbol;
};

export type UnknownMapping = UniqueString<string>;

export type FilterMethod<T> = (element: T) => boolean;
export type Nothing = never | 0 | null | undefined;

/**
 * When using abstract class, return a simulated extended class type without having to target a "real" sub class.
 */
export type ExtendedClass<T extends abstract new (...args: Any) => Any> =
  T extends abstract new (...args: infer TArgs) => infer TInstance
    ? new (...args: TArgs) => TInstance
    : never;
export type ImplementedClass<T> =
  | (abstract new (...args: Any[]) => T)
  | (new (...args: Any[]) => T);

/**
 * Stub to trick eslint.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

/**
 * Force expand a type for debug purpose. Don't work on every type.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/ban-types
export type __DEBUG_TYPE__<T> = { [P in keyof T]: T[P] } & {};

export type UnionToIntersection<TUnion> = (
  TUnion extends Any ? (k: TUnion) => void : never
) extends (k: infer I) => void
  ? I
  : never;
type UnionToOverloads<TUnion> = UnionToIntersection<
  TUnion extends Any ? (f: TUnion) => void : never
>;
export type PopUnion<TUnion> = UnionToOverloads<TUnion> extends (
  a: infer A
) => void
  ? A
  : never;

export type UnionConcat<
  TUnion extends string,
  TSep extends string = ","
> = PopUnion<TUnion> extends infer Self
  ? Self extends string
    ? Exclude<TUnion, Self> extends never
      ? Self
      :
          | Self
          | UnionConcat<Exclude<TUnion, Self>, TSep>
          | `${UnionConcat<Exclude<TUnion, Self>, TSep>}${TSep}${Self}`
    : never
  : never;

/**
 * Split literal strings with optional split char and return a tuple of literals.
 *
 * ```ts
 * // default split char: ","
 * type LitTuple1 = Split<"a,b,c,d"> // ["a","b","c","d"]
 * // defined split char
 * type LitTuple2 = Split<"a.b.c.d", "."> // ["a","b","c","d"]
 * // missing split char
 * type LitTuple3 = Split<"a.b.c.d"> // ["a.b.c.d"]
 * ```
 */
export type Split<
  T extends string,
  TSep extends string = ","
> = T extends `${infer Part}${TSep}${infer Rest}`
  ? [Part, ...Split<Rest, TSep>]
  : T extends string
  ? [T]
  : never;
