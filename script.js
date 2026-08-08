// האלמנטים ב-DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const removeBgBtn = document.getElementById('removeBgBtn');
const downloadBtn = document.getElementById('downloadBtn');
const originalImg = document.getElementById('originalImg');
const resultImg = document.getElementById('resultImg');
const origPlaceholder = document.getElementById('origPlaceholder');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const bgPickerContainer = document.getElementById('bgPickerContainer');

// כפתורי Pro
const openProBtn = document.getElementById('openProBtn');
const proFeaturesBtn = document.getElementById('proFeaturesBtn');
const closeProBtn = document.getElementById('closeProBtn');
const proModal = document.getElementById('proModal');

let selectedFile = null;

// ==========================================
// 1. ניהול הפופ-אפ של Pro
// ==========================================
function openModal() {
    proModal.style.display = 'flex';
}

function closeModal() {
    proModal.style.display = 'none';
}

if (openProBtn) openProBtn.addEventListener('click', openModal);
if (proFeaturesBtn) proFeaturesBtn.addEventListener('click', openModal);
if (closeProBtn) closeProBtn.addEventListener('click', closeModal);

// סגירה בלחיצה מחוץ לחלון הפופ-אפ
window.addEventListener('click', (e) => {
    if (e.target === proModal) {
        closeModal();
    }
});

// ==========================================
// 2. העלאת קבצים (גרירה / בלחיצה)
// ==========================================
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

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// טיפול בקובץ שנבחר
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
        origPlaceholder.style.display = 'none';

        // איפוס תוצאה קודמת
        resultImg.style.display = 'none';
        resultPlaceholder.style.display = 'block';
        downloadBtn.style.display = 'none';
        bgPickerContainer.style.display = 'none';

        // הפעלת כפתור הסרת רקע
        removeBgBtn.disabled = false;
    };

    reader.readAsDataURL(file);
}

// ==========================================
// 3. הסרת רקע (סימולציה / API)
// ==========================================
removeBgBtn.addEventListener('click', () => {
    if (!selectedFile) return;

    // שינוי מצב כפתור לטעינה
    removeBgBtn.disabled = true;
    removeBgBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> מעבד תמונה...';

    // סימולציית עיבוד (כאן ניתן לשלב API אמיתי כמו imgly / remove.bg)
    setTimeout(() => {
        // הצגת התמונה המעובדת (כרגע מציג את המקורית לצורך הדגמה)
        resultImg.src = originalImg.src;
        resultImg.style.display = 'block';
        resultPlaceholder.style.display = 'none';

        // הפעלת כפתור הורדה ובחירת צבע
        downloadBtn.href = originalImg.src;
        downloadBtn.style.display = 'inline-flex';
        bgPickerContainer.style.display = 'block';

        // החזרת הכפתור למצבו המקורי
        removeBgBtn.disabled = false;
        removeBgBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> הסר רקע';
    }, 1500);
});

// ==========================================
// 4. שינוי צבע רקע לתוצאה
// ==========================================
const colorBtns = document.querySelectorAll('.color-btn');
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        const resultContainer = document.querySelector('.result-box');
        resultContainer.style.backgroundColor = color;
    });
});
