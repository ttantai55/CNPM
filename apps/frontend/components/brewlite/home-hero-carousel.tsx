'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Coffee } from 'lucide-react'

const SLIDES = [
  {
    slogan: 'Thưởng thức từng giọt cảm xúc',
    detail: 'Một khoảng lặng dịu dàng, được pha riêng cho nhịp sống của bạn.',
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1800&q=85',
    position: 'center 55%',
  },
  {
    slogan: 'Nguồn năng lượng thuần khiết mỗi ngày',
    detail: 'Nguyên liệu tươi lành, hương vị cân bằng trong từng thức uống.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85',
    position: 'center 55%',
  },
  {
    slogan: 'Chậm lại một chút, vui hơn mỗi ngày',
    detail: 'Ghé BrewLite và tìm thấy hương vị khiến ngày hôm nay thêm trọn vẹn.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1800&q=85',
    position: 'center 55%',
  },
]

export function HomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % SLIDES.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  function move(offset: number) {
    setActiveIndex((index) => (index + offset + SLIDES.length) % SLIDES.length)
  }

  return (
    <section
      aria-label="Thông điệp BrewLite"
      aria-roledescription="carousel"
      className="relative mx-auto mb-6 max-w-[1600px] overflow-hidden rounded-3xl shadow-[0_12px_35px_rgba(47,45,33,0.12)]"
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <article
            key={slide.slogan}
            aria-roledescription="slide"
            className="relative flex min-h-[270px] min-w-full items-center bg-cover bg-center px-7 py-10 text-white sm:min-h-[330px] sm:px-12"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(33,25,20,.78), rgba(33,25,20,.3)), url("${slide.image}")`, backgroundPosition: slide.position }}
          >
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                <Coffee className="size-3.5" aria-hidden="true" />
                BrewLite · Mỗi ngày một vị ngon
              </p>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{slide.slogan}</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">{slide.detail}</p>
              <button
                type="button"
                onClick={() => document.getElementById('menu-heading')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-6 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#2e2520] shadow-sm transition hover:bg-white/90"
              >
                Khám phá menu
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.slogan}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Xem thông điệp ${index + 1}`}
            aria-current={activeIndex === index}
            className={`h-1.5 rounded-full transition-all ${activeIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'}`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Thông điệp trước"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/35 sm:left-4"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Thông điệp tiếp theo"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/35 sm:right-4"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </section>
  )
}
