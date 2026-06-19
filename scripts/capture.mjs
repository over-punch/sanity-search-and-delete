// Reproducible visual harness: renders README diagrams from Mermaid source to SVG.
// Run with: npm run capture
// Adds new diagrams by listing them in the DIAGRAMS array below.

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Resolve repo-root-relative paths regardless of cwd.
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(SCRIPT_DIR, '..')
const ASSETS = join(ROOT, 'assets')

// One entry per diagram: { src: Mermaid file, out: SVG file } (paths relative to assets/).
const DIAGRAMS = [
	{ src: 'data-flow.mmd', out: 'data-flow.svg' }
]

// Render every Mermaid source to SVG via mermaid-cli (mmdc).
for (const { src, out } of DIAGRAMS) {
	const input = join(ASSETS, src)
	const output = join(ASSETS, out)
	console.log(`Rendering ${src} -> ${out}`)
	execFileSync(
		'npx',
		['--yes', '@mermaid-js/mermaid-cli', '-i', input, '-o', output, '-b', 'transparent'],
		{ stdio: 'inherit', cwd: ROOT }
	)
}

console.log('Capture complete.')
