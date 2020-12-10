import {
  parse,
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
  read_const,
  wrap,
  rep1sep,
  rep0sep,
  opt,
  ref,
  small_alpha,
  capital_alpha,
  nonzero_number,
  number,
  pickSecondOf3,
  anyChar,
} from "./";

function str(s: string): string {
  return s;
}

type Same<T, U> = (<X>() => X extends T ? 1 : 2) extends <X>() => X extends U
  ? 1
  : 2
  ? void
  : ["Not same", T, U];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function tassert<T extends void>() {}

function eq<T>(actual: T, expected: T): void {
  expect(actual).toStrictEqual(expected);
}

function makeTuple<T extends unknown[]>(...items: T): T {
  return items;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ensureFail<T>(x: Fail<T>): void {}

test("read", () => {
  const parser = read("a");

  const ok1 = parse(parser, "aabb", {});
  tassert<Same<typeof ok1, ["a", "abb"]>>();
  eq(ok1, ["a", "abb"]);

  expect(() => {
    ensureFail(parse(parser, "", {}));
  }).toThrow();
  expect(() => {
    ensureFail(parse(parser, "ba", {}));
  }).toThrow();
});

test("anyChar", () => {
  const ch = anyChar();

  const ok1 = parse(ch, "a", {});
  tassert<Same<typeof ok1, ["a", ""]>>();
  eq(ok1, ["a", ""]);

  const ok2 = parse(ch, "ab", {});
  tassert<Same<typeof ok2, ["a", "b"]>>();
  eq(ok2, ["a", "b"]);

  expect(() => {
    ensureFail(parse(ch, "", {}));
  }).toThrow();
});

test("constatnt", () => {
  const parser = read_const("foo", 1 as const);

  const ok1 = parse(parser, "foo", {});
  tassert<Same<typeof ok1, [1, ""]>>();
  eq(ok1, [1, ""]);

  const ok2 = parse(parser, "foo!!!", {});
  tassert<Same<typeof ok2, [1, "!!!"]>>();
  eq(ok2, [1, "!!!"]);

  /*
  const parser2: Parser<1> = read_const("foo", 1);
   const ok3 = parse(parser2, "foo!!!", {});
  tassert<Same<typeof ok3, [1, string]>>();
  eq(ok3, [1, "!!!"]);

   const ok4 = parse(parser as Parser<1>, "foobar", {});
  tassert<Same<typeof ok4, [1, string]>>();
  eq(ok4, [1, "bar"]);

   const ok5 = parse(parser as Parser<unknown>, "foobar", {});
  tassert<Same<typeof ok5, [unknown, string]>>();
  eq(ok5, [1, "bar"]);
  */

  expect(() => {
    ensureFail(parse(parser, "boo", {}));
  }).toThrow();
});

test("choose", () => {
  const parser = choose(
    read_const("foo", 1 as const),
    read_const("bar", [2] as const)
  );

  const ok1 = parse(parser, "foo", {});
  tassert<Same<typeof ok1, [1, ""]>>();
  eq(ok1, [1, ""]);

  const ok2 = parse(parser, "bar", {});
  tassert<Same<typeof ok2, [readonly [2], ""]>>();
  eq(ok2, [[2], ""]);

  expect(() => {
    ensureFail(parse(parser, "buz", {}));
  }).toThrow();
});

test("seq", () => {
  const parser = seq(
    read_const("foo", 1 as const),
    read_const("bar", 2 as const)
  );

  const ok1 = parse(parser, "foobar", {});
  tassert<Same<typeof ok1, [[1, 2], ""]>>();
  eq(ok1, [[1, 2], ""]);

  const ok2 = parse(parser, "foobarabc", {});
  tassert<Same<typeof ok2, [[1, 2], "abc"]>>();
  eq(ok2, [[1, 2], "abc"]);

  const ok3 = parse(parser, str("foobarabc"), {});
  tassert<Same<typeof ok3, [[1, 2], string]>>();
  eq(ok3, [[1, 2], "abc"]);

  /*
  const ok4 = parse(parser as Parser<[1, 2]>, "foobar", {});
  tassert<Same<typeof ok4, [[1, 2], string]>>();
  eq(ok4, [[1, 2], ""]);
  */

  expect(() => {
    ensureFail(parse(parser, "barfoo", {}));
  }).toThrow();
});

test("pickFirst", () => {
  const parser = pickFirst(
    read_const("foo", 1 as const),
    read_const("bar", 2 as const)
  );

  const ok1 = parse(parser, "foobar", {});
  tassert<Same<typeof ok1, [1, ""]>>();
  eq(ok1, [1, ""]);

  const ok2 = parse(parser, "foobarx", {});
  tassert<Same<typeof ok2, [1, "x"]>>();
  eq(ok2, [1, "x"]);

  const ok3 = parse(parser, str("foobarx"), {});
  tassert<Same<typeof ok3, [1, string]>>();
  eq(ok3, [1, "x"]);

  //  const ok4 = parse(parser as Parser<1>, "foobar", {});
  // tassert<Same<typeof ok4, [1, string]>>();
  // eq(ok4, [1, ""]);

  expect(() => {
    ensureFail(parse(parser, "foo", {}));
  }).toThrow();
  expect(() => {
    ensureFail(parse(parser, "", {}));
  }).toThrow();
});

test("pickSecond", () => {
  const parser = pickSecond(
    read_const("foo", 1 as const),
    read_const("bar", 2 as const)
  );

  const ok1 = parse(parser, "foobar", {});
  tassert<Same<typeof ok1, [2, ""]>>();
  eq(ok1, [2, ""]);

  const ok2 = parse(parser, "foobarx", {});
  tassert<Same<typeof ok2, [2, "x"]>>();
  eq(ok2, [2, "x"]);

  const ok3 = parse(parser, str("foobarx"), {});
  tassert<Same<typeof ok3, [2, string]>>();
  eq(ok3, [2, "x"]);

  //  const ok4 = parse(parser as Parser<2>, "foobar", {});
  // tassert<Same<typeof ok4, [2, string]>>();
  // eq(ok4, [2, ""]);

  expect(() => {
    ensureFail(parse(parser, "foo", {}));
  }).toThrow();
  expect(() => {
    ensureFail(parse(parser, "", {}));
  }).toThrow();
});

test("rep0", () => {
  const parser = rep0(read_const("x", 1 as const));

  const ok1 = parse(parser, "", {});
  tassert<Same<typeof ok1, [[], ""]>>();
  eq(ok1, [[], ""]);

  const ok2 = parse(parser, "a", {});
  tassert<Same<typeof ok2, [[], "a"]>>();
  eq(ok2, [[], "a"]);

  const ok3 = parse(parser, "x", {});
  tassert<Same<typeof ok3, [[1], ""]>>();
  eq(ok3, [[1], ""]);

  const ok4 = parse(parser, "xx", {});
  tassert<Same<typeof ok4, [[1, 1], ""]>>();
  eq(ok4, [[1, 1], ""]);

  const ok5 = parse(parser, "xxa", {});
  tassert<Same<typeof ok5, [[1, 1], "a"]>>();
  eq(ok5, [[1, 1], "a"]);
});

test("prepend", () => {
  const parser = prepend(
    read_const("x", 1 as const),
    rep0(read_const("y", 2 as const))
  );

  const ok1 = parse(parser, "x", {});
  tassert<Same<typeof ok1, [[1], ""]>>();
  eq(ok1, [[1], ""]);

  const ok2 = parse(parser, "xy", {});
  tassert<Same<typeof ok2, [[1, 2], ""]>>();
  eq(ok2, [[1, 2], ""]);

  const ok3 = parse(parser, "xyya", {});
  tassert<Same<typeof ok3, [[1, 2, 2], "a"]>>();
  eq(ok3, [[1, 2, 2], "a"]);

  expect(() => {
    ensureFail(parse(parser, "y", {}));
  }).toThrow();
});

test("rep1", () => {
  const parser = rep1(read_const("x", 1 as const));

  const ok1 = parse(parser, "x", {});
  tassert<Same<typeof ok1, [[1], ""]>>();
  eq(ok1, [[1], ""]);
  const ok2 = parse(parser, "xxa", {});
  tassert<Same<typeof ok2, [[1, 1], "a"]>>();
  eq(ok2, [[1, 1], "a"]);

  expect(() => {
    ensureFail(parse(parser, "a", {}));
  }).toThrow();
});

test("rep1 rec limit", () => {
  const parser = rep1(read_const("x", 1 as const));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ok1: [
    [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1 // x10
    ],
    ""
  ] = parse(
    parser,
    "xxxxxxxxxx", // x10
    {}
  );
});

test("join", () => {
  const parser = join(rep0(read_const("x", "y" as const)));

  const ok1 = parse(parser, "a", {});
  tassert<Same<typeof ok1, ["", "a"]>>();
  eq(ok1, ["", "a"]);

  const ok2 = parse(parser, "xxx", {});
  tassert<Same<typeof ok2, ["yyy", ""]>>();
  eq(ok2, ["yyy", ""]);
});

test("wrap", () => {
  const parser = wrap(read("("), rep0(read("a")), read(")"));

  const ok1 = parse(parser, "()", {});
  tassert<Same<typeof ok1, [[], ""]>>();
  eq(ok1, [[], ""]);

  const ok2 = parse(parser, "(aa)", {});
  tassert<Same<typeof ok2, [["a", "a"], ""]>>();
  eq(ok2, [["a", "a"], ""]);
});

test("rep1sep", () => {
  const parser = rep1sep(read("a"), read(","));

  const ok1 = parse(parser, "a", {});
  tassert<Same<typeof ok1, [["a"], ""]>>();
  eq(ok1, [["a"], ""]);

  const ok2 = parse(parser, "a,ax", {});
  tassert<Same<typeof ok2, [["a", "a"], "x"]>>();
  eq(ok2, [["a", "a"], "x"]);

  expect(() => {
    ensureFail(parse(parser, "x", {}));
  }).toThrow();
});

test("opt", () => {
  const parser = opt(read("a"), null);

  const ok1 = parse(parser, "ab", {});
  tassert<Same<typeof ok1, ["a", "b"]>>();
  eq(ok1, ["a", "b"]);

  const ok2 = parse(parser, "b", {});
  tassert<Same<typeof ok2, [null, "b"]>>();
  eq(ok2, [null, "b"]);
});

test("rep0sep", () => {
  const parser = rep0sep(read("a"), read(","));

  const ok1 = parse(parser, "a", {});
  tassert<Same<typeof ok1, [["a"], ""]>>();
  eq(ok1, [["a"], ""]);

  const ok2 = parse(parser, "a,ax", {});
  tassert<Same<typeof ok2, [["a", "a"], "x"]>>();
  eq(ok2, [["a", "a"], "x"]);

  const ok3 = parse(parser, "x", {});
  tassert<Same<typeof ok3, [[], "x"]>>();
  eq(ok3, [[], "x"]);
});

test("ref", () => {
  const two = read("a");
  const one = ref<"a">()("two");
  const parser = ref<"a">()("one");
  const env = {
    one: one,
    two: two,
  };
  const ok1 = parse(parser, "a", env);
  tassert<Same<typeof ok1, ["a", ""]>>();
  eq(ok1, ["a", ""]);
});

test("complex: name", () => {
  const name = join(rep1(small_alpha));

  const ok1 = parse(name, "abcdefghijklmn aaa", {});
  const ex1 = makeTuple("abcdefghijklmn" as const, " aaa" as const);
  tassert<Same<typeof ok1, typeof ex1>>();
  eq(ok1, ex1);
});

test("complex: capital name", () => {
  const name = join(prepend(capital_alpha, rep0(small_alpha)));
  const env = {};

  const ok1 = parse(name, "A", env);
  tassert<Same<typeof ok1, ["A", ""]>>();
  eq(ok1, ["A", ""]);

  const ok2 = parse(name, "Foo!", env);
  tassert<Same<typeof ok2, ["Foo", "!"]>>();
  eq(ok2, ["Foo", "!"]);
});

test("complex: nested", () => {
  const exprRef = ref<unknown>()("expr");
  const name = join(rep1(read("a")));
  const tuple = wrap(read("("), rep0sep(exprRef, read(",")), read(")"));
  const expr = choose(name, tuple);
  const env = { expr: expr } as const;

  const ok1 = parse(expr, "()", env);
  tassert<Same<typeof ok1, [[], ""]>>();
  eq(ok1, [[], ""]);

  const ok2 = parse(expr, "aaa", env);
  tassert<Same<typeof ok2, ["aaa", ""]>>();
  eq(ok2, ["aaa", ""]);

  const ok3 = parse(expr, "(a)", env);
  tassert<Same<typeof ok3, [["a"], ""]>>();
  eq(ok3, [["a"], ""]);

  const ok4 = parse(expr, "(a,a)", env);
  tassert<Same<typeof ok4, [["a", "a"], ""]>>();
  eq(ok4, [["a", "a"], ""]);
  const ok5 = parse(expr, "(())", env);
  tassert<Same<typeof ok5, [[[]], ""]>>();
  eq(ok5, [[[]], ""]);
  const ok6 = parse(expr, "((a),(a,a,(a)))", env);
  tassert<Same<typeof ok6, [[["a"], ["a", "a", ["a"]]], ""]>>();
});

test("complex: expr", () => {
  // expr := expr1 (+ expr1)*
  // expr1 := expr2 (* expr2)*
  // expr2 = num | '(' expr ')'
  const exprRef = ref<unknown>()("expr");
  const num = join(prepend(nonzero_number, rep0(number)));
  const paren = pickSecondOf3(read("("), exprRef, read(")"));
  const expr2 = choose(num, paren);
  const expr1 = rep1sep(expr2, read("*"));
  const expr = rep1sep(expr1, read("+"));
  const env = { expr: expr };

  const ok1 = parse(expr, "1", env);
  tassert<Same<typeof ok1, [[["1"]], ""]>>();
  eq(ok1, [[["1"]], ""]);

  const ok2 = parse(expr, "(123)", env);
  tassert<Same<typeof ok2, [[[[["123"]]]], ""]>>();
  eq(ok2, [[[[["123"]]]], ""]);

  const ok3 = parse(expr, "1+2", env);
  tassert<Same<typeof ok3, [[["1"], ["2"]], ""]>>();
  eq(ok3, [[["1"], ["2"]], ""]);

  const ok4 = parse(expr, "1+2*3+4", env);
  tassert<Same<typeof ok4, [[["1"], ["2", "3"], ["4"]], ""]>>();
  eq(ok4, [[["1"], ["2", "3"], ["4"]], ""]);

  const ok5 = parse(expr, "1+2*(3+4)", env);
  tassert<Same<typeof ok5, [[["1"], ["2", [["3"], ["4"]]]], ""]>>();
  eq(ok5, [[["1"], ["2", [["3"], ["4"]]]], ""]);
});
