import "bootstrap";
import { Modal } from "bootstrap";
export declare class ContactForm {
    serverScript: string;
    tokenInputName: string | null;
    successModal: Modal | null;
    messageAlert: HTMLElement | null;
    constructor(serverScript: string, tokenInputName?: string | null);
    initializeEventListeners(): void;
    isEmail(email: string): boolean;
    messageSuccess(): void;
    sendMessage(data: Record<string, string>): Promise<void>;
    handleSubmit(): void;
    displayAlert(message: string): void;
}
