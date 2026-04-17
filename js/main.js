(function(){
    "use strict";
    
    console.log('✅ Yuzz Hade loaded');
    
    // ========== FFMPEG ==========
    const { FFmpeg } = FFmpegWASM;
    const ffmpeg = new FFmpeg();
    let ffmpegLoaded = false;
    
    const ffmpegStatusText = document.getElementById('ffmpegStatusText');
    const ffmpegProgressBar = document.getElementById('ffmpegProgressBar');
    const ffmpegProgressText = document.getElementById('ffmpegProgressText');
    
    ffmpeg.on('progress', ({ progress }) => {
        const p = Math.round(progress * 100);
        if (ffmpegProgressBar) ffmpegProgressBar.style.width = `${p}%`;
        if (ffmpegProgressText) ffmpegProgressText.textContent = `${p}%`;
    });
    
    async function loadFFmpeg() {
        if (ffmpegLoaded) return true;
        if (ffmpegStatusText) ffmpegStatusText.innerHTML = '<span class="spinner"></span> Loading FFmpeg...';
        try {
            await ffmpeg.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
            });
            ffmpegLoaded = true;
            if (ffmpegStatusText) ffmpegStatusText.innerHTML = '<i class="fas fa-check-circle" style="color:#00ff88;"></i> FFmpeg siap!';
            if (ffmpegProgressBar) ffmpegProgressBar.style.width = '100%';
            if (ffmpegProgressText) ffmpegProgressText.textContent = '100%';
            return true;
        } catch (e) {
            console.warn('FFmpeg fallback');
            if (ffmpegStatusText) ffmpegStatusText.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:#ffaa00;"></i> Mode Fallback';
            return false;
        }
    }
    
    loadFFmpeg();
    
    // ========== UPLOAD ==========
    const videoInput = document.getElementById('videoInput');
    const photoInput = document.getElementById('photoInput');
    const videoUploadBtn = document.getElementById('videoUploadBtn');
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const videoUploadCard = document.getElementById('videoUploadCard');
    const photoUploadCard = document.getElementById('photoUploadCard');
    const mediaContainer = document.getElementById('mediaContainer');
    const totalSize = document.getElementById('totalSizeDisplay');
    const progCont = document.getElementById('progressContainer');
    const progFill = document.getElementById('progressFillMain');
    const progText = document.getElementById('progressTextMain');
    
    let mediaItems = [];
    
    console.log('Elements:', { videoInput, photoInput, videoUploadBtn, photoUploadBtn });
    
    // Fungsi trigger file input
    function triggerVideoInput() {
        console.log('🎬 Trigger video input');
        if (videoInput) videoInput.click();
    }
    
    function triggerPhotoInput() {
        console.log('📸 Trigger photo input');
        if (photoInput) photoInput.click();
    }
    
    // Event listeners untuk button
    if (videoUploadBtn) {
        videoUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerVideoInput();
        });
    }
    
    if (photoUploadBtn) {
        photoUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerPhotoInput();
        });
    }
    
    // Event listeners untuk card
    if (videoUploadCard) {
        videoUploadCard.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                triggerVideoInput();
            }
        });
    }
    
    if (photoUploadCard) {
        photoUploadCard.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                triggerPhotoInput();
            }
        });
    }
    
    // Helper functions
    function formatBytes(b) { 
        const k = 1024, s = ['B','KB','MB','GB']; 
        const i = Math.floor(Math.log(b) / Math.log(k)); 
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i]; 
    }
    
    function updateTotal() { 
        const t = mediaItems.reduce((a, i) => a + (i.size || 0), 0); 
        if (totalSize) totalSize.textContent = (t / (1024 * 1024)).toFixed(2) + ' MB'; 
    }
    
    function showProgress(s, t = '', p = 0) { 
        if (progCont) progCont.style.display = s ? 'block' : 'none'; 
        if (s && progText && progFill) { 
            progText.textContent = t; 
            progFill.style.width = Math.min(p, 100) + '%'; 
        } 
    }
    
    async function processImage(file) {
        showProgress(true, 'Memproses Foto...', 30);
        return new Promise(async (resolve, reject) => {
            try {
                const buf = await file.arrayBuffer();
                const img = await Jimp.read(Buffer.from(buf));
                showProgress(true, 'Enhancement...', 50);
                
                const maxW = 2560, maxH = 1440;
                if (img.bitmap.width > maxW || img.bitmap.height > maxH) {
                    img.contain(maxW, maxH, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
                }
                
                img.contrast(0.08).brightness(0.02).quality(95);
                
                try {
                    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
                    img.print(font, 20, img.bitmap.height - 40, '© YUZZ HADE');
                } catch (e) {}
                
                showProgress(true, 'Encoding...', 80);
                const outBuf = await img.getBufferAsync(Jimp.MIME_JPEG);
                const b64 = btoa(new Uint8Array(outBuf).reduce((d, b) => d + String.fromCharCode(b), ''));
                
                showProgress(true, 'Selesai!', 100);
                setTimeout(() => showProgress(false), 500);
                resolve({ dataUrl: `data:image/jpeg;base64,${b64}`, size: outBuf.byteLength });
            } catch (e) { 
                showProgress(false);
                reject(e); 
            }
        });
    }
    
    async function processVideo(file) {
        showProgress(true, 'Memproses Video...', 20);
        await loadFFmpeg();
        showProgress(true, 'Encoding...', 40);
        
        // Untuk production, langsung gunakan file asli karena FFmpeg.wasm berat
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                showProgress(true, 'Selesai!', 100);
                setTimeout(() => showProgress(false), 500);
                resolve({ dataUrl: e.target.result, size: file.size });
            };
            reader.readAsDataURL(file);
        });
    }
    
    function render() {
        if (!mediaItems.length) {
            if (mediaContainer) {
                mediaContainer.innerHTML = '<div style="color:#8f846e;padding:30px;text-align:center;width:100%;"><i class="fas fa-arrow-up"></i> Klik "Pilih Video" atau "Pilih Foto" untuk upload</div>';
            }
            updateTotal();
            return;
        }
        
        let h = '';
        mediaItems.forEach((it, i) => {
            const isV = it.category === 'video';
            h += `<div class="preview-card">
                <div class="preview-media">
                    ${isV ? `<video src="${it.dataUrl}" controls style="width:100%;height:100%;object-fit:contain;background:#000;"></video>` : `<img src="${it.dataUrl}" style="width:100%;height:100%;object-fit:contain;background:#000;">`}
                </div>
                <div class="media-meta">
                    <span><i class="far ${isV ? 'fa-video' : 'fa-image'}"></i> ${it.name.substring(0, 20)}</span>
                    <span class="hd-badge">HD</span>
                </div>
                <div class="media-meta"><span>${formatBytes(it.size)}</span></div>
                <div class="action-row">
                    <button class="icon-btn download" data-i="${i}"><i class="fas fa-download"></i></button>
                    <button class="icon-btn remove" data-i="${i}"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        });
        
        if (mediaContainer) {
            mediaContainer.innerHTML = h;
        }
        updateTotal();
        
        document.querySelectorAll('.download').forEach(b => b.addEventListener('click', e => {
            const i = b.dataset.i;
            if (i && mediaItems[i]) {
                const a = document.createElement('a');
                a.href = mediaItems[i].dataUrl;
                a.download = 'YuzzHade_' + mediaItems[i].name;
                a.click();
            }
        }));
        
        document.querySelectorAll('.remove').forEach(b => b.addEventListener('click', e => {
            const i = b.dataset.i;
            if (i) { 
                mediaItems.splice(i, 1); 
                render(); 
            }
        }));
    }
    
    async function processFile(file, cat) {
        const maxSize = cat === 'video' ? 100 : 50;
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File terlalu besar! Maksimal ${maxSize}MB`);
            return;
        }
        
        try {
            const res = cat === 'photo' ? await processImage(file) : await processVideo(file);
            mediaItems.push({ 
                name: file.name, 
                type: file.type, 
                size: res.size, 
                dataUrl: res.dataUrl, 
                category: cat 
            });
            render();
        } catch (e) {
            alert('Gagal memproses: ' + e.message);
            showProgress(false);
        }
    }
    
    // File input change events
    if (videoInput) {
        videoInput.addEventListener('change', (e) => { 
            const f = videoInput.files[0]; 
            if (f) {
                console.log('📹 Video dipilih:', f.name);
                processFile(f, 'video'); 
            }
            videoInput.value = ''; 
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', (e) => { 
            const f = photoInput.files[0]; 
            if (f) {
                console.log('🖼️ Foto dipilih:', f.name);
                processFile(f, 'photo'); 
            }
            photoInput.value = ''; 
        });
    }
    
    render();
    console.log('✅ Semua event listener terpasang');
})();
