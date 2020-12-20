# Experimental type level parser combinator library for TypeScript 4.1

```typescript
const parser_ab = rep0(read('a', 'b'))

// [parse result, not consumed input]
const abab_x: ['abab', 'x'] = parse(parser_ab, 'ababx', {})
```

See [tests](src/index.test.ts) for usage.

[解説記事](https://zenn.dev/todesking/articles/d5c88b046c59f2ed76bb)
