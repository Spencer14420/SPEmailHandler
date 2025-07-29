import "bootstrap";
import { Modal } from "bootstrap";

export declare class ContactForm {
  serverScript: string;
  tokenInputName: string | null;
  successModal: Modal | null;
  messageAlert: HTMLElement | null;
  onSuccess: ((responseData: Record<string, unknown>) => void) | null;

  constructor(
    serverScript: string,
    tokenInputName?: string | null,
    onSuccess?: ((responseData: Record<string, unknown>) => void) | null,
  );

  handleSubmit(): void;
  displayAlert(message: string): void;
}
