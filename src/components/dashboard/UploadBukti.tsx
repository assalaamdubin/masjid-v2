'use client'

import { useState, useRef } from 'react'
import { compressAndUpload } from '@/lib/supabase/storage'
import Image from 'next/image'

export default function UploadBukti({
  transactionId,
  existingUrl,
  onUpload,
}: {
  transactionId: string
  existingUrl?: string | null
  onUpload: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format harus JPG, PNG, atau WebP')
      return
    }

    setError('')
    setUploading(true)

    try {
      const url = await compressAndUpload(file, transactionId)
      setPreview(url)
      onUpload(url)
    } catch (err: any) {
      setError(err.message || 'Gagal upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">Bukti Transaksi</label>
      
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={preview}
              alt="Bukti transaksi"
              fill
              className="object-contain bg-gray-50"
            />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ganti foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="space-y-1">
              <span className="text-2xl block">⏳</span>
              <p className="text-xs text-gray-500">Mengkompresi & mengupload...</p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-2xl block">📸</span>
              <p className="text-xs font-medium text-gray-700">Tap untuk upload foto nota</p>
              <p className="text-xs text-gray-400">JPG, PNG • Max 1MB • Auto kompresi</p>
            </div>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500">⚠️ {error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
