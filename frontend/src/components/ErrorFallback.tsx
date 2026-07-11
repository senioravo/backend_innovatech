/** Pantalla mostrada cuando ErrorBoundary captura un error de React */
export default function ErrorFallback() {
  return (
    <div className="login-page">
      <div className="card card-panel login-card">
        <h1>Algo salió mal</h1>
        <p className="page-description">
          Ocurrió un error inesperado en la aplicación. El incidente fue reportado automáticamente.
        </p>
        <button type="button" className="button-primary button-primary--full" onClick={() => window.location.reload()}>
          Recargar página
        </button>
      </div>
    </div>
  );
}
