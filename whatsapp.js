// ISI DENGAN LOGIKA WHATSAPP BLAST ATAU NOTIFIKASI SEMENTARA
function kirimNotifikasiWhatsApp(nama, nomor, total, status) {
    const config = JSON.parse(localStorage.getItem('wifinet_enterprise_settings')) || { whatsappTemplate: "Halo [nama], tagihan anda [status]." };
    
    let pesan = config.whatsappTemplate;
    pesan = pesan.replace("[nama]", nama);
    pesan = pesan.replace("[total]", total);
    pesan = pesan.replace("[status]", status);

    const urlWA = `https://api.whatsapp.com/send?phone=${nomor}&text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');
}