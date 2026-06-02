/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from "./types";

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "stud-1",
    name: "Sofía Luna",
    avatar: "🐰", // Cute kawaii rabbit
    parcialesGrade: 9.2,
    attendanceRate: 98,
    activities: [
      { id: "act-1-1", name: "Proyecto Ciencias", grade: 9.5, weight: 60 },
      { id: "act-1-2", name: "Tarea de Investigación", grade: 8.8, weight: 40 }
    ],
    rubric: {
      participacion: 9,
      aportacionIdeas: 8,
      retencionDatos: 9,
      habilidadesArtisticas: 10,
      sociabilidad: 7,
      liderazgo: 6,
      resolucionProblemas: 8,
      inteligenciaEmocional: 9,
      apoyoCompaneros: 8
    },
    notes: "Tiene mucho talento artístico y suele expresarse muy bien mediante dibujos y bocetos. Su retención de información visual es sobresaliente."
  },
  {
    id: "stud-2",
    name: "Mateo Pérez",
    avatar: "🐻", // Cute kawaii bear
    parcialesGrade: 7.5,
    attendanceRate: 90,
    activities: [
      { id: "act-2-1", name: "Proyecto Ciencias", grade: 8.0, weight: 60 },
      { id: "act-2-2", name: "Tarea de Investigación", grade: 7.0, weight: 40 }
    ],
    rubric: {
      participacion: 8,
      aportacionIdeas: 9,
      retencionDatos: 6,
      habilidadesArtisticas: 5,
      sociabilidad: 10,
      liderazgo: 9,
      resolucionProblemas: 7,
      inteligenciaEmocional: 8,
      apoyoCompaneros: 10
    },
    notes: "Es un líder social excelente en el aula. Siempre ayuda a sus compañeros y demuestra altos valores de compañerismo."
  },
  {
    id: "stud-3",
    name: "Emily Rodríguez",
    avatar: "🐱", // Cute kawaii kitty
    parcialesGrade: 9.8,
    attendanceRate: 100,
    activities: [
      { id: "act-3-1", name: "Proyecto Ciencias", grade: 10, weight: 60 },
      { id: "act-3-2", name: "Tarea de Investigación", grade: 9.5, weight: 40 }
    ],
    rubric: {
      participacion: 9,
      aportacionIdeas: 8,
      retencionDatos: 10,
      habilidadesArtisticas: 6,
      sociabilidad: 7,
      liderazgo: 8,
      resolucionProblemas: 10,
      inteligenciaEmocional: 9,
      apoyoCompaneros: 7
    },
    notes: "Presenta una agilidad lógica muy madura para el grupo. Resuelve problemas con facilidad y tiene excelente memoria."
  },
  {
    id: "stud-4",
    name: "Liam Silva",
    avatar: "🐨", // Cute kawaii koala
    parcialesGrade: 6.2,
    attendanceRate: 85,
    activities: [
      { id: "act-4-1", name: "Proyecto Ciencias", grade: 6.5, weight: 60 },
      { id: "act-4-2", name: "Tarea de Investigación", grade: 5.5, weight: 40 }
    ],
    rubric: {
      participacion: 5,
      aportacionIdeas: 6,
      retencionDatos: 7,
      habilidadesArtisticas: 8,
      sociabilidad: 6,
      liderazgo: 5,
      resolucionProblemas: 5,
      inteligenciaEmocional: 9,
      apoyoCompaneros: 8
    },
    notes: "Es un alumno reservado pero sumamente empático y colaborativo. Responde de forma positiva a las dinámicas artísticas y juegos grupales."
  },
  {
    id: "stud-5",
    name: "Santiago Gómez",
    avatar: "🦊", // Cute kawaii fox
    parcialesGrade: 5.8,
    attendanceRate: 78,
    activities: [
      { id: "act-5-1", name: "Proyecto Ciencias", grade: 6.0, weight: 50 },
      { id: "act-5-2", name: "Tarea de Investigación", grade: 6.0, weight: 50 }
    ],
    rubric: {
      participacion: 6,
      aportacionIdeas: 7,
      retencionDatos: 5,
      habilidadesArtisticas: 7,
      sociabilidad: 8,
      liderazgo: 6,
      resolucionProblemas: 6,
      inteligenciaEmocional: 8,
      apoyoCompaneros: 9
    },
    notes: "Tiene buena disposición social pero requiere apoyo técnico para consolidar los conocimientos lógicos básicos."
  }
];
