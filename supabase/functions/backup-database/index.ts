/**
 * Edge Function: Backup de la base de données
 *
 * Exécute un backup quotidien de la base de données Supabase
 * et le stocke dans un bucket de backup sécurisé
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier la clé secrète pour sécuriser l'endpoint
    const authHeader = req.headers.get('authorization')
    const expectedKey = Deno.env.get('BACKUP_SECRET_KEY')

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting database backup...')

    // Créer le nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `backup-database-${timestamp}.sql`

    // Générer le dump SQL en utilisant pg_dump via RPC
    const { data: dumpData, error: dumpError } = await supabase.rpc('create_database_dump')

    if (dumpError) {
      console.error('Failed to create database dump:', dumpError)
      throw new Error(`Database dump failed: ${dumpError.message}`)
    }

    if (!dumpData) {
      throw new Error('No data returned from database dump')
    }

    // Compresser le dump avec gzip
    const compressed = await compressData(dumpData)

    // Uploader le backup dans le bucket sécurisé
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(`database/${backupFileName}.gz`, compressed, {
        contentType: 'application/gzip',
        cacheControl: 'no-cache',
        metadata: {
          type: 'database_backup',
          timestamp,
          size: compressed.length,
          source: 'automated_daily'
        }
      })

    if (uploadError) {
      console.error('Failed to upload backup:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Nettoyer les anciens backups (garder 7 jours)
    await cleanupOldBackups(supabase, 'database', 7)

    // Créer une entrée dans la table de monitoring
    await supabase.from('backup_logs').insert({
      backup_type: 'database',
      file_name: `${backupFileName}.gz`,
      file_size: compressed.length,
      status: 'success',
      timestamp: new Date().toISOString(),
      metadata: {
        retention_days: 7,
        backup_source: 'automated_daily',
        compression: 'gzip'
      }
    })

    // Envoyer une notification de succès
    await sendNotification(supabase, 'success', 'Database backup completed successfully', {
      file_name: backupFileName,
      file_size: compressed.length
    })

    console.log('Database backup completed successfully:', backupFileName)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database backup completed successfully',
        file_name: backupFileName,
        file_size: compressed.length,
        timestamp
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Backup failed:', error)

    // Envoyer une notification d'échec
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      await supabase.from('backup_logs').insert({
        backup_type: 'database',
        status: 'failed',
        timestamp: new Date().toISOString(),
        error_message: error.message,
        metadata: {
          source: 'automated_daily'
        }
      })

      await sendNotification(supabase, 'error', 'Database backup failed', {
        error: error.message
      })
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError)
    }

    return new Response(
      JSON.stringify({
        error: 'Backup failed',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Compresse les données avec gzip
 */
async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const inputData = encoder.encode(data)

  const compressionStream = new CompressionStream('gzip')
  const writer = compressionStream.writable.getWriter()
  const reader = compressionStream.readable.getReader()

  // Écrire les données
  writer.write(inputData)
  writer.close()

  // Lire les données compressées
  const chunks = []
  let done = false

  while (!done) {
    const { value, done: readerDone } = await reader.read()
    done = readerDone
    if (value) {
      chunks.push(value)
    }
  }

  // Concaténer tous les chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

/**
 * Nettoie les anciens backups selon la politique de rétention
 */
async function cleanupOldBackups(supabase: any, backupType: string, retentionDays: number) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const { data: files, error } = await supabase.storage
    .from('backups')
    .list(`${backupType}/`, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('Failed to list old backups:', error)
    return
  }

  if (files) {
    const oldFiles = files.filter(file =>
      new Date(file.created_at) < cutoffDate
    )

    for (const file of oldFiles) {
      const { error: deleteError } = await supabase.storage
        .from('backups')
        .remove([`${backupType}/${file.name}`])

      if (deleteError) {
        console.error(`Failed to delete old backup ${file.name}:`, deleteError)
      } else {
        console.log(`Deleted old backup: ${file.name}`)
      }
    }
  }
}

/**
 * Envoie une notification aux administrateurs
 */
async function sendNotification(supabase: any, type: 'success' | 'error', title: string, details: any) {
  try {
    await supabase.from('notifications').insert({
      type: 'system',
      title,
      message: type === 'success'
        ? `✅ ${title}`
        : `❌ ${title}: ${details.error}`,
      channels: ['in_app', 'email'],
      priority: type === 'error' ? 'high' : 'normal',
      metadata: details,
      // Envoyer à tous les admins
      user_id: null, // Notification système
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}