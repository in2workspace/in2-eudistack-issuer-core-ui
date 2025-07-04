import { convertToOrderedArray } from "./fields-order-helpers";


describe('convertToOrderedArray', () => {
  it('should return ordered array of key-value pairs based on keysOrder', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = convertToOrderedArray(obj, ['b', 'a', 'c']);
    expect(result).toEqual([
      { key: 'b', value: 2 },
      { key: 'a', value: 1 },
      { key: 'c', value: 3 },
    ]);
  });

  it('should filter out keys not present in the object', () => {
    const obj = { x: 10, y: 20 };
    const result = convertToOrderedArray(obj, ['y', 'z', 'x'] as any);
    expect(result).toEqual([
      { key: 'y', value: 20 },
      { key: 'x', value: 10 },
    ]);
  });

  it('should return an empty array when keysOrder is empty', () => {
    const obj = { foo: 'bar', baz: 'qux' };
    const result = convertToOrderedArray(obj, []);
    expect(result).toEqual([]);
  });

  it('should only include keys specified in keysOrder', () => {
    const obj = { name: 'Alice', age: 30, city: 'London' };
    const result = convertToOrderedArray(obj, ['age', 'name']);
    expect(result).toEqual([
      { key: 'age', value: 30 },
      { key: 'name', value: 'Alice' },
    ]);
  });

  it('should work with objects having different value types', () => {
    const obj = { flag: true, count: 5, label: 'Test' };
    const result = convertToOrderedArray(obj, ['label', 'flag', 'count']);
    expect(result).toEqual([
      { key: 'label', value: 'Test' },
      { key: 'flag', value: true },
      { key: 'count', value: 5 },
    ]);
  });

  it('should preserve keysOrder even if object has extra properties', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = convertToOrderedArray(obj, ['d', 'b', 'a']);
    expect(result).toEqual([
      { key: 'd', value: 4 },
      { key: 'b', value: 2 },
      { key: 'a', value: 1 },
    ]);
  });
});
