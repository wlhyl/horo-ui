/**
 * 主限法算法
 */
export enum DirectionMethod {
  SemiArc = 'SemiArc',
  UnderPole = 'UnderPole',
  ZodiacalUnderPole = 'ZodiacalUnderPole',
}

export namespace DirectionMethod {
  const nameMap: { [key in DirectionMethod]: string } = {
    [DirectionMethod.SemiArc]: '半弧法',
    [DirectionMethod.UnderPole]: '极下法（世俗向运）',
    [DirectionMethod.ZodiacalUnderPole]: '极下法（黄道向运）',
  };

  export function name(method: DirectionMethod): string {
    return nameMap[method];
  }
}
