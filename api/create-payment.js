const axios = require('axios');
const moment = require('moment-timezone');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { amount, customer_name, phone, message } = req.body;
    if (!amount || !customer_name) return res.status(400).json({ success: false, message: 'Amount dan nama diperlukan' });

    const apiKey = process.env.d4916f89fbec709eac2f4d69a12d3252ab9db6d265eda2d37dc2e63b4dbb27c9;
    const apiSecret = process.env.9f5407f7b0e4fb908bec20c20d35131b212e893b84c756ae406a6adcdb57ccbf;
    if (!apiKey || !apiSecret) return res.status(500).json({ success: false, message: 'API Key tidak dikonfigurasi' });

    try {
        const orderId = 'YH-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
        const response = await axios.post('https://qris.pw/api/create-payment.php', {
            amount: Number(amount), order_id: orderId, customer_name: customer_name,
            customer_phone: phone || '', callback_url: ''
        }, { headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey, 'X-API-Secret': apiSecret } });

        const data = response.data;
        if (!data.success) return res.status(400).json({ success: false, message: data.message || 'Gagal membuat pembayaran' });

        const now = moment().tz('Asia/Jakarta');
        return res.status(200).json({ success: true, data: {
            transaction_id: data.transaction_id, order_id: data.order_id, amount: data.amount,
            qr_image: data.qris_url, qr_string: data.qris_string, receipt_url: `https://qris.pw/payment/${data.transaction_id}`,
            created_at: now.format('DD/MM/YYYY HH:mm'), expires_at: moment(data.expires_at).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')
        }});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
    }
};
