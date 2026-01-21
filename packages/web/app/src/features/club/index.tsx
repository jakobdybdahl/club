/* eslint-disable react-hooks/rules-of-hooks */
import { TimeAgo } from "@/components/ui/time-ago";
import { useAccount } from "@/providers/account";
import { PermissionProvider } from "@/providers/permissions";
// import { useZero } from "@/providers/zero";
import {
  Dialog,
  DialogPopup,
  DialogPortalWithOverlay,
  DialogTopbar,
  DialogTopbarLabel,
} from "@club/ui/components/dialog";
import { Field } from "@club/ui/components/field";
import { Textarea } from "@club/ui/components/textarea";
import { queries } from "@club/zero/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { ChevronRight } from "lucide-react";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, Route, Routes, useParams } from "react-router";
import { z } from "zod";
// import {
//   Button,
//   Dialog,
//   DialogPopup,
//   DialogPortalWithOverlay,
//   DialogTopbar,
//   DialogTopbarLabel,
//   Form,
//   FormControl,
//   FormField,
//   Separator,
//   Textarea,
// } from "../../../../ui-1/src";
import { mutators } from "@/providers/zero/mutators";
import { Button } from "@club/ui/components/button";
import { Separator } from "@club/ui/components/separator";
import { NotFound } from "../error-pages";
import { ClubContext, useClub, useUser } from "./context";

const inviteSchema = z.object({
  emails: z
    .string()
    .trim()
    .nonempty()
    .transform((val) => val.split(",").map((s) => s.trim()))
    .pipe(z.array(z.email())),
});

const InviteMemberDialog = () => {
  const user = useUser();
  const club = useClub();
  const z = useZero();

  const form = useForm<
    z.input<typeof inviteSchema>,
    unknown,
    z.output<typeof inviteSchema>
  >({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      emails: "",
    },
  });

  const onSubmit = (data: z.infer<typeof inviteSchema>) => {
    if (!user) return;
    const now = Date.now();
    for (const email of data.emails) {
      z.mutate(
        mutators.user.create({
          clubId: club.id,
          email,
          id: nanoid(),
          timeCreated: now,
          timeUpdated: now,
          actorId: user.id,
        }),
      );
    }
  };

  return (
    <DialogPopup className="w-11/12 max-w-xl overflow-y-auto max-h-[98%]">
      <DialogTopbar>
        <DialogTopbarLabel>{club.name}</DialogTopbarLabel>
        <ChevronRight />
        <div>Invite member</div>
      </DialogTopbar>
      <Separator />
      <div className="p-4">
        <form id="form-invite-user" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            control={form.control}
            name="emails"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Textarea
                  {...field}
                  id="form-invite-user-emails"
                  aria-invalid={fieldState.invalid}
                  placeholder="john@example.com, sophie@example.com"
                />
              </Field>
            )}
          />
        </form>
      </div>
      <Separator />
      <div className="p-4 flex justify-end">
        <Button onClick={() => void form.handleSubmit(onSubmit)()}>
          Invite
        </Button>
      </div>
    </DialogPopup>
  );
};

const ClubPage = () => {
  const club = useClub();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const sortedUsers = useMemo(
    () => club.users.toSorted((a, b) => a.timeCreated - b.timeCreated),
    [club.users],
  );

  return (
    <div className="m-8 bg-card border rounded-lg">
      <div className="p-8 flex flex-col gap-8">
        <div className="flex justify-between">
          <div className="text-lg font-bold">{club.name}</div>
          <div className="flex gap-4">
            {club.user && (
              <Button onClick={() => setShowInviteDialog(true)}>Invite</Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-semibold">Members</div>
          <div className="border-y">
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center text-sm h-10 px-2 hover:bg-muted/50"
              >
                <div className="flex-1">{user.username ?? user.email}</div>
                <TimeAgo>{user.timeCreated}</TimeAgo>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogPortalWithOverlay>
          <InviteMemberDialog />
        </DialogPortalWithOverlay>
      </Dialog>
    </div>
  );
};

export const ClubRoute = () => {
  const { slug } = useParams();
  const account = useAccount();

  if (!slug) return <Navigate to="/" />;

  const [club, { type }] = useQuery(
    queries.clubBySlug({ slug: slug }).query.fn({
      args: { slug },
      ctx: account.current
        ? {
            type: "account",
            properties: {
              accountId: account.current.id,
              email: account.current.email,
            },
          }
        : { type: "public" },
    }),
  );

  if (!club && type === "unknown") return null;
  if (!club && type === "complete") {
    return <NotFound />;
  }
  if (!club) return null;

  return (
    <ClubContext.Provider value={club}>
      <PermissionProvider>
        <Routes>
          <Route path="/" element={<ClubPage />} />
        </Routes>
      </PermissionProvider>
    </ClubContext.Provider>
  );
};
