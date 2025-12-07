import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { faceImage1, faceImage2 } = await request.json();

    // Validation des entrées
    if (!faceImage1 || !faceImage2) {
      return NextResponse.json(
        { error: 'Les deux images de visage sont requises' },
        { status: 400 }
      );
    }

    // Simuler la comparaison faciale (en production, utiliser un vrai service de ML)
    const comparisonResult = await simulateFaceComparison({
      faceImage1,
      faceImage2,
    });

    return NextResponse.json(comparisonResult);
  } catch (error) {
    console.error('Erreur lors de la comparaison faciale:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Simulation de la comparaison faciale
async function simulateFaceComparison(options: {
  faceImage1: string;
  faceImage2: string;
}): Promise<{
  match: boolean;
  confidence: number;
  error?: string;
}> {
  try {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simuler un score de correspondance aléatoire pour la démo
    const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0
    const match = confidence > 0.8;

    return {
      match,
      confidence,
      error: match ? undefined : 'Les visages ne correspondent pas suffisamment',
    };
  } catch (error) {
    return {
      match: false,
      confidence: 0,
      error: 'Erreur lors de la comparaison des visages',
    };
  }
}