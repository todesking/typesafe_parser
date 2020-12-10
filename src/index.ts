const resultTag: any = null;

export type AnyChar = {
  type: "any_char";
  _result: string;
};

export function anyChar(): AnyChar {
  return { type: "any_char", _result: resultTag };
}

export type Read<P extends string> = {
  type: "read";
  pattern: P[];
  _result: P[number];
};

export function read<P extends string[]>(...p: P): Read<P[number]> {
  return {
    type: "read",
    pattern: p,
    _result: resultTag,
  };
}

export const small_alpha = read(
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z"
);

export const capital_alpha = read(
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
);

export const number = read("0", "1", "2", "3", "4", "5", "6", "6", "8", "9");

export const nonzero_number = read("1", "2", "3", "4", "5", "6", "6", "8", "9");

export type Constant<T, P extends Parser<unknown>> = {
  type: "constant";
  parser: P;
  value: T;
  _result: T;
};

export function constant<P extends Parser<unknown>, T>(
  p: P,
  v: T
): Constant<T, P> {
  return {
    type: "constant",
    parser: p,
    value: v,
    _result: resultTag,
  };
}

export function read_const<P extends string, V>(
  p: P,
  v: V
): Constant<V, Read<P>> {
  return constant(read(p), v);
}

export type Choose<T, P1 extends Parser<T>, P2 extends Parser<T>> = {
  type: "choose";
  p1: P1;
  p2: P2;
  _result: T;
};

export function choose<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(
  p1: P1,
  p2: P2
): Choose<P1["_result"] | P2["_result"], P1, P2> {
  return {
    type: "choose",
    p1: p1,
    p2: p2,
    _result: resultTag,
  };
}

export type Seq<T1, T2, P1 extends Parser<T1>, P2 extends Parser<T2>> = {
  type: "seq";
  p1: P1;
  p2: P2;
  _result: [T1, T2];
};

export function seq<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(
  p1: P1,
  p2: P2
): Seq<P1["_result"], P2["_result"], P1, P2> {
  return {
    type: "seq",
    p1: p1,
    p2: p2,
    _result: resultTag,
  };
}

export type PickFirst<T, P1 extends Parser<T>, P2 extends Parser<unknown>> = {
  type: "pickFirst";
  p1: P1;
  p2: P2;
  _result: T;
};

export function pickFirst<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown>
>(p1: P1, p2: P2): PickFirst<P1["_result"], P1, P2> {
  return {
    type: "pickFirst",
    p1: p1,
    p2: p2,
    _result: resultTag,
  };
}

export type PickSecond<T, P1 extends Parser<unknown>, P2 extends Parser<T>> = {
  type: "pickSecond";
  p1: P1;
  p2: P2;
  _result: T;
};

export function pickSecond<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown>
>(p1: P1, p2: P2): PickSecond<P2["_result"], P1, P2> {
  return {
    type: "pickSecond",
    p1: p1,
    p2: p2,
    _result: resultTag,
  };
}

export function pickSecondOf3<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown>,
  P3 extends Parser<unknown>
>(
  p1: P1,
  p2: P2,
  p3: P3
): PickSecond<P2["_result"], P1, PickFirst<P2["_result"], P2, P3>> {
  return pickSecond(p1, pickFirst(p2, p3));
}

export type Rep0<E, P extends Parser<E>> = {
  type: "rep0";
  p: P;
  _result: E[];
};

export function rep0<P extends Parser<unknown>>(p: P): Rep0<P["_result"], P> {
  return {
    type: "rep0",
    p: p,
    _result: resultTag,
  };
}

export type Opt<T, P extends Parser<T>, D> = {
  type: "opt";
  p: P;
  default: D;
  _result: T;
};

export function opt<P extends Parser<unknown>, D>(
  p: P,
  d: D
): Opt<P["_result"] | D, P, D> {
  return {
    type: "opt",
    p: p,
    default: d,
    _result: resultTag,
  };
}

export type Prepend<
  T1,
  T2 extends unknown[],
  P1 extends Parser<T1>,
  P2 extends Parser<T2>
> = {
  type: "prepend";
  p1: P1;
  p2: P2;
  _result: [T1, ...T2];
};

