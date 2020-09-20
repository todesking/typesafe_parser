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

export type Parser<T> =
  Constant<T, string>
  | ChooseRec<T>

interface ChooseRec<T> extends Choose<T, Parser<T>, Parser<T>> {}

type Match<T extends U, U> = T

export type Parse<P extends Parser<unknown>, S extends string> =
  Parser<unknown> extends P ?
    P extends Parser<infer T> ? [T, string] : never
  : P extends Constant<infer T, infer P> ?
    S extends `${P}${infer Rest}` ? [T, Rest] :
    string extends S ? [T, string] : never
  : P extends Choose<infer T, infer P1, infer P2> ?
    Parse<P1, S> extends never ?
      Parse<P2, S> extends never ? never 
      : Parse<P2, S> extends [infer T1, infer S1] ? [T1, S1] : never
    : Parse<P1, S> extends [infer T1, infer S1] ? [T1, S1] : never
  : [P['_result'], string]

function parse_error(s: string): never {
  throw '!!!'
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
  }
}
