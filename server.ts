/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Google GenAI so it won't crash on boot if the key is missing.
  const getAIClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API endpoint for generating pedagogic diagnostic advice
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { students, groupAverage, threshold } = req.body;
      const ai = getAIClient();

      if (!ai) {
        // Return a highly thorough and beautiful rules-based local pedagogical response as fallback
        const staticAdvice = `### Intervención Pedagógica Local (Modo Independiente)
*Nota: Para habilitar el diagnóstico hiper-personalizado con Inteligencia Artificial, asegúrate de activar la clave de API \`GEMINI_API_KEY\` en el panel de Secrets.*

El promedio del grupo (**${groupAverage.toFixed(2)}**) se encuentra debajo de la meta mínima establecida (**${threshold}**). A continuación se prescriben directrices pedagógicas basadas en el perfil de tu clase para mejorar el rendimiento colectivo:

#### 1. Plan de Activación e Innovador de Metodologías
- **Gamificación Didáctica**: Reemplazar una clase magistral teórica por una sesión de trivia por equipos o un escape-room temático.
- **Micro-Proyectos Prácticos**: Fomentar la enseñanza basada en problemas (EBP). Dividir los tópicos complejos en rompecabezas grupales interactivos de 15 minutos en los cuales cada alumno deba resolver una parte específica de la tarea.

#### 2. Dinamización por Canales de Aprendizaje Detectados
- **Para Creadores Creativos (Visual/Manual)**: Permitir que los alumnos entreguen mapas mentales ilustrados, álbumes de fotos comentados o maquetas en lugar de un reporte lineal escrito clásico. Aliviana la fricción académica y explota su motivación natural.
- **Para Líderes Colaborativos y Perfil Social**: Integrar dinámicas de tutorías horizontales en el aula. Emparejar a alumnos con alta puntuación socio-afectiva con alumnos que requieran reforzar conocimientos clave en un formato amigable y lúdico.

#### 3. Soporte Emocional y Relacional (Módulo Cualitativo)
- **Círculo de Diálogo de 5 Minutos**: Iniciar la jornada con una breve dinámica de inteligencia emocional en círculo abierto, permitiendo que compartan su estado de ánimo con un emoji dibujado.
-   **Refuerzo Positivo Constante**: Utilizar insignias (badges) cariñosas para premiar el esfuerzo, la ayuda mutua ("Súper Compañero") y la creatividad, más allá de la mera nota numérica pura.`;

        return res.json({
          status: "fallback",
          recommendations: staticAdvice
        });
      }

      // Prepare a contextual audit of the group to feed Gemini
      const studentDetails = (students || []).map((s: any) => {
        return `- ${s.name}: Nota Final Calculada: ${s.finalGrade?.toFixed(1) || 'Sin nota'}, Asistencia: ${s.attendanceRate}%, Estilo Predominante: ${s.predictedProfile?.badge || 'Científico'}, Comportamiento: ${s.notes || 'Normal'}`;
      }).join("\n");

      const prompt = `Actúas como un orientador escolar y psicopedagogo experto, especializado en metodologías activas y pedagogías tiernas/pasteles para primaria y secundaria escolar.

Tu colega docente te presenta estadísticas colectivas de su grupo para que estructures un diagnóstico educativo. El promedio del aula (${groupAverage.toFixed(2)}) ha caído por debajo de su umbral ideal de alerta (${threshold}).

DATOS GENERALES DE EVALUACIÓN:
- Promedio del Grupo: ${groupAverage.toFixed(2)}
- Umbral Configurado: ${threshold}
- Alumnos Registrados: ${(students || []).length}

EXPEDIENTE DE ALUMNOS ANALIZADOS:
${studentDetails}

Por favor, ayúdale a redactar un plan estratégico amoroso y profesional titulado:
"✨ Diagnóstico y Plan de Soporte Pedagógico Colectivo (IA)"

El informe debe componerse de las siguientes secciones ilustradas y amenas:
1.  **🔍 Radiografía de Vulnerabilidades**: Un análisis simpático e integrado de por qué el promedio cayó (¿es por baja de actividades parciales, rezago en asistencias de Liam/Santiago, o complejidad técnica?).
2.  **🧩 Estrategias Didácticas con Enfoque de Ternura**: Propuesta de metodologías directas basadas en el juego y la colaboración ajustadas al aula.
3.  **🌸 Activación de Fortalezas según Canales**: Cómo integrar a los perfiles de los niños (por ejemplo, si combinan talento artístico con liderazgo como Sofía o Mateo) para motivar la nivelación e inserción deLiam o Santiago.
4.  **📝 Plan de Trabajo Exprés**: Puntos de acción prácticos del lunes al viernes para motivar el entusiasmo y el re-enganche pedagógico en clase.

Formatea de modo ameno con encabezados con iconos emoji kawaii (✨, 🦄, 🐼, 📚, 🎨, 🔍), negritas marcadoras y listas claras para fácil lectura docente. No incluyas información técnica del servidor.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({
        status: "success",
        recommendations: response.text || "Hubo un inconveniente al generar la respuesta de Gemini."
      });

    } catch (error: any) {
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error.message || "Error al solicitar diagnóstico." });
    }
  });

  // Serve static frontend assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server runs on port ${PORT}`);
  });
}

startServer();
