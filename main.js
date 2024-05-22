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

async function convert(sourceType, outputType, fileBuffer, resizeOptions) {
  const imageData = await decode(sourceType, fileBuffer);
  const resizedImageData = resizeOptions ? await resizeImage(imageData, resizeOptions) : imageData;
  return encode(outputType, resizedImageData);
}

async function resizeImage(imageData, { width, height }) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imageData.width;
  canvas.height = imageData.height;

  // Draw the original image data onto the canvas
  const imageBitmap = await createImageBitmap(new ImageData(imageData.data, imageData.width, imageData.height));
  ctx.drawImage(imageBitmap, 0, 0);

  // Create a new canvas for the resized image
  const resizedCanvas = document.createElement('canvas');
  const resizedCtx = resizedCanvas.getContext('2d');

  resizedCanvas.width = width;
  resizedCanvas.height = height;

  // Draw the resized image onto the new canvas
  resizedCtx.drawImage(canvas, 0, 0, width, height);

  return resizedCtx.getImageData(0, 0, width, height);
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

async function handleFile(file) {
  const sourceType = file.name.endsWith('jxl') ? 'jxl' : file.type.replace('image/', '');
  const outputType = document.querySelector('input[name="outputType"]:checked').value;
  const fileBuffer = await file.arrayBuffer();
  
  const resizeWidth = document.querySelector('#resizeWidth').value;
  const resizeHeight = document.querySelector('#resizeHeight').value;

  const resizeOptions = (resizeWidth && resizeHeight) ? { width: parseInt(resizeWidth), height: parseInt(resizeHeight) } : null;

  const imageSizeBeforeConversion = (file.size / 1024).toFixed(2);

  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);

  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
  const imageSizeAfterConversion = (imageBlob.size / 1024).toFixed(2);

  const difference = imageSizeAfterConversion - imageSizeBeforeConversion;
  const percentDifference = ((difference / imageSizeBeforeConversion) * 100).toFixed(2);
  const sign = difference >= 0 ? '+' : '-';

  document.querySelector('#imageSizeBefore').textContent = `Image Size Before Conversion: ${imageSizeBeforeConversion} KB`;
  document.querySelector('#imageSizeAfter').textContent = `Image Size After Conversion: ${imageSizeAfterConversion} KB`;
  document.querySelector('#imageSizeDifference').textContent = `Percent Difference: ${sign}${Math.abs(percentDifference)}%`;

  showOutput(imageBuffer, outputType);
}

async function initForm() {
  const form = document.querySelector('form');
  const inputFile = form.querySelector('input[name="file"]');
  const dropZone = document.getElementById('drop-zone');

  inputFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const imageSizeBeforeUpload = (file.size / 1024).toFixed(2);
    document.querySelector('#imageSizeBefore').textContent = `Image Size Before Conversion: ${imageSizeBeforeUpload} KB`;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = inputFile.files[0];
    if (file) {
      handleFile(file);
    }
  });

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) {
      inputFile.files = event.dataTransfer.files;
      handleFile(file);
    }
  });

  dropZone.addEventListener('click', () => {
    inputFile.click();
  });
}

async function main() {
  initForm();
}

main();

function initComparisons() {
  var overlays = document.getElementsByClassName("img-comp-overlay");
  for (var i = 0; i < overlays.length; i++) {
    compareImages(overlays[i]);
  }

  function compareImages(img) {
    var slider, button, clicked = 0, w, h;
    w = img.offsetWidth;
    h = img.offsetHeight;

    img.style.width = (w / 2) + "px";

    slider = document.createElement("DIV");
    slider.setAttribute("class", "img-comp-slider");

    button = document.createElement("DIV");
    button.setAttribute("class", "img-comp-slider-button");

    slider.appendChild(button);

    img.parentElement.insertBefore(slider, img);

    slider.style.left = (w / 2) - (slider.offsetWidth / 2) + "px";

    slider.addEventListener("mousedown", slideReady);
    window.addEventListener("mouseup", slideFinish);
    slider.addEventListener("touchstart", slideReady);
    window.addEventListener("touchend", slideFinish);

    function slideReady(e) {
      e.preventDefault();
      clicked = 1;
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }

    function slideFinish() {
      clicked = 0;
    }

    function slideMove(e) {
      if (!clicked) return;
      var pos = getCursorPos(e);
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      slide(pos);
    }

    function getCursorPos(e) {
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      var rect = img.getBoundingClientRect();
      var x = e.pageX - rect.left - window.pageXOffset;
      return x;
    }

    function slide(x) {
      img.style.width = x + "px";
      slider.style.left = img.offsetWidth - (slider.offsetWidth / 2) + "px";
    }
  }
}

window.onload = initComparisons;
