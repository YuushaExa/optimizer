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

async function handleFileDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
  const fileInput = document.querySelector('input[name="file"]');
  fileInput.files = files; // Set the files to the input element for form submission handling
  
  const imageSizeBefore = document.querySelector('#imageSizeBefore');
  const imageSizeBeforeUpload = Array.from(files).reduce((acc, file) => acc + file.size, 0) / 1024;
  imageSizeBefore.textContent = `Image Size Before Conversion: ${imageSizeBeforeUpload.toFixed(2)} KB`;

  const form = document.querySelector('#image-form');
  form.submit();
}

function initDragAndDrop() {
  const dropZone = document.getElementById('file-drop-zone');

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', handleFileDrop);
  dropZone.addEventListener('click', () => {
    const fileInput = dropZone.querySelector('input[type="file"]');
    fileInput.click();
  });

  const fileInput = dropZone.querySelector('input[type="file"]');
  fileInput.addEventListener('change', handleFileDrop);
}

async function initForm() {
  initDragAndDrop();

  const form = document.querySelector('#image-form');
  const imageSizeBefore = document.querySelector('#imageSizeBefore');
  const imageSizeAfter = document.querySelector('#imageSizeAfter');
  const imageSizeDifference = document.querySelector('#imageSizeDifference');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const files = formData.getAll('file');
    const outputType = formData.get('outputType');

    const imageSizeBeforeConversion = Array.from(files).reduce((acc, file) => acc + file.size, 0) / 1024;

    let totalBuffer = new Uint8Array();

    for (const file of files) {
      const sourceType = file.name.endsWith('jxl') ? 'jxl' : file.type.replace('image/', '');
      const fileBuffer = await file.arrayBuffer();
      const imageBuffer = await convert(sourceType, outputType, fileBuffer);

      const newBuffer = new Uint8Array(totalBuffer.length + imageBuffer.byteLength);
      newBuffer.set(totalBuffer);
      newBuffer.set(new Uint8Array(imageBuffer), totalBuffer.length);
      totalBuffer = newBuffer;
    }

    const imageBlob = new Blob([totalBuffer], { type: `image/${outputType}` });
    const imageSizeAfterConversion = (imageBlob.size / 1024).toFixed(2);

    const difference = imageSizeAfterConversion - imageSizeBeforeConversion;
    const percentDifference = ((difference / imageSizeBeforeConversion) * 100).toFixed(2);
    const sign = difference >= 0 ? '+' : '-';

    imageSizeAfter.textContent = `Image Size After Conversion: ${imageSizeAfterConversion} KB`;
    imageSizeDifference.textContent = `Percent Difference: ${sign}${Math.abs(percentDifference)}%`;

    showOutput(totalBuffer.buffer, outputType);
  });
}

async function main() {
  initForm();
}

main();
