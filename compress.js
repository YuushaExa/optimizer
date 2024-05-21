async function compressImage(file) {
  const { ImagePool } = window.squoosh;
  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(file);

  await image.encode({
    mozjpeg: { quality: 75 },
  });

  const compressedImage = await image.encodedWith.mozjpeg;
  return compressedImage.binary;
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const originalImage = document.getElementById('originalImage');
  originalImage.src = URL.createObjectURL(file);
  originalImage.style.display = 'block';

  document.getElementById('optimizeButton').disabled = false;
  document.getElementById('sizeInfo').innerText = `Original Size: ${formatBytes(file.size)}`;
});

document.getElementById('optimizeButton').addEventListener('click', async () => {
  const file = document.getElementById('fileInput').files[0];
  const arrayBuffer = await file.arrayBuffer();
  const compressedImageBuffer = await compressImage(new Uint8Array(arrayBuffer));

  const compressedBlob = new Blob([compressedImageBuffer], { type: 'image/jpeg' });
  const compressedUrl = URL.createObjectURL(compressedBlob);
  const compressedImage = document.getElementById('compressedImage');
  compressedImage.src = compressedUrl;
  compressedImage.style.display = 'block';

  const originalSize = file.size;
  const compressedSize = compressedBlob.size;

  document.getElementById('sizeInfo').innerText += `\nCompressed Size: ${formatBytes(compressedSize)}\nSize Reduction: ${(100 - (compressedSize / originalSize) * 100).toFixed(2)}%`;

  const downloadButton = document.getElementById('downloadButton');
  downloadButton.href = compressedUrl;
  downloadButton.download = 'optimized_image.jpg';
  downloadButton.style.display = 'inline-block';
});
