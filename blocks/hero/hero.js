function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

export default function decorate(block) {
  const img = block.querySelector('img');
  if (img) {
    setBackgroundFocus(img);
  }
}
