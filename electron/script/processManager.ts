import { execFile } from "child_process";
import { promisify } from "util";

const execFileP = promisify(execFile);

export interface WinProcess {
  pid: number;
  name: string;
  path?: string;
}

export async function listProcesses(): Promise<WinProcess[] | any> {
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

  try {
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
  } catch (err) {
    return String(err);
  }
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

  let stdout;
  let stderr;

  try {
    stdout = await execFileP(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", psScript],
      { maxBuffer: 1024 * 1024 * 64 },
    );
  } catch (err) {
    stderr = String(err);
  }

  return { stdout, stderr };
}
