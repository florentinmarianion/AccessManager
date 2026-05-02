import { useState, useEffect, useCallback } from "react";

const ERROR_TIPS = {
  SQL_SYNTAX: {
    title: "Eroare de sintaxă SQL",
    tips: ["Verifică typo-uri în numele coloanelor sau tabelelor", "Numărul de ? din query trebuie să coincidă cu parametrii", "Verifică virgulele și parantezele din query"],
    color: "#A32D2D", bg: "#FCEBEB", border: "#F09595",
  },
  SQL_DUPLICATE: {
    title: "Valoare duplicată",
    tips: ["username sau email există deja în baza de date", "Verifică înainte de INSERT dacă recordul există", "Folosește INSERT ... ON DUPLICATE KEY UPDATE"],
    color: "#854F0B", bg: "#FAEEDA", border: "#EF9F27",
  },
  SQL_NO_TABLE: {
    title: "Tabelă inexistentă",
    tips: ["Rulează migrațiile: php artisan migrate", "Verifică numele tabelei — case sensitive în unele DB-uri", "Verifică că ești conectat la baza de date corectă"],
    color: "#A32D2D", bg: "#FCEBEB", border: "#F09595",
  },
  SQL_BAD_FIELD: {
    title: "Coloană inexistentă",
    tips: ["Coloana nu există în tabelă", "Verifică numele exact al coloanei în DB", "Poate ai redenumit coloana și ai uitat să updatezi query-ul"],
    color: "#A32D2D", bg: "#FCEBEB", border: "#F09595",
  },
  SQL_GENERIC: {
    title: "Eroare de bază de date",
    tips: ["Verifică query-ul complet în câmpul SQL de mai jos", "Verifică că toate tabelele și coloanele există", "Verifică tipurile de date — ex: string în loc de number"],
    color: "#A32D2D", bg: "#FCEBEB", border: "#F09595",
  },
  DB_CONNECTION: {
    title: "Nu pot conecta la MySQL",
    tips: ["Pornește MySQL din WAMP/XAMPP", "Verifică DB_HOST și DB_PORT în .env", "Verifică că portul 3306 nu e blocat de firewall"],
    color: "#185FA5", bg: "#E6F1FB", border: "#85B7EB",
  },
  DB_AUTH: {
    title: "Credențiale greșite pentru DB",
    tips: ["Verifică DB_USER și DB_PASS în .env", "Verifică că userul MySQL are drepturi pe baza de date", "Dacă DB_PASS e gol în WAMP, lasă-l gol în .env"],
    color: "#185FA5", bg: "#E6F1FB", border: "#85B7EB",
  },
  JWT_INVALID: {
    title: "Token JWT invalid",
    tips: ["JWT_SECRET diferit între sign și verify — verifică .env", "Token-ul a expirat — fă logout și login din nou", "Token-ul din localStorage e corupt — șterge-l manual din DevTools"],
    color: "#854F0B", bg: "#FAEEDA", border: "#EF9F27",
  },
  NOT_FOUND: {
    title: "Rută inexistentă",
    tips: ["Verifică URL-ul exact — /api/audit vs /api/audit_log", "Verifică că ruta e înregistrată în app.js", "Verifică metoda HTTP: GET vs POST vs PUT vs DELETE"],
    color: "#3B6D11", bg: "#EAF3DE", border: "#97C459",
  },
  VALIDATION: {
    title: "Date lipsă sau invalide",
    tips: ["Verifică că trimiți toate câmpurile required în body", "Verifică tipurile de date — număr vs string", "Inspectează request-ul în Network tab din DevTools"],
    color: "#854F0B", bg: "#FAEEDA", border: "#EF9F27",
  },
  INTERNAL: {
    title: "Eroare internă de server",
    tips: ["Verifică consola din terminal pentru stack trace complet", "Cel mai frecvent: o funcție undefined sau un import greșit", "Verifică că toate serviciile și modelele sunt importate corect"],
    color: "#A32D2D", bg: "#FCEBEB", border: "#F09595",
  },
};

const DEFAULT_TIP = {
  title: "Eroare necunoscută",
  tips: ["Verifică consola din terminal", "Verifică Network tab din DevTools", "Adaugă console.log în controller pentru mai multe detalii"],
  color: "#5F5E5A", bg: "#F1EFE8", border: "#B4B2A9",
};

