import * as avif from 'https://unpkg.com/@jsquash/avif@latest?module';
import * as jpeg from 'https://unpkg.com/@jsquash/jpeg@latest?module';
import * as jxl from 'https://unpkg.com/@jsquash/jxl@latest?module';
import * as png from 'https://unpkg.com/@jsquash/png@latest?module';
import * as webp from 'https://unpkg.com/@jsquash/webp@latest?module';

async function decode (sourceType, fileBuffer) {
  switch (sourceType) {
    case 'avif':
      return await avif.decode(fileBuffer);
    case 'jpeg':
      return await jpeg.decode(fileBuffer);
    case 'jxl':
      return await jxl.decode(fileBuffer);
    case 'png':
      return await png.decode(fileBuffer);
    case 'webp':
      return await webp.decode(fileBuffer);
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

async function encode (outputType, imageData) {
  switch (outputType) {
    case 'avif':
      return await avif.encode(imageData);
    case 'jpeg':
      return await jpeg.encode(imageData);
    case 'jxl':
      return await jxl.encode(imageData);
    case 'png':
      return await png.encode(imageData);
    case 'webp':
      return await webp.encode(imageData);
    default:
      throw new Error(`Unknown output type: ${outputType}`);
  }
}

async function convert (sourceType, outputType, fileBuffer) {
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

async function showOutput (imageBuffer, outputType) {
  const preview = document.querySelector('#preview');
  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
  const base64String = await blobToBase64(imageBlob);
  const previewImg = document.createElement('img');
  previewImg.src = base64String;
  preview.innerHTML = '';
  preview.appendChild(previewImg);
}

async function initForm() {
  const form = document.querySelector('form');
  const inputFile = form.querySelector('input[name="file"]');
  const imageSizeBefore = document.querySelector('#imageSizeBefore');
  const imageSizeAfter = document.querySelector('#imageSizeAfter');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const file = formData.get('file');
    const sourceType = file.name.endsWith('jxl') ? 'jxl' : file.type.replace('image/', '');
    const outputType = formData.get('outputType');
    const fileBuffer = await file.arrayBuffer();
    
    // Calculate image size before conversion
    const imageSizeBeforeConversion = (file.size / 1024).toFixed(2) + ' KB';
    imageSizeBefore.textContent = `Image Size Before Conversion: ${imageSizeBeforeConversion}`;

    // Convert the image
    const imageBuffer = await convert(sourceType, outputType, fileBuffer);

    // Calculate image size after conversion
    const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
    const imageSizeAfterConversion = (imageBlob.size / 1024).toFixed(2) + ' KB';
    imageSizeAfter.textContent = `Image Size After Conversion: ${imageSizeAfterConversion}`;

    // Show output
    showOutput(imageBuffer, outputType);
  });
}

async function main() {
  initForm();
}

main();
