import * as z from "zod";

export const paymentSchema = z.object({
    tenantId: z.string().min(1, "Tenant is required"),
    amount: z.number().min(0, "Amount must be a positive number"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    type: z.enum(["RENT", "WATER", "OTHER"]),
    method: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY"]),
    reference: z.string().optional(),
    status: z.enum(["COMPLETED", "PENDING", "FAILED"]),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
