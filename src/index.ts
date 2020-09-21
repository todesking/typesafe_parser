const resultTag: any = null

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

export type Seq<T1, T2, P1 extends Parser<T1>, P2 extends Parser<T2>> = {
  type: 'seq',
  p1: P1,
  p2: P2,
  _result: [T1, T2]
}

export function seq<T1, T2, P1 extends Parser<T1>, P2 extends Parser<T2>>(p1: P1, p2: P2)
: Seq<T1, T2, P1, P2> {
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

export function pickFirst<T, P1 extends Parser<T>, P2 extends Parser<unknown>>(p1: P1, p2: P2)
: PickFirst<T, P1, P2> {
  return {
    type: 'pickFirst',
    p1: p1,
    p2: p2,
    _result: resultTag
  }
}

export type Parser<T> =
  Constant<T, string>
  | ChooseRec<T>
  | (SeqRec & {_result: T})
  | PickFirstRec<T>

interface ChooseRec<T> extends Choose<T, Parser<T>, Parser<T>> {}
interface SeqRec extends Seq<unknown, unknown, Parser<unknown>, Parser<unknown>> {}
interface PickFirstRec<T> extends PickFirst<T, Parser<T>, Parser<unknown>> {}

type Match<T extends U, U> = T

// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type Same<T, U> =
  (<X>() => X extends T ? 1 : 2) extends (<X>() => X extends U ? 1 : 2) ? true : false

export type Parse<P extends Parser<unknown>, S extends string> =
  P[] extends {_result: infer T}[] ? Same<Parser<T>, P> extends true ? [T, string]
    : P extends Constant<unknown, infer P> ?
      S extends `${P}${infer Rest}` ? [T, Rest] :
      string extends S ? [T, string] : never
    : P extends Choose<unknown, infer P1, infer P2> ?
      Parse<P1, S> extends never ?
        Parse<P2, S> extends never ? never
        : Parse<P2, S> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : never
      : Parse<P1, S> extends [infer T1, Match<infer S1, string>] ? [T1, S1] : never
    : P extends Seq<unknown, unknown, infer P1, infer P2> ?
        Parse<P1, S> extends never ? never :
        Parse<P1, S> extends [infer T1, Match<infer S1, string>] ?
          Parse<P2, S1> extends never ? never :
          Parse<P2, S1> extends [infer T2, Match<infer S2, string>] ?
            [[T1, T2], S2]
            : never
          : never
    : P extends PickFirst<unknown, infer P1, infer P2> ?
      Parse<P1, S> extends never ? never
      : Parse<P1, S> extends [infer T1, Match<infer S1, string>] ?
        Parse<P2, S1> extends never ? never
        : Parse<P2, S1> extends [unknown, Match<infer S2, string>] ?
          [T1, S2]
          : never
      : never
    : [P['_result'], string]
  : never

function parse_error(s: string): never {
  throw `Parse error at ${s}`
}

export function parse<P extends Parser<unknown>, S extends string>(p: P, s: S): Parse<P, S> {
  const generic_parser: Parser<P['_result']> = p
  switch(generic_parser.type) {
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
      const [v2, s2] = parse(generic_parser.p2, s1)
      return [v1, s2] as any
    }
  }
}
