import { useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorApi } from '../api/operatorApi';
import { OperatorCompany, OperatorTeam, Operator } from '../types/operatorType';

/**
 * Operator Management Mutation Hooks
 * - Handles synchronization of React Query cache after CRUD operations
 */
export const useOperatorMutations = () => {
  const queryClient = useQueryClient();

  // --- Company Mutations ---
  const createCompany = useMutation({
    mutationFn: (company: Partial<OperatorCompany>) => operatorApi.createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operatorCompanies'] });
    },
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, company }: { id: number; company: Partial<OperatorCompany> }) => 
      operatorApi.updateCompany(id, company),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operatorCompanies'] });
      queryClient.invalidateQueries({ queryKey: ['operatorCompany', variables.id] });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: ({ id, hardDelete }: { id: number; hardDelete: boolean }) => 
      operatorApi.deleteCompany(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operatorCompanies'] });
    },
  });

  // --- Team Mutations ---
  const createTeam = useMutation({
    mutationFn: ({ companyId, team }: { companyId: number; team: Partial<OperatorTeam> }) => 
      operatorApi.createTeam(companyId, team),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operatorTeams', variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ['operatorOrgTree', variables.companyId] });
    },
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, team }: { id: number; team: Partial<OperatorTeam> }) => 
      operatorApi.updateTeam(id, team),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operatorTeams'] });
      queryClient.invalidateQueries({ queryKey: ['operatorTeam', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['operatorOrgTree'] });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: ({ id, hardDelete }: { id: number; hardDelete: boolean }) => 
      operatorApi.deleteTeam(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operatorTeams'] });
      queryClient.invalidateQueries({ queryKey: ['operatorOrgTree'] });
    },
  });

  // --- Operator Mutations ---
  const createOperator = useMutation({
    mutationFn: ({ teamId, operator }: { teamId: number; operator: Partial<Operator> }) => 
      operatorApi.createOperator(teamId, operator),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teamOperators', variables.teamId] });
    },
  });

  const updateOperator = useMutation({
    mutationFn: ({ id, operator }: { id: number; operator: Partial<Operator> }) => 
      operatorApi.updateOperator(id, operator),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teamOperators'] });
      queryClient.invalidateQueries({ queryKey: ['operator', variables.id] });
    },
  });

  const deleteOperator = useMutation({
    mutationFn: ({ id, hardDelete }: { id: number; hardDelete: boolean }) => 
      operatorApi.deleteOperator(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamOperators'] });
    },
  });

  // --- Team-Customer Mapping Mutation ---
  const saveMappings = useMutation({
    mutationFn: ({ teamId, customerIds }: { teamId: number; customerIds: number[] }) => 
      operatorApi.saveMappings(teamId, customerIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teamMappings', variables.teamId] });
    },
  });

  return {
    createCompany,
    updateCompany,
    deleteCompany,
    createTeam,
    updateTeam,
    deleteTeam,
    createOperator,
    updateOperator,
    deleteOperator,
    saveMappings,
  };
};
