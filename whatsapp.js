// Simpan & Ambil Token dari LocalStorage biar Admin tidak ketik terus
function saveWATokenToLocal() {
    const token = document.getElementById('waGatewayToken').value;
    localStorage.setItem('jayahomenet_wa_token', token);
}

function loadWATokenFromLocal() {
    const savedToken = localStorage.getItem('jayahomenet_wa_token') || "";
    if(document.getElementById('waGatewayToken')) {
        document.getElementById('waGatewayToken').value = savedToken;
    }
}

// ENGINE UTAMA KIRIM WA GATEWAY (STRUK DIGITAL)
function kirimNotifikasiWhatsApp(noWA, namaClient, totalBayar, idClient, statusBayar, namaPaketInet) {
    const tokenInput = document.getElementById('waGatewayToken').value || localStorage.getItem('jayahomenet_wa_token');
    
    if (!tokenInput || tokenInput === "") {
        logAktivitasDashboard(`Gagal kirim WA ke ${namaClient}: Token Fonnte Kosong!`, 'danger');
        alert("Peringatan: Token API WhatsApp belum diisi di form kiri!");
        return;
    }

    if (!noWA || noWA === '-' || noWA === '') {
        logAktivitasDashboard(`Nomor WA ${namaClient} tidak valid, pesan dibatalkan.`, 'danger');
        return;
    }
    
    let formattedWA = noWA.trim();
    if (formattedWA.startsWith('0')) {
        formattedWA = '62' + formattedWA.substring(1);
    }
    
    const config = JSON.parse(localStorage.getItem('wifinet_enterprise_settings')) || { brandName: "JAYAHOME NET" };
    const namaServer = config.brandName || "JAYAHOME NET";
    const waktuNota = new Date().toLocaleString('id-ID');
    const nomorNota = "INV-" + Math.floor(1000 + Math.random() * 9000);

    const teksPesan = `*KUITANSI DIGITAL ${namaServer.toUpperCase()}*\n` +
                      `=============================\n` +
                      `Status Pembayaran: *${statusBayar.toUpperCase()}* ✅\n\n` +
                      `Terima kasih, pembayaran Anda telah diterima.\n\n` +
                      `*DETAIL NOTA TRANSAKSI:*\n` +
                      `▪️ No Nota    : ${nomorNota}\n` +
                      `▪️ ID Client  : ${idClient}\n` +
                      `▪️ Pelanggan  : ${namaClient}\n` +
                      `▪️ Layanan    : ${namaPaketInet.toUpperCase()}\n` +
                      `▪️ Total Bayar: Rp ${parseInt(totalBayar).toLocaleString('id-ID')}\n` +
                      `▪️ Waktu Cetak: ${waktuNota}\n\n` +
                      `=============================\n` +
                      `_Masa aktif paket otomatis diperpanjang. Terima kasih telah berlangganan._`;

    fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': tokenInput },
        body: new URLSearchParams({
            'target': formattedWA,
            'message': teksPesan,
            'countryCode': '62'
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            logAktivitasDashboard(`[WA SENT] Berhasil kirim struk ke nomor ${formattedWA} (${namaClient})`, 'success');
        } else {
            logAktivitasDashboard(`[WA FAILED] Gagal mengirim: ${data.reason}`, 'danger');
        }
    })
    .catch(err => {
        console.error("WhatsApp Gateway Error: ", err);
        logAktivitasDashboard(`Koneksi gateway WA gagal terhubung.`, 'danger');
    });
}