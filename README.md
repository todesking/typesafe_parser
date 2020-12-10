# Experimental type level parser combinator library for TypeScript 4.1

```typescript
const parser_ab = rep0(read('a', 'b'))

// [parse result, not consumed input]
const abab_x: ['abab', 'x'] = parse(parser_ab, 'ababx', {})
```

See [tests](src/index.test.ts) for usage.
