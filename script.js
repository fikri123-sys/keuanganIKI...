// State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let filterAktif = 'semua';

// Helper Functions
function simpanData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka);
}

function getTanggalHariIni() {
    return new Date().toISOString().split('T')[0];
}

function isBulanIni(tanggal) {
    const now = new Date();
    const tgl = new Date(tanggal);
    return tgl.getMonth() === now.getMonth() && 
           tgl.getFullYear() === now.getFullYear();
}

function isTahunIni(tanggal) {
    const now = new Date();
    const tgl = new Date(tanggal);
    return tgl.getFullYear() === now.getFullYear();
}

// Filter Functions
function filterTransaksi(periode) {
    filterAktif = periode;
    
    // Update button active
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update info filter
    const infoMap = {
        'semua': 'Semua Transaksi',
        'hari': 'Transaksi Hari Ini',
        'bulan': 'Transaksi Bulan Ini',
        'tahun': 'Transaksi Tahun Ini'
    };
    
    document.getElementById('infoFilter').innerHTML = 
        `<i class="fas fa-info-circle"></i> ${infoMap[periode]}`;
    
    tampilkanTransaksi();
}

function getTransaksiTerfilter() {
    const hariIni = getTanggalHariIni();
    
    switch(filterAktif) {
        case 'hari':
            return transactions.filter(t => t.tanggal === hariIni);
        case 'bulan':
            return transactions.filter(t => isBulanIni(t.tanggal));
        case 'tahun':
            return transactions.filter(t => isTahunIni(t.tanggal));
        default:
            return transactions;
    }
}

// UI Update Functions
function updateRingkasan() {
    const totalPemasukan = transactions
        .filter(t => t.tipe === 'income')
        .reduce((sum, t) => sum + t.jumlah, 0);
    
    const totalPengeluaran = transactions
        .filter(t => t.tipe === 'expense')
        .reduce((sum, t) => sum + t.jumlah, 0);
    
    document.getElementById('totalPemasukan').textContent = 
        `Rp ${formatRupiah(totalPemasukan)}`;
    document.getElementById('totalPengeluaran').textContent = 
        `Rp ${formatRupiah(totalPengeluaran)}`;
}

function updateSaldo() {
    const saldo = transactions.reduce((sum, t) => {
        return t.tipe === 'income' ? sum + t.jumlah : sum - t.jumlah;
    }, 0);
    
    document.getElementById('total').textContent = formatRupiah(saldo);
}

function tampilkanTransaksi() {
    const daftar = document.getElementById('daftarTransaksi');
    const transaksiFilter = getTransaksiTerfilter();
    
    if (transaksiFilter.length === 0) {
        daftar.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>Belum ada transaksi</p>
            </div>
        `;
        return;
    }
    
    // Urutkan dari terbaru
    transaksiFilter.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    let html = '';
    transaksiFilter.forEach((t, index) => {
        const cariIndexAsli = transactions.findIndex(tr => 
            tr.deskripsi === t.deskripsi && 
            tr.jumlah === t.jumlah && 
            tr.tanggal === t.tanggal
        );
        
        const icon = t.tipe === 'income' ? 'fa-arrow-up' : 'fa-arrow-down';
        const warna = t.tipe === 'income' ? '#10b981' : '#ef4444';
        const tanda = t.tipe === 'income' ? '+' : '-';
        
        html += `
            <div class="item-transaksi">
                <div class="info-transaksi">
                    <div class="judul-transaksi">
                        <i class="fas ${icon}" style="color: ${warna}; margin-right: 6px;"></i>
                        ${t.deskripsi}
                    </div>
                    <div class="tanggal-transaksi">
                        <i class="fas fa-calendar-alt"></i> ${t.tanggal}
                    </div>
                </div>
                <span class="nominal-transaksi ${t.tipe}">
                    ${tanda} Rp ${formatRupiah(t.jumlah)}
                </span>
                <button class="btn-hapus" onclick="hapusTransaksi(${cariIndexAsli})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    daftar.innerHTML = html;
}

// Transaction Functions
function tambahTransaksi() {
    const deskripsi = document.getElementById('desc').value.trim();
    const jumlah = parseInt(document.getElementById('amount').value);
    const tipe = document.getElementById('type').value;
    
    if (!deskripsi || !jumlah || jumlah <= 0) {
        alert('Isi data dengan lengkap!');
        return;
    }
    
    transactions.push({
        deskripsi,
        jumlah,
        tipe,
        tanggal: getTanggalHariIni()
    });
    
    // Reset form
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
    
    // Update UI
    simpanData();
    updateRingkasan();
    updateSaldo();
    tampilkanTransaksi();
    
    // Focus ke input
    document.getElementById('desc').focus();
}

function hapusTransaksi(index) {
    if (confirm('Hapus transaksi ini?')) {
        transactions.splice(index, 1);
        simpanData();
        updateRingkasan();
        updateSaldo();
        tampilkanTransaksi();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    updateRingkasan();
    updateSaldo();
    tampilkanTransaksi();
    
    // Enter key
    document.getElementById('amount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') tambahTransaksi();
    });
});