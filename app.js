// KONFIGURASI BASIS DATA FIREBASE FIRESTORE
const firebaseConfig = {
    apiKey: "AIzaSyB5iWDJLLz81QUDDLIdD4ApPjhoSrLKeP4",
    authDomain: "billingorg-internet.firebaseapp.com",
    projectId: "billingorg-internet",
    storageBucket: "billingorg-internet.firebasestorage.app",
    messagingSenderId: "519438699306",
    appId: "1:519438699306:web:4b5b3d3801d50d98e96c53"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function autoScrollKeAtas() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pasangTemaAwal() {
    const body = document.getElementById('appBody');
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    if (!body) return;
    let warnaTeksGrafik = '#475569';

    body.classList.remove('bg-slate-900', 'text-slate-100');
    body.classList.add('bg-[#f5f7fa]', 'text-gray-800');
    document.querySelectorAll('.id-title-text,.class-title-form,.class-value-card').forEach(el => el.style.color = '#1e293b');
    document.querySelectorAll('.id-subtitle-text,.class-label-card,.class-title-box,.class-label-input,.class-table-head').forEach(el => el.style.color = '#475569');
    if (icon) { icon.className = 'fa-solid fa-sun text-[#00529B]'; }
    if (text) { text.innerText = 'Indomaret'; }
    if (window.trafficDashboardChart && window.trafficDashboardChart.options.plugins.legend.labels) {
        window.trafficDashboardChart.options.plugins.legend.labels.color = warnaTeksGrafik;
        window.trafficDashboardChart.update();
    }
}

function toggleTheme() { alert("Tema Indomaret aktif terus bang 😄"); }
document.addEventListener("DOMContentLoaded", () => { pasangTemaAwal(); });

let cacheCustomers = [], cacheExpenses = [], cacheTickets = [], cachePakets = [];
const defaultSettings = { brandName: "JAYAHOME Net", whatsappTemplate: "Halo [nama], tagihan internet JayaHome anda [status]. Total: Rp[total]" };

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const payTanggal = document.getElementById('payTanggal');
    if (payTanggal) payTanggal.value = today;
    const custTanggal = document.getElementById('custTanggal');
    if (custTanggal) custTanggal.value = today;
}

function loadAppConfiguration() {
    const config = JSON.parse(localStorage.getItem('wifinet_enterprise_settings')) || defaultSettings;
    const brandLabel = document.getElementById('brandLabel');
    if (brandLabel) {
        brandLabel.innerHTML = `${config.brandName.split(' ')[0]} <span class="text-[#E21E26]">${config.brandName.split(' ').slice(1).join(' ') || 'Net'}</span>`;
    }
    const setBrand = document.getElementById('setBrand');
    if (setBrand) setBrand.value = config.brandName;
    const setTemplate = document.getElementById('setTemplate');
    if (setTemplate) setTemplate.value = config.whatsappTemplate;
    setDefaultDate();
}

function saveSettings(e) {
    e.preventDefault();
    localStorage.setItem('wifinet_enterprise_settings', JSON.stringify({
        brandName: document.getElementById('setBrand').value,
        whatsappTemplate: document.getElementById('setTemplate').value
    }));
    loadAppConfiguration();
    alert("Pengaturan Tersimpan!");
    autoScrollKeAtas();
}

auth.onAuthStateChanged((user) => {
    const authScreen = document.getElementById('authScreen');
    if(user) {
        if (authScreen) authScreen.classList.add('hidden');
        const displayEmail = document.getElementById('userDisplayEmail');
        if (displayEmail) displayEmail.innerText = user.email;
        loadAppConfiguration();
        initializeEnterpriseListeners();
        gantiMenu('dashboard');
    } else {
        if (authScreen) authScreen.classList.remove('hidden');
        const views = ['dashboardView', 'pelangganView', 'pembayaranView', 'riwayatView', 'pengeluaranView', 'komplainView', 'paketView', 'settingView', 'backupView'];
        views.forEach(v => { const el = document.getElementById(v); if (el) el.style.display = 'none'; });
    }
});

