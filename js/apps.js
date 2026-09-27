// PASTE URL GOOGLE APPS SCRIPT ANDA DI SINI
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTM2GnaPBHORF9LzDcdE4oZO5wK8vpRHu35WUHvyLwd3J90gky1UzDC5ngH1Jj4MEM/exec";
    
    const MODAL_TETAP = 500000;
    const kertasList = [100000, 75000, 50000, 20000, 10000, 5000, 2000, 1000];
    const koinList = [1000, 500, 200, 100, 50, 25];
    let listData = [];

    function initApp() {
      document.getElementById('tanggalInput').valueAsDate = new Date();
      renderInputs();
      
      const savedData = localStorage.getItem('rekapKasirData');
      if (savedData) {
        try {
          listData = JSON.parse(savedData);
          renderList();
        } catch (e) {
          listData = [];
        }
      }
      hitungTotalAkumulasi();
    }

    function renderInputs() {
      const kertasBox = document.getElementById('kertasContainer');
      const koinBox = document.getElementById('koinContainer');

      kertasBox.innerHTML = '';
      koinBox.innerHTML = '';

      kertasList.forEach(val => {
        kertasBox.innerHTML += `
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Rp ${val.toLocaleString('id-ID')}</label>
            <input type="number" min="0" max="9999" placeholder="0" data-val="${val}" 
              oninput="hitungTotalAkumulasi()" class="input-x w-full border rounded p-1.5 text-sm text-right font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>`;
      });

      koinList.forEach(val => {
        koinBox.innerHTML += `
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Rp ${val.toLocaleString('id-ID')}</label>
            <input type="number" min="0" max="9999" placeholder="0" data-val="${val}" 
              oninput="hitungTotalAkumulasi()" class="input-x w-full border rounded p-1.5 text-sm text-right font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>`;
      });
    }

    function hitungTotalAkumulasi() {
      const inputs = document.querySelectorAll('.input-x');
      let totalCurrentInput = 0;

      inputs.forEach(input => {
        const x = parseInt(input.value) || 0;
        const val = parseInt(input.getAttribute('data-val'));
        totalCurrentInput += x * val;
      });

      const grandTotalFisik = listData.reduce((acc, curr) => acc + curr.total, 0) + totalCurrentInput;
      updateDisplay(grandTotalFisik);
    }

    function updateDisplay(totalFisik) {
      const setorBank = totalFisik - MODAL_TETAP;
      const sysVal = parseInt(document.getElementById('salesSystem').value) || 0;
      const selisih = (setorBank >= 0 ? setorBank : 0) - sysVal;

      const statusBox = document.getElementById('modalStatusBox');
      const selisihDisplay = document.getElementById('displaySelisih');

      document.getElementById('displayTotalFisik').innerText = `Rp ${totalFisik.toLocaleString('id-ID')}`;
      document.getElementById('displaySalesSystem').innerText = `Rp ${sysVal.toLocaleString('id-ID')}`;
      
      if (setorBank >= 0) {
        document.getElementById('displaySetorBank').innerText = `Rp ${setorBank.toLocaleString('id-ID')}`;
        statusBox.className = "p-3 text-xs rounded-lg bg-emerald-100 text-emerald-800 font-medium border border-emerald-200";
        statusBox.innerText = `✅ Uang Modal Rp 500.000 Aman Terpenuhi. (Hasil Sales Fisik: Rp ${setorBank.toLocaleString('id-ID')})`;
      } else {
        document.getElementById('displaySetorBank').innerText = `Rp 0`;
        statusBox.className = "p-3 text-xs rounded-lg bg-red-100 text-red-800 font-medium border border-red-200";
        statusBox.innerText = `⚠️ Fisik di laci kurang dari modal Rp 500.000! Selisih Modal: Rp ${Math.abs(setorBank).toLocaleString('id-ID')}`;
      }

      // Format Tampilan Audit Selisih Sales
      if (selisih === 0) {
        selisihDisplay.innerText = "Rp 0 (Pas / Balance)";
        selisihDisplay.className = "font-bold text-emerald-600";
      } else if (selisih > 0) {
        selisihDisplay.innerText = `+ Rp ${selisih.toLocaleString('id-ID')} (Lebih)`;
        selisihDisplay.className = "font-bold text-blue-600";
      } else {
        selisihDisplay.innerText = `- Rp ${Math.abs(selisih).toLocaleString('id-ID')} (Kurang/Minus)`;
        selisihDisplay.className = "font-bold text-red-600";
      }
    }

    function tambahTransaksi() {
      const nama = document.getElementById('namaKasir').value.trim();
      const tgl = document.getElementById('tanggalInput').value;
      const akun = document.getElementById('akunKasir').value;
      const jenis = document.getElementById('jenisTransaksi').value;

      if (!nama || !tgl || !akun || !jenis) {
        showAlert("Peringatan: Kolom Nama, Tanggal, Akun Kasir, dan Jenis Transaksi wajib diisi!");
      } else {
        hideAlert();
      }

      const inputs = document.querySelectorAll('.input-x');
      let subtotal = 0;
      inputs.forEach(i => {
        subtotal += (parseInt(i.value) || 0) * parseInt(i.getAttribute('data-val'));
      });

      if (subtotal === 0) {
        showAlert("Silakan masukkan minimal satu nominal lembar/koin uang!");
        return;
      }

      listData.push({ id: Date.now(), nama, tgl, akun, jenis, total: subtotal });
      saveToStorage();
      
      inputs.forEach(i => i.value = '');
      renderList();
      hitungTotalAkumulasi();
    }

    function hapusItem(id) {
      listData = listData.filter(item => item.id !== id);
      saveToStorage();
      renderList();
      hitungTotalAkumulasi();
    }

    function renderList() {
      const box = document.getElementById('daftarTransaksi');
      document.getElementById('totalItemBadge').innerText = `${listData.length} Item`;

      if (listData.length === 0) {
        box.innerHTML = `<p class="text-slate-400 italic text-center py-4">Belum ada item ditambahkan.</p>`;
        return;
      }

      box.innerHTML = '';
      listData.forEach((item) => {
        box.innerHTML += `
          <div class="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <p class="font-bold text-slate-700 text-xs">${item.jenis} <span class="font-normal text-slate-500">(${item.akun || 'Tanpa Akun'})</span></p>
              <p class="text-[10px] text-slate-400">${item.nama || 'Tanpa Nama'} • ${item.tgl || '-'}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-800 text-xs">Rp ${item.total.toLocaleString('id-ID')}</span>
              <button onclick="hapusItem(${item.id})" class="text-red-400 hover:text-red-600 font-bold px-1 no-print" title="Hapus">✕</button>
            </div>
          </div>`;
      });
    }

    // KIRIM DATA KE GOOGLE SHEETS
    async function kirimKeGoogleSheets() {
      const nama = document.getElementById('namaKasir').value.trim();
      const tgl = document.getElementById('tanggalInput').value;
      const akun = document.getElementById('akunKasir').value;
      const jenis = document.getElementById('jenisTransaksi').value;
      const sysVal = parseInt(document.getElementById('salesSystem').value) || 0;
      const catatan = document.getElementById('catatanSelisih').value.trim();

      if (!nama || !tgl || !akun || !jenis) {
        showAlert("⚠️ Harap lengkapi Nama, Tanggal, Akun Kasir, dan Jenis Transaksi sebelum mengirim data!");
        return;
      }

      if (GOOGLE_SCRIPT_URL === "URL_GOOGLE_APPS_SCRIPT_MAS_BRO_DI_SINI") {
        showAlert("⚠️ URL Google Apps Script belum dipasang pada kode HTML!");
        return;
      }

      const totalFisik = listData.reduce((acc, curr) => acc + curr.total, 0);
      const salesMurni = totalFisik - MODAL_TETAP > 0 ? totalFisik - MODAL_TETAP : 0;
      const selisih = salesMurni - sysVal;

      const payload = {
        tanggal: tgl,
        namaKasir: nama,
        akunKasir: akun,
        jenisTransaksi: jenis,
        totalFisik: totalFisik,
        modal: MODAL_TETAP,
        salesMurni: salesMurni,
        salesSystem: sysVal,
        selisih: selisih,
        catatan: catatan
      };

      const btn = document.getElementById('btnSync');
      btn.disabled = true;
      btn.innerText = "Mengirim...";

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Menghindari CORS error dari browser
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        alert("✅ Data Rekap Kasir Berhasil Terkirim ke Google Sheets!");
        hideAlert();
      } catch (err) {
        showAlert("❌ Gagal mengirim data ke Google Sheets: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg> Kirim & Sync ke Google Sheets`;
      }
    }

    function saveToStorage() {
      localStorage.setItem('rekapKasirData', JSON.stringify(listData));
    }

    function resetSemuaData() {
      if (confirm("Apakah Anda yakin ingin menghapus semua rekap shift ini?")) {
        listData = [];
        localStorage.removeItem('rekapKasirData');
        document.getElementById('salesSystem').value = '';
        document.getElementById('catatanSelisih').value = '';
        renderList();
        hitungTotalAkumulasi();
        hideAlert();
      }
    }

    function showAlert(msg) {
      const b = document.getElementById('alertBox');
      document.getElementById('alertMessage').innerText = msg;
      b.classList.remove('hidden');
    }

    function hideAlert() {
      document.getElementById('alertBox').classList.add('hidden');
    }

    initApp();
