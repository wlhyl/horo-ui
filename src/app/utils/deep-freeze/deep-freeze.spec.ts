import { deepFreeze } from './deep-freeze';

describe('deepFreeze', () => {
  it('应该冻结一个简单对象', () => {
    const obj = { a: 1, b: 'hello' };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBeTrue();
    expect(() => {
      frozenObj.a = 2;
    }).toThrowError();
  });

  it('应该冻结一个包含嵌套对象的对象', () => {
    const obj = { a: 1, b: { c: 2, d: 'world' } };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBeTrue();
    expect(Object.isFrozen(frozenObj.b)).toBeTrue();
    expect(() => {
      frozenObj.b.c = 3;
    }).toThrowError();
  });

  it('应该冻结一个包含数组的对象', () => {
    const obj = { a: 1, arr: [1, { x: 10 }] };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBeTrue();
    expect(Object.isFrozen(frozenObj.arr)).toBeTrue();
    expect(Object.isFrozen(frozenObj.arr[1])).toBeTrue();
    expect(() => {
      frozenObj.arr[0] = 2;
    }).toThrowError();
    expect(() => {
      (frozenObj as any).arr[1].x = 20;
    }).toThrowError();
  });

  it('应该返回原始值如果输入是null或非对象类型', () => {
    expect(deepFreeze(null)).toBeNull();
    expect(deepFreeze(123)).toBe(123);
    expect(deepFreeze('string')).toBe('string');
    expect(deepFreeze(true)).toBe(true);
  });

  it('应该返回已经冻结的对象而不进行额外处理', () => {
    const obj = { a: 1 };
    Object.freeze(obj);
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBeTrue();
    expect(frozenObj).toBe(obj); // 应该返回同一个引用
  });

  it('应该处理循环引用', () => {
    const obj: any = {};
    obj.a = obj;
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBeTrue();
    expect(Object.isFrozen(frozenObj.a)).toBeTrue();
    expect(() => {
      frozenObj.a = 1;
    }).toThrowError();
  });
});
