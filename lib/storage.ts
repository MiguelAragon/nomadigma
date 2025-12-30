import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import https from 'https';

/**
 * Validar variables de entorno de S3
 */
function validateS3Config() {
  const requiredVars = {
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required S3 environment variables: ${missing.join(', ')}`);
  }

  return {
    endpoint: requiredVars.S3_ENDPOINT!,
    publicUrl: requiredVars.S3_PUBLIC_URL!,
    region: requiredVars.S3_REGION!,
    accessKey: requiredVars.S3_ACCESS_KEY!,
    secretKey: requiredVars.S3_SECRET_KEY!,
    bucketName: requiredVars.S3_BUCKET_NAME!,
  };
}

/**
 * Configuración del cliente S3
 */
function getS3Client() {
  const config = validateS3Config();
  
  // Configurar agente HTTPS para ignorar certificados auto-firmados en desarrollo
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle: true,
    // @ts-ignore - requestHandler acepta httpsAgent pero no está en los tipos
    requestHandler: {
      httpsAgent,
    },
  });
}

/**
 * Sube un Buffer a S3
 * @param buffer - El Buffer a guardar
 * @param fileName - Nombre del archivo (con ruta, ej: "covers/image.jpg")
 * @param mimeType - Tipo MIME del archivo (ej: "image/jpeg")
 * @returns URL pública del archivo guardado
 */
export async function uploadBufferToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    const config = validateS3Config();
    const s3Client = getS3Client();
    
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);
    
    // Construir la URL pública del archivo usando S3_PUBLIC_URL
    const publicUrl = `${config.publicUrl}/${config.bucketName}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Error processing buffer upload');
  }
}

