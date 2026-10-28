import { useEffect, useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

import { useAuth } from "../context/AuthContext";

type TwoFactorForm = {
  code: string;
};

type TwoFactorResponse = {
  token?: string;
  message?: string;
};

type TwoFactorLocationState = {
  challengeId: string;
  expiresAt?: number;
};

const twoFactorSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Authentication code must contain exactly 6 digits"),
});

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const locationState = location.state as TwoFactorLocationState | null;
  const challengeId = locationState?.challengeId;
  const expiresAt = locationState?.expiresAt ?? 0;

  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!expiresAt) {
      return 0;
    }

    return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.ceil((expiresAt - Date.now()) / 1000);

      setSecondsRemaining(Math.max(0, remaining));
    };

    updateCountdown();

    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAt]);

  const onSubmit = async (data: TwoFactorForm) => {
    clearErrors("root");

    if (!challengeId) {
      setError("root", {
        type: "client",
        message: "Authentication challenge is missing",
      });

      return;
    }

    if (secondsRemaining === 0) {
      setError("root", {
        type: "client",
        message: "Authentication challenge has expired",
      });

      return;
    }

    try {
      const response = await fetch("/api/auth/login/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          code: data.code,
        }),
      });

      const responseData = (await response.json()) as TwoFactorResponse;

      if (!response.ok) {
        setError("root", {
          type: "server",
          message:
            responseData.message ?? "Authentication code verification failed",
        });

        return;
      }

      if (!responseData.token) {
        setError("root", {
          type: "server",
          message: "Authentication token is missing",
        });

        return;
      }

      signIn(responseData.token);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("root", {
        type: "server",
        message: "Unable to connect to the server",
      });
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  if (!challengeId) {
    return (
      <main className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={6} lg={4}>
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="p-4 text-center">
                  <Alert variant="warning">
                    Authentication challenge is missing.
                  </Alert>

                  <Button variant="primary" onClick={handleBackToLogin}>
                    Back to sign in
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-4">
                <div className="text-center mb-3">
                  <Badge bg="primary">Step 2 of 2</Badge>
                </div>

                <h1 className="h3 text-center mb-3">
                  Two-factor authentication
                </h1>

                <p className="text-muted text-center mb-4">
                  Enter the six-digit code displayed on your security device.
                </p>

                {errors.root?.message && (
                  <Alert variant="danger">{errors.root.message}</Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Form.Group className="mb-3" controlId="twoFactorCode">
                    <Form.Label>Authentication code</Form.Label>

                    <Form.Control
                      {...register("code", {
                        onChange: () => {
                          clearErrors("root");
                        },
                      })}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter your six-digit code"
                      maxLength={6}
                      autoFocus
                      isInvalid={Boolean(errors.code)}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.code?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="text-center text-muted small mb-4">
                    {secondsRemaining > 0
                      ? `Challenge expires in ${secondsRemaining} seconds`
                      : "Challenge expired"}
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-2"
                    disabled={isSubmitting || secondsRemaining === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify code"
                    )}
                  </Button>

                  <Button
                    variant="link"
                    type="button"
                    className="w-100"
                    onClick={handleBackToLogin}
                    disabled={isSubmitting}
                  >
                    Back to sign in
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default TwoFactorPage;
