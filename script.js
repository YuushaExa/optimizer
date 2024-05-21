document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const optimizeButton = document.getElementById("optimizeButton");
  const sizeInfoDiv = document.getElementById("sizeInfo");
  const outputDiv = document.getElementById("output");
  const downloadButton = document.getElementById("downloadButton");

  let originalSize = 0;
  let compressedSize = 0;
  let compressedUrl = '';

  // Function to format bytes
  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  // Function to compress the uploaded image
  const compressImage = async (file) => {
    try {
      // Dynamically import the jSquash library
      const { encode } = await import('https://cdn.jsdelivr.net/npm/@jsquash/jpeg@1.4.0/esm/index.js');

      const arrayBuffer = await file.arrayBuffer();
      const compressedBlob = await encode(new Uint8Array(arrayBuffer), {
        quality: 75, // Adjust the quality as needed
      });

      // Display compressed image
      compressedUrl = URL.createObjectURL(compressedBlob);
      outputDiv.innerHTML = `<img src="${compressedUrl}" alt="Compressed Image" width="100">`;

      // Calculate and display size difference
      compressedSize = compressedBlob.size;
      sizeInfoDiv.innerText = `Original Size: ${formatBytes(originalSize)}\nCompressed Size: ${formatBytes(compressedSize)}\nSize Reduction: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`;

      // Show download button
      downloadButton.style.display = 'inline-block';
      downloadButton.href = compressedUrl;
      downloadButton.download = 'optimized_image.jpg';
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  // Event listener for file input change
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      originalSize = file.size;
      optimizeButton.disabled = false;
      sizeInfoDiv.innerText = `Original Size: ${formatBytes(originalSize)}`;
    } else {
      optimizeButton.disabled = true;
      sizeInfoDiv.innerText = '';
    }
  });

  // Event listener for optimize button click
  optimizeButton.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (file) {
      compressImage(file);
    }
  });
});
