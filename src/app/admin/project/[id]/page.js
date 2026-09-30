'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import {
  PriorityChart,
  ThroughputChart,
  EfficiencyChart
} from '@/components/charts';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;

  const [state, setState] = useState({
    project: null,
    stats: null,
    loading: true,
    error: null
  });

  const [operators, setOperators] = useState([]);
  const [operatorsLoading, setOperatorsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    assigned_role: 0
  });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Esegui fetch in parallelo per progetto e statistiche
        const [projectRes, statsRes] = await Promise.all([
          fetch(`/api/admin/projects/${projectId}`),
          fetch(`/api/admin/projects/${projectId}/stats`)
        ]);

        // Gestisci errori di fetch
        if (!projectRes.ok) {
          throw new Error(`Errore nel caricamento del progetto: ${projectRes.status}`);
        }
        if (!statsRes.ok) {
          throw new Error(`Errore nel caricamento delle statistiche: ${statsRes.status}`);
        }

        const projectData = await projectRes.json();
        const statsData = await statsRes.json();

        setState({
          project: projectData,
          stats: statsData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Errore durante il caricamento dei dati:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Errore nel caricamento dei dati'
        }));
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Fetch degli operatori
  const fetchOperators = async () => {
    setOperatorsLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/operators`);
      if (response.ok) {
        const data = await response.json();
        setOperators(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento degli operatori:', error);
    } finally {
      setOperatorsLoading(false);
    }
  };

  // Carica gli operatori quando il progetto è disponibile
  useEffect(() => {
    if (projectId) {
      fetchOperators();
    }
  }, [projectId]);

  // Copia il codice di accesso
  const handleCopyAccessCode = async (accessCode, userId) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Errore nella copia del codice:', error);
    }
  };

  // Aggiungi un nuovo operatore
  const handleAddOperator = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/operators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: formData.display_name,
          assigned_role: parseInt(formData.assigned_role)
        })
      });

      if (response.ok) {
        setFormData({ display_name: '', assigned_role: 0 });
        setShowModal(false);
        fetchOperators();
      } else {
        console.error('Errore nell\'aggiunta dell\'operatore');
      }
    } catch (error) {
      console.error('Errore durante l\'aggiunta:', error);
    }
  };

  // Rimuovi un operatore
  const handleRemoveOperator = async (userId) => {
    if (!confirm('Sei sicuro di voler rimuovere questo operatore?')) return;

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/operators?id_user=${userId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        fetchOperators();
      } else {
        console.error('Errore nella rimozione dell\'operatore');
      }
    } catch (error) {
      console.error('Errore durante la rimozione:', error);
    }
  };

  // Elimina il progetto
  const handleDeleteProject = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Reindirizza alla dashboard con parametro di refresh
        router.push('/admin?refresh=' + Date.now());
      } else {
        alert('Errore nell\'eliminazione del progetto');
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      alert('Errore nell\'eliminazione del progetto');
    }
  };

  if (state.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Caricamento dati del progetto...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Errore</h2>
          <p>{state.error}</p>
        </div>
      </div>
    );
  }

  if (!state.project) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Progetto non trovato</h2>
          <p>Il progetto richiesto non esiste o non hai accesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER DEL PROGETTO */}
      <div className={styles.projectHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.projectTitle}>{state.project.name}</h1>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteProject}
              title="Elimina progetto"
            >
              🗑️ Elimina
            </button>
          </div>
          {state.project.description && (
            <p className={styles.projectDescription}>{state.project.description}</p>
          )}
        </div>
      </div>

      {/* GRIGLIA STATISTICHE PRINCIPALI */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Task Totali</h3>
          <p className={styles.statValue}>
            {state.stats?.completionStatus?.total || 0}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Completati</h3>
          <p className={styles.statValue}>
            {state.stats?.completionStatus?.completed || 0}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Percentuale Completamento</h3>
          <p className={styles.statValue}>
            {state.stats?.completionStatus?.percentage || 0}%
          </p>
        </div>
      </div>

      {/* GRIGLIA GRAFICI */}
      <div className={styles.chartsGrid}>
        {/* Grafico Priorità */}
        <div className={styles.chartCard}>
          <h2>Distribuzione Priorità</h2>
          {state.stats?.priority && state.stats.priority.length > 0 ? (
            <PriorityChart data={state.stats.priority} />
          ) : (
            <p className={styles.noData}>Nessun dato disponibile</p>
          )}
        </div>

        {/* Grafico Stato Avanzamento */}
        <div className={styles.chartCard}>
          <h2>Stato Avanzamento</h2>
          {state.stats?.completionStatus ? (
            <EfficiencyChart
              data={[
                {
                  name: 'Progetto',
                  total: state.stats.completionStatus.total,
                  done: state.stats.completionStatus.completed
                }
              ]}
            />
          ) : (
            <p className={styles.noData}>Nessun dato disponibile</p>
          )}
        </div>
      </div>

      {/* Grafico Andamento Completati */}
      <div className={styles.fullWidthChart}>
        <div className={styles.chartCard}>
          <h2>Andamento Completamenti (ultimi 30 giorni)</h2>
          {state.stats?.throughput && state.stats.throughput.length > 0 ? (
            <ThroughputChart data={state.stats.throughput} />
          ) : (
            <p className={styles.noData}>Nessun dato disponibile</p>
          )}
        </div>
      </div>

      {/* SEZIONE GESTIONE OPERATORI */}
      <div className={styles.operatorsSection}>
        <div className={styles.operatorsHeader}>
          <h2>Gestione Team</h2>
          <button 
            className={styles.addButton}
            onClick={() => setShowModal(true)}
          >
            + Aggiungi Operatore
          </button>
        </div>

        {/* TABELLA OPERATORI */}
        {operatorsLoading ? (
          <p className={styles.loadingText}>Caricamento operatori...</p>
        ) : operators.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ruolo</th>
                  <th>Codice Accesso</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {operators.map(operator => (
                  <tr key={operator.id_user}>
                    <td className={styles.nameCell}>{operator.display_name}</td>
                    <td className={styles.roleCell}>
                      <span className={`${styles.roleBadge} ${styles[operator.assigned_role === 1 ? 'manager' : 'operator']}`}>
                        {operator.assigned_role === 1 ? 'Manager' : 'Operatore'}
                      </span>
                    </td>
                    <td className={styles.codeCell}>
                      <div className={styles.codeContainer}>
                        <code>{operator.access_code}</code>
                        <button
                          className={styles.copyButton}
                          onClick={() => handleCopyAccessCode(operator.access_code, operator.id_user)}
                          title="Copia codice"
                        >
                          {copiedId === operator.id_user ? '✓ Copiato' : '📋 Copia'}
                        </button>
                      </div>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveOperator(operator.id_user)}
                      >
                        Rimuovi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.emptyState}>Nessun operatore assegnato al progetto.</p>
        )}
      </div>

      {/* MODAL PER AGGIUNGERE OPERATORE */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Aggiungi Nuovo Operatore</h3>
            <form onSubmit={handleAddOperator}>
              <div className={styles.formGroup}>
                <label htmlFor="display_name">Nome Operatore</label>
                <input
                  id="display_name"
                  type="text"
                  placeholder="Es. Marco Rossi"
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="assigned_role">Ruolo</label>
                <select
                  id="assigned_role"
                  value={formData.assigned_role}
                  onChange={e => setFormData({ ...formData, assigned_role: e.target.value })}
                >
                  <option value="0">Operatore</option>
                  <option value="1">Manager</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Aggiungi
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
