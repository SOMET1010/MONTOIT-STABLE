/**
 * Tests d'intégration pour useProperties
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProperties, useProperty, useCreateProperty } from '../useProperties';
import { propertyApi } from '../../services/property.api';
import type { ReactNode } from 'react';

// Mock propertyApi
vi.mock('../../services/property.api', () => ({
  propertyApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

// Helper pour créer un wrapper avec QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProperties', () => {
    it('should fetch all properties', async () => {
      const mockProperties = [
        { id: '1', title: 'Appartement 1', price: 100000 },
        { id: '2', title: 'Appartement 2', price: 200000 },
      ];

      vi.mocked(propertyApi.getAll).mockResolvedValue({
        data: mockProperties,
        error: null,
      });

      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(propertyApi.getAll).toHaveBeenCalled();
      expect(result.current.data?.data).toEqual(mockProperties);
    });

    it('should fetch properties with filters', async () => {
      const filters = { city: 'Abidjan', status: 'available' };
      const mockProperties = [
        { id: '1', title: 'Appartement Abidjan', city: 'Abidjan' },
      ];

      vi.mocked(propertyApi.getAll).mockResolvedValue({
        data: mockProperties,
        error: null,
      });

      const { result } = renderHook(() => useProperties(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(propertyApi.getAll).toHaveBeenCalledWith(filters);
      expect(result.current.data?.data).toEqual(mockProperties);
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch properties');

      vi.mocked(propertyApi.getAll).mockRejectedValue(error);

      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useProperty', () => {
    it('should fetch a property by ID', async () => {
      const propertyId = '123';
      const mockProperty = { id: propertyId, title: 'Appartement Test', price: 150000 };

      vi.mocked(propertyApi.getById).mockResolvedValue({
        data: mockProperty,
        error: null,
      });

      const { result } = renderHook(() => useProperty(propertyId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(propertyApi.getById).toHaveBeenCalledWith(propertyId);
      expect(result.current.data?.data).toEqual(mockProperty);
    });

    it('should not fetch when ID is undefined', async () => {
      const { result } = renderHook(() => useProperty(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(propertyApi.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateProperty', () => {
    it('should create a property', async () => {
      const newProperty = {
        title: 'Nouveau Appartement',
        type: 'apartment' as const,
        price: 150000,
        city: 'Abidjan',
        address: '123 Rue Test',
        area: 75,
      };

      const createdProperty = { id: '1', ...newProperty };

      vi.mocked(propertyApi.create).mockResolvedValue({
        data: createdProperty,
        error: null,
      });

      const { result } = renderHook(() => useCreateProperty(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newProperty);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(propertyApi.create).toHaveBeenCalledWith(newProperty);
      expect(result.current.data?.data).toEqual(createdProperty);
    });

    it('should handle creation errors', async () => {
      const newProperty = {
        title: 'Nouveau Appartement',
        type: 'apartment' as const,
        price: 150000,
        city: 'Abidjan',
        address: '123 Rue Test',
        area: 75,
      };

      const error = new Error('Failed to create property');

      vi.mocked(propertyApi.create).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateProperty(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newProperty);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });
});

