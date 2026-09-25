"use client"
import React from 'react'

type Props = {
  categories: string[]
  selected: string
  onSelect: (c: string) => void
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`px-3 py-1 rounded-md text-sm ${selected === c ? 'bg-white text-violet-900' : 'bg-white/10 text-white/90'}`}>
          {c}
        </button>
      ))}
    </div>
  )
}
