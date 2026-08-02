export enum SecondaryProgressionMethod {
  DayPerYear = 'DayPerYear',
  DegreePerYear = 'DegreePerYear',
}

export namespace SecondaryProgressionMethod {
  export function name(method: SecondaryProgressionMethod): string {
    return method === SecondaryProgressionMethod.DayPerYear ? '1天=1年' : '1度=1年';
  }
}
