/**
 * Image compression utility for web
 * Compresses images to reduce file size before upload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.7,
  maxSizeMB: 2, // Target max 2MB (well under Vercel's 4.5MB limit)
};

/**
 * Compresses an image file using Canvas API
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns A Promise that resolves to a compressed Blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(
            opts.maxWidth / width,
            opts.maxHeight / height
          );
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if we need further compression
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > opts.maxSizeMB) {
              // Recursively compress with lower quality
              const lowerQuality = Math.max(0.3, opts.quality - 0.2);
              compressImage(file, { ...opts, quality: lowerQuality })
                .then(resolve)
                .catch(reject);
              return;
            }

            // Create a new File from the blob
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: file.type || 'image/jpeg',
                lastModified: Date.now(),
              }
            );

            console.log('✅ Image compressed:', {
              original: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              compressed: `${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB`,
              reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`,
            });

            resolve(compressedFile);
          },
          file.type || 'image/jpeg',
          opts.quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple image files
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns A Promise that resolves to an array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}
