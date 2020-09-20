import {Parser, parse, constant} from "./"

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
