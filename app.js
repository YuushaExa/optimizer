async function loadWasm() {
    const response = await fetch('jpegli.wasm');
    const buffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(buffer);
    return wasmModule.instance.exports;
}

let jpegli = null;
loadWasm().then(exports => {
    jpegli = exports;
});

document.getElementById('optimizeButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length === 0) {
        alert('Please upload an image.');
        return;
    }

    const file = fileInput.files[0];
    const originalSize = file.size;
    document.getElementById('originalSize').textContent = originalSize;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const originalImage = new Uint8Array(arrayBuffer);

        // Assume jpegli.encode() and jpegli.decode() are available and correctly handle the image data
        // You might need to adjust according to the actual API provided by the wasm module

        const optimizedImage = jpegli.encode(originalImage);
        const optimizedSize = optimizedImage.length;
        document.getElementById('optimizedSize').textContent = optimizedSize;

        const blob = new Blob([optimizedImage], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);

        const img = document.getElementById('optimizedImage');
        img.src = url;
        img.style.display = 'block';

        const downloadButton = document.getElementById('downloadButton');
        downloadButton.style.display = 'inline';
        downloadButton.href = url;
        downloadButton.download = 'optimized_image.jpg';
    };
    reader.readAsArrayBuffer(file);

    const originalImg = document.getElementById('originalImage');
    originalImg.src = URL.createObjectURL(file);
    originalImg.style.display = 'block';
});
