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

// הגדרות API וקוד שדרוג
const API_KEY = 'VS1Nj55zAtnN2eJhFx5NLGQk';
const PROMO_CODE = 'GAH423';

let selectedFile = null;
let processedBlob = null;
let highResHdBlob = null; // קובץ HD/4K ברזולוציה מלאה

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
        highResHdBlob = null;
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
// 4. יצירת HD 4K ברזולוציה מקורית (Canvas Alpha Mask)
// ==========================================
function createFullHdImage(origImgSrc, lowResNoBgBlob) {
    return new Promise((resolve, reject) => {
        const origImg = new Image();
        const noBgImg = new Image();

        origImg.onload = () => {
            noBgImg.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = origImg.naturalWidth;
                canvas.height = origImg.naturalHeight;

                // ציור התמונה המקורית ברזולוציה המלאה
                ctx.drawImage(origImg, 0, 0, canvas.width, canvas.height);

                // יצירת מסכת שקיפות מהתמונה ללא הרקע
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx.drawImage(noBgImg, 0, 0, canvas.width, canvas.height);

                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(tempCanvas, 0, 0);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            };
            noBgImg.src = URL.createObjectURL(lowResNoBgBlob);
        };
        origImg.src = origImgSrc;
    });
}

// ==========================================
// 5. הסרת רקע
// ==========================================
if (removeBtn) {
    removeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        if (loader) loader.style.display = 'flex';
        if (resultPlaceholder) resultPlaceholder.style.display = 'none';
        if (resultImage) resultImage.style.display = 'none';
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

            if (!response.ok) throw new Error('API Error');

            processedBlob = await response.blob();
            const url = URL.createObjectURL(processedBlob);

            if (resultImage) {
                resultImage.src = url;
                resultImage.style.display = 'block';
            }

            if (bgPickerSection) bgPickerSection.style.display = 'block';

            // 1. הורדה רגילה (איכות בסיסית)
            if (downloadBtn) {
                downloadBtn.href = url;
                downloadBtn.download = `no-bg-${selectedFile.name.split('.')[0]}.png`;
                downloadBtn.style.display = 'inline-flex';
            }

            // 2. עיבוד HD/4K ברזולוציה מקורית
            highResHdBlob = await createFullHdImage(originalImage.src, processedBlob);

            if (downloadHdBtn) {
                downloadHdBtn.removeAttribute('href');
                downloadHdBtn.style.display = 'inline-flex';
            }

            if (copyBtn) copyBtn.style.display = 'inline-flex';

        } catch (err) {
            alert('אירעה שגיאה בחיבור למנוע ה-AI. יש לוודא שהמפתח תקין.');
            if (resultPlaceholder) resultPlaceholder.style.display = 'block';
        } finally {
            if (loader) loader.style.display = 'none';
            removeBtn.disabled = false;
            checkProStatus();
        }
    });
}

// ==========================================
// 6. חסימת הורדת HD/4K למשתמשים שאינם Pro
// ==========================================
if (downloadHdBtn) {
    downloadHdBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (checkProStatus()) {
            const blobToDownload = highResHdBlob || processedBlob;
            if (blobToDownload) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blobToDownload);
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
// 7. שינוי רקע
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

checkProStatus();
