'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingPanelProps {
  isLoading: boolean
}

const messages = [
  'Reading chart structure...',
  'Identifying key levels...',
  'Detecting patterns...',
  'Calculating confidence score...',
  'Building your analysis...',
  'Almost ready...',
]

export default function LoadingPanel({ isLoading }: LoadingPanelProps) {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 1800)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 right-0 top-16 bg-white flex flex-col items-center justify-center z-40">
      {/* Logo */}
      <div className="relative mb-8">
        <Image src="/Logo.png" alt="BlueFlow" width={120} height={120} className="object-contain" />
      </div>

      {/* Cycling messages with fade */}
      <div className="h-6 mb-8">
        <p className="message-fade text-gray-700 text-lg font-medium text-center">
          {messages[currentMessage]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1 bg-gray-200 rounded-full overflow-hidden mb-8">
        <div className="progress-bar-animate h-full bg-gradient-to-r from-[#0033CC] to-[#00AAFF] rounded-full" />
      </div>

      {/* Bottom text */}
      <p className="text-gray-400 text-xs mt-8">Powered by Anthropic Claude Vision AI</p>
    </div>
  )
}
