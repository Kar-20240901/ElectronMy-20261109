import dayjs from "dayjs";

export function getEpochFlag(date: Date) {
  return date.getTime() <= 0;
}

export function FormatStringDateTime(
  dateTimeStr?: string,
  checkEpochFlag: boolean = true,
): string {
  if (!dateTimeStr) {
    return "";
  }

  const date = new Date(dateTimeStr);

  if (date.toString() === "Invalid Date") {
    return "无效时间";
  }

  if (checkEpochFlag && getEpochFlag(date)) {
    return "-";
  }

  return FormatDateTime(date);
}

export function FormatDateTime(date: Date = new Date()): string {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function FormatDateTimeFull(date: Date = new Date()): string {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss.SSS");
}

export function GetServerTimestamp(
  date: Date = new Date(),
  timezone: number = 8,
): number {
  const offsetGmt = date.getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟

  const nowDate = date.getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数

  return nowDate + offsetGmt * 60 * 1000 + timezone * 60 * 60 * 1000;
}
