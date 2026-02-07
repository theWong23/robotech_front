import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';
import Navbar from "../components/Navbar";
import './RequestPasswordReset.css';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await requestPasswordReset(email);
            setMessage(response.data || 'Si el correo electrónico está registrado, se ha enviado un enlace de restablecimiento de contraseña.');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al solicitar el restablecimiento de contraseña. Por favor, intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const heroStyle = {
        minHeight: "calc(100vh - 72px)",
        background:
            "linear-gradient(135deg, rgba(0,179,179,0.12), rgba(0,179,179,0.04))",
    };

    const panelStyle = {
        backgroundImage: "linear-gradient(135deg, rgba(0,179,179,0.9), rgba(1,82,104,0.95)), url('/img/robots.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        borderRadius: "20px",
    };

    const cardStyle = {
        borderRadius: "20px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
    };

    return (
        <>
            <Navbar />

            <div className="container-fluid py-5 request-reset-page" style={heroStyle}>
                <div className="container">
                    <div className="row g-4 align-items-stretch">
                        <div className="col-lg-6">
                            <div className="p-4 p-lg-5 h-100" style={panelStyle}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <img
                                        src="/img/logo.jpg"
                                        alt="Logo Robotech"
                                        className="rounded shadow"
                                        style={{ width: "72px", height: "72px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <h2 className="fw-bold mb-1">Robotech League</h2>
                                        <p className="mb-0 opacity-75">Recupera el acceso a tu cuenta</p>
                                    </div>
                                </div>

                                <p className="lead mb-0">
                                    Te enviaremos un enlace seguro para restablecer tu contraseña.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card p-4 p-lg-5 h-100" style={cardStyle}>
                                <div className="mb-4">
                                    <h3 className="fw-bold text-primary mb-1">Restablecer contraseña</h3>
                                    <p className="text-muted mb-0">
                                        Ingresa tu correo electrónico y te enviaremos un enlace.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="form-control form-control-lg"
                                            placeholder="tucorreo@ejemplo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                                        {loading ? 'Enviando...' : 'Enviar enlace'}
                                    </button>
                                </form>

                                {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
                                {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

                                <div className="text-center mt-3">
                                    <Link to="/login" className="small text-muted">
                                        Volver a iniciar sesión
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RequestPasswordReset;
