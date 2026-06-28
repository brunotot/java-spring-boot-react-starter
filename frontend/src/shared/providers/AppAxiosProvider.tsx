import { configureAxiosClient, RgoInitializeProvider, type RgoProvider } from "@rgo/front-ui";
import axios from "axios";

function onInit() {
  configureAxiosClient(axios);
}

export const AppAxiosProvider: RgoProvider = ({ children }) => {
  return <RgoInitializeProvider onInit={onInit}>{children}</RgoInitializeProvider>;
};
