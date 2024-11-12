"use strict";
import "bootstrap";
import { Modal } from "bootstrap";
export class ContactForm {
  constructor(serverScript) {
    this.successModal = null;
    this.serverScript = serverScript;
    const modalElement = document.querySelector(
      "#success"
    );
    if (modalElement) {
      this.successModal = new Modal(modalElement);
    }
    this.messageAlert = document.querySelector(
      "#message-alert"
    );
    this.initializeEventListeners();
  }
  initializeEventListeners() {
    document.querySelector("#sendmessage")?.addEventListener("click", () => this.handleSubmit());
  }
  isEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  messageSuccess() {
    ["#name", "#email", "#message"].forEach((selector) => {
      const element = document.querySelector(
        selector
      );
      if (element) {
        element.value = "";
      }
    });
    document.querySelector("#contactCancel")?.click();
    if (this.successModal) {
      this.successModal.show();
    }
  }
  async sendMessage(data) {
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
      this.messageSuccess();
    } catch (error) {
      console.error("Error sending message", error);
      this.displayAlert(
        "An unexpected error occurred. Please try again later."
      );
    }
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
    if (!email || !this.isEmail(email)) {
      this.displayAlert("Please enter a valid email address");
      return;
    }
    if (!message) {
      this.displayAlert("Please enter a message");
      return;
    }
    const nameElement = document.querySelector(
      "#name"
    );
    const name = nameElement?.value || "";
    const data = {
      name,
      email,
      message
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
}
