(function(){
    "use strict";
    
    // ========== ULTIMATE ANTI-GETCODE / ANTI-ZIP / ANTI-DOWNLOADER ==========
    
    // 1. Blokir akses file JS/CSS langsung
    if (window.location.pathname.match(/\.(js|css)$/i)) {
        document.body.innerHTML = '<h1 style="color:red;text-align:center;padding:50px;">Akses Ditolak</h1>';
        throw new Error('Direct access blocked');
    }
    
    // 2. Deteksi dan blokir User-Agent tools downloader
    const blockedUserAgents = [
        'HTTrack', 'wget', 'curl', 'Wget', 'python-requests', 'Go-http-client',
        'WinHttp', 'Jakarta Commons-HttpClient', 'Apache-HttpClient', 'PHP',
        'perl', 'ruby', 'scrapy', 'Mechanize', 'Node-fetch', 'axios',
        'getcode', 'webzip', 'teleport', 'offline explorer', 'webcopier',
        'sitecopy', 'httrack', 'grabber', 'downloader', 'rip', 'leech',
        'crawl', 'spider', 'bot', 'scanner', 'extract'
    ];
    
    const ua = navigator.userAgent.toLowerCase();
    for (let agent of blockedUserAgents) {
        if (ua.includes(agent.toLowerCase())) {
            document.body.innerHTML = '<div style="color:red;text-align:center;padding:50px;"><h1>Akses Ditolak</h1><p>Downloader tools terdeteksi.</p></div>';
            throw new Error('Blocked User-Agent');
        }
    }
    
    // 3. Deteksi ekstensi downloader
    if (navigator.plugins && navigator.plugins.length > 0) {
        const pluginNames = Array.from(navigator.plugins).map(p => p.name.toLowerCase());
        const blockedPlugins = ['video downloader', 'savefrom', 'download', 'idm', 'internet download manager', 'flashget', 'getright'];
        for (let plugin of blockedPlugins) {
            if (pluginNames.some(p => p.includes(plugin))) {
                document.body.innerHTML = '<div style="color:red;text-align:center;padding:50px;"><h1>Akses Ditolak</h1><p>Ekstensi downloader terdeteksi.</p></div>';
                throw new Error('Blocked Plugin');
            }
        }
    }
    
    // 4. Anti-Headless Browser
    if (navigator.webdriver) {
        document.body.innerHTML = '<div style="color:red;text-align:center;padding:50px;"><h1>Akses Ditolak</h1><p>Automated browsing terdeteksi.</p></div>';
        throw new Error('Headless browser');
    }
    
    // 5. Anti-DevTools Detection (Timing Attack)
    let devtoolsOpen = false;
    const threshold = 160;
    const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showSecurityAlert('🔒 Developer tools terdeteksi! Demi keamanan, fitur dibatasi.');
                // Optional: redirect atau blur halaman
                document.body.style.filter = 'blur(5px)';
                setTimeout(() => document.body.style.filter = 'none', 1000);
            }
        } else {
            devtoolsOpen = false;
        }
    };
    setInterval(checkDevTools, 500);
    
    // 6. Blokir Console (Override methods)
    const noop = () => {};
    const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'assert', 'clear', 'count', 'countReset'];
    consoleMethods.forEach(m => { if (console[m]) console[m] = noop; });
    
    // 7. Anti-Debugging (Debugger Loop)
    const antiDebug = () => {
        function debuggerLoop() {
            try {
                (function(){}.constructor('debugger')());
            } catch(e) {}
            setTimeout(debuggerLoop, 100);
        }
        debuggerLoop();
    };
    antiDebug();
    
    // 8. Proteksi Source Code (Obfuscation via eval prevention)
    const originalEval = window.eval;
    window.eval = function() {
        showSecurityAlert('🔒 Eval diblokir');
        return null;
    };
    
    // 9. Blokir Inspect Element Shortcut
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showSecurityAlert('🔒 Developer tools dinonaktifkan');
            return false;
        }
        // Ctrl+Shift+I / Cmd+Option+I
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
            e.preventDefault();
            showSecurityAlert('🔒 Akses developer tools diblokir');
            return false;
        }
        // Ctrl+Shift+J / Cmd+Option+J
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
            e.preventDefault();
            showSecurityAlert('🔒 Console dinonaktifkan');
            return false;
        }
        // Ctrl+U / Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
            e.preventDefault();
            showSecurityAlert('🔒 View source dinonaktifkan');
            return false;
        }
        // Ctrl+S / Cmd+S (Save Page)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
            e.preventDefault();
            showSecurityAlert('🔒 Menyimpan halaman dinonaktifkan');
            return false;
        }
        // Ctrl+A / Cmd+A (Select All)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'A' || e.key === 'a' || e.keyCode === 65)) {
            if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.preventDefault();
                showSecurityAlert('🔒 Seleksi teks dinonaktifkan');
            }
        }
        // Ctrl+P / Cmd+P (Print)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
            e.preventDefault();
            showSecurityAlert('🔒 Print dinonaktifkan');
        }
        // Ctrl+C / Cmd+C (Copy) - optional
        if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
            if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.preventDefault();
                showSecurityAlert('🔒 Copy dinonaktifkan');
            }
        }
    });
    
    // 10. Disable Right Click
    document.addEventListener('contextmenu', (e) => {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault();
            showSecurityAlert('🔒 Klik kanan dinonaktifkan');
            return false;
        }
    });
    
    // 11. Disable Text Selection
    document.addEventListener('selectstart', (e) => {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault();
        }
    });
    
    // 12. Disable Drag & Drop Save
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
    
    // 13. Proteksi Link dan Media
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, video, img');
        if (target && (target.tagName === 'VIDEO' || target.tagName === 'IMG')) {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
                e.preventDefault();
                showSecurityAlert('🔒 Tindakan tidak diizinkan');
            }
        }
    }, true);
    
    // 14. Anti-Iframe Embedding
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
    
    // 15. Disable Service Worker (mencegah caching offline)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(reg => reg.unregister());
        });
    }
    
    // 16. Clear Console on Load
    setTimeout(() => { console.clear = noop; }, 100);
    
    // ========== SECURITY ALERT ==========
    const securityAlert = document.getElementById('securityAlert');
    function showSecurityAlert(m) { 
        securityAlert.style.display = 'block'; 
        securityAlert.innerHTML = `<i class="fas fa-shield-alt"></i> ${m}`; 
        setTimeout(() => securityAlert.style.display = 'none', 2000); 
    }
    
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
    
    openDonateBtn.addEventListener('click', () => {
        donateOverlay.classList.add('active');
        resetDonateForm();
    });
    
    closeDonateBtn.addEventListener('click', () => {
        donateOverlay.classList.remove('active');
        stopCheckInterval();
    });
    
    donateOverlay.addEventListener('click', e => { if(e.target === donateOverlay) { donateOverlay.classList.remove('active'); stopCheckInterval(); }});
    
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            donateAmount.value = btn.dataset.amount;
        });
    });
    
    function resetDonateForm() {
        donateFormStep.style.display = 'block';
        qrCodeStep.style.display = 'none';
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
    
    generateQRBtn.addEventListener('click', async () => {
        const amount = parseInt(donateAmount.value);
        const name = donorName.value.trim() || 'Supporter';
        
        if (amount < 5000) {
            alert('Minimal donasi Rp 5.000');
            return;
        }
        
        generateQRBtn.disabled = true;
        generateQRBtn.innerHTML = '<span class="spinner"></span> Memproses...';
        
        const result = await createPayment(amount, name);
        
        generateQRBtn.disabled = false;
        generateQRBtn.innerHTML = '<i class="fas fa-qrcode"></i> Buat QRIS';
        
        if (!result.success) {
            alert('Gagal membuat pembayaran: ' + result.message);
            return;
        }
        
        const data = result.data;
        currentTransactionId = data.transaction_id;
        
        qrImage.src = data.qr_image;
        qrAmount.textContent = formatRupiah(data.amount);
        qrTransactionId.textContent = data.transaction_id;
        qrExpired.textContent = data.expires_at;
        
        donateFormStep.style.display = 'none';
        qrCodeStep.style.display = 'block';
        
        paymentStatus.className = 'payment-status pending';
        paymentStatus.innerHTML = '<i class="fas fa-clock"></i> Menunggu Pembayaran';
        
        stopCheckInterval();
        checkInterval = setInterval(async () => {
            const statusResult = await checkPaymentStatusAPI(currentTransactionId);
            if (statusResult.success && statusResult.data.is_paid) {
                paymentStatus.className = 'payment-status paid';
                paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i> Pembayaran Berhasil! Terima kasih!';
                stopCheckInterval();
            }
        }, 5000);
    });
    
    checkPaymentBtn.addEventListener('click', async () => {
        if (!currentTransactionId) return;
        checkPaymentBtn.disabled = true;
        checkPaymentBtn.innerHTML = '<span class="spinner"></span> Mengecek...';
        const result = await checkPaymentStatusAPI(currentTransactionId);
        checkPaymentBtn.disabled = false;
        checkPaymentBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        if (result.success && result.data.is_paid) {
            paymentStatus.className = 'payment-status paid';
            paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i> Pembayaran Berhasil! Terima kasih!';
            stopCheckInterval();
            alert('Pembayaran berhasil! Terima kasih atas donasi Anda!');
        } else {
            alert('Pembayaran belum diterima. Silakan coba lagi nanti.');
        }
    });
    
    backToFormBtn.addEventListener('click', resetDonateForm);
    
    // ========== OVERLAY UPDATE ==========
    const overlay = document.getElementById('updateOverlay');
    const closeBtn = document.getElementById('closeUpdateBtn');
    const continueBtn = document.getElementById('continueBtn');
    const dontShow = document.getElementById('dontShowAgainCheck');
    if(sessionStorage.getItem('hideUpdate')==='true') overlay.classList.add('hidden');
    function hideOverlay(){ overlay.classList.add('hidden'); if(dontShow.checked) sessionStorage.setItem('hideUpdate','true'); }
    closeBtn.addEventListener('click', hideOverlay);
    continueBtn.addEventListener('click', hideOverlay);
    overlay.addEventListener('click', e => { if(e.target===overlay) hideOverlay(); });
    
    // ========== FFMPEG ==========
    const { FFmpeg } = FFmpegWASM;
    const ffmpeg = new FFmpeg();
    let ffmpegLoaded = false;
    let ffmpegLoadAttempted = false;
    
    const ffmpegStatusText = document.getElementById('ffmpegStatusText');
    const ffmpegProgressBar = document.getElementById('ffmpegProgressBar');
    const ffmpegProgressText = document.getElementById('ffmpegProgressText');
    
    ffmpeg.on('progress', ({ progress }) => {
        const p = Math.round(progress * 100);
        ffmpegProgressBar.style.width = `${p}%`;
        ffmpegProgressText.textContent = `${p}%`;
    });
    
    async function loadFFmpeg() {
        if (ffmpegLoaded) return true;
        if (ffmpegLoadAttempted) return false;
        
        ffmpegLoadAttempted = true;
        ffmpegStatusText.innerHTML = '<span class="spinner"></span> Loading FFmpeg...';
        
        try {
            await ffmpeg.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
            });
            ffmpegLoaded = true;
            ffmpegStatusText.innerHTML = '<i class="fas fa-check-circle" style="color:#00ff88;"></i> FFmpeg siap!';
            ffmpegProgressBar.style.width = '100%';
            ffmpegProgressText.textContent = '100%';
            return true;
        } catch (e) {
            ffmpegStatusText.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:#ffaa00;"></i> Mode Fallback';
            ffmpegProgressText.textContent = 'Fallback';
            return false;
        }
    }
    
    loadFFmpeg();
    
    // ========== DOM UPLOAD ==========
    const videoInput = document.getElementById('videoInput');
    const photoInput = document.getElementById('photoInput');
    const mediaContainer = document.getElementById('mediaContainer');
    const totalSize = document.getElementById('totalSizeDisplay');
    const progCont = document.getElementById('progressContainer');
    const progFill = document.getElementById('progressFillMain');
    const progText = document.getElementById('progressTextMain');
    
    let mediaItems = [];
    
    function formatBytes(b) { 
        const k = 1024, s = ['B','KB','MB','GB']; 
        const i = Math.floor(Math.log(b) / Math.log(k)); 
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i]; 
    }
    
    function updateTotal() { 
        const t = mediaItems.reduce((a, i) => a + (i.size || 0), 0); 
        totalSize.textContent = (t / (1024 * 1024)).toFixed(2) + ' MB'; 
    }
    
    function showProgress(s, t = '', p = 0) { 
        progCont.style.display = s ? 'block' : 'none'; 
        if (s) { progText.textContent = t; progFill.style.width = Math.min(p, 100) + '%'; } 
    }
    
    async function processImage(file) {
        showProgress(true, 'Memproses SUPER HD...', 30);
        return new Promise(async (resolve, reject) => {
            try {
                const buf = await file.arrayBuffer();
                const img = await Jimp.read(Buffer.from(buf));
                showProgress(true, 'Enhancement...', 50);
                
                const maxW = 2560, maxH = 1440;
                if (img.bitmap.width > maxW || img.bitmap.height > maxH) {
                    img.contain(maxW, maxH, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
                }
                
                img.contrast(0.08).brightness(0.02).quality(98);
                img.convolute([[0, -0.2, 0], [-0.2, 1.8, -0.2], [0, -0.2, 0]]);
                
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
            } catch (e) { reject(e); }
        });
    }
    
    async function processVideo(file) {
        showProgress(true, 'Memproses Video...', 20);
        
        const ffmpegReady = await loadFFmpeg();
        
        if (!ffmpegReady) {
            showProgress(true, 'Mode Fallback (Video Asli)...', 50);
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
        
        showProgress(true, 'Encoding SUPER HD...', 40);
        const inName = 'i' + Date.now() + '.' + file.name.split('.').pop();
        const outName = 'o' + Date.now() + '.mp4';
        
        try {
            const ab = await file.arrayBuffer();
            await ffmpeg.writeFile(inName, new Uint8Array(ab));
            await ffmpeg.exec([
                '-i', inName,
                '-c:v', 'libx264',
                '-crf', '18',
                '-preset', 'medium',
                '-vf', "unsharp=3:3:0.8,eq=contrast=1.05:brightness=0.01,drawtext=text='© YUZZ HADE':fontcolor=white@0.4:fontsize=24:x=15:y=15",
                '-c:a', 'aac',
                '-b:a', '192k',
                '-movflags', '+faststart',
                outName
            ]);
            
            const data = await ffmpeg.readFile(outName);
            await ffmpeg.deleteFile(inName);
            await ffmpeg.deleteFile(outName);
            
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = await new Promise(r => { 
                const fr = new FileReader(); 
                fr.onload = e => r(e.target.result); 
                fr.readAsDataURL(blob); 
            });
            
            showProgress(true, 'Selesai!', 100);
            setTimeout(() => showProgress(false), 500);
            return { dataUrl: url, size: data.byteLength };
        } catch (e) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({ dataUrl: ev.target.result, size: file.size });
                reader.readAsDataURL(file);
            });
        }
    }
    
    function render() {
        if (!mediaItems.length) {
            mediaContainer.innerHTML = '<div style="color:#8f846e;padding:30px;"><i class="fas fa-arrow-up"></i> Upload media</div>';
            updateTotal();
            return;
        }
        
        let h = '';
        mediaItems.forEach((it, i) => {
            const isV = it.category === 'video';
            h += `<div class="preview-card">
                <div class="preview-media">
                    ${isV ? `<video src="${it.dataUrl}" controls controlsList="nodownload" oncontextmenu="return false;" style="width:100%;height:100%;object-fit:contain;background:#000;"></video>` : `<img src="${it.dataUrl}" style="width:100%;height:100%;object-fit:contain;background:#000;" oncontextmenu="return false;" draggable="false">`}
                </div>
                <div class="media-meta">
                    <span><i class="far ${isV ? 'fa-video' : 'fa-image'}"></i> ${it.name}</span>
                    <span class="hd-badge">SUPER HD</span>
                </div>
                <div class="media-meta"><span>${formatBytes(it.size)}</span></div>
                <div class="action-row">
                    <button class="icon-btn download" data-i="${i}"><i class="fas fa-download"></i></button>
                    <button class="icon-btn remove" data-i="${i}"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        });
        
        mediaContainer.innerHTML = h;
        updateTotal();
        
        document.querySelectorAll('.download').forEach(b => b.addEventListener('click', e => {
            const i = b.dataset.i;
            if (i) {
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
        if (file.size > (cat === 'video' ? 100 : 50) * 1024 * 1024) {
            alert('File terlalu besar!');
            return;
        }
        
        try {
            const res = cat === 'photo' ? await processImage(file) : await processVideo(file);
            mediaItems.push({ name: file.name, type: file.type, size: res.size, dataUrl: res.dataUrl, category: cat });
            render();
        } catch (e) {
            alert('Gagal: ' + e.message);
            showProgress(false);
        }
    }
    
    videoInput.addEventListener('change', e => { 
        const f = videoInput.files[0]; 
        if (f) processFile(f, 'video'); 
        videoInput.value = ''; 
    });
    
    photoInput.addEventListener('change', e => { 
        const f = photoInput.files[0]; 
        if (f) processFile(f, 'photo'); 
        photoInput.value = ''; 
    });
    
    document.getElementById('videoUploadBtn').addEventListener('click', () => videoInput.click());
    document.getElementById('photoUploadBtn').addEventListener('click', () => photoInput.click());
    
    render();
})();