async function handleAuth(e) {
    e.preventDefault();
    try { await auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value); }
    catch(err) { alert(err.message); }
}

function handleLogout() { auth.signOut(); }

function gantiMenu(target) {
    const views = ['dashboardView', 'pelangganView', 'pembayaranView', 'riwayatView', 'pengeluaranView', 'komplainView', 'paketView', 'settingView', 'backupView'];
    views.forEach(v => { const el = document.getElementById(v); if (el) el.style.display = 'none'; });
    const targetEl = document.getElementById(target + 'View');
    if (targetEl) { targetEl.style.display = ['pelanggan', 'pembayaran', 'pengeluaran', 'komplain', 'paket', 'backup'].includes(target)? 'grid' : 'block'; }
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) { pageTitle.innerText = target === 'pelanggan'? 'DATA PELANGGAN' : target.toUpperCase(); }
    const panelMetrikAtas = document.getElementById('panelMetrikAtas');
    if (panelMetrikAtas) {
        if (target === 'dashboard') panelMetrikAtas.classList.remove('hidden');
        else panelMetrikAtas.classList.add('hidden');
    }
    document.querySelectorAll('[id^="menu-"]').forEach(btn => {
        btn.classList.remove('bg-indigo-600/20', 'text-indigo-400', 'font-semibold');
        btn.classList.add('text-gray-600');
    });
    const activeBtn = document.getElementById('menu-' + target);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-600');
        activeBtn.classList.add('bg-[#00529B]/10', 'text-[#00529B]', 'font-semibold');
    }
    pasangTemaAwal();
    autoScrollKeAtas();
}

function logAktivitasDashboard(pesan, tipe = 'info') {
    const container = document.getElementById('dashboardLogContainer');
    if (!container) return;
    const waktu = new Date().toLocaleTimeString('id-ID', { hour12: false });
    let warnaTipe = 'text-cyan-600';
    if (tipe === 'success') warnaTipe = 'text-green-600';
    if (tipe === 'danger') warnaTipe = 'text-[#E21E26]';
    container.innerHTML = `<div class="class-value-card"><span class="text-gray-500">[${waktu}]</span> <span class="${warnaTipe}">[${tipe.toUpperCase()}]</span> ${pesan}</div>` + container.innerHTML;
    if(container.children.length > 25) container.removeChild(container.lastChild);
}

const financeChart = new Chart(document.getElementById('financeChart').getContext('2d'), {
    type: 'bar',
    data: { labels: ['Cash', 'Transfer', 'Pengeluaran', 'Sisa Kas'], datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['rgba(34, 197, 94, 0.2)', 'rgba(0, 82, 155, 0.2)', 'rgba(226, 30, 38, 0.2)', 'rgba(6, 182, 212, 0.2)'], borderColor: ['rgb(34, 197, 94)', 'rgb(0, 82, 155)', 'rgb(226, 30, 38)', 'rgb(6, 182, 212)'], borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }
});

