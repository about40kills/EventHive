const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Email header template with logo and event image
const getEmailHeader = (eventImage = null) => {
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 0; text-align: center; margin-bottom: 30px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- EventHive Logo -->
        <div style="margin-bottom: 20px;">
          <img src="https://cdn-icons-png.flaticon.com/128/3239/3239948.png" 
               alt="EventHive" 
               style="height: 60px; width: auto;">
          <h1 style="
            color: white; 
            font-size: 36px; 
            font-weight: bold; 
            margin: 0; 
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            letter-spacing: -1px;
          ">EventHive</h1>
        </div>
        
        ${
          eventImage
            ? `
          <!-- Event Image -->
          <div style="border-radius: 12px; overflow: hidden; margin: 20px auto; max-width: 400px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
            <img src="${eventImage}" 
                 alt="Event Image" 
                 style="width: 100%; height: 200px; object-fit: cover; display: block;">
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
};

// Send registration confirmation email
const sendRegistrationConfirmation = async (userEmail, eventDetails) => {
  try {
    const result = await resend.emails.send({
      from: "EventHive <noreply@eventhive.xyz>",
      to: userEmail,
      subject: `Registration Confirmed - ${eventDetails.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getEmailHeader(eventDetails.image)}
          
          <div style="padding: 0 30px;">
            <h2 style="color: #333; font-size: 28px; margin-bottom: 10px;">Registration Confirmed! 🎉</h2>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">Thank you for registering for <strong>${
              eventDetails.title
            }</strong></p>
            
            <div style="background-color: #f8f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333; font-size: 20px;">Event Details:</h3>
              <div style="line-height: 1.8;">
                <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${new Date(
                  eventDetails.date
                ).toLocaleDateString()}</p>
                <p style="margin: 8px 0;"><strong>🕒 Time:</strong> ${
                  eventDetails.time ||
                  new Date(eventDetails.date).toLocaleTimeString()
                }</p>
                <p style="margin: 8px 0;"><strong>📍 Location:</strong> ${
                  eventDetails.location
                }</p>
                ${
                  eventDetails.description
                    ? `<p style="margin: 8px 0;"><strong>📝 Description:</strong> ${eventDetails.description}</p>`
                    : ""
                }
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; color: #333;">We look forward to seeing you at the event!</p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center;">
              <p style="color: #888; font-size: 14px;">
                Best regards,<br>
                <strong>The EventHive Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(
      "Registration confirmation email sent successfully:",
      result.id
    );
    return result;
  } catch (error) {
    console.error("Error sending registration confirmation email:", error);
    throw error;
  }
};

// Send event reminder email
const sendEventReminder = async (userEmail, eventDetails) => {
  try {
    const result = await resend.emails.send({
      from: "EventHive <noreply@eventhive.xyz>",
      to: userEmail,
      subject: `Reminder: ${eventDetails.title} Tomorrow`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getEmailHeader(eventDetails.image)}
          
          <div style="padding: 0 30px;">
            <h2 style="color: #333; font-size: 28px; margin-bottom: 10px;">Event Reminder ⏰</h2>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">This is a friendly reminder that you have an event tomorrow!</p>
            
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); padding: 25px; border-radius: 12px; margin: 25px 0; color: white; text-align: center;">
              <h3 style="margin-top: 0; font-size: 22px;">${
                eventDetails.title
              }</h3>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 5px 0;"><strong>📅 ${new Date(
                  eventDetails.date
                ).toLocaleDateString()}</strong></p>
                <p style="margin: 5px 0;"><strong>🕒 ${
                  eventDetails.time ||
                  new Date(eventDetails.date).toLocaleTimeString()
                }</strong></p>
                <p style="margin: 5px 0;"><strong>📍 ${
                  eventDetails.location
                }</strong></p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; color: #333;">Don't forget to attend! We're excited to see you there. 🎊</p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center;">
              <p style="color: #888; font-size: 14px;">
                Best regards,<br>
                <strong>The EventHive Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Event reminder email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending event reminder email:", error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  try {
    const result = await resend.emails.send({
      from: "EventHive <noreply@eventhive.xyz>",
      to: userEmail,
      subject: "EventHive Password Reset Request",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getEmailHeader()}
          
          <div style="padding: 0 30px;">
            <h2 style="color: #333; font-size: 28px; margin-bottom: 10px;">Password Reset Request 🔐</h2>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">You requested a password reset for your EventHive account.</p>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <p style="margin-bottom: 25px; font-size: 16px; color: #333;">Click the button below to reset your password:</p>
              <a href="${resetURL}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                Reset Password
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">⚠️ Important:</p>
              <ul style="margin: 10px 0; color: #856404; line-height: 1.6;">
                <li>This link will expire in 24 hours</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, do not share this link with anyone</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 14px; background: #f8f9ff; padding: 10px; border-radius: 6px;">${resetURL}</p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center;">
              <p style="color: #888; font-size: 14px;">
                Best regards,<br>
                <strong>The EventHive Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", result.id);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Generic email sender (for flexibility)
const sendEmail = async ({ email, subject, message }) => {
  try {
    const result = await resend.emails.send({
      from: "EventHive <noreply@eventhive.xyz>",
      to: email,
      subject: subject,
      html: message,
    });

    console.log("Email sent successfully:", result.id);
    return result;
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendRegistrationConfirmation,
  sendEventReminder,
  sendPasswordResetEmail,
  sendEmail,
};