export function prepend<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown[]>
>(p1: P1, p2: P2): Prepend<P1["_result"], P2["_result"], P1, P2> {
  return {
    type: "prepend",
    p1: p1,
    p2: p2,
    _result: resultTag,
  };
}

export function rep1<P extends Parser<unknown>>(
  p: P
): Prepend<
  P["_result"],
  Rep0<P["_result"], P>["_result"],
  P,
  Rep0<P["_result"], P>
> {
  return prepend(p, rep0(p));
}

export type Join<T extends string[], P extends Parser<T>> = {
  type: "join";
  p: P;
  _result: T;
};

export function join<P extends Parser<string[]>>(p: P): Join<P["_result"], P> {
  return {
    type: "join",
    p: p,
    _result: resultTag,
  };
}

export function wrap<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown>,
  P3 extends Parser<unknown>
>(
  p1: P1,
  p2: P2,
  p3: P3
): PickSecond<P2["_result"], P1, PickFirst<P2["_result"], P2, P3>> {
  return pickSecond(p1, pickFirst(p2, p3));
}

export type Rep1Sep<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown>
> = Prepend<
  P1["_result"],
  P1["_result"][],
  P1,
  Rep0<P1["_result"], PickSecond<P1["_result"], P2, P1>>
>;

export function rep1sep<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(
  p1: P1,
  p2: P2
): Rep1Sep<P1, P2> {
  return prepend(p1, rep0(pickSecond(p2, p1)));
}

export function rep0sep<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(
  p1: P1,
  p2: P2
): Opt<Rep1Sep<P1, P2>["_result"] | [], Rep1Sep<P1, P2>, []> {
  return opt(rep1sep(p1, p2), []);
}

export type Ref<T, K extends string> = {
  type: "ref";
  key: K;
  _result: T;
};

export function ref<T>(): <K extends string>(key: K) => Ref<T, K> {
  return <K>(key: K) => ({
    type: "ref",
    key: key,
    _result: resultTag,
  });
}

export type Parser<T> =
  | (AnyChar & { _result: T })
  | (Read<string> & { _result: T })
  | ConstantRec<T>
  | ChooseRec<T>
  | (SeqRec & { _result: T })
  | PickFirstRec<T>
  | PickSecondRec<T>
  | (Rep0Rec & { _result: T })
  | (PrependRec & { _result: T })
  | (JoinRec & { _result: T })
  | (OptRec & { _result: T })
  | Ref<T, string>;

type ParseResult<P extends Parser<unknown>> = P[] extends Parser<infer T>[]
  ? T
  : never;

interface ConstantRec<T> extends Constant<T, Parser<unknown>> {}
interface ChooseRec<T> extends Choose<T, Parser<T>, Parser<T>> {}
interface SeqRec
  extends Seq<unknown, unknown, Parser<unknown>, Parser<unknown>> {}
interface PickFirstRec<T> extends PickFirst<T, Parser<T>, Parser<unknown>> {}
interface PickSecondRec<T> extends PickSecond<T, Parser<unknown>, Parser<T>> {}
interface Rep0Rec extends Rep0<unknown, Parser<unknown>> {}
interface PrependRec
  extends Prepend<unknown, unknown[], Parser<unknown>, Parser<unknown[]>> {}
interface JoinRec extends Join<string[], Parser<string[]>> {}
interface OptRec extends Opt<unknown, Parser<unknown>, unknown> {}

type Match<T extends U, U> = T;

export type Fail<Msg> = { fail: Msg };

type Bug<Msg> = { bug: Msg };

// prettier-ignore
type _Join<T extends string[]> =
  string[] extends T ? string
  : _Join1<T, ''>
type _Join1<T extends string[], R extends string> = T extends []
  ? R
  : T extends [Match<infer T1, string>, ...Match<infer T2, string[]>]
  ? _Join1<T2, `${R}${T1}`>
  : never;

// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type Same<T, U> = (<X>() => X extends T ? 1 : 2) extends <X>() => X extends U
  ? 1
  : 2
  ? true
  : false;

