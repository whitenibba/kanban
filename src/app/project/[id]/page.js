"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const priorityColor = (p) => {
  switch (p) {
    case 3:
      return "#e53e3e"; // Urgente - red
    case 2:
      return "#ed8936"; // Alta - orange
    case 1:
      return "#f6e05e"; // Media - yellow
    case 0:
    default:
      return "#48bb78"; // Bassa - green
  }
};

export default function Page() {
  const { id } = useParams();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Prova prima a caricare
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [operatorName, setOperatorName] = useState(null);
  const [lastMovedTaskId, setLastMovedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 0 });
  
  useEffect(() => {
    let mounted = true;

    async function fetchBoard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${id}/board`);
        
        // Se 401, l'utente non è autenticato
        if (res.status === 401) {
          if (mounted) {
            setIsAuthenticated(false);
          }
          return;
        }

        const data = await res.json();
        if (mounted) {
          setColumns(data.columns || []);
          setOperatorName(data.operatorName || null);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Failed to load board:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) {
      fetchBoard();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
  // 1. Se non siamo loggati, non apriamo la connessione
  if (!isAuthenticated || !id) return;

  console.log("[SSE] Tentativo di connessione...");
  const eventSource = new EventSource(`/api/projects/${id}/events`);

  // Ascoltiamo i messaggi generici
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // 2. Se il messaggio riguarda lo spostamento di un task
    if (data.type === 'TASK_MOVED') {
      const { id_task, id_column: newColId } = data.payload;

      console.log(`[SSE] Task ${id_task} spostato nella colonna ${newColId}`);

      setColumns((prev) => {
        // Troviamo il task in tutto il sistema
        let movedTask = null;
        
        // Creiamo una copia profonda per non mutare lo stato direttamente
        const newColumns = prev.map((col) => {
          const taskIndex = col.tasks.findIndex(t => t.id_task === id_task);
          
          if (taskIndex !== -1) {
            // Se il task è già nella colonna giusta, non facciamo nulla (evita loop)
            if (col.id_column === newColId) return col;
            
            // Altrimenti, lo rimuoviamo dalla colonna vecchia
            const tasksCopy = [...col.tasks];
            [movedTask] = tasksCopy.splice(taskIndex, 1);
            return { ...col, tasks: tasksCopy };
          }
          return col;
        });

        // Se abbiamo trovato il task, lo aggiungiamo alla nuova colonna
        if (movedTask) {
          movedTask.id_column = newColId; // Aggiorniamo l'id_column locale del task
          
          return newColumns.map((col) => {
            if (col.id_column === newColId) {
              // Aggiungiamo il task e riordiniamo subito (Priority DESC, Updated_at DESC)
              const updatedTasks = [...col.tasks, movedTask].sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return new Date(b.updated_at) - new Date(a.updated_at);
              });
              return { ...col, tasks: updatedTasks };
            }
            return col;
          });
        }
        
        return prev;
      });
    }

    if (data.type === 'TASK_CREATED') {
      const newTaskData = data.payload;
      console.log(`[SSE] Task ${newTaskData.id_task} creato`);
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.id_column === newTaskData.id_column) {
            return { ...col, tasks: [newTaskData, ...col.tasks] };
          }
          return col;
        });
      });
    }

    if (data.type === 'TASK_DELETED') {
      const { id_task } = data.payload;
      console.log(`[SSE] Task ${id_task} eliminato`);
      setColumns((prev) => {
        return prev.map((col) => {
          return { ...col, tasks: col.tasks.filter(t => t.id_task !== id_task) };
        });
      });
    }

    if (data.type === 'TASK_VERIFIED') {
      const { id_task } = data.payload;
      console.log(`[SSE] Task ${id_task} verificato`);
      setColumns((prev) => {
        return prev.map((col) => {
          return {
            ...col,
            tasks: col.tasks.map((t) => t.id_task === id_task ? { ...t, is_verified: 1 } : t)
          };
        });
      });
    }
  };

  eventSource.onerror = (err) => {
    console.error("[SSE] Errore di connessione:", err);
    eventSource.close();
  };

  // 3. PULIZIA: Quando chiudiamo la pagina, chiudiamo il "cavo"
  return () => {
    console.log("[SSE] Chiusura connessione");
    eventSource.close();
  };
}, [id, isAuthenticated]);


  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/operator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_project: Number(id),
          access_code: accessCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        setAuthLoading(false);
        return;
      }

      // Autenticazione riuscita
      setAccessCode("");
      setAuthError("");
      setIsAuthenticated(true);
      
      // Carica la board dopo l'autenticazione
      const boardRes = await fetch(`/api/projects/${id}/board`);
      if (boardRes.ok) {
        const boardData = await boardRes.json();
        setColumns(boardData.columns || []);
        setOperatorName(boardData.operatorName || null);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError("Connection error. Please try again.");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/operator/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_project: Number(id),
        }),
      });

      if (res.ok) {
        // Resetta lo stato per mostrare l'overlay di autenticazione
        setIsAuthenticated(false);
        setColumns([]);
        setOperatorName(null);
        setAccessCode("");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_project: Number(id),
          title: newTask.title,
          description: newTask.description,
          priority: Number(newTask.priority),
          id_column: columns[0].id_column
        }),
      });

      if (res.ok) {
        setNewTask({ title: '', description: '', priority: 0 });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Elimina questo task?')) return;

    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setColumns((prev) => {
          return prev.map((col) => {
            return { ...col, tasks: col.tasks.filter(t => t.id_task !== taskId) };
          });
        });
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const handleVerifyTask = async (taskId) => {
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setColumns((prev) => {
          return prev.map((col) => {
            return {
              ...col,
              tasks: col.tasks.map((t) => t.id_task === taskId ? { ...t, is_verified: 1 } : t)
            };
          });
        });
      }
    } catch (err) {
      console.error("Verify task error:", err);
    }
  };

const onDragEnd = async (result) => { // Aggiunto async
  const { destination, source, draggableId } = result;
  if (!destination) return;

  setLastMovedTaskId(Number(draggableId));

  const sourceColId = Number(source.droppableId);
  const destColId = Number(destination.droppableId);

  // 1. Spostamento all'interno della stessa colonna
  if (sourceColId === destColId) {
    // Gestione solo visiva (visto che non abbiamo display_order nel DB)
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id_column !== sourceColId) return col;
        const newTasks = Array.from(col.tasks);
        const [moved] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, moved);
        return { ...col, tasks: newTasks };
      })
    );
    return;
  }

  // 2. Spostamento tra colonne diverse (AGGIORNAMENTO OTTIMISTICO)
  setColumns((prev) => {
    const src = prev.find((c) => c.id_column === sourceColId);
    const dst = prev.find((c) => c.id_column === destColId);
    if (!src || !dst) return prev;
    
    const srcTasks = Array.from(src.tasks);
    const dstTasks = Array.from(dst.tasks);
    const [moved] = srcTasks.splice(source.index, 1);
    
    const movedOptimistic = { ...moved, id_column: destColId };
    dstTasks.splice(destination.index, 0, movedOptimistic);

    return prev.map((c) => {
      if (c.id_column === sourceColId) return { ...c, tasks: srcTasks };
      if (c.id_column === destColId) return { ...c, tasks: dstTasks };
      return c;
    });
  });

  // 3. CHIAMATA AL DATABASE (API PATCH)
  try {
    const response = await fetch(`/api/projects/${id}/tasks/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id_column: destColId 
      }),
    });

    if (!response.ok) {
      throw new Error('Errore durante il salvataggio');
    }
  } catch (error) {
    console.error("Errore nel salvataggio del task:", error);
    alert("Errore di sincronizzazione. Ricarico la board...");
    window.location.reload(); // In caso di errore, ricarichiamo per evitare dati incoerenti
  }
};

  return (
    <div className={styles.boardContainer}>
      {/* Se non autenticato, mostra l'overlay del form */}
      {!isAuthenticated && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h1 className={styles.modalTitle}>Project Access</h1>
            <p className={styles.modalSub}>Enter your access code to continue</p>

            {authError && (
              <div className={styles.authError}>✗ {authError}</div>
            )}

            <form onSubmit={handleAuthSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Access Code</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g., OP-A1"
                  disabled={authLoading}
                  className={styles.input}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={styles.authButton}
              >
                {authLoading ? "Verifying..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mostra la board solo se autenticato */}
      {isAuthenticated && (
        <>
          {/* Navbar */}
          <div className={styles.navbar}>
            <h2 className={styles.navTitle}>{operatorName ? `Ciao ${operatorName}` : "Caricamento..."}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsModalOpen(true)} className={styles.newTaskButton}>+ Nuovo Task</button>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>
          </div>

          {/* Modal per creare task */}
          {isModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Nuovo Task</h2>
                <form onSubmit={handleCreateTask}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Titolo</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Es. Implementare feature X"
                      className={styles.input}
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Descrizione</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Dettagli del task..."
                      className={styles.textarea}
                      rows="4"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Priorità: {newTask.priority}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: Number(e.target.value) })}
                      className={styles.prioritySlider}
                      style={{
                        accentColor: priorityColor(newTask.priority),
                      }}
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className={styles.buttonCancel}>Annulla</button>
                    <button type="submit" className={styles.buttonSubmit}>Crea Task</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <p>Loading board...</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className={styles.columnsWrapper}>
                {columns.map((col) => (
                  <div key={col.id_column} className={styles.columnCard}>
                    <h3 className={styles.columnTitle}>{col.title}</h3>
                    <Droppable droppableId={String(col.id_column)}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`${styles.droppableArea} ${snapshot.isDraggingOver ? styles.droppableOver : ""}`}
                        >
                          {(col.tasks || []).map((task, index) => (
                            <Draggable
                              key={task.id_task}
                              draggableId={String(task.id_task)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${styles.taskCard} ${snapshot.isDragging ? styles.taskDragging : ""} ${task.id_task === lastMovedTaskId ? styles.taskHighlighted : ""}`}
                                  style={provided.draggableProps.style}
                                >
                                  <div
                                    className={styles.priorityBar}
                                    style={{ background: priorityColor(task.priority || 0) }}
                                  />
                                  <div className={styles.taskContent}>
                                    <div className={styles.taskTitle}>{task.title}</div>
                                    {task.description ? (
                                      <div className={styles.taskDescription}>
                                        {task.description}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className={styles.taskActions}>
                                    <button
                                      onClick={() => handleDeleteTask(task.id_task)}
                                      className={styles.actionButton}
                                      title="Elimina task"
                                    >
                                      🗑️
                                    </button>
                                    {col.id_column === columns[columns.length - 1]?.id_column && !task.is_verified && (
                                      <button
                                        onClick={() => handleVerifyTask(task.id_task)}
                                        className={styles.actionButton}
                                        title="Verifica task"
                                      >
                                        ✅
                                      </button>
                                    )}
                                    {task.is_verified === 1 && (
                                      <span title="Task verificato">✔️</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </>
      )}
    </div>
  );
}
