async function loadWasm() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/YuushaExa/optimizer/main/jpegli.wasm');
        const buffer = await response.arrayBuffer();
        const wasmModule = await WebAssembly.instantiate(buffer);
        return wasmModule.instance.exports;
    } catch (error) {
        console.error('Error loading WebAssembly module:', error);
        alert('Failed to load WebAssembly module.');
    }
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
    document.getElementById('originalSize').textContent = `Original Size: ${originalSize} bytes`;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const arrayBuffer = e.target.result;
            const originalImage = new Uint8Array(arrayBuffer);

            // Assuming jpegli.encode() and jpegli.decode() are available
            const optimizedImagePtr = jpegli.encode(originalImage.byteOffset, originalImage.length);
            const optimizedImageLength = jpegli.getOptimizedImageLength();
            const optimizedImage = new Uint8Array(jpegli.memory.buffer, optimizedImagePtr, optimizedImageLength);

            const optimizedSize = optimizedImage.length;
            document.getElementById('optimizedSize').textContent = `Optimized Size: ${optimizedSize} bytes`;

            const blob = new Blob([optimizedImage], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);

            const img = document.getElementById('optimizedImage');
            img.src = url;
            img.style.display = 'block';

            const downloadButton = document.getElementById('downloadButton');
            downloadButton.style.display = 'inline';
            downloadButton.href = url;
            downloadButton.download = 'optimized_image.jpg';
        } catch (error) {
            console.error('Error optimizing image:', error);
            alert('Failed to optimize image.');
        }
    };
    reader.readAsArrayBuffer(file);

    const originalImg = document.getElementById('originalImage');
    originalImg.src = URL.createObjectURL(file);
    originalImg.style.display = 'block';
});
