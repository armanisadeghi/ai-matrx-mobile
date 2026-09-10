#!/usr/bin/env node
// THE LATEST LAW + THE CATCH-UP RULE, enforced before a release gate.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'));
const dependencySections = ['dependencies', 'devDependencies', 'optionalDependencies'];
const ownedPackages = dependencySections.flatMap((section) =>
    Object.entries(manifest[section] ?? {})
        .filter(([name]) => name.startsWith('@ai-matrx/'))
        .map(([name, specifier]) => ({ name, section, specifier })),
);

const failures = [];
for (const { name, section, specifier } of ownedPackages) {
    if (specifier === 'workspace:*') continue;
    if (specifier !== 'latest') {
        failures.push(`${name} is pinned as ${specifier} in ${section}; declare it as latest.`);
        continue;
    }

    let registryVersion;
    try {
        registryVersion = JSON.parse(
            execFileSync('npm', ['view', name, 'dist-tags.latest', '--json'], {
                cwd: projectRoot,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'inherit'],
            }),
        );
    } catch {
        failures.push(`${name} latest could not be verified against npm.`);
        continue;
    }

    let installedVersion;
    try {
        installedVersion = JSON.parse(
            readFileSync(resolve(projectRoot, 'node_modules', name, 'package.json'), 'utf8'),
        ).version;
    } catch {
        failures.push(`${name} is not installed; run pnpm sync:matrx-packages.`);
        continue;
    }

    if (installedVersion !== registryVersion) {
        failures.push(`${name} is installed at ${installedVersion}; npm latest is ${registryVersion}.`);
    } else {
        console.log(`✓ ${name}@${installedVersion} is npm latest.`);
    }
}

if (failures.length > 0) {
    console.error('\n@ai-matrx package freshness failed:');
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error('\nRun pnpm sync:matrx-packages, adopt every CHANGELOG Consumer action, and retry.');
    process.exit(1);
}
