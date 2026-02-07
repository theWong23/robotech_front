import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import './ResetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (!token) {
            setError('Token de restablecimiento no encontrado. Por favor, utiliza el enlace enviado a tu correo.');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await resetPassword(token, password);
            setMessage(response.data || 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    const heroStyle = {
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(0,179,179,0.22), rgba(1,82,104,0.12))",
    };

    const cardStyle = {
        borderRadius: "20px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
        backgroundColor: "rgba(255, 255, 255, 0.96)",
    };

    return (
        <>
            <div className="container-fluid py-5 reset-password-page d-flex align-items-center" style={heroStyle}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-9 col-lg-6">
                            <div className="card p-4 p-lg-5" style={cardStyle}>
                                <div className="mb-4">
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <img
                                            src="/img/logo.jpg"
                                            alt="Logo Robotech"
                                            className="rounded shadow"
                                            style={{ width: "64px", height: "64px", objectFit: "cover" }}
                                        />
                                        <div>
                                            <h3 className="fw-bold text-primary mb-1">Restablecer contraseña</h3>
                                            <p className="text-muted mb-0">Configura una nueva contraseña segura</p>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-0">
                                        Ingresa tu nueva contraseña. Te recomendamos usar al menos 8 caracteres.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label fw-semibold">Nueva contraseña</label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control form-control-lg"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength="8"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirmar contraseña</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className="form-control form-control-lg"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                                        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
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

export default ResetPassword;
