import { paymentSchema } from "@/lib/validations/payment";
import { tenantSchema } from "@/lib/validations/tenant";

describe("paymentSchema", () => {
    const validPayload = {
        tenantId: "tenant-123",
        amount: 50000,
        date: "2024-01-15",
        type: "RENT" as const,
        method: "CASH" as const,
        status: "COMPLETED" as const,
    };

    it("accepts valid payment data", () => {
        const result = paymentSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("accepts optional reference field", () => {
        const result = paymentSchema.safeParse({ ...validPayload, reference: "REF-001" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.reference).toBe("REF-001");
    });

    it("rejects empty tenantId", () => {
        const result = paymentSchema.safeParse({ ...validPayload, tenantId: "" });
        expect(result.success).toBe(false);
    });

    it("rejects negative amount", () => {
        const result = paymentSchema.safeParse({ ...validPayload, amount: -1 });
        expect(result.success).toBe(false);
    });

    it("accepts zero amount", () => {
        const result = paymentSchema.safeParse({ ...validPayload, amount: 0 });
        expect(result.success).toBe(true);
    });

    it("rejects invalid date string", () => {
        const result = paymentSchema.safeParse({ ...validPayload, date: "not-a-date" });
        expect(result.success).toBe(false);
    });

    it("rejects invalid type", () => {
        const result = paymentSchema.safeParse({ ...validPayload, type: "INVALID" });
        expect(result.success).toBe(false);
    });

    it("accepts all valid types", () => {
        for (const type of ["RENT", "WATER", "OTHER"]) {
            const result = paymentSchema.safeParse({ ...validPayload, type });
            expect(result.success).toBe(true);
        }
    });

    it("rejects invalid method", () => {
        const result = paymentSchema.safeParse({ ...validPayload, method: "CREDIT_CARD" });
        expect(result.success).toBe(false);
    });

    it("accepts all valid methods", () => {
        for (const method of ["CASH", "BANK_TRANSFER", "MOBILE_MONEY"]) {
            const result = paymentSchema.safeParse({ ...validPayload, method });
            expect(result.success).toBe(true);
        }
    });

    it("rejects invalid status", () => {
        const result = paymentSchema.safeParse({ ...validPayload, status: "UNKNOWN" });
        expect(result.success).toBe(false);
    });

    it("accepts all valid statuses", () => {
        for (const status of ["COMPLETED", "PENDING", "FAILED"]) {
            const result = paymentSchema.safeParse({ ...validPayload, status });
            expect(result.success).toBe(true);
        }
    });
});

describe("tenantSchema", () => {
    const validPayload = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        propertyId: "prop-123",
        leaseStart: "2024-01-01",
        rentAmount: 75000,
    };

    it("accepts valid tenant data", () => {
        const result = tenantSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("accepts optional leaseEnd", () => {
        const result = tenantSchema.safeParse({ ...validPayload, leaseEnd: "2025-01-01" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.leaseEnd).toBe("2025-01-01");
    });

    it("rejects name shorter than 2 characters", () => {
        const result = tenantSchema.safeParse({ ...validPayload, name: "J" });
        expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
        const result = tenantSchema.safeParse({ ...validPayload, email: "not-an-email" });
        expect(result.success).toBe(false);
    });

    it("rejects phone shorter than 10 characters", () => {
        const result = tenantSchema.safeParse({ ...validPayload, phone: "12345" });
        expect(result.success).toBe(false);
    });

    it("rejects empty propertyId", () => {
        const result = tenantSchema.safeParse({ ...validPayload, propertyId: "" });
        expect(result.success).toBe(false);
    });

    it("rejects invalid leaseStart date", () => {
        const result = tenantSchema.safeParse({ ...validPayload, leaseStart: "bad-date" });
        expect(result.success).toBe(false);
    });

    it("rejects negative rentAmount", () => {
        const result = tenantSchema.safeParse({ ...validPayload, rentAmount: -500 });
        expect(result.success).toBe(false);
    });

    it("accepts zero rentAmount", () => {
        const result = tenantSchema.safeParse({ ...validPayload, rentAmount: 0 });
        expect(result.success).toBe(true);
    });
});
