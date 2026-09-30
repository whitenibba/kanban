'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar({ isSidebarOpen, toggleMenu }) {
  const router = useRouter();
  //const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [columns, setColumns] = useState([
  { id: 'todo', title: 'To Do', isFixed: true },
  { id: 'done', title: 'Done', isFixed: true }
]);
  const [isSubmitting, setIsSubmitting] = useState(false);

// Aggiunge una colonna vuota sopra "Done"
const addColumn = () => {
  const newCol = { id: Date.now(), title: '', isFixed: false };
  const updated = [...columns];
  updated.splice(updated.length - 1, 0, newCol); // Inserisce prima dell'ultimo elemento (Done)
  setColumns(updated);
};

// Aggiorna il testo di una colonna specifica
const updateColumnTitle = (id, newTitle) => {
  setColumns(columns.map(col => col.id === id ? { ...col, title: newTitle } : col));
};

// Rimuove una colonna
const removeColumn = (id) => {
  setColumns(columns.filter(col => col.id !== id));
};

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/admin/projects', {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setProjects(data || []);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei progetti:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // Dipende da searchParams per ricaricare quando cambia
  

  // Filtra i progetti in base al termine di ricerca
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crea un nuovo progetto
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let cols = [];
      console.log("columns: "+columns);
      for(let i=0; i<columns.length;i++){
        cols.push({title : columns[i].title, display_order : i+1});
      }
      console.log("cols: "+JSON.stringify(cols));
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          columns: cols
        })
      });

      if (response.ok) {
        const newProject = await response.json();
        
        // Aggiungi il nuovo progetto alla lista locale
        setProjects(prevProjects => [...prevProjects, newProject]);
        
        setFormData({ name: '', description: '' });
        setShowModal(false);
        
        // Refresh della pagina per aggiornare i dati nel layout
        router.refresh();
        
        // Reindirizza alla pagina di dettaglio del progetto
        router.push(`/admin/project/${newProject.id_project}`);
      } else {
        console.error('Errore nella creazione del progetto');
        alert('Errore nella creazione del progetto');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nella creazione del progetto');
    } finally {
      setIsSubmitting(false);
      setColumns([
        { id: 'todo', title: 'To Do', isFixed: true },
        { id: 'done', title: 'Done', isFixed: true }
      ]);
    }
  };

  return (
    <aside className={`${styles.aside} ${isSidebarOpen ? styles.open : ''}`}>
      <input
        type="text"
        className={styles.searchBox}
        placeholder="Cerca progetto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul className={styles.projectList}>
        {!loading && filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <li key={project.id_project} className={styles.projectItem} onClick={toggleMenu}>
              <Link href={`/admin/project/${project.id_project}`}>
                📁 {project.name}
              </Link>
            </li>
          ))
        ) : loading ? (
          <li className={styles.loadingItem}>Caricamento...</li>
        ) : (
          <li className={styles.emptyItem}>Nessun progetto trovato</li>
        )}
      </ul>
      <button className={styles.btnAdd} onClick={() => setShowModal(true)}>
        + AGGIUNGI
      </button>

      {/* MODAL PER CREARE NUOVO PROGETTO */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Crea Nuovo Progetto</h3>
            <form onSubmit={handleCreateProject}>
              <div className={styles.formGroup}>
                <label htmlFor="project_name">Nome Progetto</label>
                <input
                  id="project_name"
                  type="text"
                  placeholder="Es. Sviluppo App Mobile"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="project_description">Descrizione (Opzionale)</label>
                <textarea
                  id="project_description"
                  placeholder="Descrivi brevemente il progetto..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.columnSetupContainer}>
                <label className={styles.setupLabel}>Definisci le fasi del progetto:</label>
                
                <div className={styles.columnStack}>
                  {columns.map((col, index) => (
                    <Fragment key={col.id}>
                      {/* Il rettangolo della colonna */}
                      <div className={`${styles.columnRect} ${col.isFixed ? styles.fixedRect : ''}`}>
                        {col.isFixed ? (
                          <span className={styles.fixedText}>{col.title}</span>
                        ) : (
                          <>
                            <input
                              type="text"
                              className={styles.columnNameInput}
                              placeholder="Nome fase (es. Testing...)"
                              value={col.title}
                              onChange={(e) => updateColumnTitle(col.id, e.target.value)}
                              autoFocus
                            />
                            <button 
                              type="button" 
                              className={styles.removeBtn}
                              onClick={() => removeColumn(col.id)}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>

                      {/* Se siamo dopo il primo elemento e prima dell'ultimo, o se vogliamo il tasto "+" in mezzo */}
                      {index === columns.length - 2 && (
                        <button type="button" className={styles.addRectBtn} onClick={addColumn}>
                          + Aggiungi Fase Intermedia
                        </button>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creazione...' : 'Crea'}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
