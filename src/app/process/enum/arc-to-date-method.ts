export enum ArcToDateMethod {
  DayPerYear = 'DayPerYear',
  DegreePerYear = 'DegreePerYear',
}

export namespace ArcToDateMethod {
  const nameMap: { [key in ArcToDateMethod]: string } = {
    [ArcToDateMethod.DayPerYear]: '1天=1年',
    [ArcToDateMethod.DegreePerYear]: '1度=1年',
  };

  export function name(method: ArcToDateMethod): string {
    return nameMap[method];
  }
}
