
    const MODAL_TETAP = 500000;
    const kertasList = [100000, 75000, 50000, 20000, 10000, 5000, 2000, 1000];
    const koinList = [1000, 500, 200, 100, 50, 25];
    let listData = [];

    // Load data awal dari LocalStorage browser
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

    // Render kotak input pecahan lembar/koin
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

    // Kalkulasi Real-time
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

    // Update tampilan angka (tanpa dikurangi modal)
    function updateDisplay(totalFisik) {
      document.getElementById('displayTotalFisik').innerText = `Rp ${totalFisik.toLocaleString('id-ID')}`;
      document.getElementById('displaySetorBank').innerText = `Rp ${totalFisik.toLocaleString('id-ID')}`;
    }

    // Tambah item transaksi ke daftar
    function tambahTransaksi() {
      const nama = document.getElementById('namaKasir').value.trim();
      const tgl = document.getElementById('tanggalInput').value;
      const akun = document.getElementById('akunKasir').value;
      const jenis = document.getElementById('jenisTransaksi').value;

      // Peringatan jika data diri kosong
      if (!nama || !tgl || !akun || !jenis) {
        showAlert("Peringatan: Kolom Nama, Tanggal, Akun Kasir, dan Jenis Transaksi belum diisi!");
      } else {
        hideAlert();
      }

      // Hitung subtotal input saat ini
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
      
      // Reset bidang pecahan uang saja
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

    function saveToStorage() {
      localStorage.setItem('rekapKasirData', JSON.stringify(listData));
    }

    function resetSemuaData() {
      if (confirm("Apakah Anda yakin ingin menghapus semua rekap shift ini?")) {
        listData = [];
        localStorage.removeItem('rekapKasirData');
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

    // Jalankan aplikasi saat halaman terbuka
    initApp();
