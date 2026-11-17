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
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
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
    path: p.Path,
  }));
}

export async function killProcessForPName(processName: string, force = false) {
  if (process.platform !== "win32") {
    throw new Error("仅支持 Windows");
  }

  if (!processName) {
    throw new Error("processName为空");
  }

  const psScript = `
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Stop-Process -Name "${processName}"
  `;

  const { stdout } = await execFileP(
    "powershell",
    ["-NoProfile", "-NonInteractive", "-Command", psScript],
    { maxBuffer: 1024 * 1024 * 64 },
  );

  return { stdout };
}
