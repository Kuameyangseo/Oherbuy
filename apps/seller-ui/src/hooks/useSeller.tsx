import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../utils/axiosinstance';


const fetchSeller = async () => {
    const response = await axiosInstance.get('/api/logged-in-seller');
    return response.data.seller;
}

export const useSeller = () => {
    const {
        data: seller,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['seller'],
        queryFn: fetchSeller,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
    return {seller, isLoading, isError, refetch};
}
export default useSeller;