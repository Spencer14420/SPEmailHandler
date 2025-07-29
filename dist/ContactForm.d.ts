import { Modal } from "sp14420-modal";
import { ContactFormMessages, ContactFormSelectors } from "./config";

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
  tokenInputToken: string;
}
export interface ResponseData {
  status: string;
  message?: string;
  [key: string]: unknown;
}

export declare class ContactForm {
  serverScript: string;
  tokenInputName: string | null;
  successModal: Modal | null;
  messageAlert: HTMLElement | null;
  sendButton: HTMLElement | null;
  loadingElement: HTMLElement | null;
  onSuccess: ((responseData: ResponseData) => void) | null;
  messages: ContactFormMessages;
  selectors: ContactFormSelectors;
  private isSending: boolean;

  constructor(
    serverScript: string,
    tokenInputName?: string | null,
    onSuccess?: ((responseData: ResponseData) => void) | null,
    messages?: ContactFormMessages,
    selectors?: ContactFormSelectors,
  );

  handleSubmit(): void;
  displayAlert(message: string): void;
}
