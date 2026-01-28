import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
export { uploadBufferToStorage } from './storage';


export async function getUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!user) return null;  
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}


export function getFormValue<T>(
  formData: FormData,
  key: string,
  options?: {
    parse?: (value: string) => T
    default?: T
  }
): T | null {
  const value = formData.get(key)
  if (!value) return options?.default ?? null
  if (options?.parse) return options.parse(value as string)
  return value as T
}


export function APIResponse(success: boolean, message: string, data?: any, statusCode: number = 200) {
  return NextResponse.json({ success, message, data }, { status: statusCode });
}


/**
 * Valida que un archivo sea una imagen válida (JPG, JPEG, PNG)
 * @param file - Archivo a validar
 * @returns Objeto con isValid y error si no es válido
 */
export function validateImageFile(file: File | null): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No se proporcionó ningún archivo' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!file.type || !allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Solo se permiten imágenes JPG, JPEG, PNG o WebP' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'La imagen es demasiado grande. Máximo 10MB' };
  }

  return { isValid: true };
}


/**
 * Traduce contenido de un blog post usando Gemini
 * @param title - Título del post
 * @param description - Descripción del post (puede ser null)
 * @param content - Contenido del post
 * @param slug - Slug del post
 * @param sourceLanguage - Idioma origen ('en' o 'es')
 * @param targetLanguage - Idioma destino ('en' o 'es')
 * @returns Objeto con title, description, content y slug traducidos
 */
export async function translatePost(
  title: string,
  description: string | null,
  content: string,
  slug: string,
  sourceLanguage: 'en' | 'es',
  targetLanguage: 'en' | 'es'
): Promise<{ title: string; description: string | null; content: string; slug: string }> {
  // Si los idiomas son iguales, retornar sin traducir
  if (sourceLanguage === targetLanguage) {
    return { title, description, content, slug };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const sourceLangName = sourceLanguage === 'en' ? 'English' : 'Spanish';
  const targetLangName = targetLanguage === 'en' ? 'English' : 'Spanish';

  const prompt = `You are a professional translator specializing in travel and digital nomad content. Translate the following blog post from ${sourceLangName} to ${targetLangName}.

IMPORTANT INSTRUCTIONS:
1. Preserve ALL HTML/Markdown formatting in the content field exactly as it appears
2. Maintain the same structure, tags, and formatting
3. Translate naturally and contextually, not word-by-word
4. Keep technical terms, brand names, and proper nouns in their original form unless they have a standard translation
5. Generate a URL-friendly slug for the translated title (lowercase, hyphens instead of spaces, no special characters)
6. Return ONLY valid JSON, no additional text or markdown

Input to translate:
- Title: "${title}"
- Description: "${description || ''}"
- Content: "${content}"
- Slug: "${slug}"

Return a JSON object with this exact structure:
{
  "title": "translated title",
  "description": "translated description or null if original was null",
  "content": "translated content with HTML/Markdown preserved",
  "slug": "translated-slug-url-friendly"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let translatedJson: any;
    
    try {
      // Try direct parse first
      translatedJson = JSON.parse(text);
    } catch (parseError) {
      // Sometimes the response might have markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        translatedJson = JSON.parse(jsonMatch[1]);
      } else {
        // Try to extract JSON from the text
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          translatedJson = JSON.parse(text.substring(jsonStart, jsonEnd));
        } else {
          throw new Error('Could not extract JSON from Gemini response');
        }
      }
    }

    // Validate the response structure
    if (!translatedJson.title || !translatedJson.content) {
      throw new Error('Invalid translation response: missing required fields');
    }

    // Generate slug if not provided
    const translatedSlug = translatedJson.slug || generateSlug(translatedJson.title);

    return {
      title: translatedJson.title,
      description: translatedJson.description ?? null,
      content: translatedJson.content,
      slug: translatedSlug,
    };
  } catch (error: any) {
    console.error(`Translation failed: ${error.message}`);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Genera un slug URL-friendly a partir de un título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}