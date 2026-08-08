const imageInput = document.getElementById('imageInput');
const dropZone = document.getElementById('dropZone');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');
const removeBtn = document.getElementById('removeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loader = document.getElementById('loader');

// מפתח ה-API האישי שלך
const API_KEY = 'AbN3eMM4pZzE3b2VrBir4vBb';

let selectedFile = null;

dropZone.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalImage.style.display = 'block';
            resultImage.style.display = 'none';
            downloadBtn.style.display = 'none';
            removeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

removeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    loader.style.display = 'block';
    resultImage.style.display = 'none';
    removeBtn.disabled = true;

    const formData = new FormData();
    formData.append('image_file', selectedFile);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY
            },
            body: formData
        });

        if (!response.ok) throw new Error('שגיאה בעיבוד התמונה');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        resultImage.src = url;
        resultImage.style.display = 'block';

        downloadBtn.href = url;
        downloadBtn.download = 'no-bg.png';
        downloadBtn.style.display = 'inline-block';
    } catch (error) {
        alert('אירעה שגיאה בעת הסרת הרקע.');
        console.error(error);
    } finally {
        loader.style.display = 'none';
        removeBtn.disabled = false;
    }
});