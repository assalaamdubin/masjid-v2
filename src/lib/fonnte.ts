const FONNTE_TOKEN = process.env.FONNTE_TOKEN!

export async function sendWhatsApp(phone: string, message: string) {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: phone,
        message,
        countryCode: '62',
      }),
    })

    const data = await response.json()
    console.log('Fonnte response:', data)
    return data
  } catch (error) {
    console.error('Fonnte error:', error)
  }
}

export function pesanPengajuanPengeluaran({
  namaKategori,
  nominal,
  keterangan,
  diajukanOleh,
  entityName,
  approvalUrl,
}: {
  namaKategori: string
  nominal: string
  keterangan: string
  diajukanOleh: string
  entityName: string
  approvalUrl: string
}) {
  return `🕌 *Masjid Al-Salam - Pengajuan Pengeluaran*

Ada pengajuan pengeluaran yang perlu disetujui:

📋 *Detail Transaksi:*
- Entity: ${entityName}
- Kategori: ${namaKategori}
- Nominal: ${nominal}
- Keterangan: ${keterangan || '-'}
- Diajukan oleh: ${diajukanOleh}

👆 Klik link berikut untuk menyetujui atau menolak:
${approvalUrl}

_Pesan otomatis dari Sistem Keuangan Masjid_`
}

export function pesanApprovalDisetujui({
  namaKategori,
  nominal,
  disetujuiOleh,
  entityName,
}: {
  namaKategori: string
  nominal: string
  disetujuiOleh: string
  entityName: string
}) {
  return `✅ *Masjid Al-Salam - Pengeluaran Disetujui*

Pengajuan pengeluaran telah *DISETUJUI*:

📋 *Detail:*
- Entity: ${entityName}
- Kategori: ${namaKategori}
- Nominal: ${nominal}
- Disetujui oleh: ${disetujuiOleh}

_Pesan otomatis dari Sistem Keuangan Masjid_`
}

export function pesanApprovalDitolak({
  namaKategori,
  nominal,
  ditolakOleh,
  alasan,
  entityName,
}: {
  namaKategori: string
  nominal: string
  ditolakOleh: string
  alasan: string
  entityName: string
}) {
  return `❌ *Masjid Al-Salam - Pengeluaran Ditolak*

Pengajuan pengeluaran telah *DITOLAK*:

📋 *Detail:*
- Entity: ${entityName}
- Kategori: ${namaKategori}
- Nominal: ${nominal}
- Ditolak oleh: ${ditolakOleh}
- Alasan: ${alasan || '-'}

_Pesan otomatis dari Sistem Keuangan Masjid_`
}
