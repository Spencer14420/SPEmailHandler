import "bootstrap";
import { Modal } from "bootstrap";

export class ContactForm {
  public serverScript: string;
  public tokenInputName: string | null;
  public successModal: Modal | null;
  public messageAlert: HTMLElement | null;
  public onSuccess: ((responseData: Record<string, any>) => void) | null;

  constructor(
    serverScript: string,
    tokenInputName: string | null = null,
    onSuccess: ((responseData: Record<string, any>) => void) | null = null,
  ) {
    this.serverScript = serverScript;
    this.tokenInputName = tokenInputName;
    this.onSuccess = onSuccess;

    const modalElement = document.querySelector(
      "#success",
    ) as HTMLElement | null;
    this.successModal = modalElement ? new Modal(modalElement) : null;

    this.messageAlert = document.querySelector(
      "#message-alert",
    ) as HTMLElement | null;

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

    const data = {
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

  private messageSuccess(responseData?: Record<string, any>): void {
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
      this.onSuccess(responseData || {});
    }
  }

  private async sendMessage(data: Record<string, string>): Promise<void> {
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
    }
  }
}
