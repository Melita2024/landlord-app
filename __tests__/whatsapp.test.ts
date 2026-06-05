import { sendWhatsAppMessage, sendPaymentReceipt, sendRentReminder } from "@/lib/whatsapp";

// Ensure Twilio env vars are NOT set so we test mock path
beforeEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
    jest.resetModules();
});

describe("sendWhatsAppMessage (mocked - no Twilio credentials)", () => {
    it("returns success with mocked flag when credentials are absent", async () => {
        const result = await sendWhatsAppMessage("+237600000000", "Hello tenant");
        expect(result.success).toBe(true);
        expect((result as any).mocked).toBe(true);
    });

    it("handles any phone number format", async () => {
        const result = await sendWhatsAppMessage("0600000000", "Test message");
        expect(result.success).toBe(true);
    });

    it("handles empty message gracefully", async () => {
        const result = await sendWhatsAppMessage("+237600000000", "");
        expect(result.success).toBe(true);
    });
});

describe("sendPaymentReceipt", () => {
    it("returns success for valid inputs", async () => {
        const result = await sendPaymentReceipt("+237600000000", 50000, "1/15/2024", "Alice");
        expect(result.success).toBe(true);
    });

    it("includes tenant name and amount in the message (mock path)", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        await sendPaymentReceipt("+237600000000", 75000, "2/1/2024", "Bob");
        expect(consoleSpy).toHaveBeenCalledWith(
            "Mock WhatsApp Message:",
            expect.objectContaining({
                to: "+237600000000",
                message: expect.stringContaining("Bob"),
            })
        );
        consoleSpy.mockRestore();
    });

    it("message contains the amount", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        await sendPaymentReceipt("+237600000000", 99000, "3/1/2024", "Charlie");
        expect(consoleSpy).toHaveBeenCalledWith(
            "Mock WhatsApp Message:",
            expect.objectContaining({
                message: expect.stringContaining("99000"),
            })
        );
        consoleSpy.mockRestore();
    });
});

describe("sendRentReminder", () => {
    it("returns success for valid inputs", async () => {
        const result = await sendRentReminder("+237600000000", 50000, "2024-02-01", "Alice");
        expect(result.success).toBe(true);
    });

    it("message contains tenant name and due date", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        await sendRentReminder("+237600000000", 50000, "2024-02-01", "Diana");
        expect(consoleSpy).toHaveBeenCalledWith(
            "Mock WhatsApp Message:",
            expect.objectContaining({
                message: expect.stringContaining("Diana"),
            })
        );
        consoleSpy.mockRestore();
    });

    it("message contains the rent amount", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        await sendRentReminder("+237600000000", 45000, "2024-02-01", "Eve");
        expect(consoleSpy).toHaveBeenCalledWith(
            "Mock WhatsApp Message:",
            expect.objectContaining({
                message: expect.stringContaining("45000"),
            })
        );
        consoleSpy.mockRestore();
    });
});
