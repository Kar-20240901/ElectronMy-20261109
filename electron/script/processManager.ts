import { execFile } from "child_process";
import { promisify } from "util";

const execFileP = promisify(execFile);

export interface WinProcess {
  pid: number;
  name: string;
  path?: string;
}

export async function listProcesses(): Promise<WinProcess[]> {
  if (process.platform !== "win32") {
    return [];
  }

  const psScript = `
    Get-Process |
    Where-Object { $_.MainWindowTitle -ne '' -or $_.Path -ne $null } |
    Select-Object Id, ProcessName, Path |
    ConvertTo-Json
  `;

  const { stdout } = await execFileP(
    "powershell",
    ["-NoProfile", "-NonInteractive", "-Command", psScript],
    { maxBuffer: 1024 * 1024 * 64 },
  );

  const raw = JSON.parse(stdout || "[]");
  const list = Array.isArray(raw) ? raw : [raw];

  return list.map((p: any) => ({
    pid: p.Id,
    name: p.ProcessName,
    path: p.Path ?? undefined,
  }));
}

export async function killProcess(pid: number, force = false) {
  if (process.platform !== "win32") {
    throw new Error("仅支持 Windows");
  }

  if (!pid) {
    throw new Error("pid为空");
  }

  const args = ["/PID", String(pid), "/T"]; // /T = 杀子进程
  if (force) args.push("/F");

  const { stdout, stderr } = await execFileP("taskkill", args);
  return { stdout, stderr };
}
