const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        const { transaction_id } = req.query;
        
        if (!transaction_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Transaction ID diperlukan' 
            });
        }

        const apiKey = process.env.QRISPW_API_KEY;
        const apiSecret = process.env.QRISPW_API_SECRET;

        if (!apiKey || !apiSecret) {
            return res.status(500).json({ 
                success: false, 
                message: 'Konfigurasi server belum lengkap' 
            });
        }

        console.log('🔍 Cek status:', transaction_id);

        const response = await axios.get(
            `https://qris.pw/api/check-payment.php?transaction_id=${transaction_id}`,
            {
                headers: {
                    'X-API-Key': apiKey,
                    'X-API-Secret': apiSecret
                },
                timeout: 10000
            }
        );

        const data = response.data;
        console.log('✅ Status:', data);

        if (!data.success) {
            return res.status(400).json({ 
                success: false, 
                message: data.message || 'Transaksi tidak ditemukan' 
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                transaction_id: data.transaction_id,
                status: data.status,
                is_paid: data.status === 'paid',
                amount: data.amount,
                paid_at: data.paid_at || null
            }
        });
        
    } catch (error) {
        console.error('❌ ERROR check-payment:', error.message);
        
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal cek status: ' + error.message 
        });
    }
};
