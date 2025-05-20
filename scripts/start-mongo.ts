import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export function startMongo() {
  const mongoPath = path.join(__dirname, '../mongodb/bin/mongod.exe');
  const dbPath = path.join(__dirname, '../mongodb/data/db');

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  const mongo = spawn(mongoPath, ['--dbpath', dbPath], {
    detached: true,
    stdio: 'ignore',
  });

  mongo.unref();
}
