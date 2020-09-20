import {Parser, parse, constant, choose} from "./"

function str(s: string): string { return s }

function eq<T>(actual: T, expected: T): void {
  expect(actual).toStrictEqual(expected)
}

test('constatnt', () => {
  const parser = constant('foo', 1 as const)

  const ok1: [1, ''] = parse(parser, 'foo')
  eq(ok1, [1, ''])

  const ok2: [1, '!!!'] = parse(parser, 'foo!!!')
  eq(ok2, [1, '!!!'])

  const parser2: Parser<1> = constant('foo', 1)
  const ok3: [1, string] = parse(parser2, 'foo!!!')
  eq(ok3, [1, '!!!'])

  expect(() => {
    const ng: never = parse(parser, 'boo')
  }).toThrow()
})

test('choose', () => {
  const parser = choose(constant('foo', 1 as const), constant('bar', [2] as const))

  const ok1: [1, ''] = parse(parser, 'foo')
  eq(ok1, [1, ''])

  const ok2: [readonly [2], ''] = parse(parser, 'bar')
  eq(ok2, [[2], ''])

  expect(() => {
    const ng: never = parse(parser, 'buz')
  }).toThrow()
})
