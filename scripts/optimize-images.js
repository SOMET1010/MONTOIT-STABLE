const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Script d'optimisation des images en WebP
 */
class ImageOptimizer {
  constructor() {
    this.publicDir = path.join(__dirname, '../public');
    this.outputDir = path.join(this.publicDir, 'optimized');
    this.optimizations = [];
  }

  /**
   * Optimiser toutes les images du dossier public
   */
  async optimizeAll() {
    console.log('🚀 Début de l\'optimisation des images...\n');

    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Trouver toutes les images
    const imageFiles = await this.findImages(this.publicDir);

    console.log(`📁 ${imageFiles.length} images trouvées\n`);

    // Optimiser chaque image
    for (const imagePath of imageFiles) {
      await this.optimizeImage(imagePath);
    }

    // Afficher le rapport
    this.printReport();
  }

  /**
   * Trouver toutes les images dans un dossier
   */
  async findImages(dir) {
    const files = [];
    const supportedFormats = ['.png', '.jpg', '.jpeg', '.gif', '.tiff', '.webp'];

    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Ignorer node_modules et le dossier optimized
          if (!['node_modules', 'optimized'].includes(item)) {
            scan(fullPath);
          }
        } else {
          const ext = path.extname(item).toLowerCase();
          if (supportedFormats.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    scan(dir);
    return files;
  }

  /**
   * Optimiser une image individuelle
   */
  async optimizeImage(inputPath) {
    try {
      const relativePath = path.relative(this.publicDir, inputPath);
      const parsedPath = path.parse(relativePath);

      // Créer les sous-dossiers si nécessaire
      const outputSubDir = path.join(this.outputDir, parsedPath.dir);
      if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true });
      }

      // Informations sur l'image originale
      const originalStats = fs.statSync(inputPath);
      const originalSize = originalStats.size;
      const originalImage = sharp(inputPath);
      const metadata = await originalImage.metadata();

      console.log(`📸 Optimisation: ${relativePath}`);
      console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB (${metadata.width}x${metadata.height})`);

      // Chemins de sortie
      const webpPath = path.join(outputSubDir, `${parsedPath.name}.webp`);

      // Optimisations WebP avec différentes qualités
      const optimizations = [
        { suffix: '', quality: 80, lossless: false },
        { suffix: '@2x', quality: 60, lossless: false, resize: metadata.width * 2 },
        { suffix: '@0.5x', quality: 90, lossless: false, resize: Math.round(metadata.width * 0.5) }
      ];

      let totalWebPSavings = 0;

      for (const opt of optimizations) {
        const outputPath = opt.suffix
          ? path.join(outputSubDir, `${parsedPath.name}${opt.suffix}.webp`)
          : webpPath;

        let pipeline = sharp(inputPath);

        // Redimensionner si nécessaire
        if (opt.resize) {
          const height = Math.round((metadata.height / metadata.width) * opt.resize);
          pipeline = pipeline.resize(opt.resize, height, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }

        // Convertir en WebP
        await pipeline
          .webp({
            quality: opt.quality,
            lossless: opt.lossless,
            effort: 6,
            smartSubsample: true
          })
          .toFile(outputPath);

        const webpStats = fs.statSync(outputPath);
        const webpSize = webpStats.size;
        const webpSaving = ((originalSize - webpSize) / originalSize) * 100;

        console.log(`   WebP${opt.suffix}: ${(webpSize / 1024).toFixed(2)} KB (-${webpSaving.toFixed(1)}%)`);

        totalWebPSavings += webpSaving;
      }

      // Créer un placeholder flou pour le chargement progressif
      const placeholderPath = path.join(outputSubDir, `${parsedPath.name}-placeholder.webp`);
      await sharp(inputPath)
        .resize(20, null, {
          fit: 'inside'
        })
        .webp({
          quality: 20,
          effort: 6
        })
        .toFile(placeholderPath);

      const placeholderStats = fs.statSync(placeholderPath);
      console.log(`   Placeholder: ${(placeholderStats / 1024).toFixed(2)} KB`);

      // Sauvegarder les statistiques
      this.optimizations.push({
        path: relativePath,
        originalSize,
        webpSize: fs.statSync(webpPath).size,
        webpSaving: totalWebPSavings / optimizations.length,
        metadata
      });

      console.log('   ✅ Terminé\n');

    } catch (error) {
      console.error(`❌ Erreur lors de l'optimisation de ${inputPath}:`, error.message);
    }
  }

  /**
   * Afficher le rapport d'optimisation
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT D\'OPTIMISATION');
    console.log('='.repeat(60));

    let totalOriginal = 0;
    let totalOptimized = 0;

    this.optimizations.forEach(opt => {
      totalOriginal += opt.originalSize;
      totalOptimized += opt.webpSize;
    });

    const totalSaving = totalOriginal - totalOptimized;
    const savingPercentage = (totalSaving / totalOriginal) * 100;

    console.log(`\n📈 Statistiques globales:`);
    console.log(`   Images traitées: ${this.optimizations.length}`);
    console.log(`   Taille originale: ${(totalOriginal / 1024).toFixed(2)} KB`);
    console.log(`   Taille optimisée: ${(totalOptimized / 1024).toFixed(2)} KB`);
    console.log(`   Espace économisé: ${(totalSaving / 1024).toFixed(2)} KB (-${savingPercentage.toFixed(1)}%)`);

    console.log(`\n📝 Images individuelles:`);
    this.optimizations
      .sort((a, b) => b.webpSaving - a.webpSaving)
      .slice(0, 5)
      .forEach(opt => {
        console.log(`   ${opt.path}: -${opt.webpSaving.toFixed(1)}%`);
      });

    console.log('\n✅ Optimisation terminée !');
    console.log('\n💡 Utilisez les images dans le dossier "public/optimized" dans votre application');
    console.log('💡 Les images @2x sont pour les écrans haute densité');
    console.log('💡 Les images @0.5x sont pour les thumbnails');
    console.log('💡 Les placeholders sont pour le chargement progressif');
  }
}

// Exécuter l'optimisation
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.optimizeAll().catch(console.error);
}

module.exports = ImageOptimizer;