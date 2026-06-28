import { QUERY_CLIENT } from "@/setup/queryclient";
import { RgoQueryClientProvider, type RgoProvider } from "@rgo/front-ui";

export const AppQueryClientProvider: RgoProvider = ({ children }) => {
  return <RgoQueryClientProvider client={QUERY_CLIENT}>{children}</RgoQueryClientProvider>;
};
