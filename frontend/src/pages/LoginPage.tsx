import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

type LoginForm = {
  username: string;
  password: string;
};

type LoginResponse = {
  challengeId?: string;
  expiresAt?: number;
  message?: string;
};

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must contain at least 3 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must contain at least 8 characters"),
});

const LoginPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    clearErrors("root");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setError("root", {
          type: "server",
          message: responseData.message ?? "Login failed",
        });

        return;
      }

      if (!responseData.challengeId) {
        setError("root", {
          type: "server",
          message: "Invalid authentication response",
        });

        return;
      }

      navigate("/login/2fa", {
        state: {
          challengeId: responseData.challengeId,
          expiresAt: responseData.expiresAt,
        },
      });
    } catch {
      setError("root", {
        type: "server",
        message: "Unable to connect to the server",
      });
    }
  };

  return (
    <main className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={4}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-4">
                <h1 className="h3 text-center mb-4">Sign in</h1>

                {errors.root?.message && (
                  <Alert variant="danger">{errors.root.message}</Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>

                    <Form.Control
                      {...register("username", {
                        onChange: () => {
                          clearErrors("root");
                        },
                      })}
                      type="text"
                      placeholder="Enter your username"
                      autoComplete="username"
                      isInvalid={Boolean(errors.username)}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.username?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label>Password</Form.Label>

                    <Form.Control
                      {...register("password", {
                        onChange: () => {
                          clearErrors("root");
                        },
                      })}
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      isInvalid={Boolean(errors.password)}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isSubmitting}
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
                        Signing in...
                      </>
                    ) : (
                      "Continue"
                    )}
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

export default LoginPage;
