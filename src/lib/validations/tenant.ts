import * as z from "zod";

export const tenantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    propertyId: z.string().min(1, "Property is required"),
    leaseStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    leaseEnd: z.string().optional(),
    rentAmount: z.number().min(0, "Rent amount must be a positive number"),
});

export type TenantFormValues = z.infer<typeof tenantSchema>;
