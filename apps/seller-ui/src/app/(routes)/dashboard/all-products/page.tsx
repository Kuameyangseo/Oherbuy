'use client'
import React from 'react'

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'


import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from 'lucide-react'

import Link from 'next/link';
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; 
import toast from 'react-hot-toast';
import Image from 'next/image';

const fetchProducts = async () => {
  const response = await axiosInstance.get('/product/api/get-shop-products');
  return response.data?.products ?? [];
}
const ProductList = () => {

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>();
  const queryClient = useQueryClient();

  const handleConfirmDelete = async () => {
    if (!selectedProduct?.id) return;
    try {
      await axiosInstance.delete(`/product/api/delete-product/${selectedProduct.id}`);
      toast.success('Product deleted');
      setShowDeleteModal(false);
      setSelectedProduct(undefined);
      // refresh products
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    } catch (err: any) {
      console.error('Failed to delete product', err);
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    }
  }

  const { data: products = [], isLoading, } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const columns = React.useMemo(
    () => [{
      accessorKey: 'images',
      header: 'Image',
      cell: ({row}: any) => {
        const imageUrl = row.original.images?.[0]?.url ?? '';
        const isImageKit = typeof imageUrl === 'string' && imageUrl.includes('ik.imagekit.io');
        return (
          <Image
            src={imageUrl || '/images/placeholder.svg'}
            alt={imageUrl ? imageUrl : 'product image'}
            width={200}
            height={200}
            className='w-12 h-12 rounded-md object-cover'
            unoptimized={isImageKit}
          />
        )
      }
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({row}: any) => {
        const truncatedTitle =
          row.original.title.length > 30
            ? `${row.original.title.slice(0, 30)}...`
            : row.original.title;
        return (
          <Link 
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`} 
            className='text-blue-600 hover:underline'
            title={row.original.title}
            >
            {truncatedTitle}
          </Link>
        )
      }
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({row}: any) => (
        <span className='text-white'>${row.original.sale_price}</span>
      )
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({row}: any) => (
        <span
          className={row.original.stock > 0 ? 'text-red-600' : 'text-white'}
        >
          {row.original.stock} left
        </span>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({row}: any) => (
        <span className='text-white'>{row.original.category || 'N/A'}</span>
      )
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({row}: any) => (
        <div className='flex items-center gap-1 text-yellow-400'>
          <Star fill='#fde047' size={18} />{""}
          <span className='text-white'>{row.original.rating || 5}</span>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({row}: any) => (
        <div className='flex justify-center items-center'>
          <Link 
            href={`/product/${row.original.id}`} 
            className='text-blue-600 hover:text-blue-300 transition-colors duration-200'
            >
            <Eye size={16} />
          </Link>
          <Link
            href={`/dashboard/edit/${row.original.id}`}
            className='text-yellow-600 hover:text-yellow-300 transition-colors duration-200 mx-4'
          >
            <Pencil size={16} />
          </Link>
         <button
         className='text-green-600 hover:text-green-300 transition mr-4 '
         >
          <BarChart size={16} />
         </button>
         <button
         className='text-red-600 hover:text-red-300 transition'
          onClick={() => {
            setSelectedProduct(row.original);
            setShowDeleteModal(true);
          }}
         >
          <Trash size={16} />
         </button>
        </div>
      )
    },
  ], []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className='w-full min-h-screen p-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold text-white'>All Products</h1>
        <Link 
          href="/dashboard/create-product" 
          className="text-blue-600 flex justify-center items-center hover:underline"
          >
          <Plus size={16} /> Add Product
        </Link>
      </div>
      <div className='flex items-center mb-4'>
        <Link
          href={"/dashboard"}
          className='text-blue-400 cursor-pointer'
        >
          Dashboard
        </Link>
        <ChevronRight size={16} className='mx-2 text-white' />
        <span className='text-white'>All Products</span>
      </div>
      <div
    className='mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1'
      >
        <Search size={16} className='text-gray-400 mr-2' />
        <input 
          type="text"
          placeholder='Search product...'
          className='w-full bg-transparent text-white outline-none'
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          />
      </div>
      <div className='overflow-x-auto bg-gray-900 rounded-lg p-4'>
        {isLoading ? (
          <div className='text-white'>Loading...</div>
        ) : (
          <table className='w-full table-auto'>
          <thead 
          className='bg-red-500'
          >
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr 
                key={headerGroup.id}
                className='border-b border-gray-800 text-white'
              >
                {headerGroup.headers.map((header: any) => (
                  <th 
                    key={header.id}
                    className='text-left py-2 px-4 text-white'
                  >
                    {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-gray-800'>
            {table.getRowModel().rows.map((row: any) => (
              <tr 
                key={row.id}>
                {row.getVisibleCells().map((cell: any) => (
                  <td 
                  className='text-white py-2 px-4'
                    key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
        )}
      </div>
      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black opacity-50' onClick={() => setShowDeleteModal(false)} />
          <div className='bg-gray-800 p-6 rounded-md z-10 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-white mb-2'>Delete product</h3>
            <p className='text-sm text-gray-300 mb-4'>Are you sure you want to delete <strong className='text-white'>{selectedProduct?.title}</strong>? This action can be undone by restoring the product.</p>
            <div className='flex justify-end gap-3'>
              <button onClick={() => setShowDeleteModal(false)} className='px-4 py-2 bg-gray-700 text-white rounded-md'>Cancel</button>
              <button onClick={handleConfirmDelete} className='px-4 py-2 bg-red-600 text-white rounded-md'>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
