/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Heart, 
  Award, 
  Search, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Settings, 
  UserPlus, 
  FileSpreadsheet, 
  Sparkles, 
  ChevronRight, 
  Info, 
  HelpCircle, 
  RefreshCw, 
  FileDown, 
  Github, 
  ExternalLink,
  Sliders,
  TrendingDown,
  TrendingUp,
  Smile,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, EvaluationWeights, Activity } from "./types";
import { INITIAL_STUDENTS } from "./initialData";

export default function App() {
  // --- Persistent & Interactive State ---
  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem("pastel_eval_students");
    return local ? JSON.parse(local) : INITIAL_STUDENTS;
  });

  const [weights, setWeights] = useState<EvaluationWeights>(() => {
    const local = localStorage.getItem("pastel_eval_weights");
    return local ? JSON.parse(local) : { parciales: 40, asistencia: 20, actividades: 40 };
  });

  const [threshold, setThreshold] = useState<number>(() => {
    const local = localStorage.getItem("pastel_eval_threshold");
    return local ? parseFloat(local) : 7.0;
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return students.length > 0 ? students[0].id : "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"grades" | "profiles" | "analytics" | "sheets" | "github">("grades");

  // Add Student State
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAvatar, setNewStudentAvatar] = useState("🐰");
  const [newStudentNotes, setNewStudentNotes] = useState("");

  // Edit Activity Modal State (Quick Add)
  const [newActName, setNewActName] = useState("");
  const [newActGrade, setNewActGrade] = useState(10);
  const [newActWeight, setNewActWeight] = useState(50);

  // Google Sheets Connector Settings
  const [appsScriptUrl, setAppsScriptUrl] = useState(() => {
    return localStorage.getItem("pastel_eval_apps_script_url") || "";
  });
  const [sheetsConsole, setSheetsConsole] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Gemini Recommendations Endpoint State
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem("pastel_eval_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("pastel_eval_weights", JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem("pastel_eval_threshold", threshold.toString());
  }, [threshold]);

  useEffect(() => {
    localStorage.setItem("pastel_eval_apps_script_url", appsScriptUrl);
  }, [appsScriptUrl]);

  // Available Cute Emojis for Avatars
  const AVATAR_OPTIONS = ["🐰", "🐻", "🐱", "🐨", "🦊", "🦁", "🐼", "🐵", "🦄", "🐶", "🐧", "🐹"];

  // --- Calculations Matrix ---

  // Calculates the sum of overall weights
  const weightsSum = useMemo(() => {
    return weights.parciales + weights.asistencia + weights.actividades;
  }, [weights]);

  // Safe weights balance helper (if sum != 100, we calculate proportional factors, but warn user)
  const scaledWeights = useMemo(() => {
    const total = weightsSum > 0 ? weightsSum : 100;
    return {
      parciales: weights.parciales / total,
      asistencia: weights.asistencia / total,
      actividades: weights.actividades / total,
    };
  }, [weights, weightsSum]);

  // Calculates details for each student
  const studentsComputed = useMemo(() => {
    return students.map((student) => {
      // 1. Calculate weighted activities grade
      let activitiesGrade = 0;
      let totalActWeight = student.activities.reduce((sum, act) => sum + act.weight, 0);
      
      if (student.activities.length > 0) {
        if (totalActWeight > 0) {
          const weightedSum = student.activities.reduce((sum, act) => sum + (act.grade * act.weight), 0);
          activitiesGrade = weightedSum / totalActWeight;
        } else {
          // Fallback to simple average
          const sumGrades = student.activities.reduce((sum, act) => sum + act.grade, 0);
          activitiesGrade = sumGrades / student.activities.length;
          totalActWeight = 100;
        }
      } else {
        activitiesGrade = 0;
      }

      // 2. Final Grade Calculation
      // Attendance is from 0-100%, we normalize it to a 0-10 grade (100% = 10.0, 80% = 8.0)
      const attendanceGrade = student.attendanceRate / 10;
      
      const pContrib = student.parcialesGrade * scaledWeights.parciales;
      const aContrib = attendanceGrade * scaledWeights.asistencia;
      const acContrib = activitiesGrade * scaledWeights.actividades;
      const finalGrade = pContrib + aContrib + acContrib;

      // 3. Learning style classification
      // Cognitive categories based on observation parameters (scale 1-10)
      const rub = student.rubric;
      const visualScore = rub.habilidadesArtisticas * 1.2 + rub.aportacionIdeas * 0.5;
      const logicScore = rub.resolucionProblemas * 1.2 + rub.retencionDatos * 1.0;
      const socialScore = rub.sociabilidad * 1.0 + rub.apoyoCompaneros * 1.0 + rub.liderazgo * 0.8;
      const emotionalScore = rub.inteligenciaEmocional * 1.2 + rub.participacion * 0.8;

      let scoreMax = Math.max(visualScore, logicScore, socialScore, emotionalScore);
      let pTitle = "Creador Creativo";
      let pBadge = "Apercepción Artística & Visual";
      let pEmoji = "🎨🐰";
      let pColor = "pink";
      let pBg = "bg-rose-50 border-rose-200 text-rose-600";
      let pDesc = "Aprende mejor mediante esquemas cromáticos, analogías visuales, representaciones plásticas e imaginación libre.";
      let pTips = [
        "Permítele plasmar síntesis científicas con cómics, dibujos o mapas mentales.",
        "Utiliza organizadores gráficos de colores pastel en clase.",
        "Integra rúbricas de exposición donde lo estético complemente la teoría básica."
      ];

      if (scoreMax === logicScore) {
        pTitle = "Pensador Analítico";
        pBadge = "Lógica Matemática y Categorías";
        pEmoji = "🔬🦉";
        pColor = "indigo";
        pBg = "bg-indigo-50 border-indigo-200 text-indigo-600";
        pDesc = "Presenta facilidad sobresaliente para resolver dinámicas estructuradas, catalogar hipótesis y retener datos empíricos.";
        pTips = [
          "Preséntale retos lógicos complementarios o acertijos en sus entregas.",
          "Anímale a categorizar sus resúmenes escolares con listas bien organizadas.",
          "Fomenta dinámicas científicas de causa y efecto donde deduzca conclusiones."
        ];
      } else if (scoreMax === socialScore) {
        pTitle = "Líder Colaborativo";
        pBadge = "Sociabilidad e Inteligencia Grupal";
        pEmoji = "🤝🐻";
        pColor = "amber";
        pBg = "bg-amber-50 border-amber-200 text-amber-700";
        pDesc = "Brilla coordinando mesas de opinión escolar, apoya desinteresadamente a su equipo y promueve climas de mutua empatía.";
        pTips = [
          "Asígnalo como embajador o coordinador de debates interactivos temporales.",
          "Fomenta el aprendizaje cooperativo y encomiéndale labores de tutoría grupal.",
          "Celebra su constante auxilio empático hacia compañeros rezagados."
        ];
      } else if (scoreMax === emotionalScore) {
        pTitle = "Mediador Empático";
        pBadge = "Regulación Emocional e Intrapersonal";
        pEmoji = "🌸🐨";
        pColor = "emerald";
        pBg = "bg-emerald-50 border-emerald-200 text-emerald-700";
        pDesc = "Destaca por su madurez emocional, asertividad relacional, participación justa y moderación en conflictos grupales.";
        pTips = [
          "Estimula su expresión mediante diarios de clase reflexivos o ensayos libres.",
          "Hazle partícipe activo en resolución pacífica de dudas colectivas.",
          "Bríndale un intervalo de respiro intrapersonal si detectas frustración académica."
        ];
      }

      return {
        ...student,
        activitiesGrade,
        totalActWeight,
        finalGrade,
        predictedProfile: {
          title: pTitle,
          badge: pBadge,
          emoji: pEmoji,
          color: pColor,
          bg: pBg,
          description: pDesc,
          tips: pTips,
        }
      };
    });
  }, [students, scaledWeights]);

  // Find exact selected student data
  const selectedStudent = useMemo(() => {
    return studentsComputed.find((s) => s.id === selectedStudentId) || studentsComputed[0] || null;
  }, [studentsComputed, selectedStudentId]);

  // Group Stats
  const groupStats = useMemo(() => {
    if (studentsComputed.length === 0) return { average: 0, alertActive: false };
    const sum = studentsComputed.reduce((acc, s) => acc + s.finalGrade, 0);
    const average = sum / studentsComputed.length;
    return {
      average,
      alertActive: average < threshold,
    };
  }, [studentsComputed, threshold]);

  // Search Filter
  const filteredStudents = useMemo(() => {
    return studentsComputed.filter((s) => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentsComputed, searchQuery]);

  // --- CRUD Functions ---

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: "stud-" + Date.now(),
      name: newStudentName.trim(),
      avatar: newStudentAvatar,
      parcialesGrade: 8.0,
      attendanceRate: 90,
      activities: [
        { id: "act-" + Date.now() + "-1", name: "Actividad Diagnóstica 1", grade: 8.5, weight: 100 }
      ],
      rubric: {
        participacion: 7,
        aportacionIdeas: 7,
        retencionDatos: 7,
        habilidadesArtisticas: 7,
        sociabilidad: 7,
        liderazgo: 7,
        resolucionProblemas: 7,
        inteligenciaEmocional: 7,
        apoyoCompaneros: 7
      },
      notes: newStudentNotes.trim() || "Estudiante recién incorporado a la rúbrica interactiva."
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    setSelectedStudentId(newStudent.id);
    
    // Reset Add fields
    setNewStudentName("");
    setNewStudentNotes("");
    setShowAddStudent(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm("¿Estás seguro/a que deseas dar de baja este estudiante?")) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      if (selectedStudentId === id && updated.length > 0) {
        setSelectedStudentId(updated[0].id);
      }
    }
  };

  // Modify individual student fields directly
  const updateStudentField = (studentId: string, field: keyof Student, value: any) => {
    setStudents((prev) => 
      prev.map((s) => (s.id === studentId ? { ...s, [field]: value } : s))
    );
  };

  // Modify nested qualitative rubric directly
  const updateStudentRubric = (studentId: string, rubricField: keyof Student["rubric"], value: number) => {
    setStudents((prev) => 
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            rubric: {
              ...s.rubric,
              [rubricField]: value
            }
          };
        }
        return s;
      })
    );
  };

  // Activities CRUD
  const handleAddActivity = (studentId: string) => {
    if (!newActName.trim()) return;
    const newActivity: Activity = {
      id: "act-new-" + Date.now(),
      name: newActName.trim(),
      grade: Number(newActGrade),
      weight: Number(newActWeight)
    };

    setStudents((prev) => 
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedActivities = [...s.activities, newActivity];
          return {
            ...s,
            activities: updatedActivities
          };
        }
        return s;
      })
    );

    // Reset simple fields
    setNewActName("");
  };

  const handleUpdateActivity = (studentId: string, activityId: string, field: keyof Activity, value: any) => {
    setStudents((prev) => 
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedActivities = s.activities.map((act) => {
            if (act.id === activityId) {
              return { ...act, [field]: value };
            }
            return act;
          });
          return {
            ...s,
            activities: updatedActivities
          };
        }
        return s;
      })
    );
  };

  const handleDeleteActivity = (studentId: string, activityId: string) => {
    setStudents((prev) => 
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedActivities = s.activities.filter((act) => act.id !== activityId);
          return {
            ...s,
            activities: updatedActivities
          };
        }
        return s;
      })
    );
  };

  // Reset standard simulation data
  const handleResetApp = () => {
    if (window.confirm("¿Deseas reiniciar la información a los alumnos iniciales de prueba?")) {
      setStudents(INITIAL_STUDENTS);
      setWeights({ parciales: 40, asistencia: 20, actividades: 40 });
      setThreshold(7.0);
      setSelectedStudentId(INITIAL_STUDENTS[0].id);
      setAiRecommendation("");
    }
  };

  // --- Real Time Call to server-side Gemini ---
  const handleGetAiRecommendations = async () => {
    setLoadingAI(true);
    setAiRecommendation("");
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          students: studentsComputed,
          groupAverage: groupStats.average,
          threshold: threshold,
        }),
      });

      const data = await response.json();
      if (data.recommendations) {
        setAiRecommendation(data.recommendations);
      } else if (data.error) {
        setAiRecommendation(`⚠️ Error de Servicio: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      setAiRecommendation("⚠️ No fue posible conectar con el servidor para generar recomendaciones. Revisa el estado de la red.");
    } finally {
      setLoadingAI(false);
    }
  };

  // --- External Integrations: Google Sheets Connector (Apps Script Live) ---
  const handleAppsScriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appsScriptUrl) {
      alert("Por favor ingresa un link válido de Google Apps Script Web App.");
      return;
    }

    setIsExporting(true);
    setSheetsConsole((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Iniciando canalización de datos interactivos a Google Sheets...`]);

    const payload = {
      timestamp: new Date().toISOString(),
      sender: "Evaluador Integral Inteligente",
      teacherEmail: "pd46340@uvp.edu.mx",
      groupStats: {
        totalStudents: studentsComputed.length,
        average: groupStats.average,
        alertThreshold: threshold,
        alertSignaled: groupStats.alertActive ? "SÍ" : "NO",
        rubricWeights: weights
      },
      students: studentsComputed.map((s) => ({
        id: s.id,
        nombre: s.name,
        parcialesGrade: s.parcialesGrade,
        asistenciaPercent: s.attendanceRate,
        actividadesGrade: s.activitiesGrade,
        calificacionFinal: s.finalGrade,
        perfilAprendizaje: s.predictedProfile.title,
        rubricaCualitativa: s.rubric,
        observaciones: s.notes
      }))
    };

    setSheetsConsole((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Organizando carga JSON completa del grupo...`]);

    try {
      // Use Client-side Fetch to send Webhook cross-origin (Google App Script requires POST and handles redirections)
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        mode: "no-cors", // Required because of Google Apps Script redirects and CORS policies
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      setSheetsConsole((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] PETICIÓN ENVIADA SATISFACTORIAMENTE (Código WebApp de Google procesará la redirección).`,
        `[Petición] -> POST a URL de Google Apps Script con longitud de body: ${JSON.stringify(payload).length} bytes.`,
        `💡 ¡Fantástico! Dado que Apps Script opera mediante redirecciones de cuota (CORS 'no-cors'), la llamada es asíncrona ciega. Verifica tu Hoja de Google asociada; ¡la hoja ya tiene registradas las nuevas filas e información del mes!`
      ]);
    } catch (err: any) {
      setSheetsConsole((prev) => [
        ...prev, 
        `❌ Error en conexión directa: ${err.message || err.toString()}`,
        `💡 Nota: Asegúrate de haber publicado tu Apps Script como 'Web App' y otorgado permisos para 'Anyone' (Cualquiera).`
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  // Locally download formatted student sheet data as CSV (Fallback)
  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Headers
    csvContent += "ID,Nombre,Parciales,Asistencia %,Actividades Promedio,Nota Final,Perfil de Aprendizaje,Observaciones\n";
    
    // Rows
    studentsComputed.forEach((s) => {
      const row = [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.parcialesGrade,
        s.attendanceRate,
        s.activitiesGrade.toFixed(2),
        s.finalGrade.toFixed(2),
        `"${s.predictedProfile.title}"`,
        `"${(s.notes || "").replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Evaluacion_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSheetsConsole((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Archivo CSV de respaldo generado y descargado localmente.`]);
  };

  // Google Apps Script source code for copy/paste
  const appsScriptCode = `/**
 * Google Apps Script para recibir datos desde la Web App de Evaluación Integral
 * Copia este código completo en la sección Extensiones -> Apps Script de tu Google Sheet
 */

function doPost(e) {
  try {
    // Analizar el JSON recibido en la petición
    var postData = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la hoja está totalmente vacía, crear encabezados interactivos
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha de Reporte", 
        "ID Alumno", 
        "Nombre del Estudiante", 
        "Calificación Parciales", 
        "Asistencia %", 
        "Nota Actividades", 
        "Calificación Final", 
        "Perfil de Aprendizaje", 
        "Observaciones Docentes"
      ]);
      // Dar estilo de pastel a la fila Header
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#FFEDF2"); // Rosa pastel tierno
      headerRange.setFontColor("#C24177");
      headerRange.setFontWeight("bold");
    }
    
    // Escribir fila para cada alumno enviado
    var students = postData.students;
    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      sheet.appendRow([
        postData.timestamp,
        s.id,
        s.nombre,
        s.parcialesGrade,
        s.asistenciaPercent + "%",
        s.actividadesGrade,
        s.calificacionFinal,
        s.perfilAprendizaje,
        s.observaciones
      ]);
    }
    
    // Devolver respuesta estructurada de éxito
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "message": "Datos de " + students.length + " alumnos archivados con éxito!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "error", 
      "message": error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="min-h-screen bg-[#FFECF2] p-4 md:p-6 text-gray-800 font-sans antialiased selection:bg-kawaii-pink/35 flex flex-col gap-6 relative">
      
      {/* Sparkles / Cute Ornaments */}
      <div className="absolute top-4 left-6 text-xl animate-bounce pointer-events-none text-rose-300">🌸</div>
      <div className="absolute top-12 right-12 text-2xl animate-spin pointer-events-none text-cyan-300" style={{ animationDuration: '6s' }}>✨</div>
      <div className="absolute top-1/3 left-4 text-lg pointer-events-none text-amber-300 text-opacity-80">⭐</div>
      <div className="absolute bottom-12 left-10 text-2xl animate-pulse pointer-events-none text-teal-300">🐾</div>
      
      {/* Top Cute Header */}
      <header className="max-w-7xl w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between glass-panel p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border-4 border-pink-300 rounded-full flex items-center justify-center text-3xl shadow-md hover:scale-105 transition-transform shrink-0">
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF5FF] border border-purple-200 text-purple-700">EdTech Pastel 🌸</span>
                <span className="text-xs text-slate-400">v1.2</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight tracking-tight flex items-center gap-1.5 pt-0.5">
                Escuela Primaria "Los Girasoles"
              </h1>
              <p className="text-pink-500 font-semibold text-xs">
                Panel Docente • Mtra. Sofía García • Registro Técnico & Evaluaciones
              </p>
            </div>
          </div>

          {/* Core group stats bubble */}
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/70 border border-white rounded-2xl p-4 shadow-inner">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Registrados</span>
              <span className="text-xl font-bold font-mono text-gray-800">{studentsComputed.length} Alumnos</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Promedio Grupal</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-xl font-bold font-mono ${groupStats.alertActive ? "text-red-500" : "text-emerald-600"}`}>
                  {groupStats.average.toFixed(2)}
                </span>
                {groupStats.alertActive ? (
                  <TrendingDown className="w-4 h-4 text-red-500 animate-bounce" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Navigation System */}
      <nav id="nav-container" className="max-w-7xl w-full mx-auto">
        <div className="flex flex-wrap items-center gap-2 bg-white/60 p-2 rounded-2xl border-2 border-white backdrop-blur-[10px] shadow-sm">
          <button
            id="nav-grades"
            onClick={() => setActiveTab("grades")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] ${
              activeTab === "grades" 
                ? "bg-kawaii-pink text-white shadow-md" 
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            📋 Calificaciones Cuantitativas
          </button>
          <button
            id="nav-profiles"
            onClick={() => setActiveTab("profiles")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] ${
              activeTab === "profiles" 
                ? "bg-[#81C784] text-white shadow-md" 
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            🦊 Rúbricas & Canal de Aprendizaje
          </button>
          <button
            id="nav-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] ${
              activeTab === "analytics" 
                ? "bg-[#64B5F6] text-white shadow-md" 
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            📊 Consejero Pedagógico & IA
          </button>
          <button
            id="nav-sheets"
            onClick={() => setActiveTab("sheets")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] ${
              activeTab === "sheets" 
                ? "bg-[#9c27b0] text-white shadow-md" 
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            💚 Google Sheets Apps Script
          </button>
          <button
            id="nav-github"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] ${
              activeTab === "github" 
                ? "bg-amber-400 text-white shadow-md" 
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            🚀 Guía GitHub Pages
          </button>
        </div>
      </nav>

      {/* Main Panel Content Area */}
      <main id="main-content" className="max-w-7xl w-full mx-auto pb-12 flex flex-col gap-6">
        
        {/* WARNING BAR IF MAIN WEIGHTS DO NOT SUM TO 100% */}
        {weightsSum !== 100 && (
          <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/75 border-2 border-amber-300 text-amber-800 text-xs backdrop-blur-[10px] shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse flex-shrink-0" />
              <span>
                <strong>¡Aviso de Balanza de Rubros!</strong> Tus porcentajes generales suman el <strong>{weightsSum}%</strong>. Para un veredicto óptimo, deben sumar <strong>100%</strong>. El sistema ha rebalanceado de forma proporcional interna la nota final.
              </span>
            </div>
            <button 
              onClick={() => setWeights({ parciales: 40, asistencia: 20, actividades: 40 })} 
              className="kawaii-btn text-[10px] uppercase shadow-sm"
            >
              Equilibrar Automático (40-20-40)
            </button>
          </div>
        )}

        {/* ALERTA EDUCATIVA BANNER COLECTIVA */}
        {groupStats.alertActive && (
          <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFECF2]/90 border-2 border-white text-rose-800 text-xs backdrop-blur-[10px] shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="text-xl animate-bounce">🏫🚨</span>
              <span>
                <strong>Alerta Grupal:</strong> El promedio general de la escuela/grupo (<strong>{groupStats.average.toFixed(2)}</strong>) está bajo el umbral configurado de <strong>{threshold.toFixed(1)}</strong>. Revisa estrategias en <strong>📊 Consejero Pedagógico & IA</strong>.
              </span>
            </div>
            <button 
              onClick={() => {
                setActiveTab("analytics");
              }} 
              className="kawaii-btn text-[10px] py-1.5 px-3 uppercase flex items-center gap-1 shadow-md"
            >
              Ver Consejos Docentes <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* -------------------- TAB 1: CALIFICACIONES CUANTITATIVAS (GRADES) -------------------- */}
        {activeTab === "grades" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Student Selection & Main Criteria Weights */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Overall Evaluation Settings Panel */}
              <div id="weights-panel" className="glass-panel p-6 shadow-md">
                <div className="flex items-center justify-between border-b border-pink-200 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">⚙️</span>
                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Porcentajes de Evaluación</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${weightsSum === 100 ? "bg-green-100 text-green-700" : "bg-rose-100 text-[#FF85A1]"}`}>
                    Suma: {weightsSum}%
                  </span>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  {/* Option 1: Parciales */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700 text-xs">Exámenes Parciales (%):</span>
                      <span className="font-bold text-gray-900">{weights.parciales}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={weights.parciales} 
                      onChange={(e) => setWeights({ ...weights, parciales: parseInt(e.target.value) || 0 })}
                      className="w-full accent-kawaii-pink cursor-pointer"
                    />
                  </div>

                  {/* Option 2: Asistencia */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700 text-xs">Asistencia Peso (%):</span>
                      <span className="font-bold text-gray-900">{weights.asistencia}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={weights.asistencia} 
                      onChange={(e) => setWeights({ ...weights, asistencia: parseInt(e.target.value) || 0 })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Option 3: Actividades */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700 text-xs">Actividades Peso (%):</span>
                      <span className="font-bold text-gray-900">{weights.actividades}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={weights.actividades} 
                      onChange={(e) => setWeights({ ...weights, actividades: parseInt(e.target.value) || 0 })}
                      className="w-full accent-green-400 cursor-pointer"
                    />
                  </div>
                  
                  <div className="bg-white/60 p-3 rounded-xl text-[11px] text-gray-500 border border-white italic">
                    💡 ¡Edita con las barras! Las notas de "Los Girasoles" se recalcularán de inmediato.
                  </div>
                </div>
              </div>

              {/* Student Listing Container */}
              <div id="students-list-panel" className="glass-panel p-6 shadow-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-pink-200 pb-3">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏫</span> Lista de Estudiantes ({studentsComputed.length})
                  </h3>
                  <button 
                    id="btn-add-student-modal"
                    onClick={() => setShowAddStudent(true)}
                    className="kawaii-btn text-[10px] py-1.5 px-3 uppercase flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3 h-3" /> + Inscribir Estudiante
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-300">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs input-soft focus:ring-2 focus:ring-pink-300/40"
                  />
                </div>

                {/* List Body */}
                <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-2">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-pink-200 rounded-2xl">
                      🌸 Ningún alumno coincide con la búsqueda.
                    </div>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = s.id === selectedStudentId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border-2 ${
                            isSelected 
                              ? "bg-white border-[#FF85A1] ring-4 ring-pink-100 shadow-md" 
                              : "bg-white/50 border-transparent hover:border-blue-200"
                          }`}
                        >
                          <div className="w-10 h-10 bg-white border border-pink-100 rounded-full flex items-center justify-center text-xl shrink-0 shadow-sm">
                            {s.avatar}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-700 truncate">{s.name}</p>
                            <p className="text-[10px] text-pink-500 font-semibold truncate leading-tight">
                              {s.predictedProfile.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="stat-circle bg-green-400 text-xs w-11 h-11 border-2 border-white shadow-sm flex items-center justify-center font-mono font-bold" style={{ backgroundColor: s.finalGrade >= 9 ? "#81C784" : s.finalGrade >= 7 ? "#FFD54F" : "#FF85A1" }}>
                              {s.finalGrade.toFixed(1)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudent(s.id);
                              }}
                              className="p-1 text-[#FF85A1] hover:text-red-600 rounded transition"
                              title="Baja de estudiante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Simple Reset Tool */}
              <button 
                onClick={handleResetApp}
                className="kawaii-btn-secondary text-[11px] uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restaurar Alumnos de Prueba
              </button>
            </div>

            {/* Right Box: Selected Student Profile & Interactive Grading */}
            <div className="lg:col-span-8">
              {selectedStudent ? (
                <div className="flex flex-col gap-6">
                  
                  {/* Selected Alumno Detail Header Bar */}
                  <div className="glass-panel p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar Carousel / Direct change */}
                      <div className="relative group shrink-0">
                        <div className="w-16 h-16 bg-white border-2 border-[#FF85A1] rounded-2xl flex items-center justify-center text-4xl shadow-md">
                          {selectedStudent.avatar}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={selectedStudent.name}
                            onChange={(e) => updateStudentField(selectedStudent.id, "name", e.target.value)}
                            className="bg-white border-2 border-pink-200 focus:border-kawaii-pink focus:outline-none text-lg font-bold text-gray-800 w-full max-w-sm px-2 py-1 rounded-xl"
                            title="Haz clic para renombrar estudiante directamente"
                            placeholder="Nombre del Alumno"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border-2 flex items-center gap-1 shadow-sm ${selectedStudent.predictedProfile.bg}`}>
                            <span>{selectedStudent.predictedProfile.emoji}</span>
                            {selectedStudent.predictedProfile.title}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            Evaluación Docente
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FFECF2] border-2 border-white px-5 py-3 rounded-2xl text-center flex-shrink-0 shadow-sm">
                      <p className="text-[10px] tracking-widest font-black text-[#FF85A1] uppercase">PROMEDIO FINAL</p>
                      <p className="text-3xl font-bold text-[#FF85A1] font-mono">{selectedStudent.finalGrade.toFixed(2)}</p>
                      <span className="text-[9px] text-[#FF85A1] font-bold">Escala Primaria</span>
                    </div>
                  </div>

                  {/* Quantitative Evaluations (Editable Rubrics Panel) */}
                  <div className="glass-panel p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2 border-b border-pink-100 pb-3 mb-6">
                      <span>📝</span> Evaluación de {selectedStudent.name}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      
                      {/* Sub-card: Parciales Grade */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-pink-100 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#FF85A1] flex items-center gap-1.5 uppercase tracking-wider">
                            Parciales (%)
                          </span>
                          <span className="text-[10px] font-bold bg-pink-100/60 px-2 py-1 rounded-lg text-rose-500">
                            Peso: {weights.parciales}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Calificación (0-10):</label>
                            <input 
                              type="number" 
                              min="0" 
                              max="10" 
                              step="0.1"
                              value={selectedStudent.parcialesGrade} 
                              onChange={(e) => updateStudentField(selectedStudent.id, "parcialesGrade", Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                              className="w-full input-soft font-bold text-base text-center text-gray-800"
                            />
                          </div>
                          <div className="text-right flex-shrink-0 pr-2">
                            <span className="block text-[9px] text-slate-400 uppercase font-bold">PUNTOS</span>
                            <span className="font-mono text-base font-bold text-gray-800">
                              {(selectedStudent.parcialesGrade * scaledWeights.parciales).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          * Nota acumulada de exámenes escolares aplicados.
                        </p>
                      </div>

                      {/* Sub-card: Attendance Rate */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-pink-100 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5 uppercase tracking-wider">
                            Asistencia (%)
                          </span>
                          <span className="text-[10px] font-bold bg-blue-50 px-2 py-1 rounded-lg text-blue-500">
                            Peso: {weights.asistencia}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Porcentaje de Asistencia (0-100%):</label>
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="1"
                              value={selectedStudent.attendanceRate} 
                              onChange={(e) => updateStudentField(selectedStudent.id, "attendanceRate", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-full input-soft font-bold text-base text-center text-gray-800"
                            />
                          </div>
                          <div className="text-right flex-shrink-0 pr-2">
                            <span className="block text-[9px] text-slate-400 uppercase font-bold">PUNTOS</span>
                            <span className="font-mono text-base font-bold text-gray-800">
                              {((selectedStudent.attendanceRate / 10) * scaledWeights.asistencia).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-blue-600 font-bold bg-[#E3F2FD] p-2 rounded-xl">
                          <span>Estatus de Asistencia:</span>
                          <span className={selectedStudent.attendanceRate >= 85 ? "text-green-600 font-black" : "text-red-500 font-black animate-pulse"}>
                            {selectedStudent.attendanceRate >= 90 ? "Regular Impecable" : selectedStudent.attendanceRate >= 80 ? "Suficiente" : "⚠️ En Riesgo de Faltas"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Sub-section: Dynamic Activities Rubric */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center gap-1">
                            🎨 Actividades Dinámicas Ajustables
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Cada actividad tiene peso e incidencia sobre el rubro final de Actividades general (peso de este rubro: {weights.actividades}%). Las ponderaciones se normalizan solas.
                          </p>
                        </div>
                        <span className="bg-[#E8F5E9] border-2 border-white text-emerald-700 text-xs px-3 py-1.5 rounded-xl font-mono font-bold shadow-sm">
                          Nota ponderada del rubro: {selectedStudent.activitiesGrade.toFixed(2)} / 10
                        </span>
                      </div>

                      {/* Activities interactive list list */}
                      <div className="flex flex-col gap-3 mb-6">
                        {selectedStudent.activities.length === 0 ? (
                          <div className="text-center py-8 bg-white/45 text-slate-400 italic text-xs border-2 border-dashed border-pink-100 rounded-2xl">
                            No se han ingresado actividades de clase. ¡Agrega una nueva debajo!
                          </div>
                        ) : (
                          selectedStudent.activities.map((act) => (
                            <div 
                              key={act.id} 
                              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white/95 rounded-2xl border-2 border-pink-100 shadow-sm relative group hover:shadow-md transition-all"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-pink-150 border-2 border-white rounded-lg p-1 text-[10px]">✏️</span>
                                <input
                                  type="text"
                                  value={act.name}
                                  onChange={(e) => handleUpdateActivity(selectedStudent.id, act.id, "name", e.target.value)}
                                  className="bg-transparent border-b-2 border-transparent focus:border-pink-300 focus:outline-none text-xs font-bold text-gray-700 px-1"
                                  placeholder="Nombre de actividad"
                                />
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Nota (0-10):</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={act.grade}
                                    onChange={(e) => handleUpdateActivity(selectedStudent.id, act.id, "grade", Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                                    className="w-16 bg-[#FFF9C4]/40 border-2 border-pink-100 rounded-xl p-1 text-xs text-center font-bold font-mono text-gray-800"
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Peso %:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={act.weight}
                                    onChange={(e) => handleUpdateActivity(selectedStudent.id, act.id, "weight", Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 bg-white border-2 border-pink-100 rounded-xl p-1 text-xs text-center font-bold font-mono text-gray-800"
                                  />
                                </div>

                                <div className="text-right">
                                  <span className="text-[9px] block text-gray-400 font-bold">Incidencia</span>
                                  <span className="font-mono font-bold text-pink-500">
                                    {selectedStudent.totalActWeight > 0 ? ((act.weight / selectedStudent.totalActWeight) * 100).toFixed(0) : 0}%
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleDeleteActivity(selectedStudent.id, act.id)}
                                  className="p-1.5 text-pink-300 hover:text-red-500 rounded transition"
                                  title="Eliminar actividad"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Activity Controls */}
                      <div className="bg-white/80 border-2 border-pink-200 rounded-2xl p-5 shadow-sm">
                        <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-pink-500 mb-3 block">➕ Agregar Actividad Evaluada</h5>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-5">
                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Nombre de la actividad:</label>
                            <input
                              type="text"
                              value={newActName}
                              onChange={(e) => setNewActName(e.target.value)}
                              placeholder="Ej. Tarea Fracciones, Álbum de Historia..."
                              className="input-soft text-xs p-2.5 w-full text-gray-700"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Nota inicial (0-10):</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={newActGrade}
                              onChange={(e) => setNewActGrade(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                              className="input-soft text-xs p-2.5 w-full text-gray-700 text-center font-mono"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] text-gray-500 font-bold block mb-1 font-sans">Peso %:</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={newActWeight}
                              onChange={(e) => setNewActWeight(Math.max(1, parseInt(e.target.value) || 50))}
                              className="input-soft text-xs p-2.5 w-full text-gray-700 text-center font-mono"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              onClick={() => handleAddActivity(selectedStudent.id)}
                              disabled={!newActName.trim()}
                              className="kawaii-btn w-full py-2.5 text-xs text-white disabled:opacity-50"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Observational and qualitative notes box */}
                  <div className="glass-panel p-6 shadow-md">
                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-pink-200 pb-3 mb-4">
                      <span>📝</span> Bitácora Docente / Historial Psicopedagógico
                    </h3>
                    <div>
                      <textarea
                        value={selectedStudent.notes || ""}
                        onChange={(e) => updateStudentField(selectedStudent.id, "notes", e.target.value)}
                        placeholder="Escribe conductas detectadas, progresos conductuales, dificultades transitorias familiares, o talentos detectados de este alumno..."
                        rows={3}
                        className="w-full p-4 text-xs bg-white border-2 border-pink-150 focus:outline-none focus:border-[#FF85A1] rounded-2xl font-sans text-gray-850"
                      />
                      <p className="text-[10px] text-pink-400 mt-1 font-semibold">
                        * Los apuntes de la bitácora alimentan el Diagnóstico Pedagógico de Inteligencia Artificial para afinar las recomendaciones de estudio.
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-rose-100">
                  <span className="text-5xl block animate-bounce">👩‍🏫</span>
                  <p className="text-slate-600 font-bold text-sm mt-4">No hay alumnos seleccionados.</p>
                  <p className="text-xs text-slate-400">Por favor agrega un alumno o haz clic en alguno de la lista lateral.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------- TAB 2: RÚBRICAS CUALITATIVAS (PROFILES) -------------------- */}
        {activeTab === "profiles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: list selection again but simplified */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="glass-panel p-6 shadow-md flex flex-col gap-3">
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1 pb-2 border-b border-pink-200">
                  <span>🧸</span> Alumno para Rúbrica
                </h3>
                <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {studentsComputed.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition text-xs font-bold ${
                        s.id === selectedStudentId 
                          ? "bg-white border-[#81C784] ring-4 ring-green-150 text-emerald-800 shadow-md" 
                          : "border-transparent text-slate-600 bg-white/40 hover:bg-white"
                      }`}
                    >
                      <span className="text-xl shrink-0">{s.avatar}</span>
                      <span className="truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple card to explain the Perfil framework */}
              <div className="glass-panel p-6 shadow-md">
                <h4 className="font-bold text-xs uppercase text-pink-500 mb-2">🌸 Inteligencias Múltiples</h4>
                <p className="text-[11px] text-gray-600 leading-normal font-sans">
                  Módulo cualitativo para diagnosticar rasgos de aprendizaje en educación básica. El sistema evalúa el desempeño en escala de 1 a 10 y proyecta la didáctica recomendada ideal.
                </p>
              </div>
            </div>

            {/* Right Box: Interactive qualitative factors & learning profile visualizer */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              
              {selectedStudent ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Quantitative sliders column */}
                  <div className="md:col-span-7 glass-panel p-6 shadow-md font-sans">
                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-pink-200 pb-3 mb-6">
                      <span>📊</span> Rangos de Observación del Estudiante
                    </h3>

                    {/* SLIDERS LIST */}
                    <div className="flex flex-col gap-5 text-xs font-semibold">
                      
                      {/* Rasgo 1: Participación */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">✨ Participación Activa:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.participacion} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.participacion}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "participacion", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 2: Aportación de Ideas */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">💡 Aportación de Ideas / Creatividad:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.aportacionIdeas} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.aportacionIdeas}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "aportacionIdeas", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 3: Retención de Datos */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">🧠 Retención de Datos & Memoria:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.retencionDatos} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.retencionDatos}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "retencionDatos", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 4: Habilidades Artísticas */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">🎨 Habilidades Artísticas & Dibujo:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.habilidadesArtisticas} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.habilidadesArtisticas}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "habilidadesArtisticas", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 5: Sociabilidad */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">🐻 Sociabilidad (Amigable, Alegre):</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.sociabilidad} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.sociabilidad}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "sociabilidad", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 6: Liderazgo */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">👑 Liderazgo & Empuje:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.liderazgo} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.liderazgo}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "liderazgo", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 7: Resolución de Problemas */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">⚙️ Resolución de Problemas:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.resolucionProblemas} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.resolucionProblemas}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "resolucionProblemas", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 8: Inteligencia Emocional */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">🌸 Inteligencia Emocional:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.inteligenciaEmocional} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.inteligenciaEmocional}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "inteligenciaEmocional", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                      {/* Rasgo 9: Apoyo a Compañeros */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">🤝 Compañerismo & Cooperación:</span>
                          <span className="font-bold font-mono text-emerald-600 bg-white border border-green-200 px-2 py-0.5 rounded-lg shadow-sm">{selectedStudent.rubric.apoyoCompaneros} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={selectedStudent.rubric.apoyoCompaneros}
                          onChange={(e) => updateStudentRubric(selectedStudent.id, "apoyoCompaneros", parseInt(e.target.value))}
                          className="w-full accent-[#81C784] cursor-pointer"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Generated Perfil Panel Column */}
                  <div className="md:col-span-5 flex flex-col gap-6 font-sans">
                    
                    {/* Visual Card containing avatar and learning style description */}
                    <div className="glass-panel p-6 shadow-sm flex flex-col gap-4">
                      <div className="text-center pb-4 border-b border-pink-200 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white border-4 border-pink-300 flex items-center justify-center text-3xl shadow-md mb-3 animate-none">
                          {selectedStudent.avatar}
                        </div>
                        <h4 className="text-sm font-bold text-gray-800">{selectedStudent.name}</h4>
                        <span className="text-[10px] text-pink-500 font-semibold">Canales cognitivos de observancia</span>
                      </div>

                      {/* Visual radar chart alternative: SVG horizontal profile bars */}
                      <div>
                        <h5 className="font-bold text-[10px] uppercase text-gray-500 tracking-wider mb-2">Gráfica del Canal de Aprendizaje</h5>
                        <div className="flex flex-col gap-2.5">
                          {/* Visual */}
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-600 mb-0.5 font-bold">
                              <span>🎨 Expresión Visual / Artística</span>
                              <span>{(selectedStudent.rubric.habilidadesArtisticas * 12 + selectedStudent.rubric.aportacionIdeas * 5).toFixed(0)} max</span>
                            </div>
                            <div className="w-full h-3 bg-white/70 border border-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-kawaii-pink rounded-full transition-all" style={{ width: `${Math.min(100, (selectedStudent.rubric.habilidadesArtisticas * 1.2 + selectedStudent.rubric.aportacionIdeas * 0.5) * 6)}%` }}></div>
                            </div>
                          </div>

                          {/* Lógico */}
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-600 mb-0.5 font-bold">
                              <span>🦉 Pensamiento Lógico / Científico</span>
                              <span>{(selectedStudent.rubric.resolucionProblemas * 12 + selectedStudent.rubric.retencionDatos * 10).toFixed(0)} max</span>
                            </div>
                            <div className="w-full h-3 bg-white/70 border border-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-kawaii-blue rounded-full transition-all" style={{ width: `${Math.min(100, (selectedStudent.rubric.resolucionProblemas * 1.2 + selectedStudent.rubric.retencionDatos * 1.0) * 4.5)}%` }}></div>
                            </div>
                          </div>

                          {/* Social */}
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-600 mb-0.5 font-bold">
                              <span>🤝 Colaborativo-Social</span>
                              <span>{(selectedStudent.rubric.sociabilidad * 10 + selectedStudent.rubric.apoyoCompaneros * 10).toFixed(0)} max</span>
                            </div>
                            <div className="w-full h-3 bg-white/70 border border-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, (selectedStudent.rubric.sociabilidad * 1.0 + selectedStudent.rubric.apoyoCompaneros * 1.0 + selectedStudent.rubric.liderazgo * 0.8) * 4.5)}%` }}></div>
                            </div>
                          </div>

                          {/* Emocional */}
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-600 mb-0.5 font-bold">
                              <span>🌸 Inteligencia Emocional</span>
                              <span>{(selectedStudent.rubric.inteligenciaEmocional * 12 + selectedStudent.rubric.participacion * 8).toFixed(0)} max</span>
                            </div>
                            <div className="w-full h-3 bg-white/70 border border-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-kawaii-green rounded-full transition-all" style={{ width: `${Math.min(100, (selectedStudent.rubric.inteligenciaEmocional * 1.2 + selectedStudent.rubric.participacion * 0.8) * 5)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final learning style badge visual details */}
                    <div className={`p-6 rounded-3xl border-2 border-white flex flex-col gap-3 shadow-md ${selectedStudent.predictedProfile.bg}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedStudent.predictedProfile.emoji}</span>
                        <div>
                          <p className="text-[10px] uppercase font-extrabold text-slate-500">Perfil Predominante</p>
                          <h4 className="text-sm font-bold text-slate-800">{selectedStudent.predictedProfile.title}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-normal bg-white/65 p-2.5 rounded-2xl italic">
                        &ldquo;{selectedStudent.predictedProfile.description}&rdquo;
                      </p>

                      <div>
                        <h5 className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1 text-opacity-80">
                          <span>📍</span> Consejos Didácticos Particulares:
                        </h5>
                        <ul className="text-xs text-slate-600 flex flex-col gap-1 pl-3.5 list-disc leading-relaxed">
                          {selectedStudent.predictedProfile.tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-emerald-100">
                  <p className="text-slate-500">Por favor, selecciona un alumno de la lista.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* -------------------- TAB 3: ANALÍTICAS & CONSEJERO IA -------------------- */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            
            {/* Stats row & threshold dynamic adjuster */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Group Threshold controller */}
              <div id="threshold-control" className="glass-panel p-6 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1 pb-2 mb-2 border-b border-pink-150">
                    <span>🚨</span> Umbral de Alerta
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-normal">
                    Define la calificación colectiva mínima sugerida por tu colegio. Si disminuye de esta marca, se disparará el panel de pautas tácticas docencia.
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-755">Límite Aceptable:</span>
                    <span className="font-mono text-sm font-bold text-rose-500 bg-white border border-rose-200 px-2 py-0.5 rounded shadow-sm">{threshold.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range" min="5.0" max="9.0" step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Stat 1: Group Promedio card */}
              <div className="glass-panel bg-white/70 border-pink-250 p-6 shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <span className="text-[10px] uppercase font-black text-rose-600 tracking-wider">Promedio de la Clase</span>
                  <p className="text-4xl font-mono font-bold text-rose-700 mt-2">{groupStats.average.toFixed(2)}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-[#FFECF2] p-2.5 rounded-xl border border-white">
                  <span>{groupStats.alertActive ? "🚨 ¡Bajo del Umbral Decidido!" : "✅ ¡Clase en Rendimiento Aceptable!"}</span>
                </div>
              </div>

              {/* Stat 2: High Performers */}
              <div className="glass-panel bg-white/70 border-[#81C784] p-6 shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">Alumnos con Excelencia (&gt;=9.0)</span>
                  <p className="text-4xl font-mono font-bold text-emerald-700 mt-2">
                    {studentsComputed.filter((s) => s.finalGrade >= 9.0).length}
                  </p>
                </div>
                <p className="text-[10px] text-emerald-700 italic font-semibold">
                  * Estudiantes listos para asumir dinámicas de co-tutores en equipo.
                </p>
              </div>

              {/* Stat 3: Vulnerable Performers */}
              <div className="glass-panel bg-white/70 border-amber-300 p-6 shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-805 tracking-wider">Alumnos Vulnerables (&lt;7.0)</span>
                  <p className="text-4xl font-mono font-bold text-amber-600 mt-2">
                    {studentsComputed.filter((s) => s.finalGrade < 7.0).length}
                  </p>
                </div>
                <p className="text-[10px] text-amber-700 italic font-semibold">
                  * Estudiantes recomendados para tutorías y adaptaciones directas.
                </p>
              </div>

            </div>

            {/* Smart advisories (AI engine & fallback custom instructions box) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Local rule recommendations list */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel p-6 shadow-md flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-pink-100 pb-2.5">
                    <span>💡</span> Consejos Pedagógicos Locales
                  </h3>

                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-gray-700 font-medium">
                    <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm">
                      <p className="font-bold text-pink-500 mb-1 flex items-center gap-1">👥 Metodología Rompecabezas</p>
                      Dividir las dinámicas teóricas complejas de ciencias o lenguaje en partes. Asignar un rol de exposito a cada niño según su perfil adaptativo.
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm">
                      <p className="font-bold text-pink-500 mb-1 flex items-center gap-1">🏆 Premiaciones No Numéricas</p>
                      Estimular el re-enganche de Santiago o Liam mediante mallas de insignias cariñosas como &quot;Súper Creativo&quot;, &quot;Compañero Amigo&quot; o &quot;Pensamiento del Día&quot;.
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm">
                      <p className="font-bold text-pink-500 mb-1 flex items-center gap-1">🎨 Evaluaciones Plásticas</p>
                      Permitir que los estudiantes de canal visual puedan entregar maquetas, carteles ilustrados o cómics interactivos.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Generative Gemini AI report and instructions */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="glass-panel p-6 shadow-md">
                  
                  {/* Title and Trigger */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-200 pb-4 mb-6">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm tracking-wide flex items-center gap-2">
                        <span>✨</span> Planificador Pedagógico Avanzado de Aula (IA)
                      </h3>
                      <p className="text-[11px] text-gray-500 font-semibold mt-1 leading-normal">
                        Utiliza el motor cognitivo de Inteligencia Artificial de Google (Gemini) para crear un reporte pedagógico interactivo de soporte grupal adaptado a tus alumnos.
                      </p>
                    </div>

                    <button
                      onClick={handleGetAiRecommendations}
                      disabled={loadingAI}
                      className="kawaii-btn bg-[#64B5F6] hover:bg-blue-550 text-white font-bold text-xs py-3 px-5 shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {loadingAI ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Analizando alumnos...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200 animate-pulse animate-bounce" /> Generar Diagnóstico Pedagógico
                        </>
                      )}
                    </button>
                  </div>

                  {/* Recommendation Area */}
                  <div className="bg-white/85 border-2 border-pink-105 rounded-2xl p-6 min-h-[300px] max-h-[500px] overflow-y-auto shadow-inner">
                    {aiRecommendation ? (
                      <div className="prose prose-sm text-xs leading-relaxed text-slate-700 whitespace-pre-line font-medium font-sans">
                        {aiRecommendation}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-16">
                        <span className="text-4xl block animate-pulse">📝</span>
                        <h4 className="text-gray-700 font-bold text-xs mt-3 uppercase">¿Listo/a para el análisis pedagógico?</h4>
                        <p className="text-[11px] text-gray-500 font-semibold max-w-sm mt-1">
                          Haz clic en el botón superior. Gemini estudiará tus datos actuales del grupo, evaluando las calificaciones promedio, inasistencias y estilos cualitativos recopilados para formular estrategias.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-pink-100/50 rounded-2xl border border-white text-[10px] text-pink-700 font-semibold flex items-center gap-2">
                    <span>💡</span>
                    <span>El diagnosticador evalúa de forma dinámica los perfiles activos en la pestaña 📋 <strong>Calificaciones</strong>. Si re-nombras alumnos o sumas actividades, ¡el informe de IA se adaptará por completo!</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- TAB 4: GOOGLE SHEETS & APPS SCRIPT -------------------- */}
        {activeTab === "sheets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Instructions guide */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass-panel p-6 shadow-md flex flex-col gap-4 text-xs font-sans">
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1 border-b border-cyan-150 pb-2">
                  <span>📂</span> Guía de Conexión en 5 Pasos
                </h3>

                <ol className="flex flex-col gap-4 leading-normal pl-4 list-decimal text-gray-700">
                  <li>
                    <strong>Crea una Hoja de Google</strong> vacía en tu cuenta de Google Drive personal institucional.
                  </li>
                  <li>
                    Abre el menú superior <strong>Extensiones &gt; Apps Script</strong>. Esto abrirá un editor virtual de código proporcionado por Google.
                  </li>
                  <li>
                    Borra el código que aparezca por defecto en el archivo y <strong>copia el código certificado tierno</strong> del recuadro lateral.
                  </li>
                  <li>
                    Haz clic en el botón superior <strong>Implementar &gt; Nueva Implementación</strong>:
                    <ul className="list-disc pl-4 mt-1 flex flex-col gap-1 text-[11px] font-sans text-gray-600">
                      <li>Selecciona: <strong>Tipo: Aplicación Web</strong>.</li>
                      <li>Ejecutar como: <strong>Yo (Tu Correo)</strong>.</li>
                      <li>Quién tiene acceso: <strong>Anyone (Cualquiera)</strong>.</li>
                    </ul>
                  </li>
                  <li>
                    Haz clic en Implementar, concede los permisos de cuenta, y <strong>copia el enlace de Aplicación Web generado</strong>. ¡Pégalo abajo!
                  </li>
                </ol>

                <div className="bg-white/40 border-2 border-white rounded-3xl p-4 mt-2">
                  <h4 className="font-bold text-cyan-600 mb-1 flex items-center gap-1 text-[11px] uppercase">📦 Respaldar a Hoja de Google</h4>
                  
                  <form onSubmit={handleAppsScriptSubmit} className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] text-gray-500 font-bold block">Pegar URL de Google Web App:</label>
                    <input
                      type="url"
                      required
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      className="w-full bg-white border border-cyan-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-400 font-medium"
                    />

                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        disabled={isExporting}
                        className="kawaii-btn bg-[#64B5F6] text-white flex-1 hover:bg-cyan-600 py-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold disabled:opacity-50"
                      >
                        {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        Sincronizar Sheets
                      </button>

                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="kawaii-btn bg-white hover:bg-[#F2EDF6] text-slate-700 py-3 px-4 rounded-xl transition flex items-center justify-center gap-1 font-bold"
                        title="Descargar archivo .csv complementario"
                      >
                        <FileDown className="w-4 h-4" /> CSV
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right box: Code Viewer & Interactive Sandbox Logs */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Apps Script Source Code Viewer */}
              <div className="glass-panel p-6 shadow-md flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-cyan-150 pb-2">
                  <h4 className="font-bold text-gray-805 text-xs uppercase tracking-wider flex items-center gap-1">
                    <span>💡</span> Código Apps Script Certificado
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="px-3.5 py-1.5 bg-white border border-cyan-200 text-cyan-600 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 hover:bg-cyan-50 shadow-sm cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3" /> : <Copy className="w-3" />}
                    {copiedScript ? "Copiado!" : "Copiar Código"}
                  </button>
                </div>

                <div className="max-h-[220px] overflow-auto bg-[#1E1E1E] text-slate-200 font-mono text-[10px] p-4 rounded-2xl relative shadow-inner">
                  <pre className="whitespace-pre">{appsScriptCode}</pre>
                </div>
              </div>

              {/* Console logs sandbox logger viewer */}
              <div className="glass-panel p-6 shadow-md flex flex-col gap-3">
                <h4 className="font-bold text-gray-850 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-cyan-150 pb-2">
                  <span>🖥️</span> Consola de Operaciones de Webhook / Sheets
                </h4>

                <div className="min-h-[140px] max-h-[180px] overflow-y-auto bg-[#1E1E1E] border border-[#2B2B2B] font-mono text-[9px] text-[#A3E635] p-4 rounded-2xl flex flex-col gap-1 shadow-inner">
                  <p className="text-teal-500">// Consola interactiva de envío mensual. Registra logs directos aquí.</p>
                  {sheetsConsole.length === 0 ? (
                    <p className="text-slate-400 italic font-mono mt-2">La consola está vacía. Intenta presionar &quot;Sincronizar Sheets&quot; para verificar el flujo de bytes.</p>
                  ) : (
                    sheetsConsole.map((log, i) => (
                      <p key={i} className="whitespace-pre-line leading-relaxed">{log}</p>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- TAB 5: GITHUB PAGES GUIDE -------------------- */}
        {activeTab === "github" && (
          <div className="glass-panel p-8 shadow-md max-w-4xl mx-auto flex flex-col gap-6">
            
            {/* Header description */}
            <div className="text-center border-b border-pink-100 pb-4">
              <span className="text-5xl block animate-bounce mb-3">🚀📚</span>
              <h2 className="text-lg font-bold text-gray-805 font-sans">¡Guía del Viajero de GitHub & GitHub Pages!</h2>
              <p className="text-xs text-gray-600 max-w-xl mx-auto mt-1 leading-normal font-sans font-medium">
                Esta aplicación está estructurada para ser alojada y editada con facilidad en tu propio repositorio de GitHub. Sigue la guía de despliegue para tener tu página web pública activa en minutos.
              </p>
            </div>

            {/* Step breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-650 font-sans leading-relaxed">
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-pink-100 pb-1.5">
                  <span>💻</span> Paso 1: Inicialización de Repositorio
                </h4>
                <ol className="flex flex-col gap-2 list-decimal pl-4 leading-relaxed font-semibold">
                  <li>Crea una cuenta en <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600 font-semibold underline">github.com</a> si aún no posees una.</li>
                  <li>Haz clic en el botón <strong>&quot;New Repository&quot;</strong>.</li>
                  <li>Nómbralo como tú quieras (ej. <code>evaluador-integral-pastel</code>).</li>
                  <li>Elígelo como **Público** y haz clic en Crear. No agregues archivos README ni .gitignore adicionales, ya que el proyecto ya tiene los suyos incluidos listos.</li>
                </ol>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-pink-100 pb-1.5">
                  <span>📤</span> Paso 2: Servir con GitHub Pages
                </h4>
                <ol className="flex flex-col gap-2 list-decimal pl-4 leading-relaxed font-semibold">
                  <li>Sube tu carpeta local al repositorio (mediante comandos de consola o arrastrando archivos en el portal GitHub).</li>
                  <li>Ve a la pestaña de <strong>Settings</strong> del repositorio de GitHub.</li>
                  <li>En el panel lateral izquierdo del menú, busca la opción <strong>Pages</strong>.</li>
                  <li>En <strong>&quot;Build and deployment&quot;</strong>, selecciona Source: **Deploy from a branch**.</li>
                  <li>Elige la rama <code>main</code> (o tu principal) y la carpeta <code>/ (root)</code>, luego haz clic en <strong>Save</strong>. ¡Listo! En 1-2 minutos tu enlace público de clase estará en línea.</li>
                </ol>
              </div>
            </div>

            {/* Note of static limits */}
            <div className="bg-[#FFECF2] rounded-2xl border-2 border-white p-5 text-xs text-pink-750 flex items-start gap-3 mt-2 leading-relaxed shadow-sm">
              <Info className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>💡 Nota Importante sobre Servidores Estáticos:</strong> GitHub Pages es un host estático (sirve archivos HTML, CSS y JS). Al alojarlo ahí, las llamadas a la Inteligencia Artificial (Gemini) requieren del servidor backend. 
                Sin embargo, para garantizar que la app siga siendo 100% funcional y maravillosa para tus docentes en GitHub Pages de forma estática, hemos programado un <strong>motor de autodiagnóstico psicopedagógico local integrado</strong>. Si dejas la app alojada de modo estático en GitHub, ¡los docentes siempre seguirán recibiendo los consejos didácticos y podrán evaluar con normalidad de forma local, además de poder sincronizar con su cuenta de Google Sheets!
              </div>
            </div>

          </div>
        )}

      </main>

      {/* -------------------- ADD STUDENT MODAL BACKDROP -------------------- */}
      <AnimatePresence>
        {showAddStudent && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 max-w-md w-full shadow-2xl relative border-2 border-pink-250 font-sans"
            >
              <div className="flex justify-between items-center border-b border-pink-100 pb-3 mb-4">
                <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase flex items-center gap-1.5">
                  <span>🌸👩‍🎓</span> Registro de Alumno
                </h3>
                <button 
                  onClick={() => setShowAddStudent(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 cursor-pointer transition hover:scale-110"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="flex flex-col gap-4 text-xs">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nombre Completo del Estudiante:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Luna, Mateo Pérez..."
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl focus:outline-none focus:border-pink-300 font-bold text-gray-800 transition"
                  />
                </div>

                {/* 2. Avatar Selection Picker Carousel */}
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5">Mascota / Avatar de Compañero:</label>
                  <div className="grid grid-cols-6 gap-2 bg-white/75 p-3 rounded-2xl border-2 border-slate-100 shadow-inner">
                    {AVATAR_OPTIONS.map((emoji) => {
                      const isSelected = newStudentAvatar === emoji;
                      return (
                        <div
                          key={emoji}
                          onClick={() => setNewStudentAvatar(emoji)}
                          className={`text-2xl p-1.5 rounded-lg text-center cursor-pointer hover:bg-white select-none transition ${
                            isSelected ? "bg-pink-100/70 border-2 border-pink-400 font-bold scale-110 shadow-sm" : "border border-transparent"
                          }`}
                        >
                          {emoji}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Notes */}
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Observaciones Iniciales (Optativo):</label>
                  <textarea
                    rows={2}
                    placeholder="Puntos clave personales a evaluar..."
                    value={newStudentNotes}
                    onChange={(e) => setNewStudentNotes(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl focus:outline-none focus:border-pink-300 font-sans transition"
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudent(false)}
                    className="kawaii-btn bg-slate-100 hover:bg-[#F2EDF6] text-slate-700 flex-1 py-3 rounded-xl transition text-center font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="kawaii-btn bg-pink-400 hover:bg-pink-500 text-white flex-1 py-3 rounded-xl transition text-center font-bold shadow-md"
                  >
                    Registrar Alumno
                  </button>
                </div>

              </form>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Decorative Page Footer */}
      <footer className="w-full border-t border-dashed border-pink-200 py-8 text-center text-xs text-gray-500 font-semibold font-sans">
        <p>🐾 Elaborado con cariño y dedicación para el sector de educación básica. 🌺</p>
        <p className="mt-1 text-[11px] text-gray-450 hover:text-pink-500 transition-colors">Colegio Pastel - Agenda de Gestión Psico-Educativa en Tiempo Real.</p>
      </footer>

    </div>
  );
}
