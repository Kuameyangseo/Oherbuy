import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../utils/axiosinstance';


const fetchUser = async () => {
    const response = await axiosInstance.get('/api/logged-in-user');
    // normalize to null when no user is returned to avoid React Query "undefined" errors
    return response.data?.user ?? null;
}

export const useUser = () => {
    const {
        data: user,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        // Prevent automatic refetches on window focus/mount/reconnect to avoid
        // repeated calls that can hit server rate limits (429) in dev.
        refetchOnWindowFocus: false,
        // Allow a refetch when components mount so the UI reflects the
        // current auth/user state after redirects (OAuth) or navigation.
        refetchOnMount: true,
        refetchOnReconnect: false,
    });
    return {user, isLoading, isError, refetch};
}
export default useUser;