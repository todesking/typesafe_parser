const resultTag: any = null

export type Read<P extends string> = {
  type: 'read',
  pattern: P,
  _result: P
}

export function read<P extends string>(p: P): Read<P> {
  return {
    type: 'read',
    pattern: p,
    _result: p
  }
}

export type Constant<T, P extends Parser<unknown>> = {
  type: 'constant',
  parser: P,
  value: T,
  _result: T
}

export function constant<P extends Parser<unknown>, T>(p: P, v: T): Constant<T, P> {
  return {
    type: 'constant',
    parser: p,
    value: v,
    _result: resultTag
  }
}

export function read_const<P extends string, V>(p: P, v: V)
: Constant<V, Read<P>> {
  return constant(read(p), v)
}

export type Choose<T, P1 extends Parser<T>, P2 extends Parser<T>> = {
  type: 'choose',
  p1: P1,
  p2: P2,
  _result: T
}

export function choose<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(
  p1: P1,
  p2: P2
): Choose<P1['_result'] | P2['_result'], P1, P2> {
  return {
    type: 'choose',
    p1: p1,
    p2: p2,
    _result: resultTag
  }
}

export type Seq<T1, T2, P1 extends Parser<unknown>, P2 extends Parser<unknown>> = {
  type: 'seq',
  p1: P1,
  p2: P2,
  _result: [T1, T2]
}

export function seq< P1 extends Parser<unknown>, P2 extends Parser<unknown>>(p1: P1, p2: P2)
: Seq<P1['_result'], P2['_result'], P1, P2> {
  return {
    type: 'seq',
    p1: p1,
    p2: p2,
    _result: resultTag
  }
}

export type PickFirst<T, P1 extends Parser<T>, P2 extends Parser<unknown>> = {
  type: 'pickFirst',
  p1: P1,
  p2: P2,
  _result: T
}

export function pickFirst<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(p1: P1, p2: P2)
: PickFirst<P1['_result'], P1, P2> {
  return {
    type: 'pickFirst',
    p1: p1,
    p2: p2,
    _result: resultTag
  }
}

export type PickSecond<T, P1 extends Parser<unknown>, P2 extends Parser<T>> = {
  type: 'pickSecond',
  p1: P1,
  p2: P2,
  _result: T
}

export function pickSecond<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(p1: P1, p2: P2)
: PickSecond<P2['_result'], P1, P2> {
  return {
    type: 'pickSecond',
    p1: p1,
    p2: p2,
    _result: resultTag
  }
}

export type Rep0<E, P extends Parser<E>> = {
  type: 'rep0',
  p: P,
  _result: E[]
}

export function rep0<P extends Parser<unknown>>(p: P)
: Rep0<P['_result'], P> {
  return {
    type: 'rep0',
    p: p,
    _result: resultTag
  }
}

export type Opt<T, P extends Parser<T>, D> = {
  type: 'opt',
  p: P,
  default: D,
  _result: T
}

export function opt<P extends Parser<unknown>, D>(p: P, d: D)
: Opt<P['_result'] | D, P, D> {
  return {
    type: 'opt',
    p: p,
    default: d,
    _result: resultTag
  }
}

export type Prepend<T1, T2 extends unknown[], P1 extends Parser<T1>, P2 extends Parser<T2>> = {
  type: 'prepend',
  p1: P1,
  p2: P2,
  _result: [T1, ...T2]
}

export function prepend<P1 extends Parser<unknown>, P2 extends Parser<unknown[]>>(p1: P1, p2: P2)
: Prepend<P1['_result'], P2['_result'], P1, P2> {
  return {
    type: 'prepend',
    p1: p1,
    p2: p2,
    _result: resultTag
  }
}

export function rep1<P extends Parser<unknown>>(p: P)
: Prepend<P['_result'], Rep0<P['_result'], P>['_result'], P, Rep0<P['_result'], P>> {
  return prepend(p, rep0(p))
}

export type Join<T extends string[], P extends Parser<T>> = {
  type: 'join',
  p: P,
  _result: T
}

export function join<P extends Parser<string[]>>(p: P)
: Join<P['_result'], P> {
  return {
    type: 'join',
    p: p,
    _result: resultTag
  }
}

export function wrap<
  P1 extends Parser<unknown>,
  P2 extends Parser<unknown>,
  P3 extends Parser<unknown>
>(p1: P1, p2: P2, p3: P3)
: PickSecond<P2['_result'], P1, PickFirst<P2['_result'], P2, P3>> {
  return pickSecond(p1, pickFirst(p2, p3))
}

export type Rep1Sep<P1 extends Parser<unknown>, P2 extends Parser<unknown>> =
  Prepend<P1['_result'], P1['_result'][], P1, Rep0<P1['_result'], PickSecond<P1['_result'], P2, P1>>>

