import { Modal } from "sp14420-modal";

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
  [key: string]: any;
}

export class ContactForm {
  public serverScript: string;
  public tokenInputName: string | null;
  public successModal: Modal | null;
  public messageAlert: HTMLElement | null;
  public sendButton: HTMLElement | null;
  public loadingElement: HTMLElement | null;
  public onSuccess: ((responseData: ResponseData) => void) | null;
  private isSending: boolean;

  constructor(
    serverScript: string,
    tokenInputName: string | null = null,
    onSuccess: ((responseData: ResponseData) => void) | null = null,
  ) {
    this.serverScript = serverScript;
    this.tokenInputName = tokenInputName;
    this.onSuccess = onSuccess;

    this.successModal = new Modal("#success");

    this.messageAlert = document.querySelector(
      "#message-alert",
    ) as HTMLElement | null;

    this.sendButton = document.querySelector(
      "#sendmessage",
    ) as HTMLElement | null;

    this.loadingElement = document.querySelector(
      "#sendmessage-loading",
    ) as HTMLElement | null;

    this.isSending = false;

    this.initializeEventListeners();
  }

  public handleSubmit(): void {
    const emailElement = document.querySelector(
      "#email",
    ) as HTMLInputElement | null;
    const messageElement = document.querySelector(
      "#message",
    ) as HTMLInputElement | null;

    if (!emailElement || !messageElement) {
      console.error("Email or message element not found");
      return;
    }

    const email = emailElement.value;
    const message = messageElement.value;

    if (!email || !this.isEmail(email)) {
      this.displayAlert("Please enter a valid email address");
      return;
    }

    if (!message) {
      this.displayAlert("Please enter a message");
      return;
    }

    const nameElement = document.querySelector(
      "#name",
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
      .querySelector("#sendmessage")
      ?.addEventListener("click", () => this.handleSubmit());
  }

  private isEmail(email: string): boolean {
    if (email.length > 254) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private messageSuccess(responseData?: ResponseData): void {
    ["#name", "#email", "#message"].forEach((selector) => {
      const element = document.querySelector(
        selector,
      ) as HTMLInputElement | null;
      if (element) {
        element.value = "";
      }
    });

    const cancelButton = document.querySelector(
      "#contactCancel",
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
      const errorMessage =
        responseData.message || "An error occurred. Please try again later.";

      if (!response.ok || responseData.status !== "success") {
        this.displayAlert(errorMessage);
        return;
      }

      this.messageSuccess(responseData);
    } catch (error) {
      console.error("Error sending message", error);
      this.displayAlert(
        "An unexpected error occurred. Please try again later.",
      );
    } finally {
      this.setSending(false);
    }
  }
}
