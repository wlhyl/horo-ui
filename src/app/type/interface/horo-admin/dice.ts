// 占星骰子记录
export interface Dice {
  id: number;
  // 投掷年份
  year: number;
  // 投掷月份，1-12
  month: number;
  // 投掷日期，1-31
  day: number;
  // 投掷小时，0-23
  hour: number;
  // 投掷分钟，0-59
  minute: number;
  // 投掷秒，0-59
  second: number;
  // 投掷地时区，东区为正数，西区为负数
  time_zone_offset: number;
  // 行星标识，西洋体系存枚举名如 'Sun'，七政四余存单字如 '日'
  planet: string;
  // 星座，0-11（白羊~双鱼）
  zodiac: number;
  // 宫位，1-12
  house: number;
  // 是否为七政四余体系：true=七政四余，false=西洋
  is_qizheng: boolean;
  // 事项（投掷所问的事项）
  matter: string;
  // 说明文字
  description: string;
  created_at: string;
  updated_at: string | null;
  // 锁定状态，true表示锁定（禁止删除和更新除描述外的字段）
  lock: boolean;
  user_id: number;
}

// 新增一条骰子记录请求
export interface DiceRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  time_zone_offset: number;
  planet: string;
  zodiac: number;
  house: number;
  is_qizheng: boolean;
  matter: string;
  description: string;
  lock: boolean;
  // 归属登录用户ID（可选，仅 admin 生效，缺省为当前登录用户，非 admin 忽略该字段）
  user_id?: number;
}

// 更新一条骰子记录请求（未传/undefined=不修改）
export interface UpdateDiceRequest {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  time_zone_offset?: number;
  planet?: string;
  zodiac?: number;
  house?: number;
  is_qizheng?: boolean;
  matter?: string;
  description?: string;
  lock?: boolean;
  user_id?: number;
}
