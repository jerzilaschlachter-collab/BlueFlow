'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Analysis, AnalysisResult } from '@/types'

interface Props {
  disabled?: boolean
  tradingStyle: string
  onAnalysisComplete: (analysis: Analysis) => void
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

export default function ChartUpload({ disabled, tradingStyle, onAnalysisComplete }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        setError('Please upload a JPG or PNG image.')
        return
      }

      const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
      if (file.size > MAX_SIZE) {
        setError('Image must be under 10 MB.')
        return
      }

      setError(null)
      setPreview(URL.createObjectURL(file))
      setUploadState('uploading')

      // Get current user for storage path
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated.')
        setUploadState('error')
        return
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${user.id}/${Date.now()}-chart.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('charts')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploadState('error')
        return
      }

      setUploadState('analyzing')

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath: path }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          setError('Monthly limit reached. Upgrade to Pro for unlimited analyses.')
        } else {
          setError(data.error ?? 'Analysis failed.')
        }
        setUploadState('error')
        return
      }

      const result = data.analysis as AnalysisResult
      const fullAnalysis: Analysis = {
        id: data.id,
        user_id: user.id,
        image_url: data.image_url,
        created_at: data.created_at,
        trading_style: tradingStyle as Analysis['trading_style'],
        raw_analysis: '',
        ...result,
      }

      setUploadState('done')
      onAnalysisComplete(fullAnalysis)
    },
    [supabase, tradingStyle, onAnalysisComplete]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const reset = () => {
    setUploadState('idle')
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isLoading = uploadState === 'uploading' || uploadState === 'analyzing'

  const statusMessages = {
    uploading: 'Uploading chart...',
    analyzing: 'Analyzing with Claude Vision AI...',
    done: 'Analysis complete!',
    error: 'Something went wrong',
    idle: '',
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-white font-semibold text-lg">Upload Chart</h2>
        <p className="text-zinc-500 text-sm mt-0.5">
          Drop a JPG or PNG — AI will analyze it for your {tradingStyle} setup
        </p>
      </div>

      <div className="p-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer min-h-[220px] flex items-center justify-center overflow-hidden ${
            disabled
              ? 'border-zinc-800 cursor-not-allowed opacity-50'
              : dragOver
              ? 'border-[#00AAFF] bg-[#00AAFF]/5'
              : isLoading
              ? 'border-zinc-700 cursor-default'
              : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isLoading}
          />

          {preview ? (
            <img
              src={preview}
              alt="Chart preview"
              className="w-full h-full object-contain max-h-64"
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-14 h-14 rounded-2xl gradient-bg/20 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Drop chart here</p>
              <p className="text-zinc-500 text-sm">or click to browse — JPG, PNG up to 10 MB</p>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-[#0033CC] border-t-[#00AAFF] rounded-full animate-spin" />
              <p className="text-white text-sm font-medium">{statusMessages[uploadState]}</p>
            </div>
          )}
        </div>

        {/* Status messages */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <svg
              className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {uploadState === 'done' && (
          <div className="mt-4 flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-400 text-sm font-medium">Analysis complete — see results below</p>
            </div>
            <button
              onClick={reset}
              className="text-zinc-400 text-sm hover:text-white transition-colors"
            >
              Analyze another
            </button>
          </div>
        )}

        {disabled && !isLoading && uploadState !== 'done' && (
          <p className="mt-4 text-amber-400 text-sm text-center">
            Upload disabled — monthly limit reached.{' '}
            <a href="/pricing" className="text-[#00AAFF] hover:underline">
              Upgrade to Pro
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
