async function convert(sourceType, outputType, fileBuffer) {
  let decoder, encoder;

  switch (sourceType) {
    case 'avif':
      decoder = await import('https://unpkg.com/@jsquash/avif@latest?module');
      break;
    case 'jpeg':
      decoder = await import('https://unpkg.com/@jsquash/jpeg@latest?module');
      break;
    case 'jxl':
      decoder = await import('https://unpkg.com/@jsquash/jxl@latest?module');
      break;
    case 'png':
      decoder = await import('https://unpkg.com/@jsquash/png@latest?module');
      break;
    case 'webp':
      decoder = await import('https://unpkg.com/@jsquash/webp@latest?module');
      break;
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }

  switch (outputType) {
    case 'avif':
      encoder = await import('https://unpkg.com/@jsquash/avif@latest?module');
      break;
    case 'jpeg':
      encoder = await import('https://unpkg.com/@jsquash/jpeg@latest?module');
      break;
    case 'jxl':
      encoder = await import('https://unpkg.com/@jsquash/jxl@latest?module');
      break;
    case 'png':
      encoder = await import('https://unpkg.com/@jsquash/png@latest?module');
      break;
    case 'webp':
      encoder = await import('https://unpkg.com/@jsquash/webp@latest?module');
      break;
    default:
      throw new Error(`Unknown output type: ${outputType}`);
  }

  const decoderModule = await decoder;
  const encoderModule = await encoder;

  const imageData = await decoderModule.decode(fileBuffer);
  return encoderModule.encode(imageData);
}

async function showOutput(imageBuffer, outputType) {
  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
  const base64String = await blobToBase64(imageBlob);
  // Get the file input element
  const inputFile = document.querySelector('input[name="file"]');
  const oldImgSrc = await readFileAsDataURL(inputFile.files[0]);
  // Create container for comparison
  const comparisonContainer = document.createElement('div');
  comparisonContainer.classList.add('img-comp-container');
  // Create old image container
  const oldImageContainer = document.createElement('div');
  oldImageContainer.classList.add('img-comp-img');
  const oldImg = document.createElement('img');
  oldImg.src = oldImgSrc; // Use the data URL of the old image
  oldImg.width = 1300;
  oldImg.height = 1200;
  oldImageContainer.appendChild(oldImg);

  // Create new image container
  const newImageContainer = document.createElement('div');
  newImageContainer.classList.add('img-comp-img', 'img-comp-overlay');
  const newImg = document.createElement('img');
  newImg.src = base64String;
  newImg.width = 1300;
  newImg.height = 1200;
  newImageContainer.appendChild(newImg);

  // Append old and new image containers to comparison container
  comparisonContainer.appendChild(oldImageContainer);
  comparisonContainer.appendChild(newImageContainer);

  // Append comparison container to document body or any desired container
  document.body.appendChild(comparisonContainer);

  // Initialize comparisons
  initComparisons();
}

async function initForm() {
  const form = document.querySelector('form');
  const inputFile = form.querySelector('input[name="file"]');
  const imageSizeBefore = document.querySelector('#imageSizeBefore');
  const imageSizeAfter = document.querySelector('#imageSizeAfter');
  const imageSizeDifference = document.querySelector('#imageSizeDifference');

  inputFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const imageSizeBeforeUpload = (file.size / 1024).toFixed(2); // Size in KB
    imageSizeBefore.textContent = `Image Size Before Conversion: ${imageSizeBeforeUpload} KB`;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const file = formData.get('file');
    const sourceType = file.name.endsWith('jxl') ? 'jxl' : file.type.replace('image/', '');
    const outputType = formData.get('outputType');
    const fileBuffer = await file.arrayBuffer();

    // Calculate image size before conversion
    const imageSizeBeforeConversion = (file.size / 1024).toFixed(2); // Size in KB

    // Convert the image
    const imageBuffer = await convert(sourceType, outputType, fileBuffer);

    // Calculate image size after conversion
    const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
    const imageSizeAfterConversion = (imageBlob.size / 1024).toFixed(2); // Size in KB

    // Calculate percent difference
    const difference = imageSizeAfterConversion - imageSizeBeforeConversion;
    const percentDifference = ((difference / imageSizeBeforeConversion) * 100).toFixed(2);

    // Determine sign of the difference
    const sign = difference >= 0 ? '+' : '-';

    // Display sizes and percent difference
    imageSizeAfter.textContent = `Image Size After Conversion: ${imageSizeAfterConversion} KB`;
    imageSizeDifference.textContent = `Percent Difference: ${sign}${Math.abs(percentDifference)}%`;

    // Show output
    showOutput(imageBuffer, outputType);
  });
}

async function main() {
  initForm();
}

main();
