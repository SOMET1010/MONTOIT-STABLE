import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { AccessibleButton } from '@/components/ui/AccessibleButton';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface ApplicationData {
  personalInfo: {
    full_name: string;
    phone: string;
    city: string;
    bio?: string;
  };
  verification: {
    oneci_verified: boolean;
    face_verified: boolean;
    cnam_verified: boolean;
  };
  coverLetter: string;
  documents: {
    id_card?: File;
    proof_of_income?: File;
    guarantor_letter?: File;
  };
}

interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  icon: React.ReactNode;
}

const ApplicationWizard: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationData>({
    personalInfo: {
      full_name: '',
      phone: '',
      city: '',
      bio: ''
    },
    verification: {
      oneci_verified: false,
      face_verified: false,
      cnam_verified: false
    },
    coverLetter: '',
    documents: {}
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'personal-info',
      title: 'Informations personnelles',
      component: PersonalInfoStep,
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'verification',
      title: 'Vérification identité',
      component: VerificationStep,
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'cover-letter',
      title: 'Lettre de motivation',
      component: CoverLetterStep,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'documents',
      title: 'Documents',
      component: DocumentsStep,
      icon: <FolderOpen className="w-5 h-5" />
    },
    {
      id: 'summary',
      title: 'Récapitulatif',
      component: SummaryStep,
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const saveDraft = useCallback(async () => {
    try {
      await supabase
        .from('application_drafts')
        .upsert({
          user_id: user?.id,
          property_id: propertyId,
          data: formData,
          updated_at: new Date().toISOString()
        });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [formData, user, propertyId]);

  const loadDraft = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('application_drafts')
        .select('data')
        .eq('user_id', user?.id)
        .eq('property_id', propertyId)
        .single();

      if (data) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [user, propertyId]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft, user, propertyId]);

  const updateFormData = useCallback((step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const CurrentStepComponent = steps[currentStep].component;
    // Validation basique pour chaque étape
    switch (steps[currentStep].id) {
      case 'personal-info':
        return formData.personalInfo.full_name && 
               formData.personalInfo.phone && 
               formData.personalInfo.city;
      
      case 'verification':
        return formData.verification.oneci_verified || 
               formData.verification.face_verified;
      
      case 'cover-letter':
        return formData.coverLetter.length >= 50;
      
      case 'documents':
        return true; // Documents optionnels
      
      case 'summary':
        return validateAllSteps();
      
      default:
        return false;
    }
  }, [formData, currentStep]);

  const validateAllSteps = useCallback(() => {
    return validateCurrentStep() && 
           formData.personalInfo.full_name && 
           formData.personalInfo.phone && 
           formData.personalInfo.city &&
           formData.coverLetter.length >= 50;
  }, [validateCurrentStep, formData]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [validateCurrentStep]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const submitApplication = useCallback(async () => {
    if (!validateAllSteps()) {
      alert('Veuillez compléter toutes les étapes obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculer le score de candidature
      const score = calculateApplicationScore();

      const { error } = await supabase
        .from('rental_applications')
        .insert({
          property_id: propertyId,
          applicant_id: user?.id,
          personal_info: formData.personalInfo,
          cover_letter: formData.coverLetter,
          application_score: score.totalScore,
          status: 'en_attente',
        });

      if (error) throw error;

      // Envoyer notification au propriétaire
      await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: (await getPropertyOwnerId(propertyId)),
          content: `Nouvelle candidature pour votre propriété (Score: ${score.totalScore}/100)`,
        });

      // Supprimer le brouillon
      await supabase
        .from('application_drafts')
        .delete()
        .eq('user_id', user?.id)
        .eq('property_id', propertyId);

      alert('Candidature envoyée avec succès !');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, propertyId, validateAllSteps]);

  const calculateApplicationScore = () => {
    let score = 50; // Score de base
    
    // Bonus vérifications
    if (formData.verification.oneci_verified) score += 20;
    if (formData.verification.face_verified) score += 15;
    if (formData.verification.cnam_verified) score += 15;
    
    // Bonus profil complet
    if (formData.personalInfo.bio) score += 3;
    if (formData.personalInfo.phone) score += 2;
    if (formData.personalInfo.city) score += 2;
    
    return {
      baseScore: 50,
      verificationBonus: (formData.verification.oneci_verified ? 20 : 0) + 
                        (formData.verification.face_verified ? 15 : 0) + 
                        (formData.verification.cnam_verified ? 15 : 0),
      profileBonus: (formData.personalInfo.bio ? 3 : 0) + 
                  (formData.personalInfo.phone ? 2 : 0) + 
                  (formData.personalInfo.city ? 2 : 0),
      totalScore: Math.min(score, 100)
    };
  };

  const getPropertyOwnerId = async (propertyId: string) => {
    const { data } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();
    return data?.owner_id;
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gradient">Postuler pour cette propriété</h1>
          {isSaved && (
            <div className="flex items-center text-green-600 text-sm">
              <Save className="w-4 h-4 mr-2" />
              Brouillon sauvegardé
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                ${index <= currentStep 
                  ? 'bg-terracotta-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-2 ${
                  index < currentStep ? 'bg-terracotta-500' : 'bg-gray-200'
                }`} />
              )}
              
              <span className="text-xs text-gray-600 mt-1 ml-2">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape actuelle */}
      <div className="mb-6">
        <CurrentStepComponent
          data={formData[steps[currentStep].id as keyof ApplicationData]}
          onChange={(data) => updateFormData(steps[currentStep].id, data)}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <AccessibleButton
          variant="secondary"
          onClick={previousStep}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </AccessibleButton>

        <div className="flex items-center space-x-4">
          {isSaved && (
            <span className="text-sm text-green-600">
              <Save className="w-4 h-4 mr-1" />
              Sauvegardé
            </span>
          )}
        </div>

        {currentStep < steps.length - 1 ? (
          <AccessibleButton
            onClick={nextStep}
            disabled={!validateCurrentStep()}
            className="flex items-center"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </AccessibleButton>
        ) : (
          <AccessibleButton
            variant="primary"
            onClick={submitApplication}
            loading={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer la candidature'}
          </AccessibleButton>
        )}
      </div>
    </div>
  );
};

// Composants d'étape (simplifiés pour l'exemple)
const PersonalInfoStep: React.FC<{
  data: ApplicationData['personalInfo'];
  onChange: (data: ApplicationData['personalInfo']) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => onChange({ ...data, full_name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
            placeholder="+225 XX XX XX XX XX"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ville *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
            placeholder="Abidjan, Cocody, etc."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biographie (optionnel)
          </label>
          <textarea
            value={data.bio || ''}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
            rows={4}
            placeholder="Parlez-nous de vous..."
          />
        </div>
      </div>
    </div>
  );
};

const VerificationStep: React.FC<{
  data: ApplicationData['verification'];
  onChange: (data: ApplicationData['verification']) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Vérification d'identité</h2>
      
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-amber-900">Vérification requise pour postuler</p>
            <p className="text-sm text-amber-800">
              Complétez au moins une vérification pour augmenter vos chances d'être sélectionné.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-terracotta-300">
          <input
            type="checkbox"
            checked={data.oneci_verified}
            onChange={(e) => onChange({ ...data, oneci_verified: e.target.checked })}
            className="mr-3"
          />
          <div>
            <p className="font-medium">Vérification ONECI</p>
            <p className="text-sm text-gray-600">Document CNI authentifié</p>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-terracotta-300">
          <input
            type="checkbox"
            checked={data.face_verified}
            onChange={(e) => onChange({ ...data, face_verified: e.target.checked })}
            className="mr-3"
          />
          <div>
            <p className="font-medium">Vérification faciale</p>
            <p className="text-sm text-gray-600">Reconnaissance biométrique</p>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-terracotta-300">
          <input
            type="checkbox"
            checked={data.cnam_verified}
            onChange={(e) => onChange({ ...data, cnam_verified: e.target.checked })}
            className="mr-3"
          />
          <div>
            <p className="font-medium">Vérification CNAM</p>
            <p className="text-sm text-gray-600">Affiliation CNAM (optionnel)</p>
          </div>
        </label>
      </div>
    </div>
  );
};

const CoverLetterStep: React.FC<{
  data: ApplicationData['coverLetter'];
  onChange: (data: ApplicationData['coverLetter']) => void;
}> = ({ data, onChange }) => {
  const charCount = data.coverLetter.length;
  const minChars = 50;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Lettre de motivation</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre lettre de motivation *
        </label>
        <textarea
          value={data.coverLetter}
          onChange={(e) => onChange({ ...data, coverLetter: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
          rows={8}
          placeholder="Présentez-vous et expliquez pourquoi vous souhaitez louer cette propriété..."
          required
        />
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{charCount} caractères</span>
          <span className={charCount < minChars ? 'text-red-600' : 'text-green-600'}>
            {charCount < minChars ? `Minimum ${minChars} caractères requis` : '✓ Minimum atteint'}
          </span>
        </div>
      </div>
    </div>
  );
};

const DocumentsStep: React.FC<{
  data: ApplicationData['documents'];
  onChange: (data: ApplicationData['documents']) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Documents (optionnel)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carte d'identité
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange({ ...data, id_card: file });
              }
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Justificatif de revenus
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange({ ...data, proof_of_income: file });
              }
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
          />
        </div>
      </div>
    </div>
  );
};

const SummaryStep: React.FC<{
  data: ApplicationData;
  applicationScore: ReturnType<typeof calculateApplicationScore>;
}> = ({ data, applicationScore }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Récapitulatif de votre candidature</h2>
      
      <div className="bg-gradient-to-r from-olive-50 to-green-50 border-2 border-olive-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Score de candidature</h3>
          <div className="text-3xl font-bold text-olive-600">
            {applicationScore.totalScore}/100
          </div>
        </div>
        
        <div className="w-full bg-olive-100 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-olive-500 to-green-500 transition-all duration-500"
            style={{ width: `${applicationScore.totalScore}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-700 mt-2">
          <span>Score minimum recommandé : 70/100</span>
          <span className={applicationScore.totalScore >= 70 ? 'text-green-600' : 'text-red-600'}>
            {applicationScore.totalScore >= 70 ? '✓ Objectif atteint' : '✗ En dessous de l\'objectif'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Informations personnelles</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nom :</strong> {data.personalInfo.full_name || 'Non renseigné'}</p>
            <p><strong>Téléphone :</strong> {data.personalInfo.phone || 'Non renseigné'}</p>
            <p><strong>Ville :</strong> {data.personalInfo.city || 'Non renseignée'}</p>
            <p><strong>Biographie :</strong> {data.personalInfo.bio || 'Non renseignée'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Vérifications</h3>
          <div className="space-y-2 text-sm">
            <p><strong>ONECI :</strong> 
              <span className={data.verification.oneci_verified ? 'text-green-600' : 'text-red-600'}>
                {data.verification.oneci_verified ? '✅ Vérifié' : '❌ Non vérifié'}
              </span>
            </p>
            <p><strong>Vérification faciale :</strong> 
              <span className={data.verification.face_verified ? 'text-green-600' : 'text-red-600'}>
                {data.verification.face_verified ? '✅ Vérifié' : '❌ Non vérifié'}
              </span>
            </p>
            <p><strong>CNAM :</strong> 
              <span className={data.verification.cnam_verified ? 'text-green-600' : 'text-gray-600'}>
                {data.verification.cnam_verified ? '✅ Vérifié' : 'Optionnel'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationWizard;