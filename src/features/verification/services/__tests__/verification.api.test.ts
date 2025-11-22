/**
 * Tests unitaires pour verification.api.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { verificationApi } from '../verification.api';
import { supabase } from '@/services/supabase/client';

// Mock Supabase
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('verificationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should fetch verification data for a user', async () => {
      const userId = 'user-123';
      const mockVerification = {
        id: 'verif-1',
        user_id: userId,
        oneci_status: 'verifie',
        cnam_status: 'verifie',
        face_verification_status: 'verifie',
        identity_verified: true,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockVerification, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await verificationApi.getByUserId(userId);

      expect(supabase.from).toHaveBeenCalledWith('user_verifications');
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(result.data).toEqual(mockVerification);
    });

    it('should return null when no verification exists', async () => {
      const userId = 'user-456';

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await verificationApi.getByUserId(userId);

      expect(result.data).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new verification entry', async () => {
      const verificationData = {
        user_id: 'user-123',
        oneci_status: 'en_attente' as const,
        cnam_status: 'en_attente' as const,
        face_verification_status: 'en_attente' as const,
      };

      const createdVerification = { id: 'verif-1', ...verificationData };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: createdVerification, error: null });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await verificationApi.create(verificationData);

      expect(mockInsert).toHaveBeenCalledWith(verificationData);
      expect(result.data).toEqual(createdVerification);
    });
  });

  describe('updateOneciStatus', () => {
    it('should update ONECI verification status', async () => {
      const userId = 'user-123';
      const status = 'verifie' as const;
      const documentUrl = 'https://example.com/oneci.pdf';
      const oneciNumber = 'CI123456789';

      const updatedVerification = {
        user_id: userId,
        oneci_status: status,
        oneci_document_url: documentUrl,
        oneci_number: oneciNumber,
      };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedVerification, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await verificationApi.updateOneciStatus(
        userId,
        status,
        documentUrl,
        oneciNumber
      );

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(result.data).toEqual(updatedVerification);
    });

    it('should update ONECI status with rejection reason', async () => {
      const userId = 'user-123';
      const status = 'rejete' as const;
      const rejectionReason = 'Document illisible';

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      await verificationApi.updateOneciStatus(
        userId,
        status,
        undefined,
        undefined,
        rejectionReason
      );

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('markAsVerified', () => {
    it('should mark user as verified in both tables', async () => {
      const userId = 'user-123';

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      await verificationApi.markAsVerified(userId);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from).toHaveBeenCalledWith('user_verifications');
    });
  });

  describe('isFullyVerified', () => {
    it('should return true when all verifications are complete', async () => {
      const userId = 'user-123';
      const mockVerification = {
        oneci_status: 'verifie',
        face_verification_status: 'verifie',
        identity_verified: true,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockVerification, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await verificationApi.isFullyVerified(userId);

      expect(result.data).toBe(true);
    });

    it('should return false when verifications are incomplete', async () => {
      const userId = 'user-123';
      const mockVerification = {
        oneci_status: 'verifie',
        face_verification_status: 'en_attente',
        identity_verified: false,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockVerification, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await verificationApi.isFullyVerified(userId);

      expect(result.data).toBe(false);
    });

    it('should return false when no verification data exists', async () => {
      const userId = 'user-456';

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await verificationApi.isFullyVerified(userId);

      expect(result.data).toBe(false);
    });
  });

  describe('getPending', () => {
    it('should fetch all pending verifications', async () => {
      const mockVerifications = [
        { id: 'verif-1', oneci_status: 'en_attente' },
        { id: 'verif-2', cnam_status: 'en_attente' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOr = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockVerifications, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        order: mockOrder,
      });

      const result = await verificationApi.getPending();

      expect(mockOr).toHaveBeenCalled();
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(mockVerifications);
    });
  });

  describe('countPending', () => {
    it('should count pending verifications', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOr = vi.fn().mockResolvedValue({ count: 15, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        or: mockOr,
      });

      const result = await verificationApi.countPending();

      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(result.data).toBe(15);
    });
  });
});

