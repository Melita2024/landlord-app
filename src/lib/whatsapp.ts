import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendWhatsAppMessage(to: string, message: string) {
    if (!client) {
        console.log("Mock WhatsApp Message:", { to, message });
        return { success: true, mocked: true };
    }

    try {
        const response = await client.messages.create({
            body: message,
            from: `whatsapp:${fromPhoneNumber}`,
            to: `whatsapp:${to}`,
        });
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error("WhatsApp Error:", error);
        return { success: false, error };
    }
}

export async function sendPaymentReceipt(to: string, amount: number, date: string, tenantName: string) {
    const message = `Hello ${tenantName}, we have received your payment of ${amount} FCFA on ${date}. Thank you!`;
    return sendWhatsAppMessage(to, message);
}

export async function sendRentReminder(to: string, amount: number, dueDate: string, tenantName: string) {
    const message = `Hello ${tenantName}, this is a reminder that your rent of ${amount} FCFA is due on ${dueDate}. Please ensure timely payment.`;
    return sendWhatsAppMessage(to, message);
}
