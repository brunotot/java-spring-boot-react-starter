import { Alert, Box, Button } from "@mui/material";
import { RgoQueryErrorLoaderSuspense, type RgoProvider } from "@rgo/front-ui";
import type { FallbackProps } from "react-error-boundary";

function QueryFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={resetErrorBoundary}>
            Retry
          </Button>
        }
      >
        Failed loading data.
      </Alert>
    </Box>
  );
}

export const AppQueryErrorLoaderSuspense: RgoProvider = ({ children }) => {
  return <RgoQueryErrorLoaderSuspense ErrorComponent={QueryFallback}>{children}</RgoQueryErrorLoaderSuspense>;
};
