import React from 'react'
import { X } from 'lucide-react'

const DeleteDiscountCodeModal = ({discount, onClose, onConfirm}: {discount: any, onClose: () => void, onConfirm?: any}) => {
  return (
    <div className='fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center '>
      <div className='bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg '>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-semibold text-white'>Delete Discount Code</h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white'
            >
              <X size={22} />
            </button>
          </div>
          <p className='text-white mb-4'>Are you sure you want to delete the discount code "{discount?.public_name}"?</p>
          <div className='flex justify-end'>
            <button
              onClick={onClose}
              className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mr-2'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
            >
              Delete
            </button>
          </div>
      </div> 
    </div>
  )
}

export default DeleteDiscountCodeModal
