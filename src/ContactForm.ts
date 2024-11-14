import "bootstrap";
import { Modal } from "bootstrap";

export class ContactForm {
  serverScript: string;
  successModal: Modal | null = null;
  messageAlert: HTMLElement | null;

  constructor(serverScript: string) {
    this.serverScript = serverScript;

    const modalElement = document.querySelector(
      "#success",
    ) as HTMLElement | null;
    if (modalElement) {
      this.successModal = new Modal(modalElement);
    }

    this.messageAlert = document.querySelector(
      "#message-alert",
    ) as HTMLElement | null;

    this.initializeEventListeners();
  }

  initializeEventListeners(): void {
    document
      .querySelector("#sendmessage")
      ?.addEventListener("click", () => this.handleSubmit());
  }

  isEmail(email: string): boolean {
    if (email.length > 254) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  messageSuccess(): void {
    ["#name", "#email", "#message"].forEach((selector) => {
      const element = document.querySelector(
        selector,
      ) as HTMLInputElement | null;
      if (element) {
        element.value = "";
      }
    });
    (
      document.querySelector("#contactCancel") as HTMLButtonElement | null
    )?.click();
    if (this.successModal) {
      this.successModal.show();
    }
  }

  async sendMessage(data: Record<string, string>): Promise<void> {
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

      this.messageSuccess();
    } catch (error) {
      console.error("Error sending message", error);
      this.displayAlert(
        "An unexpected error occurred. Please try again later.",
      );
    }
  }

  handleSubmit(): void {
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

    const data = {
      name,
      email,
      message,
      turnstileToken,
    };

    this.sendMessage(data);
  }

  displayAlert(message: string): void {
    if (this.messageAlert) {
      this.messageAlert.innerHTML = message;
      this.messageAlert.style.display = "block";
    } else {
      console.error("Message alert element not found.");
    }
  }
}
