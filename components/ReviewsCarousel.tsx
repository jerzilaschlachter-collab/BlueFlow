'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const reviews = [
  {
    name: 'Alex M.',
    handle: '@alextrading',
    img: 'https://i.pravatar.cc/80?img=12',
    rating: 5,
    text: "I've been trading for 6 years and BlueFlow cuts my pre-trade analysis from 20 minutes to under 10 seconds. The SMC breakdown is scary accurate.",
  },
  {
    name: 'Sarah K.',
    handle: '@sarahfx',
    img: 'https://i.pravatar.cc/80?img=5',
    rating: 5,
    text: "Finally an AI that speaks my language. I set it to Price Action mode and it spots exactly the setups I look for — confluences, structure breaks, everything.",
  },
  {
    name: 'Jordan T.',
    handle: '@jtrades',
    img: 'https://i.pravatar.cc/80?img=15',
    rating: 5,
    text: "The pre-trade checklist alone is worth it. It keeps me disciplined and stops me from entering bad setups. My win rate went up noticeably in the first month.",
  },
  {
    name: 'Marcus L.',
    handle: '@marcusdaytrader',
    img: 'https://i.pravatar.cc/80?img=33',
    rating: 5,
    text: "Day trading SPX used to feel like guessing. BlueFlow gives me a second opinion in 2 seconds — it's like having a pro trader always on call.",
  },
  {
    name: 'Priya R.',
    handle: '@priyaswings',
    img: 'https://i.pravatar.cc/80?img=47',
    rating: 5,
    text: "I use it for swing trades on crypto. The Elliott Wave detection is impressive and I love that every analysis is saved so I can review my setups.",
  },
  {
    name: 'Daniel W.',
    handle: '@dwforex',
    img: 'https://i.pravatar.cc/80?img=68',
    rating: 5,
    text: "Set up in 2 minutes, first analysis blew me away. The risk/reward setup it generates is exactly what I'd calculate manually — but instant.",
  },
]

export default function ReviewsCarousel() {
  const [idx, setIdx] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % reviews.length)
      setAnimKey(k => k + 1)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const visible = [0, 1, 2].map(offset => reviews[(idx + offset) % reviews.length])

  const goTo = (i: number) => {
    setIdx(i)
    setAnimKey(k => k + 1)
  }

  return (
    <div>
      <div key={animKey} className="grid md:grid-cols-3 gap-6 animate-carousel-in">
        {visible.map((review) => (
          <div
            key={review.name}
            className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col gap-4"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: review.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-[#475569] text-sm leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#F1F5F9]">
              <Image
                src={review.img}
                alt={review.name}
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-[#0A0E27] font-semibold text-sm">{review.name}</p>
                <p className="text-[#94A3B8] text-xs">{review.handle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-2 justify-center mt-8">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full h-2 ${
              i === idx ? 'w-6 bg-[#00AAFF]' : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
