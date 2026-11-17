/**
 * Sanitizador defensivo para respuestas de LLMs/LMMs
 * Extrae y parsea JSON limpio incluso si el modelo incluye markdown code fences o texto conversacional
 */
export function cleanAndParseJson<T>(rawContent: string): T {
  let cleaned = rawContent.trim();

  // 1. Remover markdown code fences (```json ... ``` o ``` ... ```)
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Si aún tiene texto adicional antes o después de la llave raíz, extraer el bloque {...}
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(`Error parseando JSON de respuesta del LMM: ${err instanceof Error ? err.message : String(err)}. Contenido recibido: ${rawContent.slice(0, 200)}...`);
  }
}
