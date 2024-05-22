import * as avif from 'https://unpkg.com/@jsquash/avif@latest?module';
import * as jpeg from 'https://unpkg.com/@jsquash/jpeg@latest?module';
import * as jxl from 'https://unpkg.com/@jsquash/jxl@latest?module';
import * as png from 'https://unpkg.com/@jsquash/png@latest?module';
import * as webp from 'https://unpkg.com/@jsquash/webp@latest?module';

async function decode(sourceType, fileBuffer) {
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

async function encode(outputType, imageData) {
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

  const inputFile = document.querySelector('input[type="file"]');
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

function handleFiles(files) {
  const fileList = Array.from(files);
  fileList.forEach(async (file) => {
    const sourceType = file.name.endsWith('jxl') ? 'jxl' : file.type.replace('image/', '');
    const outputType = document.querySelector('input[name="outputType"]:checked').value;
    const fileBuffer = await file.arrayBuffer();

    const imageSizeBeforeConversion = (file.size / 1024).toFixed(2); // Size in KB
    const imageBuffer = await convert(sourceType, outputType, fileBuffer);

    const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
    const imageSizeAfterConversion = (imageBlob.size / 1024).toFixed(2); // Size in KB
    const difference = imageSizeAfterConversion - imageSizeBeforeConversion;
    const percentDifference = ((difference / imageSizeBeforeConversion) * 100).toFixed(2);
    const sign = difference >= 0 ? '+' : '-';

    // Display sizes and percent difference
    document.querySelector('#imageSizeBefore').textContent = `Image Size Before Conversion: ${imageSizeBeforeConversion} KB`;
    document.querySelector('#imageSizeAfter').textContent = `Image Size After Conversion: ${imageSizeAfterConversion} KB`;
    document.querySelector('#imageSizeDifference').textContent = `Percent Difference: ${sign}${Math.abs(percentDifference)}%`;

    // Show output
    showOutput(imageBuffer, outputType);
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

function initComparisons() {
  const overlays = document.getElementsByClassName('img-comp-overlay');
  for (let i = 0; i < overlays.length; i++) {
    compareImages(overlays[i]);
  }

  function compareImages(img) {
    let slider, button, clicked = 0, w, h;
    w = img.offsetWidth;
    h = img.offsetHeight;

    img.style.width = (w / 2) + 'px';

    slider = document.createElement('div');
    slider.setAttribute('class', 'img-comp-slider');

    button = document.createElement('div');
    button.setAttribute('class', 'img-comp-slider-button');

    slider.appendChild(button);
    img.parentElement.insertBefore(slider, img);
    slider.style.left = (w / 2) - (slider.offsetWidth / 2) + 'px';

    slider.addEventListener('mousedown', slideReady);
    window.addEventListener('mouseup', slideFinish);
    slider.addEventListener('touchstart', slideReady);
    window.addEventListener('touchend', slideFinish);

    function slideReady(e) {
      e.preventDefault();
      clicked = 1;
      window.addEventListener('mousemove', slideMove);
      window.addEventListener('touchmove', slideMove);
    }

    function slideFinish() {
      clicked = 0;
    }

    function slideMove(e) {
      if (!clicked) return;
      const pos = getCursorPos(e);
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      slide(pos);
    }

    function getCursorPos(e) {
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      const rect = img.getBoundingClientRect();
      const x = e.pageX - rect.left - window.pageXOffset;
      return x;
    }

    function slide(x) {
      img.style.width = x + 'px';
      slider.style.left = img.offsetWidth - (slider.offsetWidth / 2) + 'px';
    }
  }
}

document.addEventListener('DOMContentLoaded', initForm);
