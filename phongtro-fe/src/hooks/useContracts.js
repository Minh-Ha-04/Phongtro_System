import { useQuery } from '@tanstack/react-query';
import { contractService } from '../api/contractService';

export const useContracts = () => {
  const query = useQuery({
    queryKey: ["contracts"],
    queryFn: contractService.getAll,
  });

  const getActiveContractByRoom = (roomId) => {
    const contracts = query.data?.data || [];
    const now = new Date().toISOString().slice(0,10);

    return contracts.find(
      c =>
        c.roomId === roomId &&
        c.status === 'ACTIVE' &&
        c.startDate <= now &&
        c.endDate >= now
    );
  };

  return { ...query, getActiveContractByRoom };
};