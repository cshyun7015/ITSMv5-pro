import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customerApi';
import { CustomerCompany, CustomerTeam } from '../types/customerType';

/**
 * 고객 조직 관리용 Mutation 훅
 * - 생성, 수정 작업 후 관련 쿼리 무효화 담당
 */
export const useCustomerMutations = () => {
  const queryClient = useQueryClient();

  // --- Company Mutations ---
  const createCompany = useMutation({
    mutationFn: (company: Partial<CustomerCompany>) => customerApi.createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, company }: { id: number; company: Partial<CustomerCompany> }) => 
      customerApi.updateCompany(id, company),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
    },
  });

  // --- Team Mutations ---
  const createTeam = useMutation({
    mutationFn: ({ companyId, team }: { companyId: number; team: Partial<CustomerTeam> }) => 
      customerApi.createTeam(companyId, team),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orgTree', variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ['teamsByCompany', variables.companyId] });
    },
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, team }: { id: number; team: Partial<CustomerTeam> }) => 
      customerApi.updateTeam(id, team),
    onSuccess: (_, variables) => {
      // Team update impacts both the detail and the tree it belongs to
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
      // To be safe, invalidate all orgTrees or find a way to track companyId
      queryClient.invalidateQueries({ queryKey: ['orgTree'] });
    },
  });

  return {
    createCompany,
    updateCompany,
    createTeam,
    updateTeam,
  };
};
