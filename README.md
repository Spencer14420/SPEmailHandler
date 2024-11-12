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

Alert for Displaying Errors
```html
<div class="modal fade" id="success" tabindex="-1" aria-labelledby="successLabel" aria-hidden="true">
    Success Message
</div>
```
