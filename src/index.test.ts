import {
  Parser,
  parse,
  constant,
  choose,
  seq,
  pickFirst,
  pickSecond,
  rep0,
  prepend,
  rep1,
  Fail,
  join,
  read,
  wrap,
} from "./";

function str(s: string): string {
  return s;
}

function eq<T>(actual: T, expected: T): void {
  expect(actual).toStrictEqual(expected);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ensureFail<T>(x: Fail<T>): void {}

test("read", () => {
  const parser = read("a");

  const ok1: ["a", "abb"] = parse(parser, "aabb");
  eq(ok1, ["a", "abb"]);

  expect(() => {
    ensureFail(parse(parser, ""));
  }).toThrow();
  expect(() => {
    ensureFail(parse(parser, "ba"));
  }).toThrow();
});

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
    ensureFail(parse(parser, "boo"));
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
    ensureFail(parse(parser, "buz"));
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
    ensureFail(parse(parser, "barfoo"));
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
    ensureFail(parse(parser, "foo"));
  }).toThrow();
  expect(() => {
    ensureFail(parse(parser, ""));
  }).toThrow();
});

test("pickSecond", () => {
  const parser = pickSecond(
    constant("foo", 1 as const),
    constant("bar", 2 as const)
  );

  const ok1: [2, ""] = parse(parser, "foobar");
  eq(ok1, [2, ""]);

  const ok2: [2, "x"] = parse(parser, "foobarx");
  eq(ok2, [2, "x"]);

  const ok3: [2, string] = parse(parser, str("foobarx"));
  eq(ok3, [2, "x"]);

  const ok4: [2, string] = parse(parser as Parser<2>, "foobar");
  eq(ok4, [2, ""]);

  expect(() => {
    ensureFail(parse(parser, "foo"));
  }).toThrow();
  expect(() => {
    ensureFail(parse(parser, ""));
  }).toThrow();
});

test("rep0", () => {
  const parser = rep0(constant("x", 1 as const));

  const ok1: [[], ""] = parse(parser, "");
  eq(ok1, [[], ""]);

  const ok2: [[], "a"] = parse(parser, "a");
  eq(ok2, [[], "a"]);

  const ok3: [[1], ""] = parse(parser, "x");
  eq(ok3, [[1], ""]);

  const ok4: [[1, 1], ""] = parse(parser, "xx");
  eq(ok4, [[1, 1], ""]);

  const ok5: [[1, 1], "a"] = parse(parser, "xxa");
  eq(ok5, [[1, 1], "a"]);
});

test("prepend", () => {
  const parser = prepend(
    constant("x", 1 as const),
    rep0(constant("y", 2 as const))
  );

  const ok1: [[1], ""] = parse(parser, "x");
  eq(ok1, [[1], ""]);

  const ok2: [[1, 2], ""] = parse(parser, "xy");
  eq(ok2, [[1, 2], ""]);

  const ok3: [[1, 2, 2], "a"] = parse(parser, "xyya");
  eq(ok3, [[1, 2, 2], "a"]);

  expect(() => {
    ensureFail(parse(parser, "y"));
  }).toThrow();
});

test("rep1", () => {
  const parser = rep1(constant("x", 1 as const));

  const ok1: [[1], ""] = parse(parser, "x");
  eq(ok1, [[1], ""]);
  const ok2: [[1, 1], "a"] = parse(parser, "xxa");
  eq(ok2, [[1, 1], "a"]);

  expect(() => {
    ensureFail(parse(parser, "a"));
  }).toThrow();
});

test("join", () => {
  const parser = join(rep0(constant("x", "y" as const)));

  const ok1: ["", "a"] = parse(parser, "a");
  eq(ok1, ["", "a"]);

  const ok2: ["yyy", ""] = parse(parser, "xxx");
  eq(ok2, ["yyy", ""]);
});

test("wrap", () => {
  const parser = wrap(read("("), rep0(read("a")), read(")"));

  const ok1: [[], ""] = parse(parser, "()");
  eq(ok1, [[], ""]);

  const ok2: [["a", "a"], ""] = parse(parser, "(aa)");
  eq(ok2, [["a", "a"], ""]);
});
