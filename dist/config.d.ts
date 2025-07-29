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
declare const config: ContactFor;
