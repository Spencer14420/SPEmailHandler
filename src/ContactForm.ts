import { Modal } from "sp14420-modal";
import config, { ContactFormMessages, ContactFormSelectors } from "./config";

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

export class ContactForm {
  public serverScript: string;
  public tokenInputName: string | null;
  public successModal: Modal | null;
  public messageAlert: HTMLElement | null;
  public sendButton: HTMLElement | null;
  public loadingElement: HTMLElement | null;
  public onSuccess: ((responseData: ResponseData) => void) | null;
  public messages: ContactFormMessages;
  public selectors: ContactFormSelectors;
  private isSending: boolean;

  constructor(
    serverScript: string,
    tokenInputName: string | null = null,
    onSuccess: ((responseData: ResponseData) => void) | null = null,
    messages: Partial<ContactFormMessages> = {},
    selectors: Partial<ContactFormSelectors> = {},
  ) {
    if (!serverScript) {
      throw new Error("serverScript endpoint is required");
    }
    this.serverScript = serverScript;
    this.tokenInputName = tokenInputName;
    this.onSuccess = onSuccess;
    this.messages = { ...config.messages, ...messages };
    this.selectors = { ...config.selectors, ...selectors };

    this.successModal = new Modal(this.selectors.successModal);

    this.messageAlert = document.querySelector(
      this.selectors.messageAlert,
    ) as HTMLElement | null;

    this.sendButton = document.querySelector(
      this.selectors.sendButton,
    ) as HTMLElement | null;

    this.loadingElement = document.querySelector(
      this.selectors.loadingElement,
    ) as HTMLElement | null;

    this.isSending = false;

    this.initializeEventListeners();
  }

  public handleSubmit(): void {
    const emailElement = document.querySelector(
      this.selectors.emailInput,
    ) as HTMLInputElement | null;
    const messageElement = document.querySelector(
      this.selectors.messageInput,
    ) as HTMLInputElement | null;

    if (!emailElement || !messageElement) {
      console.error("Email or message element not found");
      return;
    }

    const email = emailElement.value;
    const message = messageElement.value;

    const validationError = this.validateInput(email, message);
    if (validationError) {
      this.displayAlert(validationError);
      return;
    }

    const nameElement = document.querySelector(
      this.selectors.nameInput,
    ) as HTMLInputElement | null;
    const name = nameElement?.value || "";

    const turnstileInput = document.getElementsByName(
      "cf-turnstile-response",
    )[0] as HTMLInputElement | null;
    const turnstileToken = turnstileInput?.value || "";

    const tokenInput = this.tokenInputName
      ? (document.getElementsByName(
          this.tokenInputName,
        )[0] as HTMLInputElement | null)
      : null;
    const tokenInputToken = tokenInput?.value || "";

    const data: ContactFormData = {
      name,
      email,
      message,
      turnstileToken,
      tokenInputToken,
    };

    this.sendMessage(data);
  }

  public displayAlert(message: string): void {
    if (this.messageAlert) {
      this.messageAlert.innerHTML = message;
      this.messageAlert.style.display = "block";
    } else {
      console.error("Message alert element not found.");
    }
  }

  private initializeEventListeners(): void {
    document
      .querySelector(this.selectors.sendButton)
      ?.addEventListener("click", () => this.handleSubmit());
  }

  private isEmail(email: string): boolean {
    if (email.length > 254) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private validateInput(email: string, message: string): string | null {
    if (!email || !this.isEmail(email)) {
      return this.messages.invalidEmail;
    }

    if (!message) {
      return this.messages.emptyMessage;
    }

    return null;
  }

  private messageSuccess(responseData?: ResponseData): void {
    [
      this.selectors.nameInput,
      this.selectors.emailInput,
      this.selectors.messageInput,
    ].forEach((selector) => {
      const element = document.querySelector(
        selector,
      ) as HTMLInputElement | null;
      if (element) {
        element.value = "";
      }
    });

    const cancelButton = document.querySelector(
      this.selectors.cancelButton,
    ) as HTMLButtonElement | null;
    cancelButton?.click();

    if (this.successModal) {
      this.successModal.show();
    }

    if (this.onSuccess) {
      this.onSuccess(responseData || ({} as ResponseData));
    }
  }

  private setSending(isSending: boolean): void {
    this.isSending = isSending;
    if (this.sendButton && this.loadingElement) {
      this.sendButton.style.display = isSending ? "none" : "block";
      this.loadingElement.style.display = isSending ? "block" : "none";
    }
  }

  private async sendMessage(data: ContactFormData): Promise<void> {
    if (this.isSending) {
      return;
    }

    this.setSending(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));

    try {
      const response = await fetch(this.serverScript, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      const errorMessage = responseData.message || this.messages.serverError;

      if (!response.ok || responseData.status !== "success") {
        this.displayAlert(errorMessage);
        return;
      }

      this.messageSuccess(responseData);
    } catch (error) {
      console.error("Error sending message", error);
      this.displayAlert(this.messages.unexpectedError);
    } finally {
      this.setSending(false);
    }
  }
}
