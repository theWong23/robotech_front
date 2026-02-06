import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/encuentrosPublicos.css";
import { FaTrophy, FaLayerGroup, FaGamepad, FaRegCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import Pagination from "../components/Pagination";

const nextPowerOfTwo = (n) => {
  if (!n || n < 1) return 0;
  return 2 ** Math.ceil(Math.log2(n));
};

const buildRounds = (encuentros) => {
  if (!encuentros || encuentros.length === 0) return [];
  const directos = encuentros.filter((e) => e.tipo === "ELIMINACION_DIRECTA");
  if (directos.length === 0) return [];

  const byRound = new Map();
  directos.forEach((e) => {
    const ronda = e.ronda || 1;
    if (!byRound.has(ronda)) byRound.set(ronda, []);
    byRound.get(ronda).push(e);
  });

  const round1 = byRound.get(1) || [];
  const participantsCount = round1.length > 0 ? round1.length * 2 : new Set(
    directos.flatMap((m) => (m.participantes || []).map((p) => p.idReferencia))
  ).size;
  const totalSlots = nextPowerOfTwo(participantsCount);
  const totalRounds = totalSlots ? Math.log2(totalSlots) : 0;

  const rounds = [];
  for (let r = 1; r <= totalRounds; r += 1) {
    const expectedMatches = totalSlots / (2 ** r);
    const matches = (byRound.get(r) || []).slice();
    for (let i = matches.length; i < expectedMatches; i += 1) {
      matches.push({
        idEncuentro: `TBD-${r}-${i}`,
        estado: "PENDIENTE",
        participantes: []
      });
    }
    rounds.push({ round: r, matches });
  }

  return rounds;
};

const buildLeagueRounds = (encuentros) => {
  if (!encuentros || encuentros.length === 0) return [];
  const liga = encuentros.filter((e) => e.tipo === "TODOS_CONTRA_TODOS");
  if (liga.length === 0) return [];

  const byRound = new Map();
  liga.forEach((e) => {
    const ronda = e.ronda || 1;
    if (!byRound.has(ronda)) byRound.set(ronda, []);
    byRound.get(ronda).push(e);
  });

  const rounds = Array.from(byRound.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, matches]) => ({ round, matches }));

  return rounds;
};

const getWinnerFromMatch = (match) => {
  const participantes = match.participantes || [];
  const winner = participantes.find((p) => p.ganador);
  if (winner) return winner.idReferencia;
  if (participantes.length === 2) {
    const [a, b] = participantes;
    if (typeof a.calificacion === "number" && typeof b.calificacion === "number") {
      if (a.calificacion > b.calificacion) return a.idReferencia;
      if (b.calificacion > a.calificacion) return b.idReferencia;
    }
  }
  return null;
};

