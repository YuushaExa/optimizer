async function decode(sourceType, fileBuffer) {
  let decoder;
  switch (sourceType) {
    case 'avif':
      decoder = await import('https://unpkg.com/@jsquash/avif@latest?module');
      return await decoder.decode(fileBuffer);
    case 'jpeg':
      decoder = await import('https://unpkg.com/@jsquash/jpeg@latest?module');
      return await decoder.decode(fileBuffer);
    case 'jxl':
      decoder = await import('https://unpkg.com/@jsquash/jxl@latest?module');
      return await decoder.decode(fileBuffer);
    case 'png':
      decoder = await import('https://unpkg.com/@jsquash/png@latest?module');
      return await decoder.decode(fileBuffer);
    case 'webp':
      decoder = await import('https://unpkg.com/@jsquash/webp@latest?module');
      return await decoder.decode(fileBuffer);
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

async function encode(outputType, imageData) {
  let encoder;
  switch (outputType) {
    case 'avif':
      encoder = await import('https://unpkg.com/@jsquash/avif@latest?module');
      return await encoder.encode(imageData);
    case 'jpeg':
      encoder = await import('https://unpkg.com/@jsquash/jpeg@latest?module');
      return await encoder.encode(imageData);
    case 'jxl':
      encoder = await import('https://unpkg.com/@jsquash/jxl@latest?module');
      return await encoder.encode(imageData);
    case 'png':
      encoder = await import('https://unpkg.com/@jsquash/png@latest?module');
      return await encoder.encode(imageData);
    case 'webp':
      encoder = await import('https://unpkg.com/@jsquash/webp@latest?module');
      return await encoder.encode(imageData);
    default:
      throw new Error(`Unknown output type: ${outputType}`);
  }
}

async function convert(sourceType, outputType, fileBuffer) {
  const imageData = await decode(sourceType, fileBuffer);
  return encode(outputType, imageData);
}

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function showOutput(imageBuffer, outputType) {
  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
  const base64String = await blobToBase64(imageBlob);

  const inputFile = document.querySelector('input[name="file"]');
  const oldImgSrc = await readFileAsDataURL(inputFile.files[0]);

  let comparisonContainer = document.querySelector('.img-comp-container');
  if (!comparisonContainer) {
    comparisonContainer = document.createElement('div');
    comparisonContainer.classList.add('img-comp-container');
    document.body.appendChild(comparisonContainer);
  }

  // Clear previous content
  comparisonContainer.innerHTML = '';

  const oldImageContainer = document.createElement('div');
  oldImageContainer.classList.add('img-comp-img');
  const oldImg = document.createElement('img');
  oldImg.src = oldImgSrc;
  oldImg.width = 1300;
  oldImg.height = 1200;
  oldImageContainer.appendChild(oldImg);

  const newImageContainer = document.createElement('div');
  newImageContainer.classList.add('img-comp-img', 'img-comp-overlay');
  const newImg = document.createElement('img');
  newImg.src = base64String;
  newImg.width = 1300;
  newImg.height = 1200;
  newImageContainer.appendChild(newImg);

  comparisonContainer.appendChild(oldImageContainer);
  comparisonContainer.appendChild(newImageContainer);

  initComparisons();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initForm() {
  const dragDropArea = document.getElementById('drag-drop-area');
  const fileInput = document.getElementById('file-input');
  const convertButton = document.getElementById('convert-button');

  dragDropArea.addEventListener('click', () => fileInput.click());

  dragDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dragDropArea.classList.add('dragover');
  });

  dragDropArea.addEventListener('dragleave', () => dragDropArea.classList.remove('dragover'));

  dragDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dragDropArea.classList.remove('dragover');
    handleFiles(event.dataTransfer.files);
  });

  fileInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
  });

  convertButton.addEventListener('click', () => {
    fileInput.click();
  });
}

async function main() {
  initForm();
}

main();
