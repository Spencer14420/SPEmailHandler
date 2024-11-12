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
