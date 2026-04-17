const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { transaction_id } = req.query;
    if (!transaction_id) return res.status(400).json({ success: false, message: 'Transaction ID diperlukan' });

    const apiKey = process.env.d4916f89fbec709eac2f4d69a12d3252ab9db6d265eda2d37dc2e63b4dbb27c9;
    const apiSecret = process.env.9f5407f7b0e4fb908bec20c20d35131b212e893b84c756ae406a6adcdb57ccbf;

    try {
        const response = await axios.get(`https://qris.pw/api/check-payment.php?transaction_id=${transaction_id}`, {
            headers: { 'X-API-Key': apiKey, 'X-API-Secret': apiSecret }
        });
        const data = response.data;
        if (!data.success) return res.status(400).json({ success: false, message: data.message });
        return res.status(200).json({ success: true, data: {
            transaction_id: data.transaction_id, status: data.status, is_paid: data.status === 'paid',
            amount: data.amount, paid_at: data.paid_at || null
        }});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
    }
};