export function rep1sep<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(p1: P1, p2: P2)
: Rep1Sep<P1, P2> {
  return prepend(p1, rep0(pickSecond(p2, p1)))
}

export function rep0sep<P1 extends Parser<unknown>, P2 extends Parser<unknown>>(p1: P1, p2: P2)
: Opt<Rep1Sep<P1, P2>['_result'] | [], Rep1Sep<P1, P2>, []> {
  return opt(rep1sep(p1, p2), [])
}

export type Ref<T, K extends string> = {
  type: 'ref',
  key: K,
  _result: T
}

export function ref<T>(): <K extends string>(key: K) => Ref<T, K> {
  return <K>(key: K) => ({
    type: 'ref',
    key: key,
    _result: resultTag
  })
}

export type Parser<T> =
  (Read<string> & {_result: T})
  | ConstantRec<T>
  | ChooseRec<T>
  | (SeqRec & {_result: T})
  | PickFirstRec<T>
  | PickSecondRec<T>
  | (Rep0Rec & {_result: T})
  | (PrependRec & {_result: T})
  | (JoinRec & {_result: T})
  | (OptRec & {_result: T})
  | Ref<T, string>

interface ConstantRec<T> extends Constant<T, Parser<unknown>> {}
interface ChooseRec<T> extends Choose<T, Parser<T>, Parser<T>> {}
interface SeqRec extends Seq<unknown, unknown, Parser<unknown>, Parser<unknown>> {}
interface PickFirstRec<T> extends PickFirst<T, Parser<T>, Parser<unknown>> {}
interface PickSecondRec<T> extends PickSecond<T, Parser<unknown>, Parser<T>> {}
interface Rep0Rec extends Rep0<unknown, Parser<unknown>> {}
interface PrependRec extends Prepend<unknown, unknown[], Parser<unknown>, Parser<unknown[]>> {}
interface JoinRec extends Join<string[], Parser<string[]>> {}
interface OptRec extends Opt<unknown, Parser<unknown>, unknown> {}

type Match<T extends U, U> = T

export type Fail<Msg> = {fail: Msg}

type Bug<Msg> = {bug: Msg}

type _Join<T extends string[]> =
  string[] extends T ? string :
  T extends [] ? '' :
  T extends [Match<infer T1, string>, ...Match<infer T2, string[]>] ? `${T1}${_Join<T2>}` :
  never

// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type Same<T, U> =
  (<X>() => X extends T ? 1 : 2) extends (<X>() => X extends U ? 1 : 2) ? true : false

export type Parse<P extends Parser<unknown>, S extends string, E extends Record<string, Parser<unknown>>> =
  // P is Parser<T> ?
  P[] extends {_result: infer T}[] ? Same<Parser<T>, P> extends true ? [T, string]

  // S is string ?
  : string extends S ? [T, string]

  : P extends Read<infer T> ?
    S extends `${T}${infer Rest}` ? [T, Rest] :
    string extends S ? [T, string] :
    Fail<`${S} is not starts with ${T}`>

  : P extends Constant<infer V, infer P1> ?
    Parse<P1, S, E> extends Fail<infer F> ? Fail<F>
    : Parse<P1, S, E> extends [infer V1, infer S1] ? [V, S1]
    : Bug<'Constant:1'>

  : P extends Choose<unknown, infer P1, infer P2> ?
    Parse<P1, S, E> extends Fail<unknown> ?
      Parse<P2, S, E> extends Fail<unknown> ? Fail<`Choose failed at ${S}`>
      : Parse<P2, S, E> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : Bug<'Choose:1'>
    : Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : Bug<'Choose:2'>

  : P extends Seq<unknown, unknown, infer P1, infer P2> ?
      Parse<P1, S, E> extends Fail<infer Err> ? Fail<Err> :
      Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1, E> extends Fail<infer Err> ? Fail<Err> :
        Parse<P2, S1, E> extends [infer T2, Match<infer S2, string>] ?
          [[T1, T2], S2]
          : Bug<'Seq:1'>
        : Bug<'Seq:2'>

  : P extends PickFirst<unknown, infer P1, infer P2> ?
    Parse<P1, S, E> extends Fail<infer M> ? Fail<M>
    : Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ?
      Parse<P2, S1, E> extends Fail<infer M> ? Fail<M>
      : Parse<P2, S1, E> extends [unknown, Match<infer S2, string>] ?
        [T1, S2]
        : Bug<'PickFirst:1'>
    : Bug<'PickFirst:2'>

  : P extends PickSecond<unknown, infer P1, infer P2> ?
    Parse<P1, S, E> extends Fail<infer M> ? Fail<M>
    : Parse<P1, S, E> extends [unknown, Match<infer S1, string>] ?
      Parse<P2, S1, E> extends Fail<infer M> ? Fail<M>
      : Parse<P2, S1, E> extends [infer T2, Match<infer S2, string>] ?
        [T2, S2]
        : Bug<'PickSecond:1'>
    : Bug<'PickSecond:2'>

  : P extends Rep0<unknown, infer P1> ?
    Parse<P1, S, E> extends infer R1 ?
      R1 extends Fail<unknown> ? [[], S]
      : R1 extends [infer T1, Match<infer S1, string>] ?
        Parse<P, S1, E> extends [Match<infer T2, unknown[]>, Match<infer S2, string>] ?
          [[T1, ...T2], S2]
          : Bug<['Rep0:1', Parse<P, S1, E>]>
        : Bug<'Rep0:2'>
    : Bug<'Rep0:3'>

  : P extends Opt<unknown, infer P1, infer D> ?
    Parse<P1, S, E> extends Fail<unknown> ? [D, S] :
    Parse<P1, S, E> extends [infer T1, Match<infer S1, string>] ? [T1, S1] :
    Bug<'Opt:1'>

  : P extends Prepend<unknown, unknown[], infer P1, infer P2> ?
    Parse<P1, S, E> extends infer R1 ?
      R1 extends Fail<infer M> ? Fail<M> :
      R1 extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1, E> extends infer R2 ?
          R2 extends Fail<infer M> ? Fail<M> :
          R2 extends [Match<infer T2, unknown[]>, Match<infer S2, string>] ?
            [[T1, ...T2], S2]
            : Bug<'Prepend:1'>
        : Bug<'Prepend:2'> 
      : Bug<'Prepend:3'>
    : Bug<'Prepend:4'>

  : P extends Ref<unknown, infer K> ?
    K extends keyof E ?  Parse<E[K], S, E>
    : Fail<`Reference not found: ${K}`>

  : P extends Join<string[], infer P1> ?
    Parse<P1, S, E> extends Fail<infer M> ? Fail<M> :
    Parse<P1, S, E> extends [Match<infer T1, string[]>, Match<infer S1, string>] ?
      [_Join<T1>, S1]
      : Bug<'Join:1'>

  : Bug<'Root:1(Unknown parser definition)'>
  : Bug<'Root:2'>

