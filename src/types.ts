/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Activity {
  id: string;
  name: string;
  grade: number;      // Calificación: 0 - 10
  weight: number;     // Peso en porcentaje dentro de Actividades (ej. 50%)
}

export interface QualitativeRubric {
  participacion: number;           // Escala 1 - 10
  aportacionIdeas: number;         // Escala 1 - 10
  retencionDatos: number;          // Escala 1 - 10
  habilidadesArtisticas: number;   // Escala 1 - 10
  sociabilidad: number;            // Escala 1 - 10
  liderazgo: number;               // Escala 1 - 10
  resolucionProblemas: number;     // Escala 1 - 10
  inteligenciaEmocional: number;   // Escala 1 - 10
  apoyoCompaneros: number;         // Escala 1 - 10
}

export interface Student {
  id: string;
  name: string;
  avatar: string;                  // Emoji o URL de ilustración
  parcialesGrade: number;          // Calificación: 0 - 10
  attendanceRate: number;          // Asistencia en porcentaje: 0 - 100
  activities: Activity[];
  rubric: QualitativeRubric;
  notes?: string;
}

export interface EvaluationWeights {
  parciales: number;               // Peso total de parciales (ej. 40)
  asistencia: number;              // Peso total de asistencia (ej. 20)
  actividades: number;             // Peso total de actividades (ej. 40)
}

export interface LearningProfile {
  title: string;
  badge: string;                   // E.g. "Creador Creativo"
  emoji: string;                   // E.g. "🎨"
  color: string;                   // E.g. "pink"
  bg: string;                      // E.g. "bg-pink-100 text-pink-700"
  description: string;
  tips: string[];
}
