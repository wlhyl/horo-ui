/**
 * 主限法算法
 */
export enum DirectionMethod {
  SemiArc = 'SemiArc',
  UnderPole = 'UnderPole',
}

export namespace DirectionMethod {
  const nameMap: { [key in DirectionMethod]: string } = {
    [DirectionMethod.SemiArc]: '半弧法',
    [DirectionMethod.UnderPole]: '极下法',
  };

  export function name(method: DirectionMethod): string {
    return nameMap[method];
  }
}
