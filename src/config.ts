export interface ContactFormMessages {
  invalidEmail: string;
  emptyMessage: string;
  serverError: string;
  unexpectedError: string;
}

export interface ContactFormConfig {
  endpoint: string;
  messages: ContactFormMessages;
}

const config: ContactFormConfig = {
  endpoint: "/path/to/your-server-script.php",
  messages: {
    invalidEmail: "Please enter a valid email address",
    emptyMessage: "Please enter a message",
    serverError: "An error occured. Please try again later.",
    unexpectedError: "An unexpected error occured. Please try again later.",
  },
};

export default config;
