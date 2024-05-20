// Function to load jpegli.wasm module
async function loadJpegliModule() {
    const response = await fetch('https://raw.githubusercontent.com/YuushaExa/optimizer/main/jpegli.wasm');
    const bytes = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(bytes, {});
    return wasmModule.instance.exports;
}

// Function to optimize image using jpegli.wasm
async function optimizeWithJpegliWasm(imageBuffer) {
    // Load jpegli.wasm module
    const jpegliModule = await loadJpegliModule();

    // Convert image buffer to Uint8Array
    const imageUint8Array = new Uint8Array(imageBuffer);

    // Allocate memory for the image buffer in wasm memory
    const imagePtr = jpegliModule._malloc(imageUint8Array.length);
    jpegliModule.HEAPU8.set(imageUint8Array, imagePtr);

    // Call the optimize function in jpegli.wasm
    const optimizedImagePtr = jpegliModule._optimize_image(imagePtr, imageUint8Array.length);

    // Get the optimized image buffer from wasm memory
    const optimizedImageLength = jpegliModule._get_optimized_image_length();
    const optimizedImageBuffer = jpegliModule.HEAPU8.subarray(optimizedImagePtr, optimizedImagePtr + optimizedImageLength);

    // Free memory
    jpegliModule._free(imagePtr);
    jpegliModule._free(optimizedImagePtr);

    return optimizedImageBuffer;
}

// Function to handle image optimization
async function optimizeImageWithJpegli(imageFile) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = async function() {
            const imageBuffer = reader.result;
            const optimizedImageBuffer = await optimizeWithJpegliWasm(imageBuffer);
            const optimizedImageBlob = new Blob([optimizedImageBuffer], { type: 'image/jpeg' });
            resolve(optimizedImageBlob);
        };
        reader.readAsArrayBuffer(imageFile);
    });
}

// Function to handle image optimization
async function optimizeImage() {
    const imageInput = document.getElementById('imageInput');
    const originalSizeDiv = document.getElementById('originalSize');
    const optimizedSizeDiv = document.getElementById('optimizedSize');
    const downloadLink = document.getElementById('downloadLink');

    if (imageInput.files.length === 0) {
        alert('Please select an image file.');
        return;
    }

    const imageFile = imageInput.files[0];

    // Calculate original size
    originalSizeDiv.textContent = `Original Size: ${imageFile.size / 1024} KB`;

    // Optimizing image using jpegli.wasm
    const optimizedImageFile = await optimizeImageWithJpegli(imageFile);

    // Calculate optimized size
    optimizedSizeDiv.textContent = `Optimized Size: ${optimizedImageFile.size / 1024} KB`;

    // Display download link
    downloadLink.href = URL.createObjectURL(optimizedImageFile);
    downloadLink.style.display = 'inline';
}

document.getElementById('optimizeButton').addEventListener('click', optimizeImage);
