import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'C:\\Users\\chris\\Desktop\\수프리마랩';
const NODE = 'C:\\Users\\chris\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe';
const OUTPUT_ROOT = path.join(ROOT, 'outputs', 'batch_runs');

const SCRIPT_LIST = [
  'scripts/build_seoul_18_match.js',
  'scripts/extract_snu_full_excel.js',
  'scripts/extract_yonsei_excel.js',
  'scripts/extract_korea_excel.js',
  'scripts/extract_sogang_census.js',
  'scripts/census_snu_perfect.js',
  'scripts/census_yonsei_perfect.js',
  'scripts/census_sogang_perfect.js',
];

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function runScript(scriptPath, logDir) {
  return new Promise((resolve) => {
    const absScript = path.join(ROOT, scriptPath);
    const logFile = path.join(logDir, `${path.basename(scriptPath, path.extname(scriptPath))}.log`);
    const child = spawn(NODE, [absScript], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    child.on('close', async (code) => {
      await fs.writeFile(logFile, `EXIT ${code}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`, 'utf8');
      resolve({ scriptPath, code, logFile });
    });
  });
}

async function main() {
  const runDir = path.join(OUTPUT_ROOT, timestamp());
  await fs.mkdir(runDir, { recursive: true });

  const results = [];
  for (const scriptPath of SCRIPT_LIST) {
    console.log(`=== RUN ${scriptPath} ===`);
    const result = await runScript(scriptPath, runDir);
    results.push(result);
  }

  const reportPath = path.join(runDir, 'batch_report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(reportPath);
  console.log(JSON.stringify(results, null, 2));
}

await main();
