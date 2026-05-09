import { createClient } from '@/lib/supabase/client'

export async function uploadBuktiTransaksi(file: File, transactionId: string) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `bukti/${transactionId}.${ext}`

  const { data, error } = await supabase.storage
    .from('transaksi')
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage
    .from('transaksi')
    .getPublicUrl(path)

  return urlData.publicUrl
}
