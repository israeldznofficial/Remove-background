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

// אלמנטים של Modal Pro וקוד VIP
const proModal = document.getElementById('proModal');
const openProBtn = document.getElementById('openProBtn');
const closeProBtn = document.getElementById('closeProBtn');
const promoInput = document.getElementById('promoCodeInput');
const applyBtn = document.getElementById('applyCodeBtn');
const promoMsg = document.getElementById('promoMessage');

const API_KEY = 'AbN3eMM4pZzE3b2VrBir4vBb';
const PROMO_CODE = 'VIPISRAELDZN1';

let selectedFile = null;
let processedBlob = null;

// ==========================================
// 1. בדיקת סטטוס Pro וניהול Modal
// ==========================================
function checkProStatus() {
    const isPro = localStorage.getItem('isProUser') === 'true';
    if (isPro) {
        if (openProBtn) openProBtn.innerHTML = '<i class="fa-solid fa-crown"></i> מנוי Pro פעיל';
        if (downloadHdBtn) downloadHdBtn.innerHTML = '<i class="fa-solid fa-download"></i> הורד ב-HD 4K (פתוח)';
    }
    return isPro;
}

if (openProBtn) openProBtn.addEventListener('click', () => proModal.style.display = 'flex');
if (closeProBtn) closeProBtn.addEventListener('click', () => proModal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === proModal) proModal.style.display = 'none';
});

// הפעלת קוד VIP
if (applyBtn) {
    applyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim();
        if (code === PROMO_CODE) {
            localStorage.setItem('isProUser', 'true');
            promoMsg.style.color = '#10b981';
            promoMsg.innerText = 'קוד תקין! שודרגת בהצלחה ל-Pro!';
            promoMsg.style.display = 'block';
            checkProStatus();
            setTimeout(() => {
                proModal.style.display = 'none';
            }, 1500);
        } else {
            promoMsg.style.color = '#ef4444';
            promoMsg.innerText = 'קוד שגוי, נסה שוב.';
            promoMsg.style.display = 'block';
        }
    });
}

// בלחיצה על הורדת HD
if (downloadHdBtn) {
    downloadHdBtn.addEventListener('click', () => {
        if (checkProStatus() && processedBlob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(processedBlob);
            a.download = `no-bg-hd-${selectedFile ? selectedFile.name.split('.')[0] : 'image'}.png`;
            a.click();
        } else {
            proModal.style.display = 'flex';
        }
    });
}

// ==========================================
// 2. גרירה, העלאה והדבקת תמונות
// ==========================================
if (dropZone) {
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
}

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

if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });
}

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

// ==========================================
// 3. הסרת רקע
// ==========================================
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

// ==========================================
// 4. שינוי צבע ברקע
// ==========================================
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

// ==========================================
// 5. העתקה ללוח
// ==========================================
if (copyBtn) {
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
}

// הפעלה ראשונית לבדיקת סטטוס Pro
checkProStatus();
