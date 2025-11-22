/**
 * Feature: contract
 * 
 * Exports publics de la feature contract
 */

// Pages

// Components
export { default as ContractAnnexes } from './components/ContractAnnexes';
export { default as ContractPreview } from './components/ContractPreview';

// Hooks
export { useContract } from './hooks/useContract';
export { useLeases, useLease, useCreateLease, useUpdateLease, useDeleteLease } from './hooks/useLeases';

// Services
export { contractApi } from './services/contract.api';

// Types
export type {
  Lease,
  LeaseInsert,
  LeaseUpdate,
  LeaseWithDetails,
  ContractFormData,
  SignatureData,
  LeaseStatus,
  LeaseStats,
  LeaseFilters,
  ContractClause,
  ContractTemplate,
  SignatureRole,
  SignatureStatus
} from './types';
