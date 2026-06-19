# Sanity Search and Delete

[![npm version](https://img.shields.io/npm/v/@liiift-studio/sanity-search-and-delete.svg)](https://www.npmjs.com/package/@liiift-studio/sanity-search-and-delete)
[![license](https://img.shields.io/npm/l/@liiift-studio/sanity-search-and-delete.svg)](#license)

A flexible search and delete utility for Sanity Studio that enables bulk content management with comprehensive safety features. Works with any document type and provides powerful search capabilities.

> ⚠️ **This tool deletes documents permanently.** Deletions cannot be undone from within the component. Always test against a non-production dataset first, keep a backup/export, and read the [Safety Features](#safety-features) section before using it on real content.

- **Package:** [`@liiift-studio/sanity-search-and-delete`](https://www.npmjs.com/package/@liiift-studio/sanity-search-and-delete) (scoped — note the `@liiift-studio/` prefix)
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
npm install @liiift-studio/sanity-search-and-delete
```

> The package is **scoped**. Installing the unscoped `sanity-search-and-delete` will pull a different, unrelated package.

## Quick Start

`SearchAndDelete` is a React component you render inside Sanity Studio — for example, on a custom page or as the component for a custom Studio tool. It is **not** a plugin you spread into `tools: []` directly; you mount the component yourself and pass it a configured `client`.

### Basic Usage

```tsx
import React from 'react'
import { SearchAndDelete } from '@liiift-studio/sanity-search-and-delete'
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
import { SearchAndDelete } from '@liiift-studio/sanity-search-and-delete'

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
import { SearchAndDelete } from '@liiift-studio/sanity-search-and-delete'

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

This package declares the following peer dependencies (install them in your Studio):

- `sanity` — `^3.0.0 || ^4.0.0 || ^5.0.0`
- `react` — `^18.0.0 || ^19.0.0`
- `@sanity/ui` — `^1.0.0 || ^2.0.0 || ^3.0.0`
- `@sanity/icons` — `^2.0.0 || ^3.0.0`

## Regenerating the diagram

The data-flow diagram is generated from a committed Mermaid source so it stays reproducible:

```bash
npm run capture   # renders assets/*.mmd -> assets/*.svg via mermaid-cli
```

Edit `assets/data-flow.mmd` and re-run `npm run capture` to update it (bump the `?v=N` cache-buster in the README image URL on regenerate).

## Maintainer note

The repo currently contains two implementations under `src/`: the comprehensive component documented above (`SearchAndDelete.tsx`, the source the published `dist` was built from) and a newer, foundry-specific danger-mode variant (`SearchAndDelete.jsx`, which the `build` script now targets). This README documents the **currently published** API. Reconcile the two sources before the next publish so the shipped `dist`, its props, and these docs stay in agreement.

## License

MIT — this package is published under the MIT license. (No standalone `LICENSE` file is checked into the repo yet; add one to make the license explicit in the repository.)
