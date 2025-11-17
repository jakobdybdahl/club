const auth = {
  login: {
    title: "Welcome to Club",
    subtitle: "Sign in with your email to get started",
    placeholder: {
      email: "m@example.com",
    },
    button: {
      submit: "Continue",
      submitting: "Submitting...",
    },
    messages: {
      pinCode: "We'll send a pin code to your email",
    },
    links: {
      terms: "Terms of service",
      privacy: "Privacy",
    },
  },
  code: {
    title: "Let's verify your email",
    subtitle: "Check your inbox for the code we sent you",
  },
} as const;

export default auth;
