'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { elementsApi, testCasesApi, usersApi } from '@/lib/api';
import { TestCaseFormData, GeneratedTestCase, Role } from '@/types';

export const queryKeys = {
  elements: ['elements'] as const,
  testCases: (elementId: number) => ['testCases', elementId] as const,
  users: ['users'] as const,
};

export function useElements(enabled = true) {
  return useQuery({
    queryKey: queryKeys.elements,
    queryFn: () => elementsApi.getAll(),
    enabled,
  });
}

export function useTestCases(elementId: number | null) {
  return useQuery({
    queryKey: elementId !== null ? queryKeys.testCases(elementId) : ['testCases', 'none'],
    queryFn: () => testCasesApi.getByElement(elementId as number),
    enabled: elementId !== null,
  });
}

export function useCreateElement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => elementsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.elements }),
  });
}

export function useUpdateElement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string | null } }) =>
      elementsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.elements }),
  });
}

export function useDeleteElement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => elementsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.elements }),
  });
}

export function useCreateTestCase(elementId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TestCaseFormData) => {
      if (elementId === null) throw new Error('No element selected');
      return testCasesApi.create(elementId, data);
    },
    onSuccess: () => {
      if (elementId !== null) {
        qc.invalidateQueries({ queryKey: queryKeys.testCases(elementId) });
        qc.invalidateQueries({ queryKey: queryKeys.elements });
      }
    },
  });
}

export function useUpdateTestCase(elementId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TestCaseFormData> }) =>
      testCasesApi.update(id, data),
    onSuccess: () => {
      if (elementId !== null) {
        qc.invalidateQueries({ queryKey: queryKeys.testCases(elementId) });
      }
    },
  });
}

export function useDeleteTestCase(elementId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => testCasesApi.delete(id),
    onSuccess: () => {
      if (elementId !== null) {
        qc.invalidateQueries({ queryKey: queryKeys.testCases(elementId) });
        qc.invalidateQueries({ queryKey: queryKeys.elements });
      }
    },
  });
}

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => usersApi.getAll(),
    enabled,
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => usersApi.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

export function useBulkCreateTestCases(elementId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testCases: GeneratedTestCase[]) => {
      if (elementId === null) throw new Error('No element selected');
      return testCasesApi.bulkCreate(elementId, testCases);
    },
    onSuccess: () => {
      if (elementId !== null) {
        qc.invalidateQueries({ queryKey: queryKeys.testCases(elementId) });
        qc.invalidateQueries({ queryKey: queryKeys.elements });
      }
    },
  });
}
