import { startMongo } from './start-mongo';
import { spawn } from 'child_process';

startMongo();

const dev = spawn('npm', ['run', 'next:dev'], {
  stdio: 'inherit',
  shell: true,
});
