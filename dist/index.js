"use strict";
import { Modal } from "sp14420-modal";
export class ContactForm {
  constructor(serverScript, tokenInputName = null, onSuccess = null) {
    this.serverScript = serverScript;
    this.tokenInputName = tokenInputName;
    this.onSuccess = onSuccess;
    this.successModal = new Modal("#success");
    this.messageAlert = document.querySelector(
      "#message-alert"
    );
    this.sendButton = document.querySelector(
      "#sendmessage"
    );
    this.loadingElement = document.querySelector(
      "#sendmessage-loading"
    );
    this.isSending = false;
    this.initializeEventListeners();
  }
  handleSubmit() {
    const emailElement = document.querySelector(
      "#email"
    );
    const messageElement = document.querySelector(
      "#message"
    );
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
      "#name"
    );
    const name = nameElement?.value || "";
    const turnstileInput = document.getElementsByName(
      "cf-turnstile-response"
    )[0];
    const turnstileToken = turnstileInput?.value || "";
    const tokenInput = this.tokenInputName ? document.getElementsByName(
      this.tokenInputName
    )[0] : null;
    const tokenInputToken = tokenInput?.value || "";
    const data = {
      name,
      email,
      message,
      turnstileToken,
      tokenInputToken
    };
    this.sendMessage(data);
  }
  displayAlert(message) {
    if (this.messageAlert) {
      this.messageAlert.innerHTML = message;
      this.messageAlert.style.display = "block";
    } else {
      console.error("Message alert element not found.");
    }
  }
  initializeEventListeners() {
    document.querySelector("#sendmessage")?.addEventListener("click", () => this.handleSubmit());
  }
  isEmail(email) {
    if (email.length > 254) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  validateInput(email, message) {
    if (!email || !this.isEmail(email)) {
      return "Please enter a valid email address";
    }
    if (!message) {
      return "Please enter a message";
    }
    return null;
  }
  messageSuccess(responseData) {
    ["#name", "#email", "#message"].forEach((selector) => {
      const element = document.querySelector(
        selector
      );
      if (element) {
        element.value = "";
      }
    });
    const cancelButton = document.querySelector(
      "#contactCancel"
    );
    cancelButton?.click();
    if (this.successModal) {
      this.successModal.show();
    }
    if (this.onSuccess) {
      this.onSuccess(responseData || {});
    }
  }
  setSending(isSending) {
    this.isSending = isSending;
    if (this.sendButton && this.loadingElement) {
      this.sendButton.style.display = isSending ? "none" : "block";
      this.loadingElement.style.display = isSending ? "block" : "none";
    }
  }
  async sendMessage(data) {
    if (this.isSending) {
      return;
    }
    this.setSending(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    try {
      const response = await fetch(this.serverScript, {
        method: "POST",
        body: formData
      });
      const responseData = await response.json();
      const errorMessage = responseData.message || "An error occurred. Please try again later.";
      if (!response.ok || responseData.status !== "success") {
        this.displayAlert(errorMessage);
        return;
      }
      this.messageSuccess(responseData);
    } catch (error) {
      console.error("Error sending message", error);
      this.displayAlert(
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      this.setSending(false);
    }
  }
}
