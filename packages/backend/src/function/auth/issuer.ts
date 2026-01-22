import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { Account } from "@club/core/account/index";
import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { z } from "zod";
import { subjects } from "../../subjects";

const ses = new SESv2Client({});

export const handler = handle(
  issuer({
    subjects,
    providers: {
      email: CodeProvider({
        async request(req, state, form, error) {
          const params = new URLSearchParams();
          console.log(state);
          if (error) {
            params.set("error", error.type);
          }
          if (state.type === "start") {
            return Response.redirect(
              process.env.AUTH_FRONTEND_URL +
                "/auth/email?" +
                params.toString(),
              302,
            );
          }

          if (state.type === "code") {
            return Response.redirect(
              process.env.AUTH_FRONTEND_URL + "/auth/code?" + params.toString(),
              302,
            );
          }

          return new Response("ok");
        },
        async sendCode(claims, code) {
          const email = z.email().parse(claims.email);
          const cmd = new SendEmailCommand({
            Destination: {
              ToAddresses: [email],
            },
            FromEmailAddress: `Club <auth@${Resource.Email.sender}>`,
            Content: {
              Simple: {
                Body: {
                  Html: {
                    Data: `Your pin code is ${code}`,
                  },
                  Text: {
                    Data: `Your pin code is ${code}`,
                  },
                },
                Subject: {
                  Data: "Club Pin Code: " + code,
                },
              },
            },
          });
          await ses.send(cmd);
        },
      }),
    },
    async success(ctx, response) {
      const email = response.claims.email;
      if (!email) throw new Error("No email found");
      let accountId = await Account.fromEmail(email).then((x) => x?.id);

      if (!accountId) {
        console.log("Creating account for", email);
        accountId = await Account.create({ email });
      }

      return await ctx.subject("account", {
        accountId,
        email,
      });
    },
    async allow(input) {
      const url = new URL(input.redirectURI);
      console.log("url", url);
      return (
        url.hostname.endsWith("localhost") ||
        url.hostname.endsWith("jakobdybdahl.com")
      );
    },
  }),
);
