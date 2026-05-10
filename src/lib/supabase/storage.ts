import { createClient } from '@/lib/supabase/client'

export async function compressAndUpload(file: File, fileName: string): Promise<string> {
  const compressed = await compressImage(file, 0.7, 1200)
  
  const supabase = createClient()
  const path = `bukti/${fileName}.jpg`

  const { error } = await supabase.storage
    .from('transaksi')
    .upload(path, compressed, { 
      upsert: true,
      contentType: 'image/jpeg'
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from('transaksi')
    .getPublicUrl(path)

  return data.publicUrl
}

async function compressImage(file: File, quality: number, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = reject
    img.src = url
  })
}

export async function deleteBukti(fileName: string) {
  const supabase = createClient()
  await supabase.storage
    .from('transaksi')
    .remove([`bukti/${fileName}.jpg`])
}
