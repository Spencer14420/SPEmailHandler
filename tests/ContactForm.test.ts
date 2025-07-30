import { ContactForm } from "../src/ContactForm";
import { Modal } from "sp14420-modal";

jest.mock("sp14420-modal", () => ({
  Modal: jest.fn(),
}));

describe("ContactForm", () => {
  let modalInstance: { show: jest.Mock };

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="message-alert"></div>
      <button id="sendmessage"></button>
      <div id="sendmessage-loading"></div>
      <input id="name" />
      <input id="email" />
      <textarea id="message"></textarea>
      <button id="contactCancel" data-bs-dismiss="modal"></button>
      <div class="modal fade" id="success"></div>
    `;

    modalInstance = { show: jest.fn() };
    (Modal as jest.Mock).mockImplementation(() => modalInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error if serverScript is not specified", () => {
    expect(() => {
      new (ContactForm as any)();
    }).toThrow("serverScript endpoint is required");
  });

  it("initializes serverScript, tokenInputName, onSuccess, messages, and selectors", () => {
    const mockCallback = jest.fn();

    const customMessages = {
      invalidEmail: "Invalid!",
      emptyMessage: "Empty!",
      serverError: "Server!",
      unexpectedError: "Oops!",
    };

    const customSelectors = {
      nameInput: "#my-name",
      emailInput: "#my-email",
      messageInput: "#my-message",
      sendButton: "#my-send",
      loadingElement: "#my-loading",
      messageAlert: "#my-alert",
      cancelButton: "#my-cancel",
      successModal: "#my-modal",
    };

    const form = new ContactForm(
      "/submit-url",
      "token-field",
      mockCallback,
      customMessages,
      customSelectors,
    );

    expect(form.serverScript).toBe("/submit-url");
    expect(form.tokenInputName).toBe("token-field");
    expect(form.onSuccess).toBe(mockCallback);
    expect(form.messages).toMatchObject(customMessages);
    expect(form.selectors).toMatchObject(customSelectors);
  });

  it("instantiates Modal with the correct selector", () => {
    const customSelectors = {
      successModal: "#custom-modal",
    };

    new ContactForm("/submit", null, null, {}, customSelectors);

    expect(Modal).toHaveBeenCalledWith("#custom-modal");
  });

  it("queries DOM elements and sets isSending to false", () => {
    const form = new ContactForm("/submit");

    expect(form.messageAlert?.id).toBe("message-alert");
    expect(form.sendButton?.id).toBe("sendmessage");
    expect(form.loadingElement?.id).toBe("sendmessage-loading");

    const internal = form as any;
    expect(internal.isSending).toBe(false);
  });

  it("calls initializeEventListeners in the constructor", () => {
    const spy = jest.spyOn(
      ContactForm.prototype as any,
      "initializeEventListeners",
    );

    new ContactForm("/submit");

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it("validateInput returns messages.invalidEmail for an invalid email", () => {
    const form = new ContactForm("/submit");
    const result = (form as any).validateInput("not-an-email", "hello");
    expect(result).toBe(form.messages.invalidEmail);
  });

  it("validateInput returns messages.emptyMessage for empty message", () => {
    const form = new ContactForm("/submit");
    const result = (form as any).validateInput("test@example.com", "");
    expect(result).toBe(form.messages.emptyMessage);
  });

  it("validateInput returns null when both email and message are valid", () => {
    const form = new ContactForm("/submit");
    const result = (form as any).validateInput(
      "user@example.com",
      "Hello world",
    );
    expect(result).toBeNull();
  });

  it("isEmail accepts well-formed emails and rejects invalid or overly long strings", () => {
    const form = new ContactForm("/submit");
    const isEmail = (form as any).isEmail as (email: string) => boolean;

    // Valid emails
    expect(isEmail("test@example.com")).toBe(true);
    expect(isEmail("user.name+tag@sub.domain.co")).toBe(true);

    // Invalid email formats
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("missing@domain")).toBe(false);
    expect(isEmail("missing-domain.com")).toBe(false);
    expect(isEmail("@no-local-part.com")).toBe(false);

    // Overly long emails
    const longEmail = "a".repeat(245) + "@example.com";
    expect(isEmail(longEmail)).toBe(false);
  });

  it("logs an error if the email or message elements are missing", () => {
    document.body.innerHTML = `
    <input id="name" />
    <div id="message-alert"></div>
    <button id="sendmessage"></button>
    <div id="sendmessage-loading"></div>
  `;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const form = new ContactForm("/submit");
    form.handleSubmit();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Email or message element not found",
    );

    consoleErrorSpy.mockRestore();
  });

  it("calls displayAlert with the validation error if inputs are invalid", () => {
    const form = new ContactForm("/submit");

    (document.querySelector("#email") as HTMLInputElement).value =
      "invalid-email";
    (document.querySelector("#message") as HTMLTextAreaElement).value = "hi";

    const spy = jest.spyOn(form, "displayAlert");

    form.handleSubmit();

    expect(spy).toHaveBeenCalledWith(form.messages.invalidEmail);
  });

  it("calls sendMessage with ContactFormData containing name, email, message, and token fields", () => {
    document.body.innerHTML = `
    <input id="email" value="user@example.com" />
    <textarea id="message">Hello</textarea>
    <input id="name" value="John Doe" />
    <input name="cf-turnstile-response" value="turnstile123" />
    <input name="my-token-field" value="token456" />
    <div id="message-alert"></div>
    <button id="sendmessage"></button>
    <div id="sendmessage-loading"></div>
    <div id="success"></div>
    <button id="contactCancel"></button>
  `;

    const form = new ContactForm("/submit", "my-token-field");
    const spy = jest
      .spyOn(form as any, "sendMessage")
      .mockResolvedValue(undefined);

    form.handleSubmit();

    expect(spy).toHaveBeenCalledWith({
      name: "John Doe",
      email: "user@example.com",
      message: "Hello",
      turnstileToken: "turnstile123",
      tokenInputToken: "token456",
    });
  });

  it("inserts the message into messageAlert.innerHTML and makes it visible", () => {
    const form = new ContactForm("/submit");

    form.displayAlert("Test message");

    expect(form.messageAlert?.innerHTML).toBe("Test message");
    expect(form.messageAlert?.style.display).toBe("block");
  });

  it("clears the values of the name, email, and message inputs", () => {
    (document.getElementById("name") as HTMLInputElement).value = "Alice";
    (document.getElementById("email") as HTMLInputElement).value =
      "alice@example.com";
    (document.getElementById("message") as HTMLTextAreaElement).value = "Hello";

    const form = new ContactForm("/submit");

    // Calling private method for test
    form["messageSuccess"]();

    expect((document.getElementById("name") as HTMLInputElement).value).toBe(
      "",
    );
    expect((document.getElementById("email") as HTMLInputElement).value).toBe(
      "",
    );
    expect(
      (document.getElementById("message") as HTMLTextAreaElement).value,
    ).toBe("");
  });

  it("triggers a click on the cancel button", () => {
    const cancelButton = document.getElementById(
      "contactCancel",
    ) as HTMLButtonElement;
    const clickSpy = jest.spyOn(cancelButton, "click");

    const form = new ContactForm("/submit");

    form["messageSuccess"]();

    expect(clickSpy).toHaveBeenCalled();
  });

  it("calls successModal.show() and the onSuccess callback with the response", () => {
    const mockCallback = jest.fn();
    const form = new ContactForm("/submit", null, mockCallback);

    const modalSpy = jest.fn();
    form.successModal = { show: modalSpy } as any;

    const responseData = { status: "success", message: "done" };

    form["messageSuccess"](responseData);

    expect(modalSpy).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(responseData);
  });

  it("properly toggles isSending and updates visibility of sendButton and loadingElement", () => {
    const form = new ContactForm("/submit");

    const sendButton = form.sendButton as HTMLElement;
    const loadingElement = form.loadingElement as HTMLElement;

    sendButton.style.display = "block";
    loadingElement.style.display = "none";

    form["setSending"](true);

    expect((form as any).isSending).toBe(true);
    expect(sendButton.style.display).toBe("none");
    expect(loadingElement.style.display).toBe("block");

    form["setSending"](false);

    expect((form as any).isSending).toBe(false);
    expect(sendButton.style.display).toBe("block");
    expect(loadingElement.style.display).toBe("none");
  });

  it("does nothing when isSending is already true", async () => {
    const form = new ContactForm("/submit");

    (form as any).isSending = true;

    globalThis.fetch = jest.fn();
    const successSpy = jest.spyOn(form as any, "messageSuccess");
    const alertSpy = jest.spyOn(form, "displayAlert");

    await (form as any).sendMessage({
      name: "x",
      email: "x@x.com",
      message: "hi",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("sends a POST request using fetch with the correct serverScript endpoint and form data", async () => {
    const form = new ContactForm("/submit-endpoint");

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "success" }),
    });

    globalThis.fetch = fetchMock;

    const data = {
      name: "Alice",
      email: "alice@example.com",
      message: "Hi there!",
      turnstileToken: "turn123",
      tokenInputToken: "tok456",
    };

    await (form as any).sendMessage(data);

    expect(fetchMock).toHaveBeenCalledWith(
      "/submit-endpoint",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );

    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    const entries = Array.from(formData.entries());

    expect(entries).toEqual(
      expect.arrayContaining([
        ["name", "Alice"],
        ["email", "alice@example.com"],
        ["message", "Hi there!"],
        ["turnstileToken", "turn123"],
        ["tokenInputToken", "tok456"],
      ]),
    );
  });

  it("calls displayAlert when response is not OK", async () => {
    const form = new ContactForm("/submit");
    const alertSpy = jest.spyOn(form, "displayAlert");

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ status: "error", message: "Bad Request" }),
    });

    await (form as any).sendMessage({
      name: "",
      email: "",
      message: "",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(alertSpy).toHaveBeenCalledWith("Bad Request");
  });

  it("calls displayAlert when response is OK but status is not 'success'", async () => {
    const form = new ContactForm("/submit");
    const alertSpy = jest.spyOn(form, "displayAlert");

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ status: "fail", message: "Something went wrong" }),
    });

    await (form as any).sendMessage({
      name: "",
      email: "",
      message: "",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(alertSpy).toHaveBeenCalledWith("Something went wrong");
  });

  it("calls messageSuccess with response data on success", async () => {
    const form = new ContactForm("/submit");

    const responseData = { status: "success", message: "OK" };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseData),
    });

    const successSpy = jest.spyOn(form as any, "messageSuccess");

    await (form as any).sendMessage({
      name: "x",
      email: "x@x.com",
      message: "hi",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(successSpy).toHaveBeenCalledWith(responseData);
  });

  it("handles network or fetch errors by calling displayAlert with messages.unexpectedError", async () => {
    const form = new ContactForm("/submit");
    const alertSpy = jest.spyOn(form, "displayAlert");

    globalThis.fetch = jest.fn().mockRejectedValue(new Error("Network fail"));

    await (form as any).sendMessage({
      name: "x",
      email: "x@x.com",
      message: "hello",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(alertSpy).toHaveBeenCalledWith(form.messages.unexpectedError);
  });

  it("resets isSending to false after completion", async () => {
    const form = new ContactForm("/submit");

    const setSendingSpy = jest.spyOn(form as any, "setSending");

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "success" }),
    });

    await (form as any).sendMessage({
      name: "x",
      email: "x@x.com",
      message: "hi",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(setSendingSpy).toHaveBeenLastCalledWith(false);
  });
});
