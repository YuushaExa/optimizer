// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const optimizeButton = document.getElementById("optimizeButton");
  const sizeInfoDiv = document.getElementById("sizeInfo");
  const outputDiv = document.getElementById("output");
  const downloadButton = document.getElementById("downloadButton");

  let originalSize = 0;
  let compressedSize = 0;

  // Function to compress the uploaded image
  const compressImage = async (file) => {
    try {
      const imagePool = new window.squoosh.ImagePool();
      const image = imagePool.ingestImage(file);

      // Preprocessing and encoding options
      const preprocessOptions = {
        resize: {
          width: 100, // Adjust as needed
          height: 100, // Adjust as needed
        },
      };

      const encodeOptions = {
        mozjpeg: {}, // Empty object means 'use default settings'
      };

      // Preprocess and encode the image
      await image.preprocess(preprocessOptions);
      const result = await image.encode(encodeOptions);

      // Display compressed image
      const compressedUrl = URL.createObjectURL(
        new Blob([result.encodedWith.mozjpeg.binary], { type: "image/jpeg" })
      );
      outputDiv.innerHTML = `<img src="${compressedUrl}" alt="Compressed Image" width="100">`;

      // Calculate and display size difference
      compressedSize = result.encodedWith.mozjpeg.size;
      sizeInfoDiv.innerText = `Original Size: ${formatBytes(originalSize)}\nCompressed Size: ${formatBytes(compressedSize)}\nSize Reduction: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`;

      // Show download button
      downloadButton.style.display = 'inline-block';
      downloadButton.href = compressedUrl;
      downloadButton.download = 'optimized_image.jpg';

      // Close the ImagePool
      await imagePool.close();
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  // Function to format bytes
  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
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
