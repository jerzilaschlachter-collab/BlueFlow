'use client'

import React, { useState } from 'react'

interface Props {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function Logo({ size = 32, className = '', style }: Props) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    // Fallback: gradient "BF" box shown until logo.png is placed in /public
    return (
      <div
        style={{ width: size, height: size, ...style }}
        className={`rounded-lg gradient-bg flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>BF</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/Logo.png"
      alt="BlueFlow"
      style={{ height: size, width: size, objectFit: 'contain', ...style }}
      className={`flex-shrink-0 logo-img ${className}`}
      onError={() => setImgError(true)}
    />
  )
}
