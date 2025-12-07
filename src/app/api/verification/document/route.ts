import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { userId, documentImageUrl, documentType, country } = await request.json();

    // Validation des entrées
    if (!userId || !documentImageUrl || !documentType || !country) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis: userId, documentImageUrl, documentType, country' },
        { status: 400 }
      );
    }

    // Valider le type de document
    const validTypes = ['national_id', 'passport', 'driver_license', 'voter_card'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Type de document non valide' },
        { status: 400 }
      );
    }

    // Simuler la validation de document avec OCR (en production, utiliser un vrai service OCR)
    const validationResult = await simulateDocumentValidation({
      documentImageUrl,
      documentType,
      country,
    });

    // Mettre à jour la base de données
    const { error: updateError } = await supabase
      .from('user_verifications')
      .upsert({
        user_id: userId,
        document_verification_status: validationResult.success ? 'verifie' : 'echoue',
        document_type: documentType,
        document_image_url: documentImageUrl,
        extracted_document_data: validationResult.extractedData,
        document_confidence: validationResult.confidence,
        document_expired: validationResult.isExpired,
        document_verification_error: validationResult.error,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la base de données:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut de vérification' },
        { status: 500 }
      );
    }

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Erreur lors de la validation du document:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Simulation de la validation de document avec OCR
async function simulateDocumentValidation(options: {
  documentImageUrl: string;
  documentType: string;
  country: string;
}): Promise<{
  success: boolean;
  extractedData?: any;
  confidence: number;
  isExpired?: boolean;
  error?: string;
}> {
  try {
    // Simuler un délai de traitement OCR
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simuler l'extraction de données OCR basée sur le type de document
    const extractedData = generateMockDocumentData(options.documentType);

    // Simuler un niveau de confiance
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0

    // Simuler la vérification d'expiration
    const isExpired = Math.random() > 0.9; // 10% de chance d'être expiré

    const success = confidence > 0.8 && !isExpired;

    return {
      success,
      extractedData,
      confidence,
      isExpired,
      error: success ? undefined : 'Document illisible ou expiré',
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      error: 'Erreur lors du traitement du document',
    };
  }
}

// Génération de données factices pour différents types de documents
function generateMockDocumentData(documentType: string) {
  const baseData = {
    fullName: 'Kouadio Jean-Baptiste',
    dateOfBirth: '1990-05-15',
    nationality: 'CI',
  };

  switch (documentType) {
    case 'national_id':
      return {
        ...baseData,
        documentNumber: `CI${Math.random().toString().substr(2, 8)}`,
        issuedDate: '2020-01-15',
        expiryDate: '2030-01-15',
        placeOfIssue: 'Abidjan',
        sex: 'M',
      };
    case 'passport':
      return {
        ...baseData,
        documentNumber: `P${Math.random().toString().substr(2, 9)}`,
        issuedDate: '2021-03-10',
        expiryDate: '2031-03-10',
        placeOfIssue: 'Abidjan',
        passportType: 'Ordinaire',
      };
    case 'driver_license':
      return {
        ...baseData,
        documentNumber: `DL${Math.random().toString().substr(2, 8)}`,
        issuedDate: '2019-07-20',
        expiryDate: '2029-07-20',
        categories: 'B',
        placeOfIssue: 'Yamoussoukro',
      };
    case 'voter_card':
      return {
        ...baseData,
        documentNumber: `VC${Math.random().toString().substr(2, 8)}`,
        issuedDate: '2020-10-05',
        centreDeVote: 'Centre A1 Abidjan Plateau',
      };
    default:
      return baseData;
  }
}