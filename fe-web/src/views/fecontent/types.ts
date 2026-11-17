export type TKillType = 201 | 301; // 201 循环一次 301 一直循环

export const killTypeList = [
  {
    label: "循环一次",
    value: 201,
  },
  { label: "一直循环", value: 301 },
];

export interface IFormData {
  selectProcessPName?: string;
  killType?: TKillType;
  killTime?: string;
}

export interface KillRespBody {
  stdout?: string;
  stderr?: string;
}

export interface WinProcess {
  pid?: number; // 暂时未使用
  name?: string;
  path?: string;
}

export type TLogKillType = 101 | 201 | 301; // 101 手动执行 201 循环一次 301 一直循环

export interface KillProcessLog {
  timestamp?: number; // 时间戳
  killPid?: number;
  killPName?: string;
  killPPath?: string;
  killTime?: string;
  killRespBody?: KillRespBody;
  killType?: TLogKillType;
}
