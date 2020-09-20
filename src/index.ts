export type Constant<P extends string, V> = {
  type: 'constant',
  pattern: P,
  value: V
}

export function constant<P extends string, V>(p: P, v: V): Constant<P, V> {
  return {
    type: 'constant',
    pattern: p,
    value: v
  }
}

export type Parser<T> =
  Constant<string, T>

export type Parse<T, P extends Parser<T>, S extends string> =
  P extends Constant<infer P, infer V> ?
    S extends `${P}${infer Rest}` ? [V, Rest] :
    string extends S ? [V, string] : never
  : [T, string]

function parse_error(s: string): never {
  throw '!!!'
}

export function parse<T, P extends Parser<T>, S extends string>(p: P, s: S): Parse<T, P, S> {
  const generic_parser: Parser<T> = p
  switch(generic_parser.type) {
    case 'constant':
      if(s.startsWith(generic_parser.pattern)) {
        return [generic_parser.value, s.substr(generic_parser.pattern.length)] as any
      }
      parse_error(s)
  }
}
