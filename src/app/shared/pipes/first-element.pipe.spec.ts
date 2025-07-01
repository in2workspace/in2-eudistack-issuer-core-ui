import { FirstElementPipe } from './first-element.pipe';

describe('FirstElementPipe', () => {
  let pipe: FirstElementPipe;

  beforeEach(() => {
    pipe = new FirstElementPipe();
  });

  it('should return the first element of a non-empty array', () => {
    const arr = [1, 2, 3];
    expect(pipe.transform(arr)).toBe(1);
  });

  it('should return null for an empty array', () => {
    const arr: any[] = [];
    expect(pipe.transform(arr)).toBeNull();
  });

  it('should return the first property value of an object', () => {
    // object property order is insertion order
    const obj = { a: 'first', b: 'second' };
    expect(pipe.transform(obj)).toBe('first');
  });

  it('should return undefined for an object with no properties', () => {
    const obj: Record<string, any> = {};
    expect(pipe.transform(obj)).toBeUndefined();
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should return null for non-array, non-object inputs', () => {
    expect(pipe.transform(123)).toBeNull();
    expect(pipe.transform('string')).toBeNull();
    expect(pipe.transform(true)).toBeNull();
  });
});