type IAnyChar = {
  itype: "any_char";
};
type IRead<V extends string> = {
  itype: "read";
  value: V;
};
type ISeq = {
  itype: "seq";
};
type IPush<V> = {
  itype: "push";
  value: V;
};
type IPop = {
  itype: "pop";
};
type IAbort = {
  itype: "abort";
};
type IChoose<I extends Insn[]> = {
  itype: "choose";
  insn: I;
};
type IRep<I extends Insn[]> = {
  itype: "rep";
  insn: I;
};
type IOpt<V> = {
  itype: "opt";
  value: V;
};
type IPrepend = {
  itype: "prepend";
};
type IJoin = {
  itype: "join";
};
type IRef<K extends string> = {
  itype: "ref";
  ref: K;
};
type ICall<I extends Insn[]> = {
  itype: "call";
  insn: I;
};

type Insn =
  | IAnyChar
  | IRead<string>
  | ISeq
  | IPush<unknown>
  | IPop
  | IAbort
  | IChoose<Insn[]>
  | IRep<Insn[]>
  | IOpt<unknown>
  | IPrepend
  | IJoin
  | IRef<string>
  | ICall<Insn[]>;
// TODO: IUnknown<T>

// prettier-ignore
export type Compile<P extends Parser<unknown>> =
  Same<Parser<ParseResult<P>>, P> extends true ?
    [IPush<ParseResult<P>>]
  : P extends AnyChar ? [IAnyChar]
  : P extends Read<infer V> ? [IRead<V>]
  : P extends Constant<infer V, infer P1> ?
    Compile<P1> extends Match<infer I1, Insn[]>
      ?  [ICall<I1>, IAbort, IPop, IPush<V>]
      : Bug<"Compile:Constant:1">
  : P extends Choose<unknown, infer P1, infer P2> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? Compile<P2> extends Match<infer I2, Insn[]>
      ? [ICall<I1>, IChoose<I2>]
      : Bug<"Compile:Choose:1">
    : Bug<"Compile:Choose:2">
  : P extends Seq<unknown, unknown, infer P1, infer P2> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? Compile<P2> extends Match<infer I2, Insn[]>
      ? [...I1, IAbort, ...I2, ISeq]
      : Bug<"Compile:Seq:1">
    : Bug<"Compile:Seq:2">
  : P extends PickFirst<unknown, infer P1, infer P2> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? Compile<P2> extends Match<infer I2, Insn[]>
      ? [...I1, IAbort, ...I2, IPop]
      : Bug<"Compile:PickFirst:1">
    : Bug<"Compile:PickFirst:2">
  : P extends PickSecond<unknown, infer P1, infer P2> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? Compile<P2> extends Match<infer I2, Insn[]>
      ? [...I1, IAbort, IPop, ...I2]
      : Bug<"Compile:PickSecond:1">
    : Bug<"Compile:PickSecond:2">
  : P extends Rep0<unknown, infer P1> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? [IPush<[]>, ICall<I1>, IRep<I1>]
    : Bug<"Compile:Rep0">
  : P extends Opt<unknown, infer P1, infer V> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? [ICall<I1>, IOpt<V>]
    : Bug<"Compile:Opt">
  : P extends Prepend<unknown, unknown[], infer P1, infer P2> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? Compile<P2> extends Match<infer I2, Insn[]>
      ? [...I1, IAbort, ...I2, IAbort, IPrepend]
      : Bug<"Compile:Prepend:1">
    : Bug<"Compile:Prepend:2">
  : P extends Join<string[], infer P1> ?
    Compile<P1> extends Match<infer I1, Insn[]>
    ? [...I1, IAbort, IJoin]
    : Bug<"Compile:Join">
  : P extends Ref<unknown, infer K> ?
    [IRef<K>]
  : Bug<["Compile:Unknown parser", P]>

type State<
  S extends string,
  Vs extends unknown[],
  Is extends Insn[],
  IStack extends Insn[][],
  Env extends Record<string, Insn[]>
> = {
  s: S;
  vs: Vs;
  is: Is;
  iStack: IStack;
  env: Env;
};
type TopState = State<
  string,
  unknown[],
  Insn[],
  Insn[][],
  Record<string, Insn[]>
>;
type InitialState<
  S extends string,
  P extends Parser<unknown>,
  Env extends Environment
> = string extends S
  ? State<string, [P["_result"]], [], [], Record<string, Insn[]>>
  : Compile<P> extends Match<infer Is, Insn[]>
  ? { [K in keyof Env]: Compile<Env[K]> } extends Match<
      infer CEnv,
      Record<string, Insn[]>
    >
    ? State<S, [], Is, [], CEnv>
    : Bug<"InitialState:1">
  : Bug<["InitialState:2", Compile<P>]>;

