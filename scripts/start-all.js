const { spawn } = require('child_process');
const path = require('path');

function startService(name, dir, command, args) {
  console.log(`Starting ${name}...`);
  const process = spawn(command, args, {
    cwd: path.join(__dirname, dir),
    shell: true,
    stdio: 'inherit',
  });

  process.on('error', (err) => {
    console.error(`Failed to start ${name}:`, err);
  });

  process.on('close', (code) => {
    console.log(`${name} exited with code ${code}`);
    process.exit(code);
  });

  return process;
}

// Start Backend
startService('Backend', 'server', 'npm', ['run', 'dev']);

// Start Frontend
startService('Frontend', 'client', 'npm', ['run', 'dev']);
