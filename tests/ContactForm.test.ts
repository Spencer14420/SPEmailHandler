import { ContactForm, ContactFormData } from "../src/ContactForm";
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

  it("initializes DOM elements and modal", () => {
    const form = new ContactForm("/submit");
    expect(Modal).toHaveBeenCalledWith("#success");
    expect(form.messageAlert).not.toBeNull();
    expect(form.sendButton).not.toBeNull();
    expect(form.loadingElement).not.toBeNull();
  });

  interface TestableContactForm {
    sendMessage(data: ContactFormData): Promise<void>;
  }

  it("handleSubmit gathers inputs and sends message", () => {
    const form = new ContactForm("/submit");
    const testForm = form as unknown as TestableContactForm;
    const spy = jest
      .spyOn(testForm, "sendMessage")
      .mockResolvedValue(undefined);

    (document.querySelector("#email") as HTMLInputElement).value =
      "test@example.com";
    (document.querySelector("#message") as HTMLInputElement).value = "hello";
    (document.querySelector("#name") as HTMLInputElement).value = "name";

    form.handleSubmit();

    expect(spy).toHaveBeenCalledWith({
      name: "name",
      email: "test@example.com",
      message: "hello",
      turnstileToken: "",
      tokenInputToken: "",
    } as ContactFormData);
  });

  it("sendMessage shows success modal on success", async () => {
    const form = new ContactForm("/submit");

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "success" }),
    });

    const testForm = form as unknown as TestableContactForm;
    await testForm.sendMessage({
      name: "",
      email: "",
      message: "",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(modalInstance.show).toHaveBeenCalled();
  });

  it("sendMessage displays error message", async () => {
    const form = new ContactForm("/submit");
    const alertSpy = jest.spyOn(form, "displayAlert");

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ status: "error", message: "bad" }),
    });

    const testForm = form as unknown as TestableContactForm;
    await testForm.sendMessage({
      name: "",
      email: "",
      message: "",
      turnstileToken: "",
      tokenInputToken: "",
    });

    expect(alertSpy).toHaveBeenCalledWith("bad");
  });
});
