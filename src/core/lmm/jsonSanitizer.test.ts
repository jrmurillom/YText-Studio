import { describe, it, expect } from 'vitest';
import { cleanAndParseJson } from './jsonSanitizer';

describe('cleanAndParseJson', () => {
  it('parsea JSON puro sin adornos correctamente', () => {
    const raw = '{"success": true, "count": 42}';
    const result = cleanAndParseJson<{ success: boolean; count: number }>(raw);
    expect(result).toEqual({ success: true, count: 42 });
  });

  it('elimina markdown code fences ```json ... ``` de modelos conversacionales', () => {
    const raw = '```json\n{\n  "status": "ok",\n  "proposals": ["A", "B"]\n}\n```';
    const result = cleanAndParseJson<{ status: string; proposals: string[] }>(raw);
    expect(result.status).toBe('ok');
    expect(result.proposals).toHaveLength(2);
  });

  it('extrae el objeto JSON si el modelo añade texto explicativo antes o después', () => {
    const raw = 'Claro, aquí tienes la respuesta estructurada:\n\n{"optimalPlacement": "TOP_LEFT", "confidence": 0.95}\n\nEspero que te sirva!';
    const result = cleanAndParseJson<{ optimalPlacement: string; confidence: number }>(raw);
    expect(result.optimalPlacement).toBe('TOP_LEFT');
    expect(result.confidence).toBe(0.95);
  });

  it('lanza un error descriptivo si el contenido no contiene JSON válido', () => {
    const invalid = 'Lo siento, no puedo procesar la imagen.';
    expect(() => cleanAndParseJson(invalid)).toThrow('Error parseando JSON de respuesta del LMM');
  });
});
