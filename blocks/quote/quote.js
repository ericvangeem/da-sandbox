export default function decorate(block) {
    const [imageWrapper, quoteWrapper, authorWrapper] = block.children;
    
    // Create blockquote and add quote text
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = quoteWrapper.textContent.trim();
    
    // Create quote content wrapper
    const quoteContent = document.createElement('div');
    quoteContent.className = 'quote-content';
    quoteContent.appendChild(blockquote);
    quoteContent.appendChild(authorWrapper);
    
    // Clear and rebuild the block structure
    block.textContent = '';
    block.appendChild(imageWrapper);
    block.appendChild(quoteContent);
}
