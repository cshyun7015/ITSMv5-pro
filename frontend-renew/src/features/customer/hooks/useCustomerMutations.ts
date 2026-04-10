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

  // --- Delete Mutations ---
  const deleteCompany = useMutation({
    mutationFn: ({ id, hardDelete }: { id: number; hardDelete: boolean }) => 
      customerApi.deleteCompany(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: ({ id, hardDelete }: { id: number; hardDelete: boolean }) => 
      customerApi.deleteTeam(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgTree'] });
    },
  });

  // --- User Mutations ---
  const createUser = useMutation({
    mutationFn: ({ teamId, user }: { teamId: number; user: any }) => 
      customerApi.createUser(teamId, user),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teamUsers', variables.teamId] });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, user }: { id: number; user: any }) => 
      customerApi.updateUser(id, user),
    onSuccess: (_, variables) => {
      // Since we don't always have the teamId here, we can invalidate all teamUsers or specific one if passed
      queryClient.invalidateQueries({ queryKey: ['teamUsers'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => customerApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamUsers'] });
    },
  });

  return {
    createCompany,
    updateCompany,
    createTeam,
    updateTeam,
    deleteCompany,
    deleteTeam,
    createUser,
    updateUser,
    deleteUser,
  };
};
