// @/services/r2.ts

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  ListObjectsV2CommandInput,
  GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Config } from '@/config/r2';
import type { MediaFile, MediaType } from '@/types/media';

export class R2Service {
  private client: S3Client;
  private config: ReturnType<typeof getR2Config>;

  constructor() {
    this.config = getR2Config();
    this.client = new S3Client({
      region: this.config.region || 'auto',
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: false, // R2 supports virtual-hosted-style requests
    });
  }

  /**
   * Upload a file to R2
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<{
    url: string;
    key: string;
    etag: string;
    bucket: string;
  }> {
    try {
      const params: PutObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: metadata,
      };

      const command = new PutObjectCommand(params);
      const result = await this.client.send(command);

      const url = this.getPublicUrl(key);

      return {
        url,
        key,
        etag: result.ETag || '',
        bucket: this.config.bucketName,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const params: DeleteObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      await this.client.send(command);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new Error(`Failed to delete file from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List files in R2 bucket
   */
  async listFiles(
    prefix?: string,
    maxKeys?: number,
    continuationToken?: string
  ): Promise<{
    files: Array<{
      key: string;
      size: number;
      lastModified: Date;
      etag: string;
    }>;
    isTruncated: boolean;
    nextContinuationToken?: string;
  }> {
    try {
      const params: ListObjectsV2CommandInput = {
        Bucket: this.config.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys || 1000,
        ContinuationToken: continuationToken,
      };

      const command = new ListObjectsV2Command(params);
      const result = await this.client.send(command);

      const files = (result.Contents || []).map((object) => ({
        key: object.Key || '',
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        etag: object.ETag || '',
      }));

      return {
        files,
        isTruncated: result.IsTruncated || false,
        nextContinuationToken: result.NextContinuationToken,
      };
    } catch (error) {
      console.error('R2 list error:', error);
      throw new Error(`Failed to list files from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata from R2
   */
  async getFileMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
    etag: string;
    metadata?: Record<string, string>;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const result = await this.client.send(command);

      return {
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        contentType: result.ContentType || 'application/octet-stream',
        etag: result.ETag || '',
        metadata: result.Metadata,
      };
    } catch (error) {
      console.error('R2 metadata error:', error);
      throw new Error(`Failed to get file metadata from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a presigned URL for file access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('R2 presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (this.config.publicUrl) {
      // Use custom domain if configured
      return `${this.config.publicUrl}/${key}`;
    }
    
    // Use R2 public URL format
    return `${this.config.endpoint}/${this.config.bucketName}/${key}`;
  }

  /**
   * Generate a unique file key
   */
  generateFileKey(
    originalName: string,
    folder?: string,
    fileId?: string
  ): string {
    const timestamp = Date.now();
    const id = fileId || this.generateId();
    const sanitizedName = this.sanitizeFilename(originalName);
    const filename = `${timestamp}-${id}-${sanitizedName}`;
    
    return folder ? `${folder}/${filename}` : filename;
  }

  /**
   * Sanitize filename for safe storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Extract file key from URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      if (this.config.publicUrl && url.startsWith(this.config.publicUrl)) {
        return url.replace(`${this.config.publicUrl}/`, '');
      }
      
      if (url.includes(this.config.bucketName)) {
        const parts = url.split(`/${this.config.bucketName}/`);
        return parts[1] || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }

  /**
   * Check if R2 service is properly configured
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to list objects to verify connection
      await this.listFiles('', 1);
      return true;
    } catch (error) {
      console.error('R2 health check failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const r2Service = new R2Service();

// Helper function to determine media type from MIME type
export function getMediaTypeFromMimeType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

// Helper function to get MIME type from file extension
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.avi': 'video/avi',
    '.mov': 'video/mov',
    '.mp3': 'audio/mp3',
    '.wav': 'audio/wav',
    '.m4a': 'audio/m4a',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}