export default function EncuentrosPublicos() {
  const { idTorneo, idCategoriaTorneo } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [encuentros, setEncuentros] = useState([]);
  const [standingsPage, setStandingsPage] = useState(1);
  const [roundsPage, setRoundsPage] = useState(1);
  const standingsPerPage = 10;
  const roundsPerPage = 3;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [catsRes, encRes] = await Promise.all([
          api.get(`/public/torneos/${idTorneo}/categorias`),
          api.get(`/public/categorias/${idCategoriaTorneo}/encuentros`)
        ]);
        if (!isMounted) return;
        const cats = Array.isArray(catsRes.data) ? catsRes.data : [];
        setCategorias(cats);
        setCategoria(cats.find((c) => c.idCategoriaTorneo === idCategoriaTorneo) || null);
        setEncuentros(Array.isArray(encRes.data) ? encRes.data : []);
      } catch (err) {
        if (!isMounted) return;
        setError("No se pudieron cargar los encuentros.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [idTorneo, idCategoriaTorneo]);

  useEffect(() => {
    setStandingsPage(1);
    setRoundsPage(1);
  }, [encuentros.length]);

  const tipoEncuentro = encuentros[0]?.tipo || "";
  const rounds = useMemo(() => buildRounds(encuentros), [encuentros]);
  const leagueRounds = useMemo(() => buildLeagueRounds(encuentros), [encuentros]);

  const standings = useMemo(() => {
    const liga = encuentros.filter((e) => e.tipo === "TODOS_CONTRA_TODOS");
    const map = new Map();
    const ensure = (p) => {
      const key = p.idReferencia || p.nombre || "-";
      if (!map.has(key)) {
        map.set(key, {
          key,
          nombre: p.nombre || key,
          pj: 0,
          pg: 0,
          pp: 0,
          pts: 0
        });
      }
      return map.get(key);
    };

    liga.forEach((m) => {
      const participantes = m.participantes || [];
      participantes.forEach((p) => ensure(p));
      if (m.estado !== "FINALIZADO") return;
      if (participantes.length < 2) return;

      const ganadorId = getWinnerFromMatch(m);
      participantes.forEach((p) => {
        const row = ensure(p);
        row.pj += 1;
        if (ganadorId && p.idReferencia === ganadorId) {
          row.pg += 1;
          row.pts += 3;
        } else {
          row.pp += 1;
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.pg !== a.pg) return b.pg - a.pg;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [encuentros]);

  const standingsTotalPages = Math.max(1, Math.ceil(standings.length / standingsPerPage));
  const standingsPaginados = standings.slice(
    (standingsPage - 1) * standingsPerPage,
    standingsPage * standingsPerPage
  );

  const roundsTotalPages = Math.max(1, Math.ceil(leagueRounds.length / roundsPerPage));
  const leagueRoundsPaginados = leagueRounds.slice(
    (roundsPage - 1) * roundsPerPage,
    roundsPage * roundsPerPage
  );

  const leagueMeta = useMemo(() => {
    const liga = encuentros.filter((e) => e.tipo === "TODOS_CONTRA_TODOS");
    if (liga.length === 0) return { totalMatches: 0, rounds: 0, matchesPerRound: 0, byesPerRound: 0 };

    const participants = new Set();
    liga.forEach((m) => (m.participantes || []).forEach((p) => participants.add(p.idReferencia || p.nombre)));
    const n = participants.size;
    if (n === 0) return { totalMatches: liga.length, rounds: 0, matchesPerRound: 0, byesPerRound: 0 };

    const roundsCount = n - 1;
    const matchesPerRound = Math.floor(n / 2);
    const byesPerRound = n % 2 === 0 ? 0 : 1;

    return {
      totalMatches: liga.length,
      rounds: roundsCount,
      matchesPerRound,
      byesPerRound
    };
  }, [encuentros]);

  return (
    <>
      <Navbar />
      <div className="bracket-page">
        <section className="bracket-hero">
          <div className="hero-inner">
            <div className="hero-text">
              <p className="hero-kicker">Robotech Arena</p>
              <h1>Encuentros del Torneo</h1>
              <p className="hero-subtitle">
                {encuentros[0]?.torneo || "Torneo en curso"} -{" "}
                <span>{categoria?.categoria || "Categoría"}</span>
              </p>
              <div className="hero-meta">
                <span><FaLayerGroup /> {categoria?.modalidad || "MODALIDAD"}</span>
                <span><FaGamepad /> {tipoEncuentro || "SIN MODALIDAD"}</span>
                {encuentros[0]?.coliseo && (
                  <span><FaMapMarkerAlt /> {encuentros[0]?.coliseo}</span>
                )}
              </div>
            </div>
            <div className="hero-card">
              <div className="card-title">
                <FaTrophy /> Estado del Cuadro
              </div>
              <div className="card-body">
                <div className="card-stat">
                  <span>Encuentros</span>
                  <strong>{encuentros.length}</strong>
                </div>
                <div className="card-stat">
                  <span>Rondas</span>
                  <strong>{rounds.length || "-"}</strong>
                </div>
                <div className="card-stat">
                  <span>Actualizado</span>
                  <strong><FaRegCalendarAlt /> {new Date().toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="category-tabs">
          <div className="tab-list">
            {categorias.map((c) => (
              <Link
                key={c.idCategoriaTorneo}
                to={`/torneos/${idTorneo}/categorias/${c.idCategoriaTorneo}/encuentros`}
                className={`tab-item ${c.idCategoriaTorneo === idCategoriaTorneo ? "active" : ""}`}
              >
                <span>{c.categoria}</span>
                <small>{c.modalidad}</small>
              </Link>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="bracket-loading">
            <div className="loader"></div>
            <p>Preparando el cuadro...</p>
          </div>
        ) : error ? (
          <div className="bracket-empty">
            <h3>Ups, algo salió mal</h3>
            <p>{error}</p>
          </div>
        ) : encuentros.length === 0 ? (
          <div className="bracket-empty">
            <h3>No hay encuentros generados aún</h3>
            <p>Cuando el administrador genere los cruces, podrás verlos aquí.</p>
          </div>
        ) : tipoEncuentro === "ELIMINACION_DIRECTA" ? (
          <section className="bracket-board">
            <div className="board-title">
              <h2>Bracket Eliminación Directa</h2>
              <p>Los ganadores avanzan automáticamente a la siguiente ronda.</p>
            </div>
            <div className="rounds-scroll">
              {rounds.map((round) => (
                <div key={round.round} className="round-column">
                  <div className="round-header">Ronda {round.round}</div>
                  <div className="round-matches">
                    {round.matches.map((match) => {
                      const participantes = match.participantes || [];
                      const p1 = participantes[0] || {};
                      const p2 = participantes[1] || {};
                      return (
                        <div key={match.idEncuentro} className="match-card">
                          <div className={`team ${p1.ganador ? "winner" : ""}`}>
                            <span className="team-name">{p1.nombre || "Por definir"}</span>
                            {typeof p1.calificacion === "number" && (
                              <span className="team-score">{p1.calificacion}</span>
                            )}
                          </div>
                          <div className={`team ${p2.ganador ? "winner" : ""}`}>
                            <span className="team-name">{p2.nombre || "Por definir"}</span>
                            {typeof p2.calificacion === "number" && (
                              <span className="team-score">{p2.calificacion}</span>
                            )}
                          </div>
                          <div className={`match-status ${match.estado?.toLowerCase() || "pendiente"}`}>
                            {match.estado || "PENDIENTE"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="league-board">
            <div className="board-title">
              <h2>Tabla Liga (Todos contra Todos)</h2>
              <p>Se ordena por puntos. Cada victoria suma 3 puntos.</p>
            </div>
            <div className="league-grid mb-4">
              <div className="standings-card">
                <div className="standings-header">Estructura del torneo</div>
                <div className="p-3">
                  <div className="d-flex justify-content-between border-bottom py-2">
                    <span>Partidos en total</span>
                    <strong>{leagueMeta.totalMatches || "-"}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom py-2">
                    <span>Rondas</span>
                    <strong>{leagueMeta.rounds || "-"}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom py-2">
                    <span>Partidos por ronda</span>
                    <strong>{leagueMeta.matchesPerRound || "-"}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span>Descansos por ronda</span>
                    <strong>{leagueMeta.byesPerRound || 0}</strong>
                  </div>
                </div>
              </div>
              <div className="standings-card">
                <div className="standings-header">Puntajes</div>
                <div className="p-3">
                  <div className="d-flex justify-content-between border-bottom py-2">
                    <span>Victoria</span>
                    <strong>3 pts</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom py-2">
                    <span>Empate</span>
                    <strong>1 pt</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span>Derrota</span>
                    <strong>0 pts</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="league-grid">
              <div className="standings-card">
                <div className="standings-header">Clasificación</div>
                <div className="standings-table">
                  <div className="standings-row head">
                    <span>#</span>
                    <span>Participante</span>
                    <span>PJ</span>
                    <span>PG</span>
                    <span>PP</span>
                    <span>PTS</span>
                  </div>
                  {standingsPaginados.map((row, idx) => (
                    <div key={row.key} className="standings-row">
                      <span>{(standingsPage - 1) * standingsPerPage + idx + 1}</span>
                      <span className="name">{row.nombre}</span>
                      <span>{row.pj}</span>
                      <span>{row.pg}</span>
                      <span>{row.pp}</span>
                      <span className="pts">{row.pts}</span>
                    </div>
                  ))}
                </div>
                <Pagination
                  page={standingsPage}
                  totalPages={standingsTotalPages}
                  onPageChange={setStandingsPage}
                />
              </div>
              <div className="matches-card">
                <div className="standings-header">Partidos por ronda</div>
                <div className="matches-list">
                  {leagueRoundsPaginados.map((round) => (
                    <div key={round.round} className="mb-3">
                      <div className="fw-bold text-uppercase text-muted small mb-2">Ronda {round.round}</div>
                      {round.matches.map((match) => {
                        const participantes = match.participantes || [];
                        return (
                          <div key={match.idEncuentro} className="match-row">
                            <div className="match-info">
                              <span className="match-id">{match.idEncuentro}</span>
                              <span className="match-meta">{match.estado}</span>
                            </div>
                            <div className="match-teams">
                              <span className={participantes[0]?.ganador ? "win" : ""}>
                                {participantes[0]?.nombre || "Por definir"}
                              </span>
                              <span className="vs">vs</span>
                              <span className={participantes[1]?.ganador ? "win" : ""}>
                                {participantes[1]?.nombre || "Por definir"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <Pagination
                  page={roundsPage}
                  totalPages={roundsTotalPages}
                  onPageChange={setRoundsPage}
                />
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
