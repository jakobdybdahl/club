import { CodeForm } from "./components/code-form";
import { EmailForm } from "./components/email-form";

export const Email = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-xs">
        <EmailForm />
      </div>
    </div>
  );
};

export const Code = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-xs">
        <CodeForm />
      </div>
    </div>
  );
};
