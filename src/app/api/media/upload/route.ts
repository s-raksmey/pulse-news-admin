import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { r2Service, getMediaTypeFromMimeType, getMimeTypeFromExtension } from "@/services/r2";
import { validateR2Config } from "@/config/r2";
import type { MediaFile, MediaType, MediaUploadOptions } from "@/types/media";

// File type mappings
const MIME_TYPE_MAP: Record<string, MediaType> = {
  // Images
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  
  // Videos
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/avi': 'video',
  'video/mov': 'video',
  
  // Audio
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/m4a': 'audio',
  
  // Documents
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'text/plain': 'document',
  'text/csv': 'document',
};

// File size limits (in bytes)
const SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  document: 25 * 1024 * 1024, // 25MB
  other: 10 * 1024 * 1024, // 10MB
};

function getMediaType(mimeType: string): MediaType {
  return MIME_TYPE_MAP[mimeType] || 'other';
}

// Check R2 configuration on module load
const isR2Configured = validateR2Config();

async function processImage(
  buffer: Buffer,
  options: MediaUploadOptions = {}
): Promise<{ buffer: Buffer; width?: number; height?: number }> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 85 } = options;
  
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Only resize if image is larger than max dimensions
  const needsResize = 
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight);
  
  if (needsResize) {
    const processed = await image
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    
    const newMetadata = await sharp(processed).metadata();
    return {
      buffer: processed,
      width: newMetadata.width,
      height: newMetadata.height,
    };
  }
  
  return {
    buffer,
    width: metadata.width,
    height: metadata.height,
  };
}

export async function POST(req: Request) {
  try {
    // Check R2 configuration
    if (!isR2Configured) {
      return NextResponse.json(
        { success: false, message: "R2 storage is not properly configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const optionsStr = formData.get("options") as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }
    
    const options: MediaUploadOptions = optionsStr ? JSON.parse(optionsStr) : {};
    const mediaType = getMediaType(file.type);
    
    // Check file size
    if (file.size > SIZE_LIMITS[mediaType]) {
      return NextResponse.json(
        { 
          success: false, 
          message: `File too large. Maximum size for ${mediaType} files is ${SIZE_LIMITS[mediaType] / (1024 * 1024)}MB` 
        },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = uuidv4();
    
    let processedBuffer = buffer;
    let width: number | undefined;
    let height: number | undefined;
    
    // Process images
    if (mediaType === 'image' && file.type !== 'image/gif' && file.type !== 'image/svg+xml') {
      const processed = await processImage(buffer, options);
      processedBuffer = processed.buffer;
      width = processed.width;
      height = processed.height;
    } else if (mediaType === 'image') {
      // For GIF and SVG, just get dimensions without processing
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch {
        // Ignore errors for SVG or unsupported formats
      }
    }
    
    // Generate R2 key
    const key = r2Service.generateFileKey(file.name, options.folder, fileId);
    
    // Upload to R2
    const uploadResult = await r2Service.uploadFile(
      processedBuffer,
      key,
      file.type,
      {
        originalName: file.name,
        uploadedBy: 'current-user', // TODO: Get from auth context
        alt: options.alt || '',
        caption: options.caption || '',
        tags: JSON.stringify(options.tags || []),
      }
    );
    
    // Create media file object
    const mediaFile: Partial<MediaFile> = {
      id: fileId,
      filename: key.split('/').pop() || key,
      originalName: file.name,
      url: uploadResult.url,
      type: mediaType,
      mimeType: file.type,
      size: processedBuffer.length,
      width,
      height,
      alt: options.alt,
      caption: options.caption,
      folder: options.folder,
      tags: options.tags || [],
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current-user', // TODO: Get from auth context
      lastModified: new Date().toISOString(),
      // R2-specific fields
      bucket: uploadResult.bucket,
      key: uploadResult.key,
      etag: uploadResult.etag,
      storageClass: 'STANDARD',
    };
    
    // TODO: Save to database
    // await saveMediaFile(mediaFile);
    
    return NextResponse.json({
      success: true,
      file: mediaFile,
      message: "File uploaded successfully to R2",
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check R2 configuration
    if (!isR2Configured) {
      return NextResponse.json(
        { success: false, message: "R2 storage is not properly configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '1000');
    const continuationToken = searchParams.get('continuationToken') || undefined;
    
    // List files from R2
    const result = await r2Service.listFiles(
      folder ? `${folder}/` : undefined,
      maxKeys,
      continuationToken
    );
    
    const files: Partial<MediaFile>[] = [];
    const folders: Set<string> = new Set();
    
    for (const r2File of result.files) {
      const key = r2File.key;
      
      // Extract folder structure
      if (folder) {
        const relativePath = key.replace(`${folder}/`, '');
        const pathParts = relativePath.split('/');
        
        if (pathParts.length > 1) {
          // This is a file in a subfolder
          folders.add(pathParts[0]);
          continue;
        }
      } else {
        const pathParts = key.split('/');
        if (pathParts.length > 1) {
          // This is a file in a folder
          folders.add(pathParts[0]);
          continue;
        }
      }
      
      // Determine file type from key
      const ext = key.substring(key.lastIndexOf('.')).toLowerCase();
      const mimeType = getMimeTypeFromExtension(ext);
      const mediaType = getMediaType(mimeType);
      
      // Extract filename from key
      const filename = key.split('/').pop() || key;
      
      // Try to extract original name from metadata (if available)
      let originalName = filename;
      try {
        const metadata = await r2Service.getFileMetadata(key);
        originalName = metadata.metadata?.originalName || filename;
      } catch (error) {
        // Ignore metadata errors, use filename as fallback
        console.warn(`Could not get metadata for ${key}:`, error);
      }
      
      files.push({
        id: key, // Use R2 key as ID
        filename,
        originalName,
        url: r2Service.getPublicUrl(key),
        type: mediaType,
        mimeType,
        size: r2File.size,
        uploadedAt: r2File.lastModified.toISOString(),
        lastModified: r2File.lastModified.toISOString(),
        // R2-specific fields
        bucket: r2Service['config'].bucketName,
        key: r2File.key,
        etag: r2File.etag,
        storageClass: 'STANDARD',
      });
    }
    
    return NextResponse.json({
      success: true,
      files,
      folders: Array.from(folders),
      isTruncated: result.isTruncated,
      nextContinuationToken: result.nextContinuationToken,
    });
    
  } catch (error) {
    console.error("Error listing files from R2:", error);
    return NextResponse.json(
      { success: false, message: `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Check R2 configuration
    if (!isR2Configured) {
      return NextResponse.json(
        { success: false, message: "R2 storage is not properly configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('id');
    const filename = searchParams.get('filename');
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }
    
    // For R2, the fileId is actually the key
    const key = fileId;
    
    try {
      // Delete file from R2
      await r2Service.deleteFile(key);
      
      // TODO: Remove from database
      // await deleteMediaFile(fileId);
      
      return NextResponse.json({
        success: true,
        message: "File deleted successfully from R2",
      });
      
    } catch (deleteError) {
      // Check if file doesn't exist (404 error)
      if (deleteError instanceof Error && deleteError.message.includes('NoSuchKey')) {
        return NextResponse.json(
          { success: false, message: "File not found in R2" },
          { status: 404 }
        );
      }
      
      throw deleteError;
    }
    
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