type NextState<St extends TopState> = St extends State<
  infer S,
  infer Vs,
  [],
  [Match<infer Is1, Insn[]>, ...Match<infer Is2, Insn[][]>],
  infer Env
>
  ? State<S, Vs, Is1, Is2, Env>
  : St extends State<
      infer S,
      infer Vs,
      [Match<infer I1, Insn>, ...Match<infer I2, Insn[]>],
      infer IStack,
      infer Env
    >
  ? DoInsn<S, Vs, I1, I2, IStack, Env>
  : State<"NextState:Bug", [St], [], [], Record<string, Insn[]>>;

type DoRead<V extends string, S extends string> = V extends Match<
  infer V1,
  string
>
  ? S extends `${V1}${infer Rest}`
    ? [V1, Rest]
    : never
  : Bug<"DoRead:1">;

// prettier-ignore
type DoInsn<
  S extends string,
  Vs extends unknown[],
  I extends Insn,
  Is extends Insn[],
  IStack extends Insn[][],
  Env extends Record<string, Insn[]>
> =
  I extends IAnyChar ?
    S extends `${infer S1}${infer S2}`
    ? State<S2, [S1, ...Vs], Is, IStack, Env>
    : State<S, [Fail<'AnyChar'>, ...Vs], Is, IStack, Env>
  : I extends IRead<infer V> ?
    DoRead<V, S> extends never
      ? State<S, [Fail<["Read", V, S]>, ...Vs], Is, IStack, Env>
      : DoRead<V, S> extends [infer V1, Match<infer S1, string>]
        ? State<S1, [V1, ...Vs], Is, IStack, Env>
        : Bug<"Read:1">
  : I extends ISeq
    ? Vs extends [infer V1, infer V2, ...infer V3]
      ? State<S, [[V2, V1], ...V3], Is, IStack, Env>
      : Bug<["DoInsn:ISeq:Stack inssuficient", Vs]>
  : I extends IPush<infer V> ?
    State<S, [V, ...Vs], Is, IStack, Env>
  : I extends IPop ?
    Vs extends [unknown, ...infer V2]
    ? State<S, V2, Is, IStack, Env>
    : Bug<"DoInsn:IPop: Value stack is empty">
  : I extends IAbort ?
    Vs extends [Fail<unknown>, ...unknown[]]
    ? IStack extends [Match<infer Is1, Insn[]>, ...Match<infer Is2, Insn[][]>]
      ? State<S, Vs, Is1, Is2, Env>
      : State<S, Vs, [], [], Env>
    : State<S, Vs, Is, IStack, Env>
  : I extends IChoose<infer I2> ?
    Vs extends [Fail<unknown>, ...infer V2]
    ? State<S, V2, I2, [Is, ...IStack], Env>
    : State<S, Vs, Is, IStack, Env>
  : I extends IRep<infer I2> ?
    Vs extends [Fail<unknown>, ...infer V2]
    ? State<S, V2, Is, IStack, Env>
    : Vs extends [infer V1, Match<infer V2, unknown[]>, ...infer V3]
      ? State<S, [[...V2, V1], ...V3], [ICall<I2>, IRep<I2>, ...Is], IStack, Env>
      : Bug<["DoInsn:IRep", S, Vs, I, Is, IStack, Env]>
  : I extends IOpt<infer V1> ?
    Vs extends [Fail<unknown>, ...infer V2]
    ? State<S, [V1, ...V2], Is, IStack, Env>
    : State<S, Vs, Is, IStack, Env>
  : I extends IPrepend ?
    Vs extends [Match<infer V1, unknown[]>, infer V2, ...infer V3]
    ? State<S, [[V2, ...V1], ...V3], Is, IStack, Env>
    : Bug<["DoInsn:Prepend", Vs]>
  : I extends IJoin ?
    Vs extends [Match<infer V1, string[]>, ...infer V2]
    ? State<S, [_Join<V1>, ...V2], Is, IStack, Env>
    : Bug<["DoInsn:Join", Vs]>
  : I extends IRef<infer Name> ?
    State<S, Vs, Env[Name], [Is, ...IStack], Env>
  : I extends ICall<infer I2> ?
    State<S, Vs, I2, [Is, ...IStack], Env>
  : Bug<["DoInsn", I]>

