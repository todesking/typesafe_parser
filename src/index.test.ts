import { Parser, parse, constant, choose, seq, pickFirst } from "./";

function str(s: string): string {
  return s;
}

function eq<T>(actual: T, expected: T): void {
  expect(actual).toStrictEqual(expected);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ensureNever(x: never): never {
  return x;
}

test("constatnt", () => {
  const parser = constant("foo", 1 as const);

  const ok1: [1, ""] = parse(parser, "foo");
  eq(ok1, [1, ""]);

  const ok2: [1, "!!!"] = parse(parser, "foo!!!");
  eq(ok2, [1, "!!!"]);

  const parser2: Parser<1> = constant("foo", 1);
  const ok3: [1, string] = parse(parser2, "foo!!!");
  eq(ok3, [1, "!!!"]);

  const ok4: [1, string] = parse(parser as Parser<1>, "foobar");
  eq(ok4, [1, "bar"]);

  const ok5: [unknown, string] = parse(parser as Parser<unknown>, "foobar");
  eq(ok5, [1, "bar"]);

  expect(() => {
    ensureNever(parse(parser, "boo"));
  }).toThrow();
});

test("choose", () => {
  const parser = choose(
    constant("foo", 1 as const),
    constant("bar", [2] as const)
  );

  const ok1: [1, ""] = parse(parser, "foo");
  eq(ok1, [1, ""]);

  const ok2: [readonly [2], ""] = parse(parser, "bar");
  eq(ok2, [[2], ""]);

  expect(() => {
    ensureNever(parse(parser, "buz"));
  }).toThrow();
});

test("seq", () => {
  const parser = seq(constant("foo", 1 as const), constant("bar", 2 as const));

  const ok1: [[1, 2], ""] = parse(parser, "foobar");
  eq(ok1, [[1, 2], ""]);

  const ok2: [[1, 2], "abc"] = parse(parser, "foobarabc");
  eq(ok2, [[1, 2], "abc"]);

  const ok3: [[1, 2], string] = parse(parser, str("foobarabc"));
  eq(ok3, [[1, 2], "abc"]);

  const ok4: [[1, 2], string] = parse(parser as Parser<[1, 2]>, "foobar");
  eq(ok4, [[1, 2], ""]);

  expect(() => {
    ensureNever(parse(parser, "barfoo"));
  }).toThrow();
});

test("pickFirst", () => {
  const parser = pickFirst(
    constant("foo", 1 as const),
    constant("bar", 2 as const)
  );

  const ok1: [1, ""] = parse(parser, "foobar");
  eq(ok1, [1, ""]);

  const ok2: [1, "x"] = parse(parser, "foobarx");
  eq(ok2, [1, "x"]);

  const ok3: [1, string] = parse(parser, str("foobarx"));
  eq(ok3, [1, "x"]);

  const ok4: [1, string] = parse(parser as Parser<1>, "foobar");
  eq(ok4, [1, ""]);

  expect(() => {
    ensureNever(parse(parser, "foo"));
  }).toThrow();
  expect(() => {
    ensureNever(parse(parser, ""));
  }).toThrow();
});
