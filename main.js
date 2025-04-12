// Ensure CSS is imported if needed (Vite handles this)
// import './style.css'; // Assuming you might have a style.css later

// --- DOM Element Selection ---
const formTitle = document.getElementById('formTitle');
const form = document.getElementById('leadForm'); // Ensure this ID matches the <form> tag
const messageDiv = document.getElementById('message');
const responseDisplay = document.getElementById('responseDisplay');
const responseContent = document.getElementById('responseContent');
const calWidget = document.getElementById('my-cal-inline');
const nameInput = document.getElementById('name'); // Ensure this ID matches the name input
const emailInput = document.getElementById('email'); // Ensure this ID matches the email input
const phoneInput = document.getElementById('phone'); // Ensure this ID matches the phone input

// --- Configuration ---
const webhookUrl = 'https://n8n.leadluxedigital.com/webhook-test/lead-form';

// --- Utility Functions ---
function showMessage(text, color = '#666') {
  if (messageDiv) {
    messageDiv.textContent = text;
    messageDiv.style.color = color;
    messageDiv.style.display = 'block';
  } else {
    console.warn('Message div not found');
  }
}

function showResponse(text) {
  if (responseDisplay && responseContent) {
    responseContent.textContent = text;
    responseDisplay.style.display = 'block';
  } else {
    console.warn('Response display elements not found');
  }
}

function hideResponse() {
  if (responseDisplay) {
    responseDisplay.style.display = 'none';
  }
   if (responseContent) {
    responseContent.textContent = '';
  }
}

function showForm() {
  if (formTitle) formTitle.style.display = 'block';
  if (form) form.style.display = 'block';
  if (calWidget) calWidget.style.display = 'none'; // Hide Cal widget when showing form
}

function showCalWidget() {
  if (formTitle) formTitle.style.display = 'none';
  if (form) form.style.display = 'none';
  if (messageDiv) messageDiv.style.display = 'none'; // Hide status message
  hideResponse(); // Hide any previous response/error
  if (calWidget) {
     calWidget.style.display = 'block';
     // Potentially initialize or load Cal.com content here if needed
     console.log("Attempting to show Cal.com widget area.");
  } else {
    console.warn('Cal.com widget container not found');
  }
}

// --- Event Listener ---
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Form submission triggered.'); // DEBUG

    showMessage('Submitting...');
    hideResponse(); // Clear previous responses
    showForm(); // Ensure form is visible during submission attempt / potential failure

    // --- Input Validation ---
    if (!nameInput || !emailInput || !phoneInput) {
        console.error('Form input elements not found. Check IDs in HTML and JS.');
        showMessage('Internal error: Form fields missing.', 'red');
        return; // Stop execution if inputs aren't found
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    let phone = phoneInput.value.trim();

    // Basic validation
    if (!name || !email) {
      console.log('Validation failed: Name or Email missing.'); // DEBUG
      showMessage('Please fill out both Name and Email fields.', 'red');
      return; // Stop if validation fails
    }

    // Prepend "+1" if phone number is provided and doesn't already start with it
    if (phone && !phone.startsWith('+1')) {
      phone = `+1${phone.replace(/\D/g, '')}`; // Remove non-digits before prepending
      console.log('Formatted phone:', phone); // DEBUG
    } else if (phone) {
      phone = `+${phone.replace(/\D/g, '')}`; // Ensure only digits and '+' remain if it starts with '+'
      console.log('Formatted phone (already had +):', phone); // DEBUG
    }


    const leadData = {
      name: name,
      email: email,
      phone: phone, // Use the potentially modified phone number
    };

    console.log('Submitting lead data:', leadData); // DEBUG
    console.log('Target Webhook URL:', webhookUrl); // DEBUG

    // --- API Call ---
    try {
      console.log('Attempting fetch to webhook...'); // DEBUG
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add 'Accept' if the server specifically requires it, but usually not needed for sending JSON
          // 'Accept': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      console.log('Fetch response received. Status:', response.status); // DEBUG

      // Try reading response body regardless of status for debugging
      let responseBodyText = '';
      try {
        responseBodyText = await response.text();
        console.log('Raw Webhook Response Text:', responseBodyText); // DEBUG
      } catch (textError) {
        console.error('Error reading response body as text:', textError);
        responseBodyText = 'Could not read response body.';
      }

      if (response.ok) {
        console.log('Webhook submission successful.'); // DEBUG
        // Hide form elements and show Cal.com widget
        showCalWidget();
        if (form) form.reset(); // Reset form fields

      } else {
        console.error('Webhook submission failed:', response.status, response.statusText); // DEBUG
        const errorMsg = `Submission failed: ${response.statusText} (${response.status})`;
        showMessage(errorMsg, 'red');
        showResponse(`Server Response:\n${responseBodyText}`); // Show error response from server
        showForm(); // Ensure form remains visible on failure
      }

    } catch (error) {
      console.error('Network or fetch error submitting form:', error); // DEBUG
      showMessage('Submission error. Check console & network connection.', 'red');
      showResponse(`Network/Fetch Error:\n${error.message}`); // Show network error details
      showForm(); // Ensure form remains visible on error
    }
  });

  console.log('Form event listener attached successfully.'); // DEBUG

} else {
  console.error('Form element with ID "leadForm" not found. Submission will not work.');
}

// --- Initial Setup (Optional) ---
// Hide elements that should only appear after submission
if (messageDiv) messageDiv.style.display = 'none';
hideResponse();
if (calWidget) calWidget.style.display = 'none';
