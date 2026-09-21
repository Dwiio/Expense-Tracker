/**
 * ========================================================
 * Personal Finance & Expense Tracker App — main.js
 * ========================================================
 * Implementasi menggunakan Vanilla JavaScript (DOM API).
 * Tidak menggunakan library/framework eksternal.
 */

// ========================================================
// 1. STATE & KONFIGURASI
// ========================================================

const STORAGE_KEY = 'trackerio_transactions';

let transactions = [];
let editingTransactionId = null;

// Ambil elemen-elemen utama dari DOM.
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');

const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');

const searchForm = document.getElementById('searchTransactionForm');
const searchInput = document.getElementById('searchTransactionFormTitleInput');

const formHeading = document.getElementById('form-heading');
const submitButton = document.querySelector('[data-testid="transactionFormSubmitButton"]');

const balanceElement = document.querySelector('.tracker-summary__balance-amount');
const incomeTotalElement = document.querySelector('.tracker-summary__stat-amount--income');
const expenseTotalElement = document.querySelector('.tracker-summary__stat-amount--expense');

const greetingElement = document.querySelector('.tracker-header__greeting');
const headerDateElement = document.querySelector('.tracker-header__date');

// ========================================================
// 2. HELPER FUNCTIONS
// ========================================================

/**
 * Menghasilkan ID numerik unik menggunakan timestamp.
 */
function generateId() {
  return +new Date();
}

/**
 * Format angka menjadi mata uang Rupiah.
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD.
 */
function getToday() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

/**
 * Format tanggal agar lebih mudah dibaca pengguna.
 */
function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Menyimpan array transaksi ke localStorage.
 */
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/**
 * Membaca transaksi dari localStorage menggunakan JSON.parse().
 */
function loadTransactions() {
  const storedData = localStorage.getItem(STORAGE_KEY);

  if (!storedData) {
    transactions = [];
    return;
  }

  try {
    const parsedData = JSON.parse(storedData);

    // Pastikan data yang dibaca benar-benar berupa array.
    transactions = Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('Data transaksi di localStorage tidak valid:', error);
    transactions = [];
  }
}

/**
 * Mengirim custom event sebagai sinyal bahwa data transaksi berubah.
 */
function dispatchTransactionUpdated() {
  document.dispatchEvent(new Event('transaction:updated'));
}

/**
 * Mengubah mode form kembali ke "Tambah".
 */
function resetFormMode() {
  editingTransactionId = null;
  transactionForm.reset();
  dateInput.value = getToday();
  typeSelect.value = 'income';

  if (formHeading) formHeading.textContent = 'Tambah Pencatatan Baru';
  if (submitButton) submitButton.textContent = 'Simpan';
}

/**
 * Mengubah form ke mode edit berdasarkan ID transaksi.
 */
function setEditMode(transaction) {
  editingTransactionId = transaction.id;

  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  typeSelect.value = transaction.type;

  if (formHeading) formHeading.textContent = 'Edit Pencatatan';
  if (submitButton) submitButton.textContent = 'Simpan Perubahan';

  titleInput.focus();

  // Memudahkan pengguna melihat form saat edit di perangkat kecil.
  transactionForm.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

/**
 * Membuat elemen tombol secara aman melalui DOM API.
 */
function createActionButton(label, className, onClick, dataTestId = null) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = `tracker-transaction-item__btn ${className}`;
  button.textContent = label;
  button.addEventListener('click', onClick);

  if (dataTestId) {
    button.setAttribute('data-testid', dataTestId);
  }

  return button;
}

// ========================================================
// 3. DASHBOARD / RINGKASAN KEUANGAN
// ========================================================

/**
 * Menghitung dan menampilkan saldo, total pemasukan,
 * dan total pengeluaran secara dinamis.
 */
function updateDashboard() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpense;

  incomeTotalElement.textContent = formatCurrency(totalIncome);
  expenseTotalElement.textContent = formatCurrency(totalExpense);
  balanceElement.textContent = formatCurrency(balance);

  balanceElement.classList.toggle(
    'tracker-summary__balance-amount--negative',
    balance < 0,
  );
}

// ========================================================
// 4. MEMBUAT KARTU TRANSAKSI DENGAN createElement()
// ========================================================

/**
 * Membuat satu kartu transaksi.
 * Semua node dibuat menggunakan document.createElement().
 */
