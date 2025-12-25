/**
 * API de Comments - Un archivo, un dominio
 * GET → público (ver comentarios)
 * POST → requiere auth (crear comentario)
 */

import { requireUser } from "../auth/require-user";

export async function GET() {
  // Público - todos pueden ver comentarios
  return Response.json({ comments: [] });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  
  // Crear comentario
  // El backend valida todo
  
  return Response.json({ ok: true, comment: body });
}