const ctxTrafficDb = document.getElementById('trafficDashboardChart').getContext('2d');
const trafficDashboardChart = new Chart(ctxTrafficDb, {
    type: 'doughnut',
    data: { labels: ['Lunas', 'Belum Bayar'], datasets: [{ data: [0, 0], backgroundColor: ['rgba(0, 82, 155, 0.75)', 'rgba(226, 30, 38, 0.75)'], borderColor: ['#00529B', '#E21E26'], borderWidth: 2, hoverOffset: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#475569', font: { size: 11 } }, cutout: '70%' }
});

function initializeEnterpriseListeners() {
    db.collection("packages").onSnapshot((snap) => {
        cachePakets = []; let opts = '';
        snap.forEach(doc => { cachePakets.push({id: doc.id,...doc.data()}); opts += `<option value="${doc.data().harga}|${doc.data().nama}">${doc.data().nama}</option>`; });
        const custPaket = document.getElementById('custPaket');
        if (custPaket) custPaket.innerHTML = opts || '<option value="100000|Default">Default 10Mbps</option>';
        renderPaketTable();
        db.collection("customers").orderBy("nama").onSnapshot((snapshot) => {
            cacheCustomers = []; snapshot.forEach(doc => cacheCustomers.push({id: doc.id,...doc.data()}));
            buildPaymentDropdown();
            compileBusinessData();
        });
    });
    db.collection("expenses").orderBy("waktu","desc").onSnapshot((snap) => { cacheExpenses = []; snap.forEach(doc => cacheExpenses.push({id: doc.id,...doc.data()})); renderExpenseTable(); compileBusinessData(); });
    db.collection("tickets").onSnapshot((snap) => { cacheTickets = []; snap.forEach(doc => cacheTickets.push({id: doc.id,...doc.data()})); renderTicketTable(); });
}

function buildPaymentDropdown() {
    const selectEl = document.getElementById('payCustomerSelect');
    if(!selectEl) return;
    let options = '<option value="">-- Pilih Pelanggan --</option>';
    cacheCustomers.forEach(u => {
        options += `<option value="${u.id}">${u.nama} (${u.customerUID || ''}) - [${u.status || 'Belum Bayar'}]</option>`;
    });
    selectEl.innerHTML = options;
    updatePaymentFormDetails();
}

function updatePaymentFormDetails() {
    const selectEl = document.getElementById('payCustomerSelect');
    const tarifEl = document.getElementById('payFormTarif');
    if(!selectEl ||!tarifEl) return;
    const selectedId = selectEl.value;
    if(!selectedId) { tarifEl.innerText = "Rp 0"; return; }
    const user = cacheCustomers.find(u => u.id === selectedId);
    if(user) {
        let harga = 0;
        if(user.paket && user.paket.includes('|')) { harga = user.paket.split('|')[0]; } else { harga = user.paket || 0; }
        tarifEl.innerText = "Rp " + parseInt(harga).toLocaleString('id-ID');
    }
}

function compileBusinessData() {
    let omsetCash = 0, omsetTransfer = 0, pengeluaranTotal = 0;
    let totalLunas = 0, totalBelumBayar = 0;
    cacheExpenses.forEach(e => pengeluaranTotal += parseInt(e.jumlah || 0));
    const crmTable = document.getElementById('crmTable');
    const kasirTable = document.getElementById('kasirTable');
    const riwayatTable = document.getElementById('riwayatTable');
    if (crmTable) crmTable.innerHTML = '';
    if (kasirTable) kasirTable.innerHTML = '';
    if (riwayatTable) riwayatTable.innerHTML = '';

    cacheCustomers.forEach(user => {
        let harga = 0, namaPaket = "Custom";
        if(user.paket && user.paket.includes('|')) { [harga, namaPaket] = user.paket.split('|'); } else { harga = user.paket || 0; }
        const nominal = parseInt(harga);
        if(user.status === 'Lunas') {
            totalLunas += 1;
            if(user.metodeBayar === 'TRANSFER BANK') { omsetTransfer += nominal; } else { omsetCash += nominal; }
        } else { totalBelumBayar += 1; }
        let tglTampil = user.updatedAt || '-';
        if(user.tanggalPilihan) { const t = user.tanggalPilihan.split('-'); if(t.length === 3) tglTampil = `${t[2]}/${t[1]}/${t[0]}`; }

        if (crmTable) {
            crmTable.innerHTML += `
                <tr class="border-b border-gray-200 crm-row">
                    <td class="p-3">
                        <div class="text-xs text-[#00529B] font-mono font-bold">${user.customerUID || 'BELUM GENERATE'}</div>
                        <div class="font-bold search-name class-value-card">${user.nama || 'Tanpa Nama'}</div>
                        <div class="text-xs class-label-card">${user.alamat || 'Alamat Kosong'}</div>
                        <div class="text-xs class-label-card font-semibold">HP: ${user.whatsapp || '-'}</div>
                    </td>
                    <td class="p-3"><div class="class-value-card font-medium">${namaPaket}</div><div class="text-[#00529B] font-bold">Rp ${nominal.toLocaleString('id-ID')}</div></td>
                    <td class="p-3 text-center whitespace-nowrap space-x-2">
                        <button onclick="editCustomer('${user.id}')" class="bg-blue-100 text-[#00529B] px-2 py-1 rounded hover:bg-blue-200 cursor-pointer text-xs font-bold"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button onclick="deleteCustomer('${user.id}', '${user.nama}')" class="bg-red-100 text-[#E21E26] px-2 py-1 rounded hover:bg-red-200 cursor-pointer text-xs font-bold"><i class="fa-solid fa-trash"></i> Hapus</button>
                    </td>
                </tr>`;
        }

        if (kasirTable) {
            kasirTable.innerHTML += `
                <tr class="border-b border-gray-200 kasir-row">
                    <td class="p-3">
                        <div class="font-bold class-value-card search-pembayaran-name">${user.nama}</div>
                        <div class="text-xs class-label-card font-mono">${user.customerUID || '-'} | Tgl: ${tglTampil}</div>
                    </td>
                    <td class="p-3"><span class="text-[#00529B] font-bold">Rp ${nominal.toLocaleString('id-ID')}</span><br><span class="text-[9px] text-gray-500">${user.metodeBayar || 'CASH'}</span></td>
                    <td class="p-3"><span class="${user.status === 'Lunas'? 'text-green-600 bg-green-100' : 'text-[#E21E26] bg-red-100'} text-xs font-bold px-2 py-0.5 rounded-full">${user.status || 'Belum Bayar'}</span></td>
                    <td class="p-3 text-center whitespace-nowrap space-x-1">
                        <button onclick="togglePayment('${user.id}', '${user.status}', '${user.nama}')" class="bg-transparent text-xs font-bold py-1 px-1.5 rounded text-amber-600 border-amber-500/40 hover:bg-amber-50 cursor-pointer">Ubah Status</button>
                        <button onclick="cetakStruk('${user.id}')" class="bg-[#00529B] text-white text-xs font-bold py-1 px-2 rounded hover:bg-[#004a8a] cursor-pointer"><i class="fa-solid fa-print"></i> Struk</button>
                    </td>
                </tr>`;
        }

        if (riwayatTable) {
            riwayatTable.innerHTML += `<tr class="border-b border-gray-200"><td class="p-3 font-bold class-value-card">${user.nama}</td><td class="p-3 class-value-card font-semibold text-[#00529B]">Rp ${nominal.toLocaleString('id-ID')}</td><td class="p-3 text-xs class-label-card">${tglTampil}</td><td class="p-3 font-bold class-value-card">${user.status}</td></tr>`;
        }
    });

    if (document.getElementById('statTotal')) document.getElementById('statTotal').innerText = cacheCustomers.length + " User";
    if (document.getElementById('statOmsetCash')) document.getElementById('statOmsetCash').innerText = "Rp " + omsetCash.toLocaleString('id-ID');
    if (document.getElementById('statOmsetTransfer')) document.getElementById('statOmsetTransfer').innerText = "Rp " + omsetTransfer.toLocaleString('id-ID');
    const totalBersih = (omsetCash + omsetTransfer) - pengeluaranTotal;
    if (document.getElementById('statLabaBersih')) document.getElementById('statLabaBersih').innerText = "Rp " + totalBersih.toLocaleString('id-ID');
    if (document.getElementById('statKomplainCount')) document.getElementById('statKomplainCount').innerText = cacheTickets.length + " Tiket";
    financeChart.data.datasets[0].data = [omsetCash, omsetTransfer, pengeluaranTotal, totalBersih]; financeChart.update();
    trafficDashboardChart.data.datasets[0].data = [totalLunas, totalBelumBayar]; trafficDashboardChart.update();
    pasangTemaAwal();
}

function filterHarianKasir() {
    const tanggalDicari = document.getElementById('filterTanggalKasir').value;
    const infoBox = document.getElementById('infoFilterHarian');
    const txtOrang = document.getElementById('hitungOrangHarian');
    const txtUang = document.getElementById('hitungUangHarian');
    if (!tanggalDicari) {
        if (infoBox) infoBox.classList.add('hidden');
        document.querySelectorAll('.kasir-row').forEach(row => row.style.display = '');
        return;
    }
    let totalOrang = 0;
    let totalUang = 0;
    cacheCustomers.forEach((user, index) => {
        const rows = document.querySelectorAll('.kasir-row');
        if (!rows[index]) return;
        const tglUser = user.tanggalPilihan || "";
        const statusUser = user.status || "Belum Bayar";
        if (tglUser === tanggalDicari && statusUser === 'Lunas') {
            rows[index].style.display = '';
            totalOrang += 1;
            let harga = 0;
            if (user.paket && user.paket.includes('|')) harga = user.paket.split('|')[0]; else harga = user.paket || 0;
            totalUang += parseInt(harga);
        } else {
            rows[index].style.display = 'none';
        }
    });
    if (infoBox) infoBox.classList.remove('hidden');
    if (txtOrang) txtOrang.innerText = totalOrang + " Orang";
    if (txtUang) txtUang.innerText = "Rp " + totalUang.toLocaleString('id-ID');
    logAktivitasDashboard(`Filter harian diterapkan untuk tanggal ${tanggalDicari}. Ditemukan ${totalOrang} transaksi lunas.`, 'info');
}

function liveSearchPembayaran() {
    const q = document.getElementById('searchBarPembayaran').value.toLowerCase();
    document.querySelectorAll('.kasir-row').forEach(r => {
        r.style.display = r.querySelector('.search-pembayaran-name').innerText.toLowerCase().includes(q)? '' : 'none';
    });
}

function exportData(statusFilter, tipeFormat) {
    const dataTerfilter = cacheCustomers.filter(user => (user.status || 'Belum Bayar') === statusFilter);
    if (dataTerfilter.length === 0) {
        alert(`Tidak ditemukan data pelanggan dengan status pembayaran: ${statusFilter}`);
        return;
    }
    const barisData = dataTerfilter.map((user, index) => {
        let harga = 0, namaPaket = "Custom";
        if(user.paket && user.paket.includes('|')) { [harga, namaPaket] = user.paket.split('|'); } else { harga = user.paket || 0; }
        return {
            "No": index + 1,
            "ID Pelanggan": user.customerUID || "-",
            "Nama Pelanggan": user.nama || "-",
            "No WhatsApp": user.whatsapp || "-",
            "Alamat": user.alamat || "-",
            "Paket Internet": namaPaket,
            "Tarif Bulanan": parseInt(harga),
            "Metode": user.metodeBayar || "-",
            "Waktu Update": user.updatedAt || user.tanggalPilihan || "-"
        };
    });
    const namaFile = `Laporan_Pelanggan_${statusFilter.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    if (tipeFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(barisData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `${namaFile}.xlsx`);
        logAktivitasDashboard(`Export Excel data (${statusFilter}) sukses.`, 'success');
    } else if (tipeFormat === 'pdf') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFont("helvetica", "bold"); doc.setFontSize(15);
        doc.text("LAPORAN DATA KASIR INTERNET JAYAHOME", 14, 15);
        const headers = [["No", "ID Client", "Nama Pelanggan", "WhatsApp", "Alamat Rumah", "Paket Speed", "Biaya", "Metode", "Tanggal Transaksi"]];
        const bodyTables = barisData.map(item => [
            item["No"], item["ID Pelanggan"], item["Nama Pelanggan"], item["No WhatsApp"],
            item["Alamat"], item["Paket Internet"], `Rp ${item["Tarif Bulanan"].toLocaleString('id-ID')}`,
            item["Metode"], item["Waktu Update"]
        ]);
        doc.autoTable({
            head: headers, body: bodyTables, startY: 25, theme: 'grid',
            headStyles: { fillColor: statusFilter === 'Lunas'? [0, 82, 155] : [226, 30, 38] }
        });
        doc.save(`${namaFile}.pdf`);
        logAktivitasDashboard(`Unduh PDF data (${statusFilter}) sukses.`, 'success');
    }
}

function generateAutoID() {
    const sekarang = new Date();
    const formatPeriode = `${sekarang.getFullYear()}${String(sekarang.getMonth() + 1).padStart(2, '0')}`;
    const hitungUrutan = cacheCustomers.filter(u => u.customerUID && u.customerUID.includes(`-${formatPeriode}-`)).length;
    return `SKW-${formatPeriode}-${String(hitungUrutan + 1).padStart(3, '0')}`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('customerId').value;
    const tglSkrg = new Date().toLocaleDateString('id-ID') + " + new Date().toLocaleTimeString('id-ID');
    const namaClient = document.getElementById('custName').value;
    const payload = {
        nama: namaClient, whatsapp: document.getElementById('custWA').value, alamat: document.getElementById('custAlamat').value,
        paket: document.getElementById('custPaket').value, updatedAt: tglSkrg
    };
    if (id === "") {
        payload.status = 'Belum Bayar';
        payload.metodeBayar = 'CASH / TUNAI';
        payload.customerUID = generateAutoID();
        payload.tanggalPilihan = new Date().toISOString().split('T')[0];
        db.collection("customers").add(payload).then(() => {
            logAktivitasDashboard(`Registrasi client baru sukses: ${namaClient}`, 'success');
            clearForm();
            gantiMenu('pelanggan');
        });
    } else {
        payload.customerUID = document.getElementById('custUID').value;
        db.collection("customers").doc(id).update(payload).then(() => {
            logAktivitasDashboard(`Memperbarui profil data akun: ${namaClient}`, 'info');
            clearForm();
            gantiMenu('pelanggan');
        });
    }
}

function handleProsesPembayaran(e) {
    e.preventDefault();
    const customerId = document.getElementById('payCustomerSelect').value;
    if(!customerId) return alert("Silakan pilih pelanggan terlebih dahulu!");
    const metode = document.getElementById('payMetode').value;
    const tanggal = document.getElementById('payTanggal').value;
    const tglSkrg = new Date().toLocaleDateString('id-ID') + " + new Date().toLocaleTimeString('id-ID');
    const user = cacheCustomers.find(u => u.id === customerId);
    db.collection("customers").doc(customerId).update({
        status: 'Lunas',
        metodeBayar: metode,
        tanggalPilihan: tanggal,
        updatedAt: tglSkrg
    }).then(() => {
        logAktivitasDashboard(`Kasir memproses pembayaran LUNAS untuk: ${user.nama}`, 'success');
        alert(`Pembayaran ${user.nama} Berhasil Diproses!`);
        cetakStruk(customerId);
        document.getElementById('paymentForm').reset();
        updatePaymentFormDetails();
        autoScrollKeAtas();
    });
}

function cetakStruk(id) {
    const user = cacheCustomers.find(u => u.id === id);
    if(!user) return alert("Pelanggan tidak ditemukan!");
    const config = JSON.parse(localStorage.getItem('wifinet_enterprise_settings')) || defaultSettings;
    let harga = 0, namaPaket = "Layanan Internet";
    if (user.paket && user.paket.includes('|')) { [harga, namaPaket] = user.paket.split('|'); } else if(user.paket) { harga = user.paket; }
    let tglStruk = user.updatedAt || new Date().toLocaleDateString('id-ID');
    if(user.tanggalPilihan) { const t = user.tanggalPilihan.split('-'); if(t.length === 3) tglStruk = `${t[2]}/${t[1]}/${t[0]}`; }
    document.getElementById('stCompName').innerText = (config.brandName || "JAYAHOME Net").toUpperCase();
    document.getElementById('stCustUID').innerText = user.customerUID || "SKW-MAIN-00";
    document.getElementById('stCustName').innerText = (user.nama || "TANPA NAMA").toUpperCase();
    document.getElementById('stCustWA').innerText = user.whatsapp || "-";
    document.getElementById('stCustAlamat').innerText = (user.alamat || "ALAMAT BELUM DIISI").toUpperCase();
    document.getElementById('stTxId').innerText = "INV-" + user.id.substring(0, 7).toUpperCase();
    document.getElementById('stTime').innerText = tglStruk;
    document.getElementById('stItemName').innerText = namaPaket.toUpperCase();
    document.getElementById('stItemPrice').innerText = "Rp " + parseInt(harga || 0).toLocaleString('id-ID');
    document.getElementById('stTotalPay').innerText = "Rp " + parseInt(harga || 0).toLocaleString('id-ID');
    document.getElementById('stStatus').innerText = (user.status || "BELUM BAYAR").toUpperCase();
    document.getElementById('stMetode').innerText = (user.metodeBayar || "CASH / TUNAI").toUpperCase();
    const strukEl = document.getElementById('strukPrintArea');
    if (strukEl) {
        strukEl.classList.remove('hidden');
        setTimeout(() => { window.print(); setTimeout(() => { strukEl.classList.add('hidden'); }, 600); }, 350);
    }
}

function editCustomer(id) {
    const u = cacheCustomers.find(x => x.id === id);
    if(u) {
        document.getElementById('customerId').value = u.id; document.getElementById('custUID').value = u.customerUID || '';
        document.getElementById('custName').value = u.nama || ''; document.getElementById('custWA').value = u.whatsapp || '';
        document.getElementById('custAlamat').value = u.alamat || ''; document.getElementById('custPaket').value = u.paket || '';
        gantiMenu('pelanggan');
    }
}

function togglePayment(id, statusLama, nama) {
    const tglSkrg = new Date().toISOString().split('T')[0];
    const statusBaru = statusLama === 'Lunas'? 'Belum Bayar' : 'Lunas';
    db.collection("customers").doc(id).update({ status: statusBaru, tanggalPilihan: tglSkrg, updatedAt: new Date().toLocaleDateString('id-ID') + " + new Date().toLocaleTimeString('id-ID') }).then(() => {
        logAktivitasDashboard(`Mengubah status bayar ${nama} menjadi ${statusBaru.toUpperCase()}`, statusBaru === 'Lunas'? 'success' : 'danger');
    });
}

function deleteCustomer(id, nama) { if(confirm(`Hapus pelanggan ${nama}?`)) { db.collection("customers").doc(id).delete().then(() => { logAktivitasDashboard(`Menghapus paksa akun database client: ${nama}`, 'danger'); }); } }

function handleExpenseSubmit(e) {
    e.preventDefault();
    const ket = document.getElementById('expDetail').value;
    const jml = document.getElementById('expAmount').value;
    db.collection("expenses").add({ keterangan: ket, jumlah: jml, waktu: new Date().toLocaleDateString('id-ID') + " + new Date().toLocaleTimeString('id-ID') }).then(() => {
        logAktivitasDashboard(`Mencatat pengeluaran kas baru sebesar Rp ${parseInt(jml).toLocaleString('id-ID')}`, 'danger');
        autoScrollKeAtas();
    });
    document.getElementById('expenseForm').reset();
}

function renderExpenseTable() {
    const et = document.getElementById('expenseTable');
    if (!et) return;
    et.innerHTML = '';
    cacheExpenses.forEach(e => {
        et.innerHTML += `
            <tr class="border-b border-gray-200">
                <td class="p-3 class-value-card">${e.keterangan}</td>
                <td class="p-3 text-[#E21E26] font-bold">Rp ${parseInt(e.jumlah).toLocaleString('id-ID')}</td>
                <td class="p-3 text-xs class-label-card">${e.waktu}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteExpense('${e.id}', '${e.keterangan}', ${e.jumlah})" class="text-[#E21E26] hover:text-red-700 p-1 cursor-pointer transition-colors">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function deleteExpense(id, keterangan, jumlah) {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan pengeluaran "${keterangan}" sebesar Rp ${parseInt(jumlah).toLocaleString('id-ID')}?`)) {
        db.collection("expenses").doc(id).delete().then(() => {
            logAktivitasDashboard(`Menghapus catatan pengeluaran: ${keterangan} (-Rp ${parseInt(jumlah).toLocaleString('id-ID')})`, 'danger');
            alert("Catatan pengeluaran berhasil dihapus!");
        }).catch((error) => {
            console.error("Gagal menghapus data pengeluaran: ", error);
            alert("Gagal menghapus data dari server.");
        });
    }
}

function handleTicketSubmit(e) {
    e.preventDefault();
    const n = document.getElementById('tickName').value;
    db.collection("tickets").add({ nama: n, kendala: document.getElementById('tickDetail').value, status: 'Antrean' }).then(() => {
        logAktivitasDashboard(`Tiket gangguan masuk dari client: ${n}`, 'danger');
        autoScrollKeAtas();
    });
    document.getElementById('ticketForm').reset();
}

function renderTicketTable() { const tt = document.getElementById('ticketTable'); if (!tt) return; tt.innerHTML = ''; cacheTickets.forEach(t => { tt.innerHTML += `<tr class="border-b border-gray-200"><td class="p-3 font-bold class-value-card">${t.nama}</td><td class="p-3 class-value-card">${t.kendala}</td><td class="p-3"><span class="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-xs font-bold">${t.status}</span></td><td class="p-3 text-center"><button onclick="deleteTicket('${t.id}', '${t.nama}')" class="text-[#E21E26] hover:text-red-700 p-1 cursor-pointer transition-colors"><i class="fa-solid fa-trash"></i></button></td></tr>`; }); }
function deleteTicket(id, nama) { if(confirm(`Hapus tiket komplain dari ${nama}?`)) { db.collection("tickets").doc(id).delete().then(() => { logAktivitasDashboard(`Menghapus tiket komplain dari client: ${nama}`, 'danger'); }); } }

function handlePaketSubmit(e) {
    e.preventDefault();
    db.collection("packages").add({ nama: document.getElementById('pakName').value, harga: document.getElementById('pakPrice').value }).then(() => { autoScrollKeAtas(); });
    document.getElementById('paketForm').reset();
}

function renderPaketTable() { const pt = document.getElementById('paketTable'); if (!pt) return; pt.innerHTML = ''; cachePakets.forEach(p => { pt.innerHTML += `<tr class="border-b border-gray-200"><td class="p-3 font-bold class-value-card">${p.nama}</td><td class="p-3 class-value-card font-semibold text-[#00529B]">Rp ${parseInt(p.harga).toLocaleString('id-ID')}</td><td class="p-3"><button onclick="db.collection('packages').doc('${p.id}').delete()" class="text-[#E21E26] cursor-pointer"><i class="fa-solid fa-trash"></i></button></td></tr>`; }); }
function downloadBackup() { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({customers: cacheCustomers, expenses: cacheExpenses, packages: cachePakets})); const dl = document.createElement('a'); dl.setAttribute("href", dataStr); dl.setAttribute("download", "wifinet_backup.json"); dl.click(); }
function processRestore() { const file = document.getElementById('importFile').files[0]; if(!file) return alert("Pilih file!"); const reader = new FileReader(); reader.onload = function(e) { try { const data = JSON.parse(e.target.result);
