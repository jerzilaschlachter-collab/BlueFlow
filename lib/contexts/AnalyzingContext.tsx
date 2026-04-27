'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AnalyzingContextType {
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
}

const AnalyzingContext = createContext<AnalyzingContextType | undefined>(undefined)

export function AnalyzingProvider({ children }: { children: ReactNode }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <AnalyzingContext.Provider value={{ isAnalyzing, setIsAnalyzing }}>
      {children}
    </AnalyzingContext.Provider>
  )
}

export function useAnalyzing() {
  const context = useContext(AnalyzingContext)
  if (context === undefined) {
    throw new Error('useAnalyzing must be used within AnalyzingProvider')
  }
  return context
}
