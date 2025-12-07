/**
 * Edge Function: Backup du stockage Storage
 *
 * Crée un backup complet du bucket de fichiers utilisateur
 * avec préservation de la structure des dossiers
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    console.log('Starting storage backup...')

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `backup-storage-${timestamp}.tar.gz`

    // Créer le backup avec l'utilitaire de backup Supabase
    const backupData = await createStorageBackup(supabase)

    // Créer le manifeste des fichiers
    const manifest = await createStorageManifest(supabase)

    // Combiner le manifeste et les données
    const combinedData = JSON.stringify({
      manifest,
      backup_date: timestamp,
      total_files: Object.keys(backupData).length,
      total_size: Object.values(backupData).reduce((sum, file) => sum + file.size, 0)
    }) + '\n' + JSON.stringify(backupData)

    // Compresser le tout
    const compressed = await compressData(combinedData)

    // Uploader le backup
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(`storage/${backupFileName}`, compressed, {
        contentType: 'application/gzip',
        cacheControl: 'no-cache',
        metadata: {
          type: 'storage_backup',
          timestamp,
          size: compressed.length,
          total_files: Object.keys(backupData).length,
          source: 'automated_monthly'
        }
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Nettoyer les anciens backups (garder 1 mois)
    await cleanupOldBackups(supabase, 'storage', 30)

    // Logger le succès
    await supabase.from('backup_logs').insert({
      backup_type: 'storage',
      file_name: backupFileName,
      file_size: compressed.length,
      status: 'success',
      timestamp: new Date().toISOString(),
      metadata: {
        retention_days: 30,
        backup_source: 'automated_monthly',
        total_files: Object.keys(backupData).length
      }
    })

    console.log('Storage backup completed:', backupFileName)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Storage backup completed successfully',
        file_name: backupFileName,
        file_size: compressed.length,
        total_files: Object.keys(backupData).length,
        timestamp
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Storage backup failed:', error)

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      await supabase.from('backup_logs').insert({
        backup_type: 'storage',
        status: 'failed',
        timestamp: new Date().toISOString(),
        error_message: error.message
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return new Response(
      JSON.stringify({
        error: 'Storage backup failed',
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
 * Crée une archive des fichiers du Storage
 */
async function createStorageBackup(supabase: any): Promise<Record<string, any>> {
  const buckets = ['properties', 'documents', 'avatars', 'contracts']
  const backupData: Record<string, any> = {}

  for (const bucketName of buckets) {
    try {
      console.log(`Processing bucket: ${bucketName}`)

      // Lister tous les fichiers dans le bucket
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 10000 })

      if (error) {
        console.error(`Failed to list files in ${bucketName}:`, error)
        continue
      }

      if (files && files.length > 0) {
        backupData[bucketName] = {
          files: [],
          metadata: {
            bucket_name: bucketName,
            total_files: files.length,
            backup_timestamp: new Date().toISOString()
          }
        }

        // Récupérer chaque fichier
        for (const file of files) {
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(bucketName)
              .download(file.name)

            if (fileError) {
              console.error(`Failed to download ${file.name}:`, fileError)
              backupData[bucketName].files.push({
                name: file.name,
                size: file.metadata?.size || 0,
                status: 'error',
                error: fileError.message
              })
              continue
            }

            // Convertir en base64 pour le stockage
            const base64 = await fileToBase64(fileData)

            backupData[bucketName].files.push({
              name: file.name,
              size: file.size,
              created_at: file.created_at,
              updated_at: file.updated_at,
              last_accessed_at: file.last_accessed_at,
              metadata: file.metadata,
              content_type: file.metadata?.mimetype,
              data: base64,
              status: 'success'
            })

            console.log(`Backed up: ${bucketName}/${file.name}`)

          } catch (fileError) {
            console.error(`Error processing ${file.name}:`, fileError)
            backupData[bucketName].files.push({
              name: file.name,
              size: file.size,
              status: 'error',
              error: fileError.message
            })
          }
        }

        console.log(`Completed bucket ${bucketName}: ${files.length} files`)
      }
    } catch (bucketError) {
      console.error(`Error processing bucket ${bucketName}:`, bucketError)
      backupData[bucketName] = {
        files: [],
        metadata: {
          bucket_name: bucketName,
          error: bucketError.message,
          backup_timestamp: new Date().toISOString()
        }
      }
    }
  }

  return backupData
}

/**
 * Crée un manifeste détaillé du contenu du Storage
 */
async function createStorageManifest(supabase: any): Promise<any> {
  const buckets = ['properties', 'documents', 'avatars', 'contracts']
  const manifest = {
    backup_date: new Date().toISOString(),
    buckets: {},
    total_files: 0,
    total_size: 0
  }

  for (const bucketName of buckets) {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 10000 })

      if (!error && files) {
        manifest.buckets[bucketName] = {
          file_count: files.length,
          total_size: files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0),
          files: files.map(file => ({
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            updated_at: file.updated_at,
            content_type: file.metadata?.mimetype
          }))
        }

        manifest.total_files += files.length
        manifest.total_size += manifest.buckets[bucketName].total_size
      }
    } catch (error) {
      console.error(`Failed to create manifest for ${bucketName}:`, error)
      manifest.buckets[bucketName] = { error: error.message }
    }
  }

  return manifest
}

/**
 * Convertit un fichier en base64
 */
async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      // Retirer le préfixe data:image/...;base64,
      const base64Content = base64String.split(',')[1]
      resolve(base64Content)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Compresse les données avec gzip
 */
async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const inputData = encoder.encode(data)

  const compressionStream = new CompressionStream('gzip')
  const writer = compressionStream.writable.getWriter()
  const reader = compressionStream.readable.getReader()

  writer.write(inputData)
  writer.close()

  const chunks = []
  let done = false

  while (!done) {
    const { value, done: readerDone } = await reader.read()
    done = readerDone
    if (value) {
      chunks.push(value)
    }
  }

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
 * Nettoie les anciens backups
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

  if (!error && files) {
    const oldFiles = files.filter(file =>
      new Date(file.created_at) < cutoffDate
    )

    for (const file of oldFiles) {
      await supabase.storage
        .from('backups')
        .remove([`${backupType}/${file.name}`])
    }
  }
}