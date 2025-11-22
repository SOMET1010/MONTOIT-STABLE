import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { supabase } from "@/services/supabase/client";

/**
 * Hook pour vérifier si un feature flag est activé
 * 
 * @param flagKey - Clé du feature flag à vérifier
 * @param options - Options de configuration
 * @returns Object contenant l'état du flag et les métadonnées
 * 
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useFeatureFlag('oneci_verification');
 * 
 * if (isLoading) return <Skeleton />;
 * 
 * return (
 *   <div>
 *     {isEnabled ? (
 *       <ONECIVerification />
 *     ) : (
 *       <ManualVerification />
 *     )}
 *   </div>
 * );
 * ```
 */
export function useFeatureFlag(
  flagKey: string,
  options: {
    /**
     * Si true, le hook retournera toujours false sans faire d'appel API
     * Utile pour désactiver temporairement une fonctionnalité côté client
     */
    forceDisabled?: boolean;
    /**
     * Si true, le hook retournera toujours true sans faire d'appel API
     * Utile pour forcer l'activation en développement
     */
    forceEnabled?: boolean;
    /**
     * Intervalle de rafraîchissement en ms (défaut: pas de rafraîchissement)
     */
    refetchInterval?: number;
  } = {}
) {
  const { forceDisabled = false, forceEnabled = false, refetchInterval } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["feature-flag", flagKey],
    queryFn: async () => {
      // Si forcé, ne pas faire d'appel API
      if (forceDisabled) return { enabled: false, key: flagKey };
      if (forceEnabled) return { enabled: true, key: flagKey };

      const { data: { session } } = await supabase.auth.getSession();
      
      // Si pas de session, vérifier quand même le flag (certains flags sont publics)
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-feature-flag?key=${flagKey}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to check feature flag");
      }

      return response.json();
    },
    enabled: !forceDisabled && !forceEnabled,
    refetchInterval,
    // Cache pendant 5 minutes par défaut
    staleTime: 5 * 60 * 1000,
  });

  return {
    /**
     * True si le feature flag est activé pour l'utilisateur courant
     */
    isEnabled: forceEnabled || (data?.enabled ?? false),
    /**
     * True pendant le chargement
     */
    isLoading: !forceDisabled && !forceEnabled && isLoading,
    /**
     * Erreur éventuelle
     */
    error,
    /**
     * Fonction pour forcer le rafraîchissement du flag
     */
    refetch,
    /**
     * Clé du flag
     */
    key: flagKey,
  };
}

/**
 * Hook pour vérifier plusieurs feature flags en une seule fois
 * 
 * @param flagKeys - Array de clés de feature flags
 * @returns Object avec l'état de chaque flag
 * 
 * @example
 * ```tsx
 * const flags = useFeatureFlags(['oneci_verification', 'cryptoneo_signature', 'intouch_payment']);
 * 
 * return (
 *   <div>
 *     {flags.oneci_verification.isEnabled && <ONECIVerification />}
 *     {flags.cryptoneo_signature.isEnabled && <CryptoNeoSignature />}
 *     {flags.intouch_payment.isEnabled && <InTouchPayment />}
 *   </div>
 * );
 * ```
 */
export function useFeatureFlags(flagKeys: string[]) {
  const flags = flagKeys.reduce((acc, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    acc[key] = useFeatureFlag(key);
    return acc;
  }, {} as Record<string, ReturnType<typeof useFeatureFlag>>);

  return flags;
}

/**
 * Hook pour obtenir tous les feature flags d'une catégorie
 * 
 * @param category - Catégorie des feature flags
 * @returns Array de feature flags
 * 
 * @example
 * ```tsx
 * const { flags, isLoading } = useFeatureFlagsByCategory('payment');
 * 
 * return (
 *   <div>
 *     <h2>Méthodes de paiement disponibles:</h2>
 *     {flags?.filter(f => f.is_enabled).map(flag => (
 *       <PaymentMethod key={flag.key} method={flag.key} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useFeatureFlagsByCategory(category: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["feature-flags-category", category],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-feature-flags?category=${category}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch feature flags");

      const result = await response.json();
      return result.flags;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    flags: data,
    isLoading,
    error,
  };
}

/**
 * Composant wrapper pour afficher du contenu conditionnel selon un feature flag
 * 
 * @example
 * ```tsx
 * <FeatureFlag flag="oneci_verification">
 *   <ONECIVerification />
 * </FeatureFlag>
 * 
 * // Avec fallback
 * <FeatureFlag flag="oneci_verification" fallback={<ManualVerification />}>
 *   <ONECIVerification />
 * </FeatureFlag>
 * ```
 */
export function FeatureFlag({
  flag,
  children,
  fallback = null,
  loadingFallback = null,
}: {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}) {
  const { isEnabled, isLoading } = useFeatureFlag(flag);

  if (isLoading) {
    return React.createElement(React.Fragment, null, loadingFallback);
  }

  return React.createElement(React.Fragment, null, isEnabled ? children : fallback);
}

