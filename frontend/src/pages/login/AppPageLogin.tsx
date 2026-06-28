import { useAuthContext } from "@/features/auth/hooks/contexts/useAuthContext";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { Alert, Box, Button, Card, Typography } from "@mui/material";
import { RgoInputPassword, RgoInputText, RgoPage } from "@rgo/front-ui";
import type { AxiosError } from "axios";
import React from "react";
import { useNavigate } from "react-router";

type ApiError = {
  message?: string;
};

export function AppPageLogin() {
  const { t } = useLmsTranslation();
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [username, setUsername] = React.useState("superadmin");
  const [password, setPassword] = React.useState("superadmin123");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (unknownError) {
      const axiosError = unknownError as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message ?? t("auth.messages.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RgoPage>
      <Card
        sx={{
          p: 4,
          width: 420,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={onSubmit}>
          <Typography variant="h5" fontWeight={700}>
            {t("auth.messages.signIn")}
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <RgoInputText
            value={username}
            onChange={value => setUsername(String(value ?? ""))}
            rgoSlotProps={{
              root: {
                label: t("auth.messages.username"),
                autoComplete: "username",
                required: true,
              },
            }}
          />

          <RgoInputPassword
            value={password}
            onChange={value => setPassword(String(value ?? ""))}
            rgoSlotProps={{
              root: {
                label: t("auth.messages.password"),
                autoComplete: "current-password",
                required: true,
              },
            }}
          />

          <Button type="submit" variant="contained" disabled={submitting}>
            {t("common.messages.login")}
          </Button>
        </Box>
      </Card>
    </RgoPage>
  );
}