function StackLine({ line }) {
  const isOwn = line.includes("src/") || line.includes("controllers") || line.includes("services") || line.includes("middlewares");
  return (
    <div style={{
      padding: "2px 0",
      fontSize: 11,
      fontFamily: "monospace",
      color: isOwn ? "#185FA5" : "#888780",
      fontWeight: isOwn ? 500 : 400,
    }}>
      {isOwn && <span style={{ color: "#D85A30", marginRight: 6 }}>▶</span>}
      {line.trim()}
    </div>
  );
}

function ErrorCard({ error, onDismiss }) {
  const [showStack, setShowStack] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const info = ERROR_TIPS[error.type] || DEFAULT_TIP;
  const stackLines = error.stack ? error.stack.split("\n").slice(1, 8) : [];

  return (
    <div style={{
      border: `1px solid ${info.border}`,
      borderRadius: 12,
      background: info.bg,
      marginBottom: 12,
      overflow: "hidden",
    }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 7px",
              borderRadius: 4,
              background: info.color,
              color: "#fff",
              fontFamily: "monospace",
              letterSpacing: 0.5,
            }}>{error.type}</span>
            <span style={{ fontSize: 10, color: info.color, fontFamily: "monospace" }}>
              {error.status} · {new Date(error.timestamp).toLocaleTimeString("ro-RO")}
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 500, color: info.color, marginBottom: 4 }}>
            {info.title}
          </div>
          <div style={{ fontSize: 12, color: "#5F5E5A", fontFamily: "monospace", marginBottom: 10, wordBreak: "break-all" }}>
            {error.message}
          </div>

          <div style={{ marginBottom: 10 }}>
            {info.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3, fontSize: 12, color: "#444441" }}>
                <span style={{ color: info.color, flexShrink: 0 }}>→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stackLines.length > 0 && (
              <button onClick={() => setShowStack(!showStack)} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 6,
                border: `0.5px solid ${info.border}`, background: "transparent",
                color: info.color, cursor: "pointer",
              }}>
                {showStack ? "Ascunde" : "Stack trace"}
              </button>
            )}
            {error.sql && (
              <button onClick={() => setShowSql(!showSql)} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 6,
                border: `0.5px solid ${info.border}`, background: "transparent",
                color: info.color, cursor: "pointer",
              }}>
                {showSql ? "Ascunde" : "SQL query"}
              </button>
            )}
            <button onClick={() => onDismiss(error.id)} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 6,
              border: "0.5px solid #B4B2A9", background: "transparent",
              color: "#5F5E5A", cursor: "pointer", marginLeft: "auto",
            }}>
              Închide
            </button>
          </div>

          {showStack && (
            <div style={{
              marginTop: 8, padding: 10, background: "rgba(255,255,255,0.6)",
              borderRadius: 6, border: "0.5px solid rgba(0,0,0,0.08)",
            }}>
              {stackLines.map((line, i) => <StackLine key={i} line={line} />)}
            </div>
          )}

          {showSql && error.sql && (
            <div style={{
              marginTop: 8, padding: 10, background: "rgba(255,255,255,0.6)",
              borderRadius: 6, border: "0.5px solid rgba(0,0,0,0.08)",
              fontSize: 11, fontFamily: "monospace", color: "#185FA5", wordBreak: "break-all",
            }}>
              {error.sql}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DevErrorPanel() {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((errorData) => {
    setErrors(prev => [{
      ...errorData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }, ...prev].slice(0, 10));
  }, []);

  const dismiss = useCallback((id) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const dismissAll = useCallback(() => setErrors([]), []);

    useEffect(() => {
        window.__devReportError = addError;
        // Golește coada acumulată înainte de montare
        const queue = window.__devErrorQueue || [];
        queue.forEach(addError);
        window.__devErrorQueue = [];
        return () => { delete window.__devReportError; };
    }, [addError]);
  if (errors.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 420,
      maxHeight: "80vh",
      overflowY: "auto",
      zIndex: 9999,
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        padding: "0 2px",
      }}>
        <span style={{ fontSize: 11, color: "#888780", fontWeight: 500 }}>
          DEV · {errors.length} {errors.length === 1 ? "eroare" : "erori"}
        </span>
        <button onClick={dismissAll} style={{
          fontSize: 11, color: "#888780", background: "none",
          border: "none", cursor: "pointer", padding: 0,
        }}>
          Închide toate
        </button>
      </div>
      {errors.map(err => (
        <ErrorCard key={err.id} error={err} onDismiss={dismiss} />
      ))}
    </div>
  );
}