function createTransactionElement(transaction) {
  const item = document.createElement('article');
  item.className = 'tracker-transaction-item';
  item.setAttribute('data-testid', 'transactionItem');
  item.dataset.transactionId = String(transaction.id);

  const icon = document.createElement('div');
  icon.className = `tracker-transaction-item__icon tracker-transaction-item__icon--${transaction.type}`;
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = transaction.type === 'income' ? '↗' : '↘';

  const detail = document.createElement('div');
  detail.className = 'tracker-transaction-item__detail';

  const title = document.createElement('h4');
  title.className = 'tracker-transaction-item__title';
  title.setAttribute('data-testid', 'transactionItemTitle');
  title.textContent = transaction.title;

  const date = document.createElement('p');
  date.className = 'tracker-transaction-item__date';
  date.setAttribute('data-testid', 'transactionItemDate');
  date.textContent = formatDate(transaction.date);

  detail.append(title, date);

  const right = document.createElement('div');
  right.className = 'tracker-transaction-item__right';

  const amount = document.createElement('p');
  amount.className = `tracker-transaction-item__amount tracker-transaction-item__amount--${transaction.type}`;
  amount.setAttribute('data-testid', 'transactionItemAmount');
  amount.textContent = `${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(Number(transaction.amount))}`;

  const transactionType = document.createElement('span');
  transactionType.className = `tracker-transaction-item__type tracker-transaction-item__type--${transaction.type}`;
  transactionType.setAttribute('data-testid', 'transactionItemType');
  transactionType.textContent = transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran';

  const actions = document.createElement('div');
  actions.className = 'tracker-transaction-item__actions';

  const editButton = createActionButton(
    'Edit',
    'tracker-transaction-item__btn--edit',
    () => {
      setEditMode(transaction);
    },
  );

  const toggleTypeButton = createActionButton(
    transaction.type === 'income' ? 'Jadikan Pengeluaran' : 'Jadikan Pemasukan',
    'tracker-transaction-item__btn--type',
    () => {
      transaction.type = transaction.type === 'income' ? 'expense' : 'income';
      saveTransactions();
      dispatchTransactionUpdated();
    },
    'transactionItemEditTypeButton',
  );

  const deleteButton = createActionButton(
    'Hapus',
    'tracker-transaction-item__btn--delete',
    () => {
      transactions = transactions.filter((itemTransaction) => itemTransaction.id !== transaction.id);
      saveTransactions();
      dispatchTransactionUpdated();

      if (editingTransactionId === transaction.id) {
        resetFormMode();
      }
    },
    'transactionItemDeleteButton',
  );

  actions.append(editButton, toggleTypeButton, deleteButton);
  right.append(amount, transactionType, actions);

  item.append(icon, detail, right);

  return item;
}

// ========================================================
// 5. RENDER DAFTAR TRANSAKSI
// ========================================================

/**
 * Menampilkan transaksi sesuai kata kunci pencarian.
 * Pemasukan dan pengeluaran dipisahkan ke kontainer masing-masing.
 */
function renderTransactions() {
  incomeList.replaceChildren();
  expenseList.replaceChildren();

  const keyword = searchInput.value.trim().toLowerCase();

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.title.toLowerCase().includes(keyword),
  );

  // Urutkan transaksi terbaru di bagian atas.
  const sortedTransactions = [...filteredTransactions].sort(
    (first, second) => Number(second.id) - Number(first.id),
  );

  let incomeCount = 0;
  let expenseCount = 0;

  sortedTransactions.forEach((transaction) => {
    const transactionElement = createTransactionElement(transaction);

    if (transaction.type === 'income') {
      incomeList.appendChild(transactionElement);
      incomeCount += 1;
    } else {
      expenseList.appendChild(transactionElement);
      expenseCount += 1;
    }
  });

  if (incomeCount === 0) {
    incomeList.appendChild(createEmptyState(
      keyword ? 'Tidak ada pemasukan yang cocok.' : 'Belum ada pemasukan.',
    ));
  }

  if (expenseCount === 0) {
    expenseList.appendChild(createEmptyState(
      keyword ? 'Tidak ada pengeluaran yang cocok.' : 'Belum ada pengeluaran.',
    ));
  }
}

/**
 * Membuat pesan kosong sebagai elemen DOM biasa.
 */
function createEmptyState(message) {
  const emptyState = document.createElement('p');
  emptyState.className = 'tracker-empty-state';
  emptyState.textContent = message;
  return emptyState;
}

/**
 * Satu listener custom event bertanggung jawab memperbarui
 * seluruh tampilan setelah data transaksi berubah.
 */
document.addEventListener('transaction:updated', () => {
  renderTransactions();
  updateDashboard();
});

// ========================================================
// 6. FORM TRANSAKSI: TAMBAH & EDIT
// ========================================================

transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;

  // Validasi sesuai rubrik submission.
  if (!title) {
    alert('Judul transaksi tidak boleh kosong.');
    titleInput.focus();
    return;
  }

  if (!Number.isFinite(amount) || amount < 1) {
    alert('Nominal uang harus minimal Rp1.');
    amountInput.focus();
    return;
  }

  if (!date) {
    alert('Tanggal transaksi harus diisi.');
    dateInput.focus();
    return;
  }

  if (editingTransactionId !== null) {
    // Mode edit: ubah objek transaksi yang dipilih.
    const transactionIndex = transactions.findIndex(
      (transaction) => transaction.id === editingTransactionId,
    );

    if (transactionIndex !== -1) {
      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        title,
        amount,
        date,
        type,
      };
    }

    saveTransactions();
    resetFormMode();
    dispatchTransactionUpdated();
    return;
  }

  // Mode tambah: buat transaksi baru dengan struktur konsisten.
  const newTransaction = {
    id: generateId(),
    title,
    amount,
    date,
    type,
  };

  transactions.push(newTransaction);
  saveTransactions();

  resetFormMode();
  dispatchTransactionUpdated();
});

// ========================================================
// 7. PENCARIAN REAL-TIME
// ========================================================

searchInput.addEventListener('input', () => {
  // Pencarian real-time cukup merender ulang data hasil filter.
  // Ketika input kosong, filter otomatis mengembalikan seluruh transaksi.
  renderTransactions();
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  renderTransactions();
});

// ========================================================
// 8. INISIALISASI APLIKASI
// ========================================================

function initializeApp() {
  // Greeting identitas pengguna sesuai permintaan submission.
  if (greetingElement) {
    greetingElement.textContent = 'Halo, Dwirizki Adithya Putra (dwi_rzkio0c8)';
  }

  // Label bulan/tahun mengikuti tanggal perangkat pengguna.
  if (headerDateElement) {
    headerDateElement.textContent = new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }

  loadTransactions();

  // Default tanggal form.
  dateInput.value = getToday();

  // Gunakan custom event yang sama agar render awal
  // melewati satu jalur pembaruan tampilan.
  dispatchTransactionUpdated();
}

initializeApp();