// prettier-ignore
type UnwrapAux<T> =
  T[] extends never[] ? never
  : T extends { __rec: { __rec: infer U } } ? { __rec: UnwrapAux<U> }
  : T extends { __rec: infer U } ? U
  : T;

type Unwrap<T> = T[] extends { __rec: unknown }[] ? Unwrap<UnwrapAux<T>> : T;

// prettier-ignore
type Run<St extends TopState> =
  St extends State<infer S, [infer V, ...unknown[]], [], [], Record<string, Insn[]>>
  ? V extends Fail<unknown>
    ? V
    : [V, S]
  : { __rec: Run<NextState<St>> };

export type Environment = Record<string, Parser<unknown>>;

// prettier-ignore
export type ParseVM<
  P extends Parser<unknown>,
  S extends string,
  E extends Environment
> = string extends S ? [ParseResult<P>, string]
  : InitialState<S, P, E> extends Match<infer St, TopState> ? Unwrap<Run<St>>
  : Bug<["ParseVM:1", InitialState<S, P, E>]>;

/*
export type Parse<P extends Parser<unknown>, S extends string, E extends Record<string, Parser<unknown>>> =
  // P is Parser<T> ?
  P[] extends {_result: infer T}[]
    ? Same<Parser<T>, P> extends true ? [T, string]
    // S is string ?
    : string extends S ? [T, string]
    : ParseImpl<T, P, S, E>
  : Bug<'Parse:1'>
*/
/*
type ParseImpl<T, P extends Parser<unknown>, S extends string, E extends Record<string, Parser<unknown>>> =
  P extends Read<infer T> ?
    S extends `${T}${infer Rest}` ? [T, Rest] :
    string extends S ? [T, string] :
    Fail<`${S} is not starts with ${T}`>

  : P extends Constant<infer V, infer P1> ?
    Parse<P1, S, E> extends Fail<infer F> ? Fail<F>
    : Parse<P1, S, E> extends [infer V1, infer S1] ? [V, S1]
    : Bug<'ParseImpl:Constant:1'>

  : P extends Choose<unknown, infer P1, infer P2> ?
    Parse<P1, S, E> extends Fail<unknown> ?
      Parse<P2, S, E> extends Fail<unknown> ? Fail<`Choose failed at ${S}`>
      : Parse<P2, S, E> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : Bug<'ParseImpl:Choose:1'>
    : Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : Bug<'ParseImpl:Choose:2'>

  : P extends Seq<unknown, unknown, infer P1, infer P2> ?
      Parse<P1, S, E> extends Fail<infer Err> ? Fail<Err> :
      Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1, E> extends Fail<infer Err> ? Fail<Err> :
        Parse<P2, S1, E> extends [infer T2, Match<infer S2, string>] ?
          [[T1, T2], S2]
          : Bug<'ParseImpl:Seq:1'>
        : Bug<'ParseImpl:Seq:2'>

  : P extends PickFirst<unknown, infer P1, infer P2> ?
    Parse<P1, S, E> extends Fail<infer M> ? Fail<M>
    : Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ?
      Parse<P2, S1, E> extends Fail<infer M> ? Fail<M>
      : Parse<P2, S1, E> extends [unknown, Match<infer S2, string>] ?
        [T1, S2]
        : Bug<'ParseImpl:PickFirst:1'>
    : Bug<'ParseImpl:PickFirst:2'>

  : P extends PickSecond<unknown, infer P1, infer P2> ?
    Parse<P1, S, E> extends Fail<infer M> ? Fail<M>
    : Parse<P1, S, E> extends [unknown, Match<infer S1, string>] ?
      Parse<P2, S1, E> extends Fail<infer M> ? Fail<M>
      : Parse<P2, S1, E> extends [infer T2, Match<infer S2, string>] ?
        [T2, S2]
        : Bug<'ParseImpl:PickSecond:1'>
    : Bug<'ParseImpl:PickSecond:2'>

  : P extends Rep0<unknown, infer P1> ?
    Parse<P1, S, E> extends infer R1 ?
      R1 extends Fail<unknown> ? [[], S]
      : R1 extends [infer T1, Match<infer S1, string>] ?
        Parse<P, S1, E> extends [Match<infer T2, unknown[]>, Match<infer S2, string>] ?
          [[T1, ...T2], S2]
          : Bug<['Rep0:1', Parse<P, S1, E>]>
        : Bug<'ParseImpl:Rep0:2'>
    : Bug<'ParseImpl:Rep0:3'>

  : P extends Opt<unknown, infer P1, infer D> ?
    Parse<P1, S, E> extends Fail<unknown> ? [D, S] :
    Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ? [T1, S1] :
    Bug<'ParseImpl:Opt:1'>

  : P extends Prepend<unknown, unknown[], infer P1, infer P2> ?
    Parse<P1, S, E> extends infer R1 ?
      R1 extends Fail<infer M> ? Fail<M> :
      R1 extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1, E> extends infer R2 ?
          R2 extends Fail<infer M> ? Fail<M> :
          R2 extends [Match<infer T2, unknown[]>, Match<infer S2, string>] ?
            [[T1, ...T2], S2]
            : Bug<'ParseImpl:Prepend:1'>
        : Bug<'ParseImpl:Prepend:2'>
      : Bug<'ParseImpl:Prepend:3'>
    : Bug<'ParseImpl:Prepend:4'>

  : P extends Ref<unknown, infer K> ?
    K extends keyof E ?  Parse<E[K], S, E>
    : Fail<`Reference not found: ${K}`>

  : P extends Join<string[], infer P1> ?
    Parse<P1, S, E> extends Fail<infer M> ? Fail<M> :
    Parse<P1, S, E> extends [Match<infer T1, string[]>, Match<infer S1, string>] ?
      [_Join<T1>, S1]
      : Bug<'ParseImpl:Join:1'>

  : Bug<'ParseImpl:1(Unknown parser definition)'>
*/

