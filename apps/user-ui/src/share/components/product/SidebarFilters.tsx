"use client"
import React from 'react'

type Props = {
  categories: string[]
  subcategories: string[]
  selectedCategory: string
  onSelectCategory: (c: string) => void
  selectedSubcategory: string
  onSelectSubcategory: (s: string) => void
  colors: string[]
  selectedColors: string[]
  toggleColor: (c: string) => void
  sizes: string[]
  selectedSizes: string[]
  toggleSize: (s: string) => void
  onClear: () => void
}

export default function SidebarFilters({
  categories,
  subcategories,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  colors,
  selectedColors,
  toggleColor,
  sizes,
  selectedSizes,
  toggleSize,
  onClear
}: Props) {
  return (
    <aside className="w-full md:w-64 text-black">
      <div className="bg-white p-4 rounded-md">
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          <ul className="flex flex-col gap-2">
            {categories.map((c) => (
              <li key={c}>
                <button
                  className={`text-left w-full px-2 py-1 rounded ${selectedCategory === c ? 'bg-white text-violet-900' : 'hover:bg-white/10'}`}
                  onClick={() => onSelectCategory(c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Subcategory</h4>
          <select value={selectedSubcategory} onChange={(e) => onSelectSubcategory(e.target.value)} className="w-full rounded-md p-2 bg-white/5">
            {subcategories.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Color</h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const active = selectedColors.includes(c)
              return (
                <button key={c} onClick={() => toggleColor(c)} className={`px-2 py-1 rounded text-sm ${active ? 'bg-white text-violet-900' : 'bg-white/10'}`}>
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Size</h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const active = selectedSizes.includes(s)
              return (
                <button key={s} onClick={() => toggleSize(s)} className={`px-2 py-1 rounded text-sm ${active ? 'bg-white text-violet-900' : 'bg-white/10'}`}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClear} className="flex-1 bg-white/10 rounded px-3 py-2">Clear</button>
        </div>
      </div>
    </aside>
  )
}
