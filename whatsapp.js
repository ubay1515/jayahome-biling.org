// LOGIKA WHATSAPP BLAST / NOTIFIKASI JAYAHOME INDOMARET THEME
function kirimNotifikasiWhatsApp(nama, nomor, total, status) {
    const config = JSON.parse(localStorage.getItem('wifinet_enterprise_settings')) || {
        whatsappTemplate: "Halo [nama], tagihan internet JayaHome anda [status]. Total: Rp[total]"
    };

    // Bersihin nomor WA biar format 628xxx
    let nomorBersih = nomor.replace(/[^0-9]/g, '');
    if (nomorBersih.startsWith('08')) {
        nomorBersih = '62' + nomorBersih.substring(1);
    }

    // Format total ke Rupiah
    let totalFormat = parseInt(total || 0).toLocaleString('id-ID');

    // Ganti template
    let pesan = config.whatsappTemplate;
    pesan = pesan.replace("[nama]", nama);
    pesan = pesan.replace("[total]", totalFormat);
    pesan = pesan.replace("[status]", status);

    // Log ke dashboard biar keliatan
    if (typeof logAktivitasDashboard === 'function') {
        let warna = status === 'Lunas'? 'success' : 'danger';
        logAktivitasDashboard(`Kirim WA ke ${nama} - Status: ${status}`, warna);
    }

    const urlWA = `https://api.whatsapp.com/send?phone=${nomorBersih}&text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');

    // Alert style Indomaret
    setTimeout(() => {
        console.log(`%c WA Terkirim ke ${nama}`, 'background: #00529B; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;');
    }, 500);
}

// Fungsi buat blast massal ke semua yg belum bayar
function blastTagihanBelumBayar() {
    if (typeof cacheCustomers === 'undefined') {
        alert("Data pelanggan belum dimuat!");
        return;
    }

    const belumBayar = cacheCustomers.filter(u => u.status === 'Belum Bayar');
    if (belumBayar.length === 0) {
        alert("Semua pelanggan sudah Lunas bang! 🎉");
        return;
    }

    if (confirm(`Kirim WA tagihan ke ${belumBayar.length} pelanggan belum bayar?`)) {
        let counter = 0;
        belumBayar.forEach((user, index) => {
            setTimeout(() => {
                let harga = 0;
                if(user.paket && user.paket.includes('|')) {
                    harga = user.paket.split('|')[0];
                } else {
                    harga = user.paket || 0;
                }
                kirimNotifikasiWhatsApp(user.nama, user.whatsapp, harga, 'Belum Bayar');
                counter++;

                if (counter === belumBayar.length) {
                    setTimeout(() => {
                        alert(`Blast WA selesai! ${counter} pesan terkirim ke pelanggan belum bayar 🔵🔴`);
                    }, 2000);
                }
            }, index * 3000); // delay 3 detik biar nggak keblokir WA
        });
    }
}
