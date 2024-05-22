document.addEventListener('DOMContentLoaded', async () => {
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
        throw new Error(`Unsupported source type: ${sourceType}`);
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
        throw new Error(`Unsupported output type: ${outputType}`);
    }
  }

  async function convert(sourceType, outputType, fileBuffer) {
    const imageData = await decode(sourceType, fileBuffer);
    return encode(outputType, imageData);
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
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

  async function initForm() {
    const form = document.querySelector('form');
    const inputFile = form.querySelector('input[name="file"]');
    const imageSizeBefore = document.querySelector('#imageSizeBefore');
    const imageSizeAfter = document.querySelector('#imageSizeAfter');
    const imageSizeDifference = document.querySelector('#imageSizeDifference');

    inputFile.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageSizeBeforeUpload = (file.size / 1024).toFixed(2);
        imageSizeBefore.textContent = `Image Size Before Conversion: ${imageSizeBeforeUpload} KB`;
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const loadingIndicator = document.createElement('div');
      loadingIndicator.textContent = 'Processing...';
      form.appendChild(loadingIndicator);

      try {
        const formData = new FormData(form);
        const file = formData.get('file');
        const sourceType = file.name.endsWith('jxl') ? 'jxl' : file.type.replace('image/', '');
        const outputType = formData.get('outputType');
        const fileBuffer = await file.arrayBuffer();

        const imageSizeBeforeConversion = (file.size / 1024).toFixed(2);

        const imageBuffer = await convert(sourceType, outputType, fileBuffer);

        const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
        const imageSizeAfterConversion = (imageBlob.size / 1024).toFixed(2);

        const difference = imageSizeAfterConversion - imageSizeBeforeConversion;
        const percentDifference = ((difference / imageSizeBeforeConversion) * 100).toFixed(2);
        const sign = difference >= 0 ? '+' : '-';

        imageSizeAfter.textContent = `Image Size After Conversion: ${imageSizeAfterConversion} KB`;
        imageSizeDifference.textContent = `Percent Difference: ${sign}${Math.abs(percentDifference)}%`;

        await showOutput(imageBuffer, outputType);
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        form.removeChild(loadingIndicator);
      }
    });
  }

  async function main() {
    initForm();
  }

  main();
});
