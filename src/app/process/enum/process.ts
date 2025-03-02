import { Path } from './path';

export enum ProcessName {
  Profection = 'Profection',
  Transit = 'Transit',
  Firdaria = 'firdaria',
  SolarReturn = 'SolarReturn',
  LunarReturn = 'LunarReturn',
  SolarcomparNative = 'SolarcomparNative',
  NativecomparSolar = 'NativecomparSolar',
  LunarcomparNative = 'LunarcomparNative',
  NativecomparLunar = 'NativecomparLunar',
}

export namespace ProcessName {
  const nameMap: { [key in ProcessName]: string } = {
    [ProcessName.Profection]: '小限',
    [ProcessName.Transit]: '行运',
    [ProcessName.Firdaria]: '法达',
    [ProcessName.SolarReturn]: '日返',
    [ProcessName.LunarReturn]: '月返',
    [ProcessName.SolarcomparNative]: '日返比本命',
    [ProcessName.NativecomparSolar]: '本命比日返',
    [ProcessName.LunarcomparNative]: '月返比本命',
    [ProcessName.NativecomparLunar]: '本命比月返',
  };

  const pathMap: { [key in ProcessName]: Path } = {
    [ProcessName.Profection]: Path.Profection,
    [ProcessName.Transit]: Path.Transit,
    [ProcessName.Firdaria]: Path.Firdaria,
    [ProcessName.SolarReturn]: Path.SolarReturn,
    [ProcessName.LunarReturn]: Path.LunarReturn,
    [ProcessName.SolarcomparNative]: Path.SolarcomparNative,
    [ProcessName.NativecomparSolar]: Path.NativecomparSolar,
    [ProcessName.LunarcomparNative]: Path.LunarcomparNative,
    [ProcessName.NativecomparLunar]: Path.NativecomparLunar,
  };

  export function name(process: ProcessName): string {
    return nameMap[process] || '未知process';
  }

  export function path(process: ProcessName): string {
    return pathMap[process] || 'unknown';
  }
}
