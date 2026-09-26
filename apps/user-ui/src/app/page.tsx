'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Hero from '../share/widget/hero-templates/hero'
import ProductList from '../share/widget/product-ui/productList'
import ProductGallary from '../share/widget/productgallary/productgallary'
import { useUser } from '../hooks/useUser'

const page = () => {
  const { user, isLoading } = useUser()
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)

  useEffect(() => {
    if (!isLoading && user === null) {
      const promptWasShown = sessionStorage.getItem('home-sign-in-prompt-shown')

      if (!promptWasShown) {
        sessionStorage.setItem('home-sign-in-prompt-shown', 'true')
        setShowSignInPrompt(true)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSignInPrompt(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isLoading, user])

  return (
    <div>
      <Hero />
      <ProductList />
      <ProductGallary />

      {showSignInPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSignInPrompt(false)
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-in-prompt-title"
          >
            <h2 id="sign-in-prompt-title" className="text-2xl font-semibold text-gray-900">
              Sign in to continue
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to get the best experience and keep track of your orders.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Create account
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowSignInPrompt(false)}
              className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
            >
              Continue as guest
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 

export default page