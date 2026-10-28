import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

import { useAuth } from "../context/AuthContext";

type WelcomeResponse = {
  message?: string;
};

const getTokenExpiration = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const payload = JSON.parse(window.atob(paddedBase64)) as {
      exp?: unknown;
    };

    if (typeof payload.exp !== "number") {
      return null;
    }

    return payload.exp;
  } catch {
    return null;
  }
};

const formatRemainingTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token, signOut } = useAuth();

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  const [welcomeError, setWelcomeError] = useState(false);

  useEffect(() => {
    if (!token) {
      setSecondsRemaining(null);
      return;
    }

    const expirationSeconds = getTokenExpiration(token);

    if (expirationSeconds === null) {
      signOut();
      navigate("/login", { replace: true });
      return;
    }

    const expiresAt: number = expirationSeconds;

    const updateSessionTimer = () => {
      const currentSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = Math.max(0, expiresAt - currentSeconds);

      setSecondsRemaining(remainingSeconds);

      if (remainingSeconds === 0) {
        signOut();
        navigate("/login", { replace: true });
      }
    };

    updateSessionTimer();

    const intervalId = window.setInterval(updateSessionTimer, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [token, signOut, navigate]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadWelcomeMessage = async () => {
      try {
        const response = await fetch("/api/auth/welcome", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          signOut();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          setWelcomeError(true);
          return;
        }

        const responseData = (await response.json()) as WelcomeResponse;

        if (!responseData.message) {
          setWelcomeError(true);
          return;
        }

        setWelcomeMessage(responseData.message);
      } catch {
        setWelcomeError(true);
      }
    };

    loadWelcomeMessage();
  }, [token, signOut, navigate]);

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="navbar bg-body-tertiary border-bottom py-2">
        <Container fluid>
          <span className="navbar-brand mb-0 h1">Dashboard</span>

          <div className="d-flex align-items-center">
            <span className="text-muted small me-3" aria-live="polite">
              {secondsRemaining !== null
                ? `Session: ${formatRemainingTime(secondsRemaining)}`
                : "Session: --:--"}
            </span>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </Container>
      </nav>

      <main className="bg-light min-vh-100 py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={7} xl={6}>
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="p-4 p-md-5 text-center">
                  <Badge bg="success" className="mb-3">
                    Protected session
                  </Badge>

                  <h1 className="h2 mb-3">Welcome to your dashboard</h1>

                  {welcomeMessage && (
                    <p className="text-muted mb-0">{welcomeMessage}</p>
                  )}

                  {!welcomeMessage && !welcomeError && (
                    <p className="text-muted mb-0">
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                        aria-hidden="true"
                      />
                      Checking your session...
                    </p>
                  )}

                  {welcomeError && (
                    <Alert variant="warning" className="mt-3 mb-0">
                      The protected message could not be loaded.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default DashboardPage;
