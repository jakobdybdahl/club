import { Toaster } from "@zero-template/ui";
import { MessengerPage } from "./features/messenger/list-page";
import { LocaleProvider } from "./providers/locale";
import { ZeroProvider } from "./providers/zero";

function App() {
  return (
    <LocaleProvider>
      <ZeroProvider>
        <Toaster />
        <MessengerPage />
      </ZeroProvider>
    </LocaleProvider>
  );
}

export default App;
