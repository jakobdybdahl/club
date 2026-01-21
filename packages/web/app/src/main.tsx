import "@club/ui/globals.css";

import dayjs from "dayjs";
import "dayjs/locale/da";
import relativeTime from "dayjs/plugin/relativeTime";
import { createRoot } from "react-dom/client";
import App from "./App";

dayjs.extend(relativeTime);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App />,
  // </StrictMode>
);
