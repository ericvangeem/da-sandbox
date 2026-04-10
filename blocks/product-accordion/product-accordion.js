import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const body = row.children[1];

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  // Decorate and load any blocks nested inside panel bodies.
  // These are not processed by the standard decorateBlocks pipeline since
  // they live inside the autoblocked product-accordion rather than at the
  // div.section > div > div depth that decorateBlocks targets.
  const nestedBlocks = [...block.querySelectorAll('.accordion-item-body > div')].filter(
    (el) => el.classList.length > 0,
  );

  nestedBlocks.forEach(decorateBlock);

  for (const nestedBlock of nestedBlocks) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(nestedBlock);
  }
}
