export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Total Saldo</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Rp 0</p>
          <p className="text-xs text-gray-400 mt-1">Semua entitas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Pemasukan Bulan Ini</p>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">Rp 0</p>
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Pengeluaran Bulan Ini</p>
            <span className="text-2xl">📉</span>
          </div>
          <p className="text-2xl font-bold text-red-500">Rp 0</p>
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>
      </div>

      {/* Recent Transactions Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-sm">Belum ada transaksi</p>
          <p className="text-xs mt-1">Mulai tambah transaksi pertama</p>
        </div>
      </div>
    </div>
  )
}
