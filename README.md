# SPEmailHandler - Contact Form Script

SPEmailHandler is a simple contact form handler that uses Bootstrap's modal for success feedback and manages form validation and submissions via JavaScript.

## Installation

To use this script, you’ll need:
- **Bootstrap** (for styling and modal functionality)
- **SPEmailHandler** (imported as a module)

Install SPEmailHandler from npm:
```bash
npm install spemailhandler
```

Then, in your JavaScript:

```javascript
import { ContactForm } from "spemailhandler";

const formHandler = new ContactForm("/path/to/your-server-script.php");
```

## HTML Structure

The following HTML structure is required for SPEmailHandler to function correctly. Be sure to use the correct id and class attributes as the script depends on these identifiers.

### Form Fields:

Name Input:
```html
<input type="text" id="name" placeholder="Your Name">
```

Email Input:
```html
<input type="email" id="email" placeholder="Your Email">
```

Message Input:
```html
<textarea id="message" placeholder="Your Message"></textarea>
```

Submit Button:
```html
<button id="sendmessage">Send Message</button>
```

Cancel Button (for modal)
```html
<button id="contactCancel" data-bs-dismiss="modal">Cancel</button>
```

### Alert and Modal

Alert for Displaying Errors
```html
<div id="message-alert" style="display: none;"></div>
```

Success Modal
```html
<div class="modal fade" id="success" tabindex="-1" aria-labelledby="successLabel" aria-hidden="true">
    Success Message
</div>
```

## How to Use

### Initialize the Contact Form

After including the necessary HTML elements and Bootstrap modal, initialize ContactForm by passing the URL of your server-side script that handles form submissions.

```javascript
const formHandler = new ContactForm("/path/to/your-server-script.php");
```

### Form Validation and Submission

- **Email Validation:** The script validates email format before submission.
- **SPEmailHandler:** Both the email and message fields must be filled out. If not, an alert displays prompting users to complete the fields.

### Error Handling
- If there is an issue with the server response, a default error message is displayed in #message-alert.
- You can customize the error message by modifying the server-side response.

## Server-Side Script Requirements

The server script should return a JSON response in the following format:

```json
{
  "status": "success", // or "error"
  "message": "Optional error message"
}

```

## Example

```html
<form id="contact-form">
    <input type="text" id="name" placeholder="Your Name">
    <input type="email" id="email" placeholder="Your Email">
    <textarea id="message" placeholder="Your Message"></textarea>
    <div id="message-alert" style="display: none;"></div>
    <button id="sendmessage">Send Message</button>
</form>

<div class="modal fade" id="success" tabindex="-1" aria-labelledby="successLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="successLabel">Success</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Your message has been sent successfully!
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
```