function parse_error(s: string, p: Parser<unknown>): never {
  throw new Error(`Parse error at ${s}, parser=${JSON.stringify(p)}`);
}

export function parse<
  P extends Parser<unknown>,
  S extends string,
  E extends Record<string, Parser<unknown>>
>(p: P, s: S, env: E): ParseVM<P, S, E>;
export function parse(
  p: Parser<unknown>,
  s: string,
  env: Environment
): [unknown, string] {
  switch (p.type) {
    case "any_char":
      if (s.length === 0) parse_error(s, p);
      return [s[0], s.substr(1)];
    case "read": {
      for (const pat of p.pattern) {
        if (s.startsWith(pat)) {
          return [pat, s.substr(pat.length)];
        }
      }
      return parse_error(s, p);
    }
    case "constant": {
      const [, s1] = parse(p.parser, s, env);
      return [p.value, s1];
    }
    case "choose":
      try {
        return parse(p.p1, s, env);
      } catch {
        return parse(p.p2, s, env);
      }
    case "seq": {
      const [v1, s1] = parse(p.p1, s, env);
      const [v2, s2] = parse(p.p2, s1, env);
      return [[v1, v2], s2];
    }
    case "pickFirst": {
      const [v1, s1] = parse(p.p1, s, env);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [v2, s2] = parse(p.p2, s1, env);
      return [v1, s2];
    }
    case "pickSecond": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [v1, s1] = parse(p.p1, s, env);
      const [v2, s2] = parse(p.p2, s1, env);
      return [v2, s2];
    }
    case "rep0": {
      let v1!: unknown;
      let s1!: string;
      try {
        [v1, s1] = parse(p.p, s, env);
      } catch {
        return [[], s];
      }
      const [v2, s2] = parse(p, s1, env);
      return [[v1, ...v2], s2];
    }
    case "opt": {
      try {
        return parse(p.p, s, env);
      } catch {
        return [p.default, s];
      }
    }
    case "prepend": {
      const [v1, s1] = parse(p.p1, s, env);
      const [v2, s2] = parse(p.p2, s1, env);
      return [[v1, ...v2], s2];
    }
    case "join": {
      const [v1, s1] = parse(p.p, s, env);
      return [v1.join(""), s1];
    }
    case "ref": {
      const parser = env[p.key];
      if (!parser) throw new Error(`Reference not found: ${p.key}`);
      return parse(parser, s, env);
    }
  }
}
