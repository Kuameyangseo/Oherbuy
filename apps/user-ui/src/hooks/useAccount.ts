import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../utils/axiosinstance'

const fetchAccount = async () => {
  const res = await axiosInstance.get('/api/accounts/me')
  return res.data?.account ?? null
}

const useAccount = () => {
  const { data: account, isLoading, isError } = useQuery({
    queryKey: ['account'],
    queryFn: fetchAccount,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    // Keep window-focus/reconnect refetches off to reduce noise,
    // but allow a refetch when the component mounts so the UI
    // reflects the current auth state after redirects (OAuth).
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  })

  return { account, isLoading, isError }
}

export default useAccount
