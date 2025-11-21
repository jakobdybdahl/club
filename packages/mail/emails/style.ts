export const unit = 16;

export const GREY_COLOR = [
  "#1A1A2E", //0
  "#2F2F41", //1
  "#444454", //2
  "#585867", //3
  "#6D6D7A", //4
  "#82828D", //5
  "#9797A0", //6
  "#ACACB3", //7
  "#C1C1C6", //8
  "#D5D5D9", //9
  "#EAEAEC", //10
  "#FFFFFF", //11
];

export const BLUE_COLOR = "#395C6B";
export const DANGER_COLOR = "#ED322C";
export const TEXT_COLOR = GREY_COLOR[0];
export const SECONDARY_COLOR = GREY_COLOR[5];
export const DIMMED_COLOR = GREY_COLOR[7];
export const DIVIDER_COLOR = GREY_COLOR[10];
export const BACKGROUND_COLOR = "#F0F0F1";
export const SURFACE_COLOR = DIVIDER_COLOR;
export const SURFACE_DIVIDER_COLOR = GREY_COLOR[9];

export const body = {
  background: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

export const medium = {
  fontWeight: 500,
};

export const danger = {
  color: DANGER_COLOR,
};

export const frame = {
  padding: "0 32px",
};

export const textColor = {
  color: TEXT_COLOR,
};

export const code = {
  fontFamily: "monospace",
};

export const headingHr = {
  margin: `${unit}px 0`,
};

export const buttonPrimary = {
  ...code,
  padding: "8px 0",
  color: "#FFF",
  borderRadius: "4px",
  background: BLUE_COLOR,
  fontSize: "13px",
  fontWeight: 500,
};

export const compactText = {
  margin: "0 0 2px",
  fontFamily: "Rubik, Helvetica, Arial, sans-serif",
};

export const breadcrumb = {
  fontSize: "14px",
  color: SECONDARY_COLOR,
};

export const breadcrumbColonSeparator = {
  padding: " 0 4px",
  color: DIMMED_COLOR,
};

export const breadcrumbSeparator = {
  color: DIVIDER_COLOR,
};

export const heading = {
  fontSize: "22px",
  fontWeight: 500,
};

export const sectionLabel = {
  ...code,
  ...compactText,
  letterSpacing: "0.5px",
  fontSize: "13px",
  fontWeight: 500,
  color: DIMMED_COLOR,
};

export const footerLink = {
  fontSize: "14px",
};
