// ==========================================
// 4. הסרת רקע (כולל מנוע גיבוי חינמי)
// ==========================================
if (removeBtn) {
    removeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        if (loader) loader.style.display = 'flex';
        if (resultPlaceholder) resultPlaceholder.style.display = 'none';
        if (resultImage) resultImage.style.display = 'none';
        removeBtn.disabled = true;

        // ניסיון 1: Remove.bg API
        try {
            const formData = new FormData();
            formData.append('image_file', selectedFile);
            formData.append('size', 'auto');

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: { 'X-Api-Key': API_KEY },
                body: formData
            });

            if (!response.ok) throw new Error('Primary API Limit Exceeded');

            processedBlob = await response.blob();
            displaySuccessResult(processedBlob);

        } catch (primaryErr) {
            console.warn('Remove.bg נכשל, עובר למנוע AI חלופי...', primaryErr);

            // ניסיון 2: מנוע AI חלופי (HuggingFace RMBG)
            try {
                const formData = new FormData();
                formData.append('data', originalImage.src);

                const response = await fetch('https://briaai-rmbg-1-4.hf.space/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [originalImage.src] })
                });

                const data = await response.json();
                if (data && data.data && data.data[0]) {
                    const imgRes = await fetch(data.data[0]);
                    processedBlob = await imgRes.blob();
                    displaySuccessResult(processedBlob);
                } else {
                    throw new Error('Backup Engine Failed');
                }
            } catch (secondaryErr) {
                alert('נגמרו הקרדיטים החינמיים ב-API. יש לעדכן מפתח Remove.bg חדש.');
                if (resultPlaceholder) resultPlaceholder.style.display = 'block';
            }
        } finally {
            if (loader) loader.style.display = 'none';
            removeBtn.disabled = false;
        }
    });
}

function displaySuccessResult(blob) {
    const url = URL.createObjectURL(blob);
    if (resultImage) {
        resultImage.src = url;
        resultImage.style.display = 'block';
    }
    if (bgPickerSection) bgPickerSection.style.display = 'block';
    if (downloadBtn) {
        downloadBtn.href = url;
        downloadBtn.download = `no-bg-${selectedFile ? selectedFile.name.split('.')[0] : 'image'}.png`;
        downloadBtn.style.display = 'inline-flex';
    }
    if (downloadHdBtn) downloadHdBtn.style.display = 'inline-flex';
    if (copyBtn) copyBtn.style.display = 'inline-flex';
}
