import { Dialog as DialogPrimitive } from "@base-ui-components/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "../util";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 fixed data-[ending-style]:opacity-0 inset-0 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  keepMounted,
  ...props
}: {
  keepMounted?: React.ComponentProps<
    typeof DialogPrimitive.Portal
  >["keepMounted"];
} & React.ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPortal data-slot="dialog-portal" keepMounted={keepMounted}>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed left-[50%] top-[40%] flex flex-col w-full max-w-lg border bg-background shadow-lg duration-200 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 sm:rounded-lg",
          "translate-x-[-50%] translate-y-[calc(-40%+0px+1.25rem*var(--nested-dialogs))]",
          "scale-[calc(1-0.05*var(--nested-dialogs))]",
          "data-[nested-dialog-open]:after:content-[''] data-[nested-dialog-open]:after:inset-0 data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:bg-black/5",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[open]:bg-accent data-[open]:text-muted-foreground absolute top-5 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogPortalWithOverlay({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" {...props}>
      <DialogOverlay />
      {children}
    </DialogPrimitive.Portal>
  );
}

function DialogClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        "ring-offset-background focus:ring-ring data-[open]:bg-accent data-[open]:text-muted-foreground rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

function DialogPopup({
  children,
  className,
  hideClose,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & {
  hideClose?: boolean;
}) {
  return (
    <DialogPrimitive.Popup
      data-slot="dialog-content"
      className={cn(
        "fixed left-[50%] top-[40%] flex flex-col w-full max-w-lg border bg-background shadow-lg duration-200 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 sm:rounded-lg",
        "translate-x-[-50%] translate-y-[calc(-40%+0px+1.25rem*var(--nested-dialogs))]",
        "scale-[calc(1-0.05*var(--nested-dialogs))]",
        "data-[nested-dialog-open]:after:content-[''] data-[nested-dialog-open]:after:inset-0 data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:bg-black/5",
        className
      )}
      {...props}
    >
      {children}
      {hideClose !== undefined && !hideClose && (
        <DialogClose className="absolute top-5 right-4" />
      )}
    </DialogPrimitive.Popup>
  );
}

function DialogTopbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-topbar"
      className={cn(
        "flex items-center gap-2 p-4 text-sm text-foreground [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  );
}

function DialogTopbarLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-muted dark:bg-muted/60 leading-none p-1.5 rounded",
        className
      )}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPopup,
  DialogPortal,
  DialogPortalWithOverlay,
  DialogTitle,
  DialogTopbar,
  DialogTopbarLabel,
  DialogTrigger,
};
