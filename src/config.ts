export interface ContactFormMessages {
  invalidEmail: string;
  emptyMessage: string;
  serverError: string;
  unexpectedError: string;
}

export interface ContactFormSelectors {
  successModal: string;
  messageAlert: string;
  sendButton: string;
  loadingElement: string;
  nameInput: string;
  emailInput: string;
  messageInput: string;
  cancelButton: string;
}

export interface ContactFormConfig {
  endpoint: string;
  messages: ContactFormMessages;
  selectors: ContactFormSelectors;
}

const config: ContactFormConfig = {
  endpoint: "/path/to/your-server-script.php",
  messages: {
    invalidEmail: "Please enter a valid email address",
    emptyMessage: "Please enter a message",
    serverError: "An error occured. Please try again later.",
    unexpectedError: "An unexpected error occured. Please try again later.",
  },
  selectors: {
    successModal: "#success",
    messageAlert: "#message-alert",
    sendButton: "#sendmessage",
    loadingElement: "#sendmessage-loading",
    nameInput: "#name",
    emailInput: "#email",
    messageInput: "#message",
    cancelButton: "#contactCancel",
  },
};

export default config;
