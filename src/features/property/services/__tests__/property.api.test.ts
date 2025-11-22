/**
 * Tests unitaires pour property.api.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { propertyApi } from '../property.api';
import { supabase } from '@/services/supabase/client';

// Mock Supabase
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('propertyApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all properties without filters', async () => {
      const mockProperties = [
        { id: '1', title: 'Appartement 1', price: 100000 },
        { id: '2', title: 'Appartement 2', price: 200000 },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockProperties, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const result = await propertyApi.getAll();

      expect(supabase.from).toHaveBeenCalledWith('properties');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(mockProperties);
      expect(result.error).toBeNull();
    });

    it('should fetch properties with city filter', async () => {
      const mockProperties = [
        { id: '1', title: 'Appartement Abidjan', city: 'Abidjan' },
      ];

      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProperties, error: null }),
      };
      chainMock.select.mockReturnValue(chainMock);
      chainMock.eq.mockReturnValue(chainMock);

      (supabase.from as any).mockReturnValue(chainMock);

      const result = await propertyApi.getAll({ city: 'Abidjan' });

      expect(chainMock.eq).toHaveBeenCalledWith('city', 'Abidjan');
      expect(result.data).toEqual(mockProperties);
    });

    it('should fetch properties with price range filter', async () => {
      const mockProperties = [
        { id: '1', title: 'Appartement', price: 150000 },
      ];

      const chainMock = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProperties, error: null }),
      };
      chainMock.select.mockReturnValue(chainMock);
      chainMock.gte.mockReturnValue(chainMock);
      chainMock.lte.mockReturnValue(chainMock);

      (supabase.from as any).mockReturnValue(chainMock);

      const result = await propertyApi.getAll({ minPrice: 100000, maxPrice: 200000 });

      expect(chainMock.gte).toHaveBeenCalledWith('price', 100000);
      expect(chainMock.lte).toHaveBeenCalledWith('price', 200000);
      expect(result.data).toEqual(mockProperties);
    });
  });

  describe('getById', () => {
    it('should fetch a property by ID', async () => {
      const mockProperty = { id: '1', title: 'Appartement 1', price: 100000 };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProperty, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await propertyApi.getById('1');

      expect(supabase.from).toHaveBeenCalledWith('properties');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockProperty);
    });

    it('should throw error when property not found', async () => {
      const mockError = new Error('Property not found');

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      await expect(propertyApi.getById('999')).rejects.toThrow('Property not found');
    });
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const newProperty = {
        title: 'Nouveau Appartement',
        type: 'apartment' as const,
        price: 150000,
        city: 'Abidjan',
        address: '123 Rue Test',
        area: 75,
      };

      const createdProperty = { id: '1', ...newProperty };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: createdProperty, error: null });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await propertyApi.create(newProperty);

      expect(supabase.from).toHaveBeenCalledWith('properties');
      expect(mockInsert).toHaveBeenCalledWith(newProperty);
      expect(result.data).toEqual(createdProperty);
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const updates = { price: 180000, status: 'available' as const };
      const updatedProperty = { id: '1', title: 'Appartement 1', ...updates };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedProperty, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await propertyApi.update('1', updates);

      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result.data).toEqual(updatedProperty);
    });
  });

  describe('delete', () => {
    it('should delete a property', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await propertyApi.delete('1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result.error).toBeNull();
    });
  });

  describe('search', () => {
    it('should search properties by term', async () => {
      const searchTerm = 'Cocody';
      const mockProperties = [
        { id: '1', title: 'Appartement Cocody', city: 'Abidjan' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOr = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockProperties, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        eq: mockEq,
        order: mockOrder,
      });

      const result = await propertyApi.search(searchTerm);

      expect(mockOr).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('status', 'available');
      expect(result.data).toEqual(mockProperties);
    });
  });

  describe('count', () => {
    it('should count properties', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ count: 42, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await propertyApi.count();

      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(result.data).toBe(42);
    });

    it('should count properties with filters', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
      };
      chainMock.select.mockReturnValue(chainMock);
      chainMock.eq.mockReturnValue(chainMock);

      (supabase.from as any).mockReturnValue(chainMock);

      const result = await propertyApi.count({ city: 'Abidjan', status: 'available' });

      expect(chainMock.eq).toHaveBeenCalledWith('city', 'Abidjan');
      expect(chainMock.eq).toHaveBeenCalledWith('status', 'available');
      expect(result.data).toBe(10);
    });
  });
});

