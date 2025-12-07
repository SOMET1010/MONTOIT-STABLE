import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/services/supabase/server';
import { smileIdService } from '@/services/smileIdService';

/**
 * Callback endpoint for Smile ID verification
 * This endpoint receives callbacks from Smile ID when verification is completed
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_id, status, result, partner_params, timestamp } = body;

    // Validate the callback
    if (!job_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the callback for debugging
    console.log('Smile ID callback received:', {
      job_id,
      status,
      timestamp: new Date(timestamp).toISOString()
    });

    // Process the callback
    await smileIdService.processCallback(body);

    // Update user verification status in database
    if (partner_params?.user_id) {
      const userId = partner_params.user_id;
      const isVerified = status === 'VERIFIED';

      // Update user_verifications table
      await supabase
        .from('user_verifications')
        .update({
          smile_id_status: status === 'VERIFIED' ? 'verifie' : 'rejete',
          smile_id_verified_at: status === 'VERIFIED' ? new Date().toISOString() : null,
          smile_id_result_data: result || {},
          updated_at: new Date().toISOString()
        })
        .eq('smile_id_job_id', job_id);

      // Update profiles table
      if (isVerified) {
        await supabase
          .from('profiles')
          .update({
            smile_id_verified: true,
            smile_id_verified_at: new Date().toISOString(),
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        // If verification includes full name, update profile
        if (result?.full_name) {
          await supabase
            .from('profiles')
            .update({
              full_name: result.full_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully',
      job_id,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing Smile ID callback:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process callback'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: 'healthy',
    service: 'Smile ID Callback',
    timestamp: new Date().toISOString()
  });
}