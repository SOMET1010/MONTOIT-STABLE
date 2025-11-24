import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PaymentRepository } from '@/api/repositories/paymentRepository';
import { logger } from '@/shared/lib/logger';
import type {
  Payment,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  MobileMoneyProvider,
  PaymentCalculation,
  PaymentError,
} from '@/shared/types/payment.types';

const paymentRepo = new PaymentRepository();

interface PaymentState {
  // Current payment flow
  currentPayment: PaymentResponse | null;
  paymentInProgress: boolean;
  paymentError: PaymentError | null;

  // Payment history
  payments: Payment[];
  paymentsFetching: boolean;

  // Selected payment details (for form)
  selectedProvider: MobileMoneyProvider | null;
  phoneNumber: string;
  amount: number;
  calculation: PaymentCalculation | null;

  // Actions
  setProvider: (provider: MobileMoneyProvider) => void;
  setPhoneNumber: (phone: string) => void;
  setAmount: (amount: number) => void;
  calculateFees: () => void;

  initiatePayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  checkPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
  cancelPayment: (paymentId: string) => Promise<void>;

  fetchPaymentHistory: (tenantId: string) => Promise<void>;
  clearCurrentPayment: () => void;
  clearError: () => void;
  reset: () => void;
}

const PROVIDER_FEES = {
  orange_money: 1.5,
  mtn_money: 1.5,
  moov_money: 1.2,
  wave: 1.0,
};

const PLATFORM_FEE_PERCENTAGE = 5;

export const usePaymentStore = create<PaymentState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentPayment: null,
        paymentInProgress: false,
        paymentError: null,
        payments: [],
        paymentsFetching: false,
        selectedProvider: null,
        phoneNumber: '',
        amount: 0,
        calculation: null,

        // Set provider
        setProvider: (provider: MobileMoneyProvider) => {
          set({ selectedProvider: provider });
          get().calculateFees();
        },

        // Set phone number
        setPhoneNumber: (phone: string) => {
          set({ phoneNumber: phone });
        },

        // Set amount
        setAmount: (amount: number) => {
          set({ amount });
          get().calculateFees();
        },

        // Calculate fees
        calculateFees: () => {
          const { amount, selectedProvider } = get();

          if (!amount || !selectedProvider) {
            set({ calculation: null });
            return;
          }

          const providerFeeRate = PROVIDER_FEES[selectedProvider];
          const providerFee = (amount * providerFeeRate) / 100;
          const totalAmount = amount + providerFee;
          const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
          const landlordAmount = amount - platformFee;

          set({
            calculation: {
              baseAmount: amount,
              providerFee,
              platformFee,
              totalAmount,
              landlordAmount,
            },
          });
        },

        // Initiate payment
        initiatePayment: async (request: PaymentRequest) => {
          set({ paymentInProgress: true, paymentError: null });

          try {
            logger.info('Initiating payment', { provider: request.provider, amount: request.amount });

            const response = await paymentRepo.initiatePayment(request);

            set({ currentPayment: response, paymentInProgress: false });
            logger.info('Payment initiated successfully', { paymentId: response.paymentId });
            return response;
          } catch (error) {
            logger.error('Payment initiation failed', error);

            const paymentError: PaymentError = {
              code: 'UNKNOWN_ERROR',
              message:
                error instanceof Error
                  ? error.message
                  : 'Erreur lors du paiement',
              retryable: true,
            };

            set({ paymentError, paymentInProgress: false });
            throw paymentError;
          }
        },

        // Check payment status
        checkPaymentStatus: async (paymentId: string) => {
          try {
            logger.info('Checking payment status', { paymentId });

            const status = await paymentRepo.checkPaymentStatus(paymentId);

            if (get().currentPayment?.paymentId === paymentId) {
              set({
                currentPayment: {
                  ...get().currentPayment!,
                  status,
                },
              });
            }

            return status;
          } catch (error) {
            logger.error('Error checking payment status', error, { paymentId });
            return 'failed';
          }
        },

        // Cancel payment
        cancelPayment: async (paymentId: string) => {
          try {
            logger.info('Cancelling payment', { paymentId });

            await paymentRepo.cancelPayment(paymentId);

            if (get().currentPayment?.paymentId === paymentId) {
              set({
                currentPayment: {
                  ...get().currentPayment!,
                  status: 'cancelled',
                },
                paymentInProgress: false,
              });
            }

            logger.info('Payment cancelled successfully', { paymentId });
          } catch (error) {
            logger.error('Error cancelling payment', error, { paymentId });
            throw error;
          }
        },

        // Fetch payment history
        fetchPaymentHistory: async (tenantId: string) => {
          set({ paymentsFetching: true });

          try {
            logger.info('Fetching payment history', { tenantId });

            const payments = await paymentRepo.getPaymentsByTenant(tenantId);

            set({ payments, paymentsFetching: false });
            logger.info('Payment history fetched', { count: payments.length });
          } catch (error) {
            logger.error('Error fetching payment history', error, { tenantId });
            set({ paymentsFetching: false });
          }
        },

        // Clear current payment
        clearCurrentPayment: () => {
          set({
            currentPayment: null,
            paymentInProgress: false,
            paymentError: null,
          });
        },

        // Clear error
        clearError: () => {
          set({ paymentError: null });
        },

        // Reset store
        reset: () => {
          set({
            currentPayment: null,
            paymentInProgress: false,
            paymentError: null,
            selectedProvider: null,
            phoneNumber: '',
            amount: 0,
            calculation: null,
          });
        },
      }),
      {
        name: 'payment-storage',
        partialize: (state) => ({
          payments: state.payments,
        }),
      }
    ),
    { name: 'PaymentStore' }
  )
);
