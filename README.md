# Sanity Search and Delete

[![npm version](https://img.shields.io/npm/v/@overpunch/sanity-search-and-delete.svg)](https://www.npmjs.com/package/@overpunch/sanity-search-and-delete)
[![license](https://img.shields.io/npm/l/@overpunch/sanity-search-and-delete.svg)](#license)
[![Sanity Studio v3–v6](https://img.shields.io/badge/Sanity%20Studio-v3%20%E2%80%93%20v6-f03e2f.svg)](https://www.sanity.io/)

A flexible search and delete utility for Sanity Studio that enables bulk content management with comprehensive safety features. Works with any document type and provides powerful search capabilities.

> ⚠️ **This tool deletes documents permanently.** Deletions cannot be undone from within the component. Always test against a non-production dataset first, keep a backup/export, and read the [Safety Features](#safety-features) section before using it on real content.

- **Package:** [`@overpunch/sanity-search-and-delete`](https://www.npmjs.com/package/@overpunch/sanity-search-and-delete) (scoped — note the `@overpunch/` prefix)
- **Repo / issues:** [Liiift-Studio/sanity-search-and-delete](https://github.com/Liiift-Studio/sanity-search-and-delete)

## How it works

The component runs a search against your dataset, lets you review and select what matched, then deletes the chosen documents — gated behind an explicit confirmation step. Nothing is removed until you confirm.

![Search, select, then delete data flow: a search term and document type build a GROQ query; matched documents are reviewed and selected; deletion is gated behind a confirmation/danger-mode step before a batched delete permanently removes the documents.](https://raw.githubusercontent.com/Liiift-Studio/sanity-search-and-delete/main/assets/data-flow.svg?v=1)

## Features

- 🔍 **Flexible Search**: Search across any document type with multiple criteria
- 🎯 **Custom GROQ Queries**: Advanced users can write custom queries
- 🛡️ **Safety First**: Confirmation dialogs, dry-run mode, and batch processing
- 📊 **Progress Tracking**: Real-time feedback during operations
- ✅ **Selective Deletion**: Choose exactly which documents to delete
- 🔄 **Batch Processing**: Handles large datasets efficiently
- 📱 **Responsive UI**: Works seamlessly in Sanity Studio

## Installation

```bash
npm install @overpunch/sanity-search-and-delete
```

> The package is **scoped**. Installing the unscoped `sanity-search-and-delete` will pull a different, unrelated package.

## Quick Start

`SearchAndDelete` is a React component you render inside Sanity Studio — for example, on a custom page or as the component for a custom Studio tool. It is **not** a plugin you spread into `tools: []` directly; you mount the component yourself and pass it a configured `client`.

### Basic Usage

```tsx
import React from 'react'
import { SearchAndDelete } from '@overpunch/sanity-search-and-delete'
import { useClient } from 'sanity'

const MyUtilityPage = () => {
  const client = useClient({ apiVersion: '2023-01-01' })

  return (
    <SearchAndDelete
      client={client}
      onComplete={(results) => {
        console.log(`Deleted ${results.deleted} items`)
      }}
    />
  )
}
```

### As a Sanity Studio tool

Wrap the component in your own page, then register that page as a tool so it shows up in the Studio navbar:

```tsx
// MyUtilityPage.tsx — the page you register as a tool
import React from 'react'
import { useClient } from 'sanity'
import { SearchAndDelete } from '@overpunch/sanity-search-and-delete'

export default function MyUtilityPage() {
  const client = useClient({ apiVersion: '2023-01-01' })
  return <SearchAndDelete client={client} dryRun />
}
```

```tsx
// sanity.config.ts
import { defineConfig } from 'sanity'
import { TrashIcon } from '@sanity/icons'
import MyUtilityPage from './MyUtilityPage'

export default defineConfig({
  // ...other config
  tools: (prev) => [
    ...prev,
    {
      name: 'search-and-delete',
      title: 'Search & Delete',
      icon: TrashIcon,
      component: MyUtilityPage,
    },
  ],
})
```

### With Specific Document Types

```tsx
<SearchAndDelete
  client={client}
  documentTypes={['post', 'page', 'author']}
  maxResults={50}
  batchSize={5}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `client` | `SanityClient` | **required** | Sanity client instance |
| `documentTypes` | `string[]` | `[]` | Specific document types to search (empty = all types) |
| `onComplete` | `function` | `undefined` | Callback when deletion completes. Receives `{ deleted: number; errors: string[] }` |
| `onError` | `function` | `undefined` | Error handling callback. Receives an error message string |
| `batchSize` | `number` | `10` | Number of items to delete per batch |
| `dryRun` | `boolean` | `false` | Preview mode without actual deletion |
| `maxResults` | `number` | `100` | Maximum search results to display |

## Usage Examples

### 1. Basic Content Cleanup

```tsx
import { SearchAndDelete } from '@overpunch/sanity-search-and-delete'

const ContentCleanup = () => {
  const client = useClient({ apiVersion: '2023-01-01' })

  return (
    <SearchAndDelete
      client={client}
      documentTypes={['post', 'page']}
      onComplete={(results) => {
        if (results.errors.length > 0) {
          console.error('Some deletions failed:', results.errors)
        } else {
          console.log(`Successfully deleted ${results.deleted} items`)
        }
      }}
    />
  )
}
```

### 2. Safe Mode with Dry Run

```tsx
<SearchAndDelete
  client={client}
  dryRun={true}
  onComplete={(results) => {
    console.log(`Would delete ${results.deleted} items`)
  }}
/>
```

### 3. Custom Error Handling

```tsx
<SearchAndDelete
  client={client}
  onError={(error) => {
    // Custom error handling
    toast.error(`Operation failed: ${error}`)
  }}
  onComplete={(results) => {
    if (results.deleted > 0) {
      toast.success(`Deleted ${results.deleted} items`)
    }
  }}
/>
```

## Search Capabilities

### Built-in Search Fields

The component automatically searches across common fields:
- `title`
- `name` 
- `slug.current`
- Document ID

### Custom GROQ Queries

For advanced users, enable custom GROQ queries:

```groq
*[_type == "post" && dateTime(_createdAt) < dateTime("2023-01-01")]
```

```groq
*[_type == "author" && !defined(bio)]
```

## Safety Features

### Confirmation Dialogs
- All delete operations require explicit confirmation
- Clear warning messages for destructive actions
- Separate confirmation for dry-run vs actual deletion

### Dry Run Mode
```tsx
<SearchAndDelete client={client} dryRun={true} />
```
- Preview what would be deleted without making changes
- Test queries and filters safely
- Validate batch sizes and operations

### Batch Processing
- Large deletions are processed in configurable batches
- Prevents timeout issues with large datasets
- Progress feedback during long operations

### Irreversibility
- **Deletes are permanent.** The component does not implement undo, soft-delete, or trash — once a batch commits, those documents are gone.
- Sanity may block deletion of a document that is still referenced by others; in that case the operation surfaces the conflicting document rather than orphaning the reference.
- Run with `dryRun` first, confirm you are pointed at the intended dataset, and keep an export/backup before deleting production content.

## Requirements

This package declares the following peer dependencies — **one build supports Sanity
Studio v3, v4, v5 and v6**:

| Peer | Declared range | Meaning |
|------|----------------|---------|
| `sanity` | `>=3 <7` | Studio v3 through v6 |
| `@sanity/ui` | `>=2 <5` | v2, v3, v4 — see the note below, `<5` is **not** a mistake |
| `@sanity/icons` | `>=2 <6` | v2 through v5 |
| `react` | `^18.0.0 \|\| ^19.0.0` | React 18 or 19 |

> **`@sanity/ui` is capped below v5 on purpose.** Studio v6 ships **`@sanity/ui` v4**,
> not v5, so `>=2 <5` is the correct range for a v6 Studio. It reads like a bug at a
> glance; it isn't.

### How one build spans four Studio majors

Two upstream breaking changes make naive imports fail across these majors:

- **`@sanity/ui` v4** moved `Tooltip`, `Menu`, `MenuButton`, `MenuItem`, `Code`,
  `Popover`, `Autocomplete`, `Toast` and `useToast` out of the package root and into
  **subpath entries**.
- **`@sanity/icons` v5** removed **every named `*Icon` export**.

The trap is that **both packages still _declare_ the removed names in their `.d.ts`,
typed `never`**. A named import therefore type-checks, compiles, and bundles cleanly —
and then throws at runtime in the Studio. `tsc` and your bundler will both tell you it
is fine.

You can see it in the shipped typings. `@sanity/icons@5.2.1`, `dist/index.d.ts`:

```ts
/**
 * @deprecated `TrashIcon` is no longer exported from the `@sanity/icons` root entry
 * (removed in v5) – the icon itself still exists. Import it from its own subpath
 * instead: `import {TrashIcon} from '@sanity/icons/Trash'`
 */
declare const TrashIcon: never;
```

`TrashIcon` is still listed in that file's root `export { … }` block, so
`import { TrashIcon } from '@sanity/icons'` resolves, type-checks as `never`, bundles —
and is `undefined` at runtime.

So this package **imports no `@sanity/ui` or `@sanity/icons` symbol directly**. Every
component and icon routes through
[`@overpunch/sanity-ui-compat`](https://www.npmjs.com/package/@overpunch/sanity-ui-compat),
which resolves the *installed* namespace at runtime and picks the right root-or-subpath
location per major. That indirection — not a version-matrix build — is what makes a
single artifact work on v3 through v6.

> **Unlike its sibling tools, this package does _not_ bundle the compat layer.** Its
> build marks `@overpunch/*` as external, so `dist/index.js` keeps a real runtime
> `import … from "@overpunch/sanity-ui-compat"`. It is declared in `dependencies`,
> so a normal `npm install` fetches it — but if you vendor `dist/` by hand, or install
> with `--no-optional`-style pruning that drops transitive deps, you must ensure
> `@overpunch/sanity-ui-compat` is present or the import will fail to resolve.

### Verification status

v3–v6 support rests on the declared peer ranges, green builds, and use in **three
in-house Liiift Studio Studios**. It has **not** been exercised broadly in a running
Sanity 6 Studio beyond those. Treat v6 as supported-and-believed-good rather than
extensively field-tested, and please file an issue if you hit a gap.

### TypeScript

The published package **does not declare a `types` field**, so TypeScript consumers get
no bundled declarations and the import resolves as untyped. `src/` ships in the tarball
and `src/SearchAndDelete.tsx` carries the real `SearchAndDeleteProps`, `SearchResult`
and `DeleteResult` interfaces — use the [Props](#props) table above as the contract, or
declare a local module shim.

## Regenerating the diagram

The data-flow diagram is generated from a committed Mermaid source so it stays reproducible:

```bash
npm run capture   # renders assets/*.mmd -> assets/*.svg via mermaid-cli
```

Edit `assets/data-flow.mmd` and re-run `npm run capture` to update it (bump the `?v=N` cache-buster in the README image URL on regenerate).

## Maintainer note — two implementations under `src/`

The repo contains **two** implementations of the component:

| File | What it is | Shipped? |
|---|---|---|
| `src/SearchAndDelete.tsx` | The comprehensive component documented above | **Yes — this is what `dist` is built from** |
| `src/SearchAndDelete.jsx` | A foundry-specific `dangerMode` variant (`dangerMode`, `utilityId`, `onDangerModeChange`, `displayName`, `icon` props) | **No — currently dead code** |

**Which one ships is easy to get wrong.** The `build` script's entry is
`src/index.jsx`, which looks like it selects the `.jsx` implementation — but that file
only does `export { default } from './SearchAndDelete'`, an **extensionless** specifier.
esbuild's default `--resolve-extensions` order is `.tsx,.ts,.jsx,.js,…`, so it resolves
**`SearchAndDelete.tsx`**, not the `.jsx` sitting beside it.

You can confirm this from the build output rather than taking it on trust:

```bash
head -1 dist/index.js          # => // src/SearchAndDelete.tsx
grep -c dangerMode dist/index.js   # => 0  (the .jsx-only prop never ships)
```

So the [Props](#props) table above **does** describe the published package, and
`dangerMode` / `DangerModeWarning` are **not** part of the public API despite being
present in `src/`.

This is fragile: renaming or deleting `SearchAndDelete.tsx` would silently swap the
published component for the `.jsx` one, with entirely different props and no build
error. Reconcile the two sources — or make the entry point's extension explicit — before
the next publish.

## Part of the Liiift Sanity Tools suite

One of a family of Sanity Studio utilities by [Liiift Studio](https://liiift.studio), all
sharing the same v3–v6 compat approach:

| Package | Does |
|---|---|
| [`sanity-delete-unused-assets`](https://www.npmjs.com/package/@overpunch/sanity-delete-unused-assets) | Remove unreferenced image/file assets |
| [`sanity-duplicate-and-rename`](https://www.npmjs.com/package/@overpunch/sanity-duplicate-and-rename) | Bulk-duplicate documents with templated renaming |
| [`sanity-export-data`](https://www.npmjs.com/package/@overpunch/sanity-export-data) | Export document types to CSV or JSON |
| [`sanity-ui-compat`](https://www.npmjs.com/package/@overpunch/sanity-ui-compat) | The compat layer these tools import instead of `@sanity/ui` |

## License

MIT — this package is published under the MIT license. (No standalone `LICENSE` file is checked into the repo yet; add one to make the license explicit in the repository.)
