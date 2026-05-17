/**
 * Full validation orchestration:
 * 1. Typecheck all workspaces
 * 2. Run unit tests (API + Web)
 * 3. Start Docker compose stack
 * 4. Run E2E tests (Playwright)
 * 5. Stop Docker compose stack
 *
 * Always tears down Docker, even on failure.
 */
import { spawn } from 'child_process';

const API_HEALTH = 'http://localhost:3001/api/health';
const DOCKER_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 2_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand(command: string, args: string[], env?: NodeJS.ProcessEnv): Promise<number> {
  return new Promise((resolve) => {
    const proc = spawn(`${command} ${args.join(' ')}`, {
      stdio: 'inherit',
      shell: true,
      env: env ? { ...process.env, ...env } : process.env,
    });
    proc.on('close', (code) => resolve(code ?? 1));
  });
}

async function dockerUp(): Promise<void> {
  console.log('\n🐳 Starting Docker compose...');
  return new Promise((resolve, reject) => {
    const proc = spawn('docker', ['compose', 'up', '-d'], { stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`docker compose up exited with ${code}`));
    });
  });
}

async function dockerDown(): Promise<void> {
  console.log('\n🧹 Stopping Docker compose...');
  return new Promise((resolve) => {
    const proc = spawn('docker', ['compose', 'down'], { stdio: 'inherit', shell: true });
    proc.on('close', () => resolve());
  });
}

async function waitForApi() {
  const start = Date.now();
  while (Date.now() - start < DOCKER_TIMEOUT_MS) {
    try {
      const res = await fetch(API_HEALTH, { signal: AbortSignal.timeout(5_000) });
      if (res.ok) {
        console.log('✅ API is healthy');
        return;
      }
    } catch {
      // not ready yet
    }
    console.log('⏳ Waiting for API...');
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`API failed to become healthy within ${DOCKER_TIMEOUT_MS}ms`);
}

async function main() {
  let failed = false;

  try {
    // 1. Typecheck
    console.log('\n🔍 Running typecheck...');
    let code = await runCommand('npm', ['run', 'typecheck', '--workspaces', '--if-present']);
    if (code !== 0) throw new Error(`Typecheck failed with exit code ${code}`);

    // 2. Unit tests
    console.log('\n🧪 Running unit tests...');
    code = await runCommand('npm', ['run', 'test']);
    if (code !== 0) throw new Error(`Unit tests failed with exit code ${code}`);

    // 3. Start Docker for E2E
    await dockerUp();
    await waitForApi();

    // 4. E2E tests
    console.log('\n🎭 Running E2E tests...');
    code = await runCommand('npm', ['run', 'test:e2e']);
    if (code !== 0) throw new Error(`E2E tests failed with exit code ${code}`);

    console.log('\n✅ VERIFY PASSED — all checks succeeded');
  } catch (err) {
    failed = true;
    console.error('\n❌ VERIFY FAILED:', err instanceof Error ? err.message : String(err));
  } finally {
    await dockerDown();
  }

  process.exit(failed ? 1 : 0);
}

main();
