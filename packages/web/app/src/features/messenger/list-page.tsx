import { TimeAgo } from "@/components/ui/time-ago";
import { useZero } from "@/providers/zero";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@rocicorp/zero/react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  Input,
  InputIcon,
  InputRoot,
} from "@zero-template/ui";
import { messageList } from "@zero-template/zero/queries";
import { UserCircleIcon, UserRoundIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const MessageSchema = z.object({
  sender: z.string().trim().nonempty(),
  message: z.string().trim().nonempty(),
});

export function MessengerPage() {
  const z = useZero();
  const [messages] = useQuery(messageList());

  const form = useForm({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      sender: "",
      message: "",
    },
  });

  useEffect(() => {
    const name = localStorage.getItem("sender-name");
    if (!name) return;
    form.setValue("sender", name);
  }, []);

  const handleSubmit = (data: z.infer<typeof MessageSchema>) => {
    z.mutate.message.create({
      id: nanoid(),
      content: data.message,
      sender: data.sender,
      timeCreated: Date.now(),
      timeUpdated: Date.now(),
    });

    form.setValue("message", "");
    form.setFocus("message");
    localStorage.setItem("sender-name", data.sender);
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center gap-4">
      <div className="w-11/12 max-w-2xl flex flex-col gap-4">
        <Form {...form}>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="sender"
              render={({ field }) => (
                <FormControl>
                  <InputRoot>
                    <InputIcon>
                      <UserRoundIcon className="size-4 text-muted-foreground" />
                    </InputIcon>
                    <Input {...field} placeholder="Your name" />
                  </InputRoot>
                </FormControl>
              )}
            />
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      {...field}
                      className="flex-1"
                      placeholder="Write a message..."
                      onKeyDown={(e) => {
                        if (e.code === "Enter") {
                          void form.handleSubmit(handleSubmit)();
                        }
                      }}
                    />
                  </FormControl>
                )}
              />
              <Button onClick={() => void form.handleSubmit(handleSubmit)()}>
                Send
              </Button>
            </div>
          </div>
        </Form>
        {messages.length > 0 && (
          <div className="flex flex-col">
            <div className="font-semibold py-4 border-b">Messages</div>
            {messages.slice(0, 15).map((message) => (
              <div
                key={message.id}
                className="flex gap-4 items-center py-3 px-1 border-b hover:bg-muted/30 text-sm"
                onClick={() => z.mutate.message.remove({ id: message.id })}
              >
                <div className="w-[100px] flex items-center gap-2.5">
                  <UserCircleIcon className="size-4 min-w-4 text-muted-foreground" />
                  <div className="truncate">{message.sender}</div>
                </div>
                <div className="flex-1 truncate">{message.content}</div>
                <TimeAgo className="text-xs text-muted-foreground">
                  {message.timeCreated}
                </TimeAgo>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
