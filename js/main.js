(function(){
    "use strict";
    
    console.log('✅ Yuzz Hade loaded');
    
    // ========== SECURITY (MINIMAL) ==========
    const securityAlert = document.getElementById('securityAlert');
    function showSecurityAlert(m) { 
        if (securityAlert) {
            securityAlert.style.display = 'block'; 
            securityAlert.innerHTML = `<i class="fas fa-shield-alt"></i> ${m}`; 
            setTimeout(() => securityAlert.style.display = 'none', 2000); 
        }
    }
    
    document.addEventListener('contextmenu', e => { 
        if(!['INPUT','TEXTAREA'].includes(e.target.tagName)) { 
            e.preventDefault(); 
            showSecurityAlert('🔒 Klik kanan dinonaktifkan'); 
            return false; 
        }
    });
    
    document.addEventListener('keydown', e => { 
        if(e.key==='F12'||e.keyCode===123||(e.ctrlKey&&e.shiftKey&&e.key==='I')||(e.ctrlKey&&e.key==='U')||(e.ctrlKey&&e.key==='S')) { 
            e.preventDefault(); 
            showSecurityAlert('🔒 Tindakan diblokir'); 
            return false; 
        }
    });
    
    // ========== OVERLAY UPDATE ==========
    const overlay = document.getElementById('updateOverlay');
    const closeBtn = document.getElementById('closeUpdateBtn');
    const continueBtn = document.getElementById('continueBtn');
    const dontShow = document.getElementById('dontShowAgainCheck');
    
    function hideOverlay() { 
        if (overlay) overlay.classList.add('hidden'); 
        if (dontShow && dontShow.checked) {
            sessionStorage.setItem('hideUpdate', 'true');
        }
    }
    
    if (sessionStorage.getItem('hideUpdate') === 'true') {
        if (overlay) overlay.classList.add('hidden');
    }
    
    if (closeBtn) closeBtn.addEventListener('click', hideOverlay);
    if (continueBtn) continueBtn.addEventListener('click', hideOverlay);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) hideOverlay(); });
    
    // ========== DONASI ==========
    const donateOverlay = document.getElementById('donateOverlay');
    const openDonateBtn = document.getElementById('openDonateBtn');
    const closeDonateBtn = document.getElementById('closeDonateBtn');
    const donateFormStep = document.getElementById('donateFormStep');
    const qrCodeStep = document.getElementById('qrCodeStep');
    const generateQRBtn = document.getElementById('generateQRBtn');
    const checkPaymentBtn = document.getElementById('checkPaymentBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const donateAmount = document.getElementById('donateAmount');
    const donorName = document.getElementById('donorName');
    const qrImage = document.getElementById('qrImage');
    const qrAmount = document.getElementById('qrAmount');
    const qrTransactionId = document.getElementById('qrTransactionId');
    const qrExpired = document.getElementById('qrExpired');
    const paymentStatus = document.getElementById('paymentStatus');
    
    let currentTransactionId = null;
    let checkInterval = null;
    
    if (openDonateBtn) {
        openDonateBtn.addEventListener('click', () => {
            if (donateOverlay) donateOverlay.classList.add('active');
            resetDonateForm();
        });
    }
    
    if (closeDonateBtn) {
        closeDonateBtn.addEventListener('click', () => {
            if (donateOverlay) donateOverlay.classList.remove('active');
            stopCheckInterval();
        });
    }
    
    if (donateOverlay) {
        donateOverlay.addEventListener('click', e => { 
            if(e.target === donateOverlay) { 
                donateOverlay.classList.remove('active'); 
                stopCheckInterval(); 
            }
        });
    }
    
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (donateAmount) donateAmount.value = btn.dataset.amount;
        });
    });
    
    function resetDonateForm() {
        if (donateFormStep) donateFormStep.style.display = 'block';
        if (qrCodeStep) qrCodeStep.style.display = 'none';
        stopCheckInterval();
    }
    
    function stopCheckInterval() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    }
    
    async function createPayment(amount, name) {
        try {
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, customer_name: name, phone: '', message: 'Donasi Yuzz Hade' })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Gagal terhubung ke server' };
        }
    }
    
    async function checkPaymentStatusAPI(transactionId) {
        try {
            const response = await fetch(`/api/check-payment?transaction_id=${transactionId}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Gagal cek status' };
        }
    }
    
    function formatRupiah(amount) {
        return 'Rp ' + Number(amount).toLocaleString('id-ID');
    }
    
    if (generateQRBtn) {
        generateQRBtn.addEventListener('click', async () => {
            const amount = parseInt(donateAmount?.value || 10000);
            const name = donorName?.value.trim() || 'Supporter';
            
            if (amount < 5000) { alert('Minimal donasi Rp 5.000'); return; }
            
            generateQRBtn.disabled = true;
            generateQRBtn.innerHTML = '<span class="spinner"></span> Memproses...';
            
            const result = await createPayment(amount, name);
            
            generateQRBtn.disabled = false;
            generateQRBtn.innerHTML = '<i class="fas fa-qrcode"></i> Buat QRIS';
            
            if (!result.success) { alert('Gagal: ' + result.message); return; }
            
            const data = result.data;
            currentTransactionId = data.transaction_id;
            
            if (qrImage) qrImage.src = data.qr_image;
            if (qrAmount) qrAmount.textContent = formatRupiah(data.amount);
            if (qrTransactionId) qrTransactionId.textContent = data.transaction_id;
            if (qrExpired) qrExpired.textContent = data.expires_at;
            
            if (donateFormStep) donateFormStep.style.display = 'none';
            if (qrCodeStep) qrCodeStep.style.display = 'block';
            
            if (paymentStatus) {
                paymentStatus.className = 'payment-status pending';
                paymentStatus.innerHTML = '<i class="fas fa-clock"></i> Menunggu Pembayaran';
            }
            
            stopCheckInterval();
            checkInterval = setInterval(async () => {
                const statusResult = await checkPaymentStatusAPI(currentTransactionId);
                if (statusResult.success && statusResult.data.is_paid) {
                    if (paymentStatus) {
                        paymentStatus.className = 'payment-status paid';
                        paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i> Berhasil! Terima kasih!';
                    }
                    stopCheckInterval();
                }
            }, 5000);
        });
    }
    
    if (checkPaymentBtn) {
        checkPaymentBtn.addEventListener('click', async () => {
            if (!currentTransactionId) return;
            checkPaymentBtn.disabled = true;
            checkPaymentBtn.innerHTML = '<span class="spinner"></span> Mengecek...';
            const result = await checkPaymentStatusAPI(currentTransactionId);
            checkPaymentBtn.disabled = false;
            checkPaymentBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
            if (result.success && result.data.is_paid) {
                if (paymentStatus) {
                    paymentStatus.className = 'payment-status paid';
                    paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i> Berhasil!';
                }
                stopCheckInterval();
                alert('Pembayaran berhasil! Terima kasih!');
            } else { alert('Pembayaran belum diterima.'); }
        });
    }
    
    if (backToFormBtn) backToFormBtn.addEventListener('click', resetDonateForm);
    
    // ========== FFMPEG ==========
    const { FFmpeg } = FFmpegWASM;
    const ffmpeg = new FFmpeg();
    let ffmpegLoaded = false;
    
    const ffmpegStatusText = document.getElementById('ffmpegStatusText');
    const ffmpegProgressBar = document.getElementById('ffmpegProgressBar');
    const ffmpegProgressText = document.getElementById('ffmpegProgressText');
    
    if (ffmpeg) {
        ffmpeg.on('progress', ({ progress }) => {
            const p = Math.round(progress * 100);
            if (ffmpegProgressBar) ffmpegProgressBar.style.width = `${p}%`;
            if (ffmpegProgressText) ffmpegProgressText.textContent = `${p}%`;
        });
    }
    
    async function loadFFmpeg() {
        if (ffmpegLoaded) return true;
        if (ffmpegStatusText) ffmpegStatusText.innerHTML = '<span class="spinner"></span> Loading...';
        try {
            await ffmpeg.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
            });
            ffmpegLoaded = true;
            if (ffmpegStatusText) ffmpegStatusText.innerHTML = '<i class="fas fa-check-circle" style="color:#00ff88;"></i> FFmpeg siap!';
            return true;
        } catch (e) {
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
    
    function triggerVideoInput() { if (videoInput) videoInput.click(); }
    function triggerPhotoInput() { if (photoInput) photoInput.click(); }
    
    if (videoUploadBtn) videoUploadBtn.addEventListener('click', (e) => { e.preventDefault(); triggerVideoInput(); });
    if (photoUploadBtn) photoUploadBtn.addEventListener('click', (e) => { e.preventDefault(); triggerPhotoInput(); });
    if (videoUploadCard) videoUploadCard.addEventListener('click', (e) => { if (!e.target.closest('button')) triggerVideoInput(); });
    if (photoUploadCard) photoUploadCard.addEventListener('click', (e) => { if (!e.target.closest('button')) triggerPhotoInput(); });
    
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
        if (s && progText && progFill) { progText.textContent = t; progFill.style.width = Math.min(p, 100) + '%'; } 
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
            } catch (e) { showProgress(false); reject(e); }
        });
    }
    
    async function processVideo(file) {
        showProgress(true, 'Memproses Video...', 20);
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
            if (mediaContainer) mediaContainer.innerHTML = '<div style="color:#8f846e;padding:30px;"><i class="fas fa-arrow-up"></i> Upload media — Klik Pilih Video atau Pilih Foto</div>';
            updateTotal(); return;
        }
        
        let h = '';
        mediaItems.forEach((it, i) => {
            const isV = it.category === 'video';
            h += `<div class="preview-card"><div class="preview-media">${isV ? `<video src="${it.dataUrl}" controls style="width:100%;height:100%;object-fit:contain;background:#000;"></video>` : `<img src="${it.dataUrl}" style="width:100%;height:100%;object-fit:contain;background:#000;">`}</div>
            <div class="media-meta"><span><i class="far ${isV?'fa-video':'fa-image'}"></i> ${it.name.substring(0,20)}</span><span class="hd-badge">HD</span></div>
            <div class="media-meta"><span>${formatBytes(it.size)}</span></div>
            <div class="action-row"><button class="icon-btn download" data-i="${i}"><i class="fas fa-download"></i></button><button class="icon-btn remove" data-i="${i}"><i class="fas fa-trash"></i></button></div></div>`;
        });
        
        if (mediaContainer) mediaContainer.innerHTML = h;
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
            if (i) { mediaItems.splice(i, 1); render(); }
        }));
    }
    
    async function processFile(file, cat) {
        const maxSize = cat === 'video' ? 100 : 50;
        if (file.size > maxSize * 1024 * 1024) { alert(`File terlalu besar! Maks ${maxSize}MB`); return; }
        try {
            const res = cat === 'photo' ? await processImage(file) : await processVideo(file);
            mediaItems.push({ name: file.name, type: file.type, size: res.size, dataUrl: res.dataUrl, category: cat });
            render();
        } catch (e) { alert('Gagal: ' + e.message); showProgress(false); }
    }
    
    if (videoInput) videoInput.addEventListener('change', e => { const f = videoInput.files[0]; if (f) processFile(f, 'video'); videoInput.value = ''; });
    if (photoInput) photoInput.addEventListener('change', e => { const f = photoInput.files[0]; if (f) processFile(f, 'photo'); photoInput.value = ''; });
    
    render();
    console.log('✅ Siap!');
})();
