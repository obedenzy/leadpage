import './style.css'

const formTitle = document.getElementById('formTitle');
const form = document.getElementById('leadForm');
const messageDiv = document.getElementById('message');
const responseDisplay = document.getElementById('responseDisplay'); // Get response display div
const responseContent = document.getElementById('responseContent');
const calWidget = document.getElementById('my-cal-inline'); // Get Cal.com widget div
const webhookUrl = 'https://n8n.leadluxedigital.com/webhook-test/lead-form';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageDiv.textContent = 'Submitting...';
  messageDiv.style.color = '#666';
  messageDiv.style.display = 'block'; // Ensure message is visible during submission
  responseDisplay.style.display = 'block'; // Ensure response area is visible initially or on error
  responseContent.textContent = '';
  calWidget.style.display = 'none'; // Ensure Cal.com widget is hidden initially or on error

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  let phone = phoneInput.value.trim(); // Get phone value

  // Prepend "+1" if phone number is provided
  if (phone) {
    phone = `+1${phone}`;
  }

  // Basic validation: ensure name and email are present
  if (name && email) {
    const leadData = {
      name: name,
      email: email,
      phone: phone, // Use the potentially modified phone number
    };

    let responseTextToDisplay = '';

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      try {
        const responseBodyText = await response.text();
        console.log('Raw Webhook Response Text:', responseBodyText);
        responseTextToDisplay = responseBodyText;

      } catch (textError) {
        console.error('Error reading response body as text:', textError);
        responseTextToDisplay = 'Could not read response body.';
      }

      if (response.ok) {
        console.log('Lead Submitted:', leadData);
        // Hide form elements and show Cal.com widget
        formTitle.style.display = 'none';
        form.style.display = 'none';
        messageDiv.style.display = 'none';
        responseDisplay.style.display = 'none';
        calWidget.style.display = 'block'; // Show Cal.com widget

        form.reset(); // Reset form fields (good practice)

      } else {
        console.error('Webhook submission failed:', response.status, response.statusText);
        responseTextToDisplay = `Submission failed: ${response.status} ${response.statusText}\n\n${responseTextToDisplay}`;
        messageDiv.textContent = `Submission failed: ${response.statusText} (${response.status})`;
        messageDiv.style.color = 'red';
        responseContent.textContent = responseTextToDisplay; // Show error response
        // Ensure form is visible on failure
        formTitle.style.display = 'block';
        form.style.display = 'block';
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      messageDiv.textContent = 'Submission error. Please try again later.';
      messageDiv.style.color = 'red';
      responseTextToDisplay = `Network Error: ${error.message}`;
      responseContent.textContent = responseTextToDisplay; // Show network error
      // Ensure form is visible on error
      formTitle.style.display = 'block';
      form.style.display = 'block';
    }

  } else {
    messageDiv.textContent = 'Please fill out both Name and Email fields.';
    messageDiv.style.color = 'red';
    responseContent.textContent = '';
    // Ensure form is visible on validation error
    formTitle.style.display = 'block';
    form.style.display = 'block';
  }
});
