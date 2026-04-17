const axios = require('axios');
const moment = require('moment-timezone');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        const { amount, customer_name, phone } = req.body;
        
        if (!amount || !customer_name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount dan nama diperlukan' 
            });
        }

        const apiKey = process.env.QRISPW_API_KEY;
        const apiSecret = process.env.QRISPW_API_SECRET;

        if (!apiKey || !apiSecret) {
            console.error('❌ ENV tidak ditemukan');
            return res.status(500).json({ 
                success: false, 
                message: 'Konfigurasi server belum lengkap. Hubungi admin.' 
            });
        }

        const orderId = 'YH-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
        
        console.log('📤 Membuat payment:', { amount, customer_name, orderId });
        
        const response = await axios.post(
            'https://qris.pw/api/create-payment.php',
            {
                amount: Number(amount),
                order_id: orderId,
                customer_name: customer_name,
                customer_phone: phone || '',
                callback_url: ''
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey,
                    'X-API-Secret': apiSecret
                },
                timeout: 10000
            }
        );

        const data = response.data;
        console.log('✅ Response dari QrisPW:', data);

        if (!data.success) {
            return res.status(400).json({ 
                success: false, 
                message: data.message || 'Gagal membuat pembayaran' 
            });
        }

        const now = moment().tz('Asia/Jakarta');

        return res.status(200).json({
            success: true,
            data: {
                transaction_id: data.transaction_id,
                order_id: data.order_id,
                amount: data.amount,
                qr_image: data.qris_url,
                qr_string: data.qris_string,
                created_at: now.format('DD/MM/YYYY HH:mm'),
                expires_at: moment(data.expires_at).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')
            }
        });
        
    } catch (error) {
        console.error('❌ ERROR create-payment:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ 
                success: false, 
                message: 'Timeout: Server QrisPW tidak merespon' 
            });
        }
        
        if (error.response) {
            return res.status(error.response.status).json({ 
                success: false, 
                message: error.response.data?.message || 'Error dari server pembayaran' 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal terhubung ke server: ' + error.message 
        });
    }
};
