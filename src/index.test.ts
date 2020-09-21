import {Parser, parse, constant, choose, seq} from "./"

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

test('seq', () => {
  const parser = seq(constant('foo', 1 as const), constant('bar', 2 as const))

  const ok1: [[1, 2], ''] = parse(parser, 'foobar')
  eq(ok1, [[1,2], ''])

  const ok2: [[1, 2], 'abc'] = parse(parser, 'foobarabc')
  eq(ok2, [[1, 2], 'abc'])

  const ok3: [[1, 2], string] = parse(parser, str('foobarabc'))
  eq(ok3, [[1, 2], 'abc'])

  expect(() => {
    const ng: never = parse(parser, 'barfoo')
  }).toThrow()
})
