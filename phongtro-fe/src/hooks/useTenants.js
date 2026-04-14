import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../api/tenantService';

export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.getAll,
  });
};