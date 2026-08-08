const imageInput = document.getElementById('imageInput');
const dropZone = document.getElementById('dropZone');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');
const resultContainer = document.getElementById('resultContainer');
const removeBtn = document.getElementById('removeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadHdBtn = document.getElementById('downloadHdBtn');
const copyBtn = document.getElementById('copyBtn');
const loader = document.getElementById('loader');
const origPlaceholder = document.getElementById('origPlaceholder');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const bgPickerSection = document.getElementById('bgPickerSection');
const colorBtns = document.querySelectorAll('.color-btn');

// אלמנטים של Modal Pro
const proModal = document.getElementById('proModal');
const openProBtn = document.getElementById('openProBtn');
const closeProBtn = document.getElementById('closeProBtn');

const API_KEY = 'AbN3eMM4pZzE3b2VrBir4vBb';

let selectedFile = null;
let processedBlob = null;

// פתיחה/סגירה של חלון Pro
openProBtn.addEventListener('click', () => proModal.style.display = 'flex');
downloadHdBtn.addEventListener('click', () => proModal.style.display = 'flex');
closeProBtn.addEventListener('click', () => proModal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === proModal) proModal.style.display = 'none';
});

// גרירת קבצים
dropZone.addEventListener('click', () => imageInput.click());

['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });
});

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) handleFile(files[0]);
});

// Ctrl+V להדבקה
document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            handleFile(blob);
            break;
        }
    }
});

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
            origPlaceholder.style.display = 'none';

            resultImage.style.display = 'none';
            resultPlaceholder.style.display = 'block';
            bgPickerSection.style.display = 'none';
            downloadBtn.style.display = 'none';
            downloadHdBtn.style.display = 'none';
            copyBtn.style.display = 'none';
            removeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

removeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    loader.style.display = 'flex';
    resultPlaceholder.style.display = 'none';
    resultImage.style.display = 'none';
    removeBtn.disabled = true;

    const formData = new FormData();
    formData.append('image_file', selectedFile);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: { 'X-Api-Key': API_KEY },
            body: formData
        });

        if (!response.ok) throw new Error('שגיאה בעיבוד');

        processedBlob = await response.blob();
        const url = URL.createObjectURL(processedBlob);

        resultImage.src = url;
        resultImage.style.display = 'block';

        bgPickerSection.style.display = 'block';
        downloadBtn.href = url;
        downloadBtn.download = 'no-bg.png';
        downloadBtn.style.display = 'inline-flex';
        downloadHdBtn.style.display = 'inline-flex';
        copyBtn.style.display = 'inline-flex';
    } catch (error) {
        alert('אירעה שגיאה בעת הסרת הרקע.');
        resultPlaceholder.style.display = 'block';
    } finally {
        loader.style.display = 'none';
        removeBtn.disabled = false;
    }
});

// שינוי צבע
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color');

        if (color === 'transparent') {
            resultContainer.style.backgroundColor = '';
            resultContainer.classList.add('result-box');
        } else {
            resultContainer.classList.remove('result-box');
            resultContainer.style.backgroundColor = color;
        }
    });
});

// העתקה ללוח
copyBtn.addEventListener('click', async () => {
    if (!processedBlob) return;
    try {
        await navigator.clipboard.write([
            new ClipboardItem({ [processedBlob.type]: processedBlob })
        ]);
        alert('התמונה הועתקה ללוח!');
    } catch (err) {
        alert('לא ניתן להעתיק את התמונה בדפדפן זה.');
    }
});
