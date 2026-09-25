import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../utils/axiosinstance';

const fetchAllProducts = async () => {
  const res = await axiosInstance.get('/api/products');
  return res.data.products as any[];
};

const useSellerProducts = (shopId?: string | null) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['seller-products', shopId],
    queryFn: async () => {
      const all = await fetchAllProducts();
      if (!shopId) return [];
      return all.filter((p: any) => p.shopId === shopId || p.shops?.id === shopId || p.shops?.id === p.shopId);
    },
    enabled: !!shopId,
    staleTime: 2 * 60 * 1000,
  });

  return {products: data ?? [], isLoading, isError, refetch};
};

export default useSellerProducts;
