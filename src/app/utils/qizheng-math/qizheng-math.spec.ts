import { zodiacLong } from './qizheng-math';

describe('七政 zodiacLong', () => {
  it('边界值处理', () => {
    // 360°归零处理
    expect(zodiacLong(360)).toEqual({ zodiac: '戌', long: 0 });
    // 359°临界值
    expect(zodiacLong(359)).toEqual({ zodiac: '亥', long: 29 });
  });

  const zodiacs = [
    { deg: 0, expected: '戌', offset: 0 },
    { deg: 30, expected: '酉', offset: 0 },
    { deg: 60, expected: '申', offset: 0 },
    { deg: 90, expected: '未', offset: 0 },
    { deg: 120, expected: '午', offset: 0 },
    { deg: 150, expected: '巳', offset: 0 },
    { deg: 180, expected: '辰', offset: 0 },
    { deg: 210, expected: '卯', offset: 0 },
    { deg: 240, expected: '寅', offset: 0 },
    { deg: 270, expected: '丑', offset: 0 },
    { deg: 300, expected: '子', offset: 0 },
    { deg: 330, expected: '亥', offset: 0 },
    { deg: 15, expected: '戌', offset: 15 },
    { deg: 45, expected: '酉', offset: 15 },
    { deg: 75, expected: '申', offset: 15 },
    { deg: 105, expected: '未', offset: 15 },
    { deg: 135, expected: '午', offset: 15 },
    { deg: 165, expected: '巳', offset: 15 },
    { deg: 195, expected: '辰', offset: 15 },
    { deg: 225, expected: '卯', offset: 15 },
    { deg: 255, expected: '寅', offset: 15 },
    { deg: 285, expected: '丑', offset: 15 },
    { deg: 315, expected: '子', offset: 15 },
    { deg: 345, expected: '亥', offset: 15 },
  ];

  zodiacs.forEach(({ deg, expected, offset }) => {
    it(`应正确处理${deg}°返回${expected}宫${offset}°`, () => {
      expect(zodiacLong(deg)).toEqual({ zodiac: expected, long: offset });
    });
  });
});