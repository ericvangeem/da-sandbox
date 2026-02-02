// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const COLORS_API_ENDPOINT = 'https://colors-worker.evangeem1.workers.dev/colors';

/**
 * Builds the fully qualified EDS URL for a color path
 * @param {string} org - Organization name
 * @param {string} repo - Repository/site name
 * @param {string} colorPath - The relative path from the color object
 * @returns {string} The fully qualified EDS URL
 */
function buildEdsUrl(org, repo, colorPath) {
  return `https://main--${repo}--${org}.aem.live${colorPath}`;
}

/**
 * Fetches the colors data from the Cloudflare worker
 * @returns {Promise<Array>} The colors array
 */
async function fetchColorsData() {
  try {
    const response = await fetch(COLORS_API_ENDPOINT);

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`Failed to fetch colors data: ${response.status} ${response.statusText}`);
      return null;
    }

    const colorsData = await response.json();
    return colorsData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching colors data:', error);
    return null;
  }
}

/**
 * Displays the colors data as a multi-selectable searchable interface
 * @param {Array} colorsData - The colors array
 * @param {Object} actions - DA actions object
 * @param {string} org - Organization name
 * @param {string} repo - Repository name
 */
function displayColorsData(colorsData, actions, org, repo) {
  // Remove loading indicator
  const loadingEl = document.querySelector('.loading');
  if (loadingEl) {
    loadingEl.remove();
  }

  if (!colorsData) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Failed to load colors data';
    document.body.appendChild(errorDiv);
    return;
  }

  // Create container for colors data
  const container = document.createElement('div');
  container.className = 'colors-container';

  // Create header
  const header = document.createElement('h2');
  header.textContent = 'COLOR PICKER';
  header.className = 'colors-header';
  container.appendChild(header);

  // Check if data array exists
  if (!Array.isArray(colorsData) || colorsData.length === 0) {
    const noDataDiv = document.createElement('div');
    noDataDiv.className = 'warning-message';
    noDataDiv.textContent = 'No colors data found';
    container.appendChild(noDataDiv);
    document.body.appendChild(container);
    return;
  }

  // Function to get filtered colors based on archived setting
  function getFilteredColors(includeArchived) {
    if (includeArchived) {
      return colorsData;
    }
    return colorsData.filter((color) => color.archived !== 'Y');
  }

  // Create search container
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';

  // Create search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search colors...';
  searchInput.className = 'search-input';

  searchContainer.appendChild(searchInput);

  // Create filter options container
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';

  // Create show archived checkbox
  const showArchivedLabel = document.createElement('label');
  showArchivedLabel.className = 'filter-label';

  const showArchivedCheckbox = document.createElement('input');
  showArchivedCheckbox.type = 'checkbox';
  showArchivedCheckbox.className = 'filter-checkbox';
  showArchivedCheckbox.checked = false;

  showArchivedLabel.appendChild(showArchivedCheckbox);
  showArchivedLabel.appendChild(document.createTextNode(' Show archived colors'));

  filterContainer.appendChild(showArchivedLabel);
  searchContainer.appendChild(filterContainer);

  container.appendChild(searchContainer);

  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';
  container.appendChild(resultsContainer);

  // Track selected colors (store full color objects)
  const selectedColors = new Map();

  // Create select all button
  const selectAllBtn = document.createElement('button');
  selectAllBtn.textContent = 'Select All';
  selectAllBtn.className = 'btn btn-secondary';

  // Create deselect all button
  const deselectAllBtn = document.createElement('button');
  deselectAllBtn.textContent = 'Deselect All';
  deselectAllBtn.className = 'btn btn-secondary';

  // Create send selected button
  const sendSelectedBtn = document.createElement('button');
  sendSelectedBtn.textContent = 'Send Selected (0)';
  sendSelectedBtn.className = 'btn btn-primary';

  // Function to update send button text and state
  function updateSendButton() {
    const count = selectedColors.size;
    sendSelectedBtn.textContent = `Send Selected (${count})`;

    if (count > 0) {
      sendSelectedBtn.className = 'btn btn-primary';
      sendSelectedBtn.disabled = false;
    } else {
      sendSelectedBtn.className = 'btn btn-secondary';
      sendSelectedBtn.disabled = true;
    }
  }

  // Create color list function
  function renderColorList(filteredData) {
    resultsContainer.innerHTML = '';

    if (filteredData.length === 0) {
      const noResultsDiv = document.createElement('div');
      noResultsDiv.className = 'no-results';
      noResultsDiv.textContent = 'No colors found matching your search';
      resultsContainer.appendChild(noResultsDiv);
      return;
    }

    filteredData.forEach((color) => {
      const colorItem = document.createElement('div');
      colorItem.className = 'color-item';

      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'color-checkbox';
      checkbox.checked = selectedColors.has(color.colorCode);

      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedColors.set(color.colorCode, color);
        } else {
          selectedColors.delete(color.colorCode);
        }
        updateSendButton();
      });

      // Create color swatch
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = `#${color.hexRGB}`;

      // Create color info
      const colorInfo = document.createElement('div');
      colorInfo.className = 'color-info';

      const colorName = document.createElement('div');
      colorName.textContent = color.colorName;
      colorName.className = 'color-name';

      const colorCode = document.createElement('div');
      colorCode.textContent = `Code: ${color.colorCode}`;
      colorCode.className = 'color-code';

      colorInfo.appendChild(colorName);
      colorInfo.appendChild(colorCode);

      if (color.colorFamily) {
        const colorFamily = document.createElement('div');
        colorFamily.textContent = color.colorFamily;
        colorFamily.className = 'color-family';
        colorInfo.appendChild(colorFamily);
      }

      // Make entire color info clickable to toggle checkbox
      colorInfo.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      });

      colorItem.appendChild(checkbox);
      colorItem.appendChild(swatch);
      colorItem.appendChild(colorInfo);

      resultsContainer.appendChild(colorItem);
    });
  }

  // Function to apply search and archived filters
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const includeArchived = showArchivedCheckbox.checked;
    const baseColors = getFilteredColors(includeArchived);

    const filteredData = baseColors.filter((color) => color.colorName.toLowerCase().includes(searchTerm)
        || color.colorCode.toLowerCase().includes(searchTerm)
        || (color.colorFamily && color.colorFamily.toLowerCase().includes(searchTerm)));
    renderColorList(filteredData);
  }

  // Add search functionality
  searchInput.addEventListener('input', applyFilters);

  // Add archived filter functionality
  showArchivedCheckbox.addEventListener('change', applyFilters);

  // Create action buttons container
  const actionContainer = document.createElement('div');
  actionContainer.className = 'action-container';
  container.appendChild(actionContainer);

  selectAllBtn.addEventListener('click', () => {
    const visibleColors = getFilteredColors(showArchivedCheckbox.checked);
    visibleColors.forEach((color) => selectedColors.set(color.colorCode, color));
    applyFilters();
    updateSendButton();
  });

  deselectAllBtn.addEventListener('click', () => {
    selectedColors.clear();
    applyFilters();
    updateSendButton();
  });

  sendSelectedBtn.addEventListener('click', async () => {
    if (selectedColors.size === 0) return;

    try {
      // Build anchor links for all selected colors as a list
      const selectedColorsArray = Array.from(selectedColors.values());
      const listItems = selectedColorsArray.map((color) => {
        const url = buildEdsUrl(org, repo, color.path);
        return `<li><a href="${url}">${color.colorName}</a></li>`;
      });

      const listHtml = `<ul>${listItems.join('')}</ul>`;

      await actions.sendHTML(listHtml);
      await actions.closeLibrary();

      // eslint-disable-next-line no-console
      console.log('Selected colors sent to document:', selectedColorsArray.map((c) => c.colorName));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending selected colors to document:', error);

      // Show error feedback
      const originalText = sendSelectedBtn.textContent;

      sendSelectedBtn.textContent = 'Error';
      sendSelectedBtn.className = 'btn btn-error';
      sendSelectedBtn.disabled = true;

      setTimeout(() => {
        sendSelectedBtn.textContent = originalText;
        sendSelectedBtn.className = 'btn btn-primary';
        sendSelectedBtn.disabled = false;
      }, 2000);
    }
  });

  actionContainer.appendChild(selectAllBtn);
  actionContainer.appendChild(deselectAllBtn);
  actionContainer.appendChild(sendSelectedBtn);

  // Initial render
  applyFilters();
  updateSendButton();

  document.body.appendChild(container);
}

/**
 * Initializes the colors tool
 */
async function init() {
  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading';
  loadingDiv.textContent = 'Loading colors...';
  document.body.appendChild(loadingDiv);

  try {
    const { context, actions } = await DA_SDK;
    const { org, repo } = context;

    // Fetch colors data from Cloudflare worker
    const colorsData = await fetchColorsData();

    // Display colors data
    displayColorsData(colorsData, actions, org, repo);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error initializing colors tool:', error);

    const loadingEl = document.querySelector('.loading');
    if (loadingEl) {
      loadingEl.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Error initializing colors tool';
    document.body.appendChild(errorDiv);
  }
}

init();
