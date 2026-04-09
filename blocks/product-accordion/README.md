# Product Accordion

An accordion block that groups multiple page sections into collapsible panels. Each panel can contain any combination of default content (headings, paragraphs, images) and other EDS blocks (cards, columns, etc.).

## How it works

`product-accordion` uses the **autoblocking pattern** — authors never insert this block directly. Instead, they mark individual page sections with a `Section Metadata` table. At render time, `buildProductAccordionBlocks` in `scripts.js` scans the page for those sections, groups them, and synthesizes a single `product-accordion` block before the standard EDS decoration pipeline runs.

## Content model

Each section that should become an accordion panel needs a `Section Metadata` table at the bottom of the section:

| Section Metadata | |
|---|---|
| block-name | product-accordion |
| id | _(optional)_ |
| title | _(optional)_ |

### Fields

| Field | Required | Description |
|---|---|---|
| `block-name` | Yes | Must be exactly `product-accordion`. Signals the autoblocker to include this section. |
| `id` | No | Groups consecutive sections into the same accordion widget. Sections with the same `id` that are adjacent in the document are collapsed into one accordion. A different `id` value — or any non-accordion section in between — starts a new accordion group. Omit if the page has only one accordion. |
| `title` | No | Overrides the panel label. If omitted, the first heading (`h1`–`h6`) in the section is promoted as the panel label and removed from the body. |

## Authoring example

The following document structure produces a single accordion with three panels:

```
---
## Panel One
Lorem ipsum dolor sit amet.

| Section Metadata | |
|---|---|
| block-name | product-accordion |
---
## Panel Two
More content here.

| Cards |
| Card 1 | Card 2 |

| Section Metadata | |
|---|---|
| block-name | product-accordion |
---
## Panel Three
Final panel content.

| Section Metadata | |
|---|---|
| block-name | product-accordion |
| title | Custom Panel Label |
---
```

Panel Three uses a `title` override, so "Custom Panel Label" is the clickable summary and the heading `## Panel Three` remains in the panel body.

## Multiple accordion groups

To place two independent accordions on one page, give each group a distinct `id`:

```
---
## Specs: Weight
...
| Section Metadata | |
|---|---|
| block-name | product-accordion |
| id | specs |
---
## Specs: Dimensions
...
| Section Metadata | |
|---|---|
| block-name | product-accordion |
| id | specs |
---
(non-accordion section or different id breaks the group)
---
## Review 1
...
| Section Metadata | |
|---|---|
| block-name | product-accordion |
| id | reviews |
---
## Review 2
...
| Section Metadata | |
|---|---|
| block-name | product-accordion |
| id | reviews |
---
```

## Nested blocks

Sections may contain any EDS block alongside default content. Because nested blocks end up inside the synthesized `product-accordion` block — outside the `div.section > div > div` depth that `decorateBlocks` targets — the `product-accordion` decorator handles their decoration and loading explicitly via `decorateBlock` and `loadBlock`.

## Autoblocking logic (`scripts.js`)

`buildProductAccordionBlocks` runs inside `buildAutoBlocks`, which is called before `decorateSections`. This is required so the raw `section-metadata` divs are still in the DOM and can be read with `readBlockConfig`.

**Algorithm:**

1. Iterate all direct `<div>` children of `<main>`.
2. For each, check for a `div.section-metadata` child containing `block-name: product-accordion`.
3. Group consecutive matching sections by `id` value (empty string if omitted).
4. For each group:
   - Remove the `section-metadata` div from each section.
   - Resolve the panel title: use the `title` metadata field if present; otherwise extract and remove the first heading from the section.
   - Move the remaining section content into a body cell `<div>`.
   - Call `buildBlock('product-accordion', rows)` and append it to the first section in the group.
   - Remove all other sections in the group from the DOM.

## Files

| File | Purpose |
|---|---|
| `product-accordion.js` | Block decorator. Builds `<details>`/`<summary>` structure per panel, then decorates and loads any nested blocks. |
| `product-accordion.css` | Block styles. Shares the same visual pattern as the core `accordion` block. |
| `_product-accordion.json` | DA component catalog entry. Picked up automatically by the `blocks/*/_*.json` wildcard in `models/_component-definition.json`. |