function parse_error(s: string, p: Parser<unknown>): never {
  throw new Error(`Parse error at ${s}, parser=${JSON.stringify(p)}`)
}

export function parse<P extends Parser<unknown>, S extends string, E extends Record<string, Parser<unknown>>>(p: P, s: S, env: E)
: Parse<P, S, typeof env extends undefined ? Record<string, Parser<unknown>> : E> {
  const generic_parser: Parser<P['_result']> = p
  switch(generic_parser.type) {
    case 'read': {
      if(s.startsWith(generic_parser.pattern)) {
        return [generic_parser.pattern, s.substr(generic_parser.pattern.length)] as any
      }
      return parse_error(s, p)
    }
    case 'constant': {
      const [v1, s1] = parse(generic_parser.parser, s, env)
      return [generic_parser.value, s1] as any
    }
    case 'choose':
      try {
        return parse(generic_parser.p1, s, env) as any
      } catch {
        return parse(generic_parser.p2, s, env) as any
      }
    case 'seq': {
      const [v1, s1] = parse(generic_parser.p1, s, env)
      const [v2, s2] = parse(generic_parser.p2, s1, env)
      return [[v1, v2], s2] as any
    }
    case 'pickFirst': {
      const [v1, s1] = parse(generic_parser.p1, s, env)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [v2, s2] = parse(generic_parser.p2, s1, env)
      return [v1, s2] as any
    }
    case 'pickSecond': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [v1, s1] = parse(generic_parser.p1, s, env)
      const [v2, s2] = parse(generic_parser.p2, s1, env)
      return [v2, s2] as any
    }
    case 'rep0': {
      let v1!: unknown
      let s1!: string
      try {
        [v1, s1] = parse(generic_parser.p, s, env)
      } catch {
        return [[], s] as any
      }
      const [v2, s2] = parse(generic_parser, s1, env)
      return [[v1, ...v2], s2] as any
    }
    case 'opt': {
      try {
        return parse(generic_parser.p, s, env) as any
      } catch {
        return [generic_parser.default, s] as any
      }
    }
    case 'prepend': {
      const [v1, s1] = parse(generic_parser.p1, s, env)
      const [v2, s2] = parse(generic_parser.p2, s1, env)
      return [[v1, ...v2], s2] as any
    }
    case 'join': {
      const [v1, s1] = parse(generic_parser.p, s, env)
      return [v1.join(''), s1] as any
    }
    case 'ref': {
      const parser = env[generic_parser.key]
      if(!parser) throw new Error(`Reference not found: ${generic_parser.key}`)
      return parse(parser, s, env) as any
    }
  }
}
