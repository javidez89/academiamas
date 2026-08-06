import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const ROOT = process.cwd();
const version = (await fs.readFile(`${ROOT}/VERSION`, 'utf8')).trim();
const packageJson = JSON.parse(await fs.readFile(`${ROOT}/package.json`, 'utf8'));
const changelog = await fs.readFile(`${ROOT}/CHANGELOG.md`, 'utf8');
const configSource = await fs.readFile(`${ROOT}/assets/js/config.js`, 'utf8');
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(configSource, sandbox, { filename: 'assets/js/config.js' });

assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/, 'VERSION no cumple SemVer.');
assert.equal(packageJson.version, version, 'package.json no coincide con VERSION.');
assert.equal(sandbox.window.ACADEMY_CONFIG?.version, version, 'assets/js/config.js no coincide con VERSION.');
assert.ok(changelog.includes(`## [v${version}]`), `CHANGELOG.md no contiene la versión v${version}.`);

console.log(`Versión OK: v${version}.`);
