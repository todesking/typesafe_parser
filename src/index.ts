export type Head<T extends readonly unknown[]> = T[0]

export function head<T extends readonly unknown[]>(t: T): Head<T> {
  if(t.length == 0) throw '!!!'
  return t[0]
}

