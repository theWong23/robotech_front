export default function Footer() {
  const goAdminLogin = () => {
    window.location.href = "/admin/login";
  };

  return (
    <footer className="bg-dark text-white py-5 w-100">
      <div className="container">
        <div className="row">

          <div className="col-md-4">
            <h6
              className="footer-title"
              onDoubleClick={goAdminLogin}
              title="Doble clic para acceso admin"
              style={{ cursor: "pointer" }}
            >
              Casos de uso
            </h6>
            <p>Diseño UI<br/>UX<br/>Wireframing<br/>Prototipos<br/>Sistemas<br/>Colaboración</p>
          </div>

          <div className="col-md-4">
            <h6 className="footer-title">Explorar</h6>
            <p>Diseño<br/>Prototipado<br/>Desarrollo<br/>Colaboración<br/>Proceso</p>
          </div>

          <div className="col-md-4">
            <h6 className="footer-title">Recursos</h6>
            <p>Blog<br/>Mejores prácticas<br/>Soporte<br/>Desarrolladores<br/>Biblioteca</p>
          </div>

        </div>
      </div>
    </footer>
  );
}