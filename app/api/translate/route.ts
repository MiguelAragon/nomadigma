/**
 * API de Traducción - Usa LLM para traducir contenido
 * POST → requiere auth
 */

import { requireUser } from "../auth/require-user";

export async function POST(req: Request) {
  try {
    await requireUser(); // Verificar autenticación
    
    const body = await req.json();
    const { text, description, content, from, to } = body;

    if (!text && !content) {
      return Response.json(
        { error: 'Se requiere texto o contenido para traducir' },
        { status: 400 }
      );
    }

    if (!from || !to) {
      return Response.json(
        { error: 'Se requieren idiomas de origen y destino' },
        { status: 400 }
      );
    }

    // TODO: Integrar con LLM real (OpenAI, Anthropic, etc.)
    // Por ahora retorna los mismos valores - el LLM se integrará después
    
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Por ahora, retornar los mismos valores hasta que se integre el LLM
    const translated = {
      title: text,
      description: description || null,
      content: content,
      slug: generateSlug(text),
    };

    return Response.json(translated);
  } catch (error: any) {
    console.error('Error translating:', error);
    return Response.json(
      { error: 'Error al traducir. Por favor, intenta de nuevo.' },
      { status: 500 }
    );
  }
}

