export enum ProfectionArcToDateMethod {
  TrueSolarArc = 'TrueSolarArc',
  MeanSolarArc = 'MeanSolarArc',
}

export namespace ProfectionArcToDateMethod {
  const nameMap: { [key in ProfectionArcToDateMethod]: string } = {
    [ProfectionArcToDateMethod.TrueSolarArc]: '真太阳弧',
    [ProfectionArcToDateMethod.MeanSolarArc]: '平太阳弧',
  };

  export function name(method: ProfectionArcToDateMethod): string {
    return nameMap[method];
  }
}
