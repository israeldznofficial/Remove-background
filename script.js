const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const removeBgBtn = document.getElementById('removeBgBtn');
const downloadBtn = document.getElementById('downloadBtn');
const originalImg = document.getElementById('originalImg');
const resultImg = document.getElementById('resultImg');
const origPlaceholder = document.getElementById('origPlaceholder');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const bgPickerContainer = document.getElementById('bgPickerContainer');

const openProBtn = document.getElementById('openProBtn');
const proFeaturesBtn = document.getElementById('proFeaturesBtn');
const closeProBtn = document.getElementById('closeProBtn');
const proModal = document.getElementById('proModal');

let selectedFile = null;

// פופ-אפ Pro
function openModal() { if (proModal) proModal.style.display = 'flex'; }
function closeModal() { if (proModal) proModal.style.display = 'none'; }

if (openProBtn) openProBtn.addEventListener('click', openModal);
if (proFeaturesBtn) proFeaturesBtn.addEventListener('click', openModal);
if (closeProBtn) closeProBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === proModal) closeModal();
});

// העלאת קבצים
if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#1d4ed8';
        dropZone.style.backgroundColor = '#dbeafe';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#3b82f6';
        dropZone.style.backgroundColor = '#eff6ff';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3b82f6';
        dropZone.style.backgroundColor = '#eff6ff';
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

// הדבקת תמונה (Ctrl + V)
document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            handleFileSelect(blob);
            break;
        }
    }
});

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('אנא בחר קובץ תמונה תקין.');
        return;
    }

    selectedFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        originalImg.src = e.target.result;
        originalImg.style.display = 'block';
        if (origPlaceholder) origPlaceholder.style.display = 'none';

        resultImg.style.display = 'none';
        if (resultPlaceholder) resultPlaceholder.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (bgPickerContainer) bgPickerContainer.style.display = 'none';

        removeBgBtn.disabled = false;
    };

    reader.readAsDataURL(file);
}

// הסרת רקע באמצעות AI
removeBgBtn.addEventListener('click', async () => {
    if (!selectedFile || !originalImg.src) return;

    removeBgBtn.disabled = true;
    removeBgBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> מסיק רקע ב-AI (כ-5 שניות)...';

    try {
        let resultBlob = null;

        // ניסיון ראשון: הסרת רקע דרך מודל AI של imgly עם הגדרות מותאמות לתאימות
        if (window.imglyRemoveBackground) {
            try {
                resultBlob = await window.imglyRemoveBackground(selectedFile, {
                    publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.4.5/dist/',
                    fetchArgs: { mode: 'cors' }
                });
            } catch (aiErr) {
                console.warn('AI Library error, trying fallback:', aiErr);
            }
        }

        // אם ה-AI הבינלאומי לא פעל, ביצוע עיבוד קנבס משופר
        if (!resultBlob) {
            resultBlob = await processAdvancedCanvas(originalImg);
        }

        const resultUrl = URL.createObjectURL(resultBlob);

        resultImg.src = resultUrl;
        resultImg.style.display = 'block';
        if (resultPlaceholder) resultPlaceholder.style.display = 'none';

        if (downloadBtn) {
            downloadBtn.href = resultUrl;
            downloadBtn.download = `no-bg-${selectedFile.name ? selectedFile.name.split('.')[0] : 'image'}.png`;
            downloadBtn.style.display = 'inline-flex';
        }

        if (bgPickerContainer) bgPickerContainer.style.display = 'block';

    } catch (err) {
        console.error('שגיאה בתהליך:', err);
        alert('אירעה שגיאה. אנא נסה תמונה אחרת.');
    } finally {
        removeBgBtn.disabled = false;
        removeBgBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> הסר רקע';
    }
});

// אלגוריתם קנבס מתקדם לעיבוד תמונה
function processAdvancedCanvas(imgElement) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;

        ctx.drawImage(imgElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // דגימת צבעים ממספר פינות להגדלת הדיוק
        const cornerSamples = [
            [0, 0],
            [canvas.width - 1, 0],
            [0, canvas.height - 1],
            [canvas.width - 1, canvas.height - 1]
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        cornerSamples.forEach(([x, y]) => {
            const idx = (y * canvas.width + x) * 4;
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
        });
        bgR /= cornerSamples.length;
        bgG /= cornerSamples.length;
        bgB /= cornerSamples.length;

        const tolerance = 60;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const diff = Math.sqrt(
                Math.pow(r - bgR, 2) +
                Math.pow(g - bgG, 2) +
                Math.pow(b - bgB, 2)
            );

            if (diff < tolerance) {
                data[i + 3] = Math.max(0, (diff / tolerance) * 255);
            }
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}

// בחירת צבע רקע
const colorBtns = document.querySelectorAll('.color-btn');
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        const resultContainer = document.querySelector('.result-box');
        if (resultContainer) {
            resultContainer.style.backgroundColor = color;
        }
    });
});
