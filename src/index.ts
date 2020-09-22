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

export type Constant<T, P extends string> = {
  type: 'constant',
  pattern: P,
  value: T,
  _result: T
}

export function constant<P extends string, T>(p: P, v: T): Constant<T, P> {
  return {
    type: 'constant',
    pattern: p,
    value: v,
    _result: resultTag
  }
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

export type Parser<T> =
  (Read<string> & {_result: T})
  | Constant<T, string>
  | ChooseRec<T>
  | (SeqRec & {_result: T})
  | PickFirstRec<T>
  | PickSecondRec<T>
  | (Rep0Rec & {_result: T})
  | (PrependRec & {_result: T})
  | (JoinRec & {_result: T})

interface ChooseRec<T> extends Choose<T, Parser<T>, Parser<T>> {}
interface SeqRec extends Seq<unknown, unknown, Parser<unknown>, Parser<unknown>> {}
interface PickFirstRec<T> extends PickFirst<T, Parser<T>, Parser<unknown>> {}
interface PickSecondRec<T> extends PickSecond<T, Parser<unknown>, Parser<T>> {}
interface Rep0Rec extends Rep0<unknown, Parser<unknown>> {}
interface PrependRec extends Prepend<unknown, unknown[], Parser<unknown>, Parser<unknown[]>> {}
interface JoinRec extends Join<string[], Parser<string[]>> {}

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

export type Parse<P extends Parser<unknown>, S extends string> =
  // P is Parser<T> ?
  P[] extends {_result: infer T}[] ? Same<Parser<T>, P> extends true ? [T, string]

  // S is string ?
  : string extends S ? [T, string]

  : P extends Read<infer T> ?
    S extends `${T}${infer Rest}` ? [T, Rest] :
    string extends S ? [T, string] :
    Fail<`${S} is not starts with ${T}`>

  : P extends Constant<unknown, infer P> ?
    S extends `${P}${infer Rest}` ? [T, Rest] :
    string extends S ? [T, string] : Fail<`${S} is not starts with ${P}`>

  : P extends Choose<unknown, infer P1, infer P2> ?
    Parse<P1, S> extends Fail<unknown> ?
      Parse<P2, S> extends Fail<unknown> ? Fail<`Choose failed at ${S}`>
      : Parse<P2, S> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : Bug<'Choose:1'>
    : Parse<P1, S> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : Bug<'Choose:2'>

  : P extends Seq<unknown, unknown, infer P1, infer P2> ?
      Parse<P1, S> extends Fail<infer Err> ? Fail<Err> :
      Parse<P1, S> extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1> extends Fail<infer Err> ? Fail<Err> :
        Parse<P2, S1> extends [infer T2, Match<infer S2, string>] ?
          [[T1, T2], S2]
          : Bug<'Seq:1'>
        : Bug<'Seq:2'>

  : P extends PickFirst<unknown, infer P1, infer P2> ?
    Parse<P1, S> extends Fail<infer M> ? Fail<M>
    : Parse<P1, S> extends [infer T1, Match<infer S1, string>] ?
      Parse<P2, S1> extends Fail<infer M> ? Fail<M>
      : Parse<P2, S1> extends [unknown, Match<infer S2, string>] ?
        [T1, S2]
        : Bug<'PickFirst:1'>
    : Bug<'PickFirst:2'>

  : P extends PickSecond<unknown, infer P1, infer P2> ?
    Parse<P1, S> extends Fail<infer M> ? Fail<M>
    : Parse<P1, S> extends [unknown, Match<infer S1, string>] ?
      Parse<P2, S1> extends Fail<infer M> ? Fail<M>
      : Parse<P2, S1> extends [infer T2, Match<infer S2, string>] ?
        [T2, S2]
        : Bug<'PickSecond:1'>
    : Bug<'PickSecond:2'>

  : P extends Rep0<unknown, infer P1> ?
    Parse<P1, S> extends infer R1 ?
      R1 extends Fail<unknown> ? [[], S]
      : R1 extends [infer T1, Match<infer S1, string>] ?
        Parse<P, S1> extends [Match<infer T2, unknown[]>, Match<infer S2, string>] ?
          [[T1, ...T2], S2]
          : Bug<['Rep0:1', Parse<P, S1>]>
        : Bug<'Rep0:2'>
    : Bug<'Rep0:3'>

  : P extends Prepend<unknown, unknown[], infer P1, infer P2> ?
    Parse<P1, S> extends infer R1 ?
      R1 extends Fail<infer M> ? Fail<M> :
      R1 extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1> extends infer R2 ?
          R2 extends Fail<infer M> ? Fail<M> :
          R2 extends [Match<infer T2, unknown[]>, Match<infer S2, string>] ?
            [[T1, ...T2], S2]
            : Bug<'Prepend:1'>
        : Bug<'Prepend:2'> 
      : Bug<'Prepend:3'>
    : Bug<'Prepend:4'>

  : P extends Join<string[], infer P1> ?
    Parse<P1, S> extends Fail<infer M> ? Fail<M> :
    Parse<P1, S> extends [Match<infer T1, string[]>, Match<infer S1, string>] ?
      [_Join<T1>, S1]
      : Bug<'Join:1'>

  : Bug<'Root:1(Unknown parser definition)'>
  : Bug<'Root:2'>

function parse_error(s: string): never {
  throw `Parse error at ${s}`
}

export function parse<P extends Parser<unknown>, S extends string>(p: P, s: S): Parse<P, S> {
  const generic_parser: Parser<P['_result']> = p
  switch(generic_parser.type) {
    case 'read': {
      if(s.startsWith(generic_parser.pattern)) {
        return [generic_parser.pattern, s.substr(generic_parser.pattern.length)] as any
      }
      return parse_error(s)
    }
    case 'constant':
      if(s.startsWith(generic_parser.pattern)) {
        return [generic_parser.value, s.substr(generic_parser.pattern.length)] as any
      }
      return parse_error(s)
    case 'choose':
      try {
        return parse(generic_parser.p1, s) as any
      } catch {
        return parse(generic_parser.p2, s) as any
      }
    case 'seq': {
      const [v1, s1] = parse(generic_parser.p1, s)
      const [v2, s2] = parse(generic_parser.p2, s1)
      return [[v1, v2], s2] as any
    }
    case 'pickFirst': {
      const [v1, s1] = parse(generic_parser.p1, s)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [v2, s2] = parse(generic_parser.p2, s1)
      return [v1, s2] as any
    }
    case 'pickSecond': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [v1, s1] = parse(generic_parser.p1, s)
      const [v2, s2] = parse(generic_parser.p2, s1)
      return [v2, s2] as any
    }
    case 'rep0': {
      let v1!: unknown
      let s1!: string
      try {
        [v1, s1] = parse(generic_parser.p, s)
      } catch {
        return [[], s] as any
      }
      const [v2, s2] = parse(generic_parser, s1)
      return [[v1, ...v2], s2] as any
    }
    case 'prepend': {
      const [v1, s1] = parse(generic_parser.p1, s)
      const [v2, s2] = parse(generic_parser.p2, s1)
      return [[v1, ...v2], s2] as any
    }
    case 'join': {
      const [v1, s1] = parse(generic_parser.p, s)
      return [v1.join(''), s1] as any
    }
  }
}
