// ==========================================
// 1. הגדרת אלמנטים מה-DOM
// ==========================================
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

// Modal Pro & VIP
const proModal = document.getElementById('proModal');
const openProBtn = document.getElementById('openProBtn');
const closeProBtn = document.getElementById('closeProBtn');

const promoInput = document.getElementById('promoCodeInput');
const applyBtn = document.getElementById('applyCodeBtn');
const promoMsg = document.getElementById('promoMessage');

// קוד שדרוג Pro
const PROMO_CODE = 'NKA353';

let selectedFile = null;
let processedBlob = null;

// ==========================================
// 2. ניהול VIP / Pro Status
// ==========================================
function checkProStatus() {
    const isPro = localStorage.getItem('isProUser') === 'true';
    
    if (isPro) {
        if (openProBtn) openProBtn.innerHTML = '<i class="fa-solid fa-crown"></i> מנוי Pro פעיל';
        if (downloadHdBtn) downloadHdBtn.innerHTML = '<i class="fa-solid fa-crown"></i> הורד ב-HD 4K (פתוח)';
    } else {
        if (openProBtn) openProBtn.innerHTML = '<i class="fa-solid fa-crown"></i> שדרג ל-Pro';
        if (downloadHdBtn) downloadHdBtn.innerHTML = '<i class="fa-solid fa-lock"></i> הורד ב-HD 4K (נעול)';
    }
    return isPro;
}

if (openProBtn) openProBtn.addEventListener('click', () => proModal.style.display = 'flex');
if (closeProBtn) closeProBtn.addEventListener('click', () => proModal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === proModal) proModal.style.display = 'none';
});

if (applyBtn) {
    applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const code = promoInput ? promoInput.value.trim().toUpperCase() : '';
        const targetCode = PROMO_CODE.trim().toUpperCase();

        if (code === targetCode) {
            localStorage.setItem('isProUser', 'true');
            if (promoMsg) {
                promoMsg.style.color = '#10b981';
                promoMsg.innerText = 'קוד תקין! שודרגת בהצלחה ל-Pro!';
                promoMsg.style.display = 'block';
            }
            checkProStatus();
            setTimeout(() => {
                if (proModal) proModal.style.display = 'none';
            }, 1200);
        } else {
            if (promoMsg) {
                promoMsg.style.color = '#ef4444';
                promoMsg.innerText = 'קוד שגוי, נסה שוב.';
                promoMsg.style.display = 'block';
            }
        }
    });
}

// ==========================================
// 3. טעינת תמונה והעלאה
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

if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
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

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        const reader = new FileReader();

        reader.onload = (e) => {
            if (originalImage) {
                originalImage.src = e.target.result;
                originalImage.style.display = 'block';
            }
            if (origPlaceholder) origPlaceholder.style.display = 'none';

            if (resultImage) resultImage.style.display = 'none';
            if (resultPlaceholder) resultPlaceholder.style.display = 'block';
            if (bgPickerSection) bgPickerSection.style.display = 'none';
            if (downloadBtn) downloadBtn.style.display = 'none';
            if (downloadHdBtn) downloadHdBtn.style.display = 'none';
            if (copyBtn) copyBtn.style.display = 'none';

            if (removeBtn) removeBtn.disabled = false;
        };

        reader.readAsDataURL(file);
    }
}

// ==========================================
// 4. הסרת רקע חינמית לתמיד (ברזולוציה מלאה)
// ==========================================
if (removeBtn) {
    removeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        if (loader) loader.style.display = 'flex';
        if (resultPlaceholder) resultPlaceholder.style.display = 'none';
        if (resultImage) resultImage.style.display = 'none';
        removeBtn.disabled = true;

        try {
            // שימוש במנוע ה-AI החינמי ללא תלות ב-API Key
            processedBlob = await imglyRemoveBackground(selectedFile);
            const url = URL.createObjectURL(processedBlob);

            if (resultImage) {
                resultImage.src = url;
                resultImage.style.display = 'block';
            }

            if (bgPickerSection) bgPickerSection.style.display = 'block';

            // הורדה רגילה
            if (downloadBtn) {
                downloadBtn.href = url;
                downloadBtn.download = `no-bg-${selectedFile.name.split('.')[0]}.png`;
                downloadBtn.style.display = 'inline-flex';
            }

            // הורדת HD/4K (מוגנת ל-Pro)
            if (downloadHdBtn) {
                downloadHdBtn.removeAttribute('href');
                downloadHdBtn.style.display = 'inline-flex';
            }

            if (copyBtn) copyBtn.style.display = 'inline-flex';

        } catch (err) {
            console.error(err);
            alert('אירעה שגיאה בשימוש במנוע הסרת הרקע.');
            if (resultPlaceholder) resultPlaceholder.style.display = 'block';
        } finally {
            if (loader) loader.style.display = 'none';
            removeBtn.disabled = false;
            checkProStatus();
        }
    });
}

// ==========================================
// 5. הורדת HD/4K
// ==========================================
if (downloadHdBtn) {
    downloadHdBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (checkProStatus()) {
            if (processedBlob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(processedBlob);
                a.download = `hd-4k-${selectedFile ? selectedFile.name.split('.')[0] : 'image'}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } else {
            if (proModal) proModal.style.display = 'flex';
        }
    });
}

// ==========================================
// 6. העתקה ללוח
// ==========================================
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        if (!processedBlob) return;
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ [processedBlob.type]: processedBlob })
            ]);
            alert('התמונה הועתקה ללוח בהצלחה!');
        } catch (err) {
            console.error(err);
            alert('לא ניתן להעתיק את התמונה בדפדפן זה.');
        }
    });
}

// ==========================================
// 7. שינוי רקע
// ==========================================
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color');

        if (color === 'transparent') {
            if (resultContainer) {
                resultContainer.style.backgroundColor = '';
                resultContainer.classList.add('result-box');
            }
        } else {
            if (resultContainer) {
                resultContainer.classList.remove('result-box');
                resultContainer.style.backgroundColor = color;
            }
        }
    });
});

checkProStatus();
