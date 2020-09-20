import {head} from "./"

test('head', () => {
  const a: 1 = head([1, 2, 3] as const)
  expect(head([1,2,3])).toBe(1)
  expect(() => head([])).toThrow()
})
