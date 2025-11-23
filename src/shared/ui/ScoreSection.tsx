import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import {
  TrendingUp,
  Shield,
  CreditCard,
  User,
  MessageSquare,
  Star,
  Clock,
  Trophy,
} from 'lucide-react';

interface TenantScore {
  total_score: number;
  identity_score: number;
  payment_score: number;
  profile_score: number;
  engagement_score: number;
  reputation_score: number;
  tenure_score: number;
  score_tier: string;
  last_calculated_at: string;
}

const TIER_CONFIG = {
  bronze: { name: 'Bronze', color: '#CD7F32', gradient: 'from-amber-600 to-amber-800' },
  silver: { name: 'Argent', color: '#C0C0C0', gradient: 'from-gray-300 to-gray-500' },
  gold: { name: 'Or', color: '#FFD700', gradient: 'from-yellow-400 to-yellow-600' },
  platinum: { name: 'Platine', color: '#E5E4E2', gradient: 'from-cyan-300 to-cyan-500' },
  diamond: { name: 'Diamant', color: '#B9F2FF', gradient: 'from-blue-300 to-blue-500' },
};

interface ScoreSectionProps {
  userId: string;
  className?: string;
}

export default function ScoreSection({ userId, className = '' }: ScoreSectionProps) {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<TenantScore | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadScoreData();
  }, [userId]);

  const loadScoreData = async () => {
    if (!userId) return;

    try {
      const { data: scoreData } = await supabase
        .from('tenant_scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scoreData) {
        setScore(scoreData);
      }
    } catch (err) {
      console.error('Error loading score:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = async () => {
    if (!userId) return;

    setCalculating(true);
    try {
      const { data, error } = await supabase.rpc('calculate_tenant_score', {
        p_user_id: userId,
      });

      if (error) throw error;

      await loadScoreData();
    } catch (err) {
      console.error('Error calculating score:', err);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className={`card-scrapbook p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto"></div>
      </div>
    );
  }

  const tierInfo = score
    ? TIER_CONFIG[score.score_tier as keyof typeof TIER_CONFIG]
    : TIER_CONFIG.bronze;
  const scorePercent = score ? score.total_score : 0;

  return (
    <div className={`card-scrapbook p-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
          <Trophy className="h-7 w-7 text-amber-600" />
          <span>Mon Score Locataire</span>
        </h2>
        <button
          onClick={calculateScore}
          disabled={calculating}
          className="btn-secondary flex items-center space-x-2 text-sm"
        >
          {calculating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-olive-600"></div>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>Recalculer</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle cx="64" cy="64" r="58" stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${(scorePercent / 100) * 364} 364`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tierInfo.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={tierInfo.color} stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold" style={{ color: tierInfo.color }}>
              {Math.round(scorePercent)}
            </div>
            <div className="text-gray-500 text-sm">/ 100</div>
          </div>
        </div>
      </div>

      <div
        className={`text-center p-4 rounded-2xl bg-gradient-to-r ${tierInfo.gradient} shadow-lg mb-6`}
      >
        <div className="flex items-center justify-center space-x-2 mb-1">
          <Trophy className="h-6 w-6 text-white" />
          <h3 className="text-xl font-bold text-white">Niveau {tierInfo.name}</h3>
        </div>
        <p className="text-white text-opacity-90 text-sm">
          {score && score.score_tier === 'diamond' && 'Statut VIP - Le meilleur des meilleurs !'}
          {score && score.score_tier === 'platinum' && 'Excellence - Locataire premium'}
          {score && score.score_tier === 'gold' && 'Excellent profil - Très recherché'}
          {score && score.score_tier === 'silver' && 'Bon profil - En progression'}
          {score && score.score_tier === 'bronze' && 'Débutant - Continuez vos efforts'}
        </p>
      </div>

      {score && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ScoreCriterion
            icon={Shield}
            title="Identité"
            score={score.identity_score}
            maxScore={20}
            color="text-terracotta-600"
            bgColor="bg-terracotta-100"
          />
          <ScoreCriterion
            icon={CreditCard}
            title="Paiements"
            score={score.payment_score}
            maxScore={25}
            color="text-olive-600"
            bgColor="bg-olive-100"
          />
          <ScoreCriterion
            icon={User}
            title="Profil"
            score={score.profile_score}
            maxScore={15}
            color="text-cyan-600"
            bgColor="bg-cyan-100"
          />
          <ScoreCriterion
            icon={MessageSquare}
            title="Engagement"
            score={score.engagement_score}
            maxScore={15}
            color="text-coral-600"
            bgColor="bg-coral-100"
          />
          <ScoreCriterion
            icon={Star}
            title="Réputation"
            score={score.reputation_score}
            maxScore={15}
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
          <ScoreCriterion
            icon={Clock}
            title="Ancienneté"
            score={score.tenure_score}
            maxScore={10}
            color="text-gray-600"
            bgColor="bg-gray-100"
          />
        </div>
      )}
    </div>
  );
}

function ScoreCriterion({
  icon: Icon,
  title,
  score,
  maxScore,
  color,
  bgColor,
}: {
  icon: any;
  title: string;
  score: number;
  maxScore: number;
  color: string;
  bgColor: string;
}) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-olive-200 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{Math.round(score)}</div>
          <div className="text-xs text-gray-500">/ {maxScore}</div>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${bgColor.replace('100', '500')}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
