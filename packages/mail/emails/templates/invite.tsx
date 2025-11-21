import React from "react";

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "jsx-email";
import {
  body,
  buttonPrimary,
  container,
  footerLink,
  frame,
  headingHr,
  TEXT_COLOR,
  unit,
} from "../style";

type InviteEmailProps = {
  club: {
    name: string;
    slug: string;
  };
  appUrl: string;
  assetsUrl?: string;
};

const LOCAL_ASSETS_URL = "/static";

export const Template = ({
  club = { name: "Social Runners Aarhus", slug: "sr-aarhus" },
  appUrl = "app.club.com",
  assetsUrl = LOCAL_ASSETS_URL,
}: InviteEmailProps) => {
  const url = `${appUrl}/c/${club.slug}`;
  return (
    <Html lang="en">
      <Head />
      <Preview>You've been invited to join {club.name}.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={frame}>
            <Img src={`${assetsUrl}/logo.png`} height="28" alt="Club logo" />
            <Hr style={headingHr} />
            <Text>
              You've been invited to join{" "}
              <Link
                href={url}
                style={{
                  textDecoration: "underline dotted",
                  textUnderlineOffset: "4px",
                  color: TEXT_COLOR,
                }}
              >
                {club.name}.
              </Link>
            </Text>
            <Text>
              Complete your membership and dive into upcoming events,
              activities, and everything the club has planned for you.
            </Text>
            <Text>Gear up.</Text>
            <Section
              style={{
                margin: `${unit * 2}px 0 ${unit * 2.5}px 0`,
              }}
            >
              <Button
                align="center"
                width={300}
                height={36}
                href={url}
                style={buttonPrimary}
              >
                Join
              </Button>
              {/* <Row>
                <Column align="center">
                  <Text
                    style={{
                      fontSize: "12px",
                      margin: "0",
                      color: SECONDARY_COLOR,
                    }}
                  >
                    {url}
                  </Text>
                </Column>
              </Row> */}
            </Section>
            <Hr style={headingHr} />
            <Row>
              <Column>
                <Link href={appUrl} style={footerLink}>
                  Club
                </Link>
              </Column>
              <Column align="right">
                <Link style={footerLink} href="#">
                  About
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export { Template as InviteEmail };
