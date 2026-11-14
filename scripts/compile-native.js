import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function findCsc() {
  const candidatePaths = [
    'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe',
    'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe'
  ];

  for (const cscCandidate of candidatePaths) {
    if (fs.existsSync(cscCandidate)) {
      return cscCandidate;
    }
  }

  // Fallback: search in PATH
  try {
    const whichCmd = process.platform === 'win32' ? 'where.exe csc.exe' : 'which csc';
    const output = execSync(whichCmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
    const firstLine = output.split(/\r?\n/)[0]?.trim();
    if (firstLine && fs.existsSync(firstLine)) {
      return firstLine;
    }
  } catch {
    // PATH lookup failed
  }

  throw new Error(
    '[Native Build Error] Could not find the C# compiler (csc.exe).\n' +
    'Searched paths:\n' +
    '  - C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe\n' +
    '  - C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe\n' +
    '  - System PATH\n\n' +
    'Please ensure .NET Framework 4.0+ is installed or csc.exe is available in your PATH.'
  );
}

function compileNative() {
  const cscPath = findCsc();
  const resourcesDir = path.resolve(projectRoot, 'resources');
  const sourcePath = path.resolve(resourcesDir, 'native.cs');
  const outputPath = path.resolve(resourcesDir, 'IndustrialHubDisplay.exe');

  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`[Native Build Error] Source file does not exist: ${sourcePath}`);
  }

  const compileCmd = `"${cscPath}" /target:winexe /optimize+ /out:"${outputPath}" "${sourcePath}"`;
  console.log(`[Native Build] Compiling C# native helper with: ${cscPath}`);

  try {
    execSync(compileCmd, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    throw new Error(`[Native Build Error] Compilation failed with exit code ${error.status}: ${error.message}`);
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error(`[Native Build Error] Output file was not generated: ${outputPath}`);
  }

  const stat = fs.statSync(outputPath);
  if (stat.size === 0) {
    throw new Error(`[Native Build Error] Output binary is empty (0 bytes): ${outputPath}`);
  }

  console.log('[Native Build] Successfully compiled resources/IndustrialHubDisplay.exe using csc.exe');
}

compileNative();
