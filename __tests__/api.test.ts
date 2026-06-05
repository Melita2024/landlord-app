import { NextResponse } from "next/server";

// ── Mock next-auth ──────────────────────────────────────────────────────────
const mockGetServerSession = jest.fn();
jest.mock("next-auth", () => ({ getServerSession: (...a: any[]) => mockGetServerSession(...a) }));

// ── Mock prisma ─────────────────────────────────────────────────────────────
const mockPrisma = {
    property: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    tenant: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
    },
    payment: {
        findMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
    },
    invoice: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};
jest.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// ── Mock whatsapp ───────────────────────────────────────────────────────────
jest.mock("@/lib/whatsapp", () => ({
    sendPaymentReceipt: jest.fn().mockResolvedValue({ success: true }),
    sendRentReminder: jest.fn().mockResolvedValue({ success: true }),
}));

// ── Mock bcrypt ─────────────────────────────────────────────────────────────
jest.mock("bcrypt", () => ({
    hash: jest.fn().mockResolvedValue("hashed_password"),
    compare: jest.fn().mockResolvedValue(true),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────
const landlordSession = { user: { id: "user-1", role: "LANDLORD", email: "admin@test.com" } };
const tenantSession   = { user: { id: "user-2", role: "TENANT",   email: "tenant@test.com" } };

function makeRequest(body?: any, url = "http://localhost/api/test", method = "GET"): Request {
    return new Request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
}

beforeEach(() => {
    jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/properties", () => {
    const { GET } = require("@/app/api/properties/route");

    it("returns list of properties", async () => {
        const props = [{ id: "p1", name: "Apt A", address: "123 St", _count: { tenants: 2 } }];
        mockPrisma.property.findMany.mockResolvedValue(props);
        const res = await GET();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(props);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.findMany.mockRejectedValue(new Error("DB error"));
        const res = await GET();
        expect(res.status).toBe(500);
    });
});

describe("POST /api/properties", () => {
    const { POST } = require("@/app/api/properties/route");

    it("creates a property successfully", async () => {
        const body = { name: "Block B", address: "456 Ave", rentAmount: 50000 };
        const created = { id: "p2", ...body };
        mockPrisma.property.create.mockResolvedValue(created);
        const res = await POST(makeRequest(body, undefined, "POST"));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(created);
    });

    it("returns 400 when name is missing", async () => {
        const res = await POST(makeRequest({ address: "456 Ave" }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 400 when address is missing", async () => {
        const res = await POST(makeRequest({ name: "Block B" }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.create.mockRejectedValue(new Error("DB error"));
        const res = await POST(makeRequest({ name: "X", address: "Y" }, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});

describe("GET /api/properties/[id]", () => {
    const { GET } = require("@/app/api/properties/[id]/route");

    it("returns property when found", async () => {
        const prop = { id: "p1", name: "Apt A", _count: { tenants: 1 }, tenants: [] };
        mockPrisma.property.findUnique.mockResolvedValue(prop);
        const res = await GET(makeRequest(), { params: Promise.resolve({ id: "p1" }) });
        expect(res.status).toBe(200);
    });

    it("returns 404 when property not found", async () => {
        mockPrisma.property.findUnique.mockResolvedValue(null);
        const res = await GET(makeRequest(), { params: Promise.resolve({ id: "bad" }) });
        expect(res.status).toBe(404);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.findUnique.mockRejectedValue(new Error("DB"));
        const res = await GET(makeRequest(), { params: Promise.resolve({ id: "p1" }) });
        expect(res.status).toBe(500);
    });
});

describe("PATCH /api/properties/[id]", () => {
    const { PATCH } = require("@/app/api/properties/[id]/route");

    it("updates a property", async () => {
        const updated = { id: "p1", name: "New Name", address: "New Addr" };
        mockPrisma.property.update.mockResolvedValue(updated);
        const res = await PATCH(
            makeRequest({ name: "New Name", address: "New Addr" }, undefined, "PATCH"),
            { params: Promise.resolve({ id: "p1" }) }
        );
        expect(res.status).toBe(200);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.update.mockRejectedValue(new Error("DB"));
        const res = await PATCH(
            makeRequest({ name: "X" }, undefined, "PATCH"),
            { params: Promise.resolve({ id: "p1" }) }
        );
        expect(res.status).toBe(500);
    });
});

describe("DELETE /api/properties/[id]", () => {
    const { DELETE } = require("@/app/api/properties/[id]/route");

    it("deletes a property", async () => {
        mockPrisma.property.delete.mockResolvedValue({});
        const res = await DELETE(makeRequest(), { params: Promise.resolve({ id: "p1" }) });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true });
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.delete.mockRejectedValue(new Error("DB"));
        const res = await DELETE(makeRequest(), { params: Promise.resolve({ id: "p1" }) });
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// TENANTS
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/tenants", () => {
    const { GET } = require("@/app/api/tenants/route");

    it("returns list of tenants", async () => {
        const tenants = [{ id: "t1", name: "Alice", property: { name: "Apt A" } }];
        mockPrisma.tenant.findMany.mockResolvedValue(tenants);
        const res = await GET();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(tenants);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.tenant.findMany.mockRejectedValue(new Error("DB"));
        const res = await GET();
        expect(res.status).toBe(500);
    });
});

describe("POST /api/tenants", () => {
    const { POST } = require("@/app/api/tenants/route");

    const validBody = {
        name: "Alice Kamga",
        email: "alice@test.com",
        phone: "0600000000",
        propertyId: "p1",
        leaseStart: "2024-01-01",
        rentAmount: 50000,
    };

    it("creates a tenant when property exists", async () => {
        mockPrisma.property.findUnique.mockResolvedValue({ id: "p1" });
        const created = { id: "t1", ...validBody };
        mockPrisma.tenant.create.mockResolvedValue(created);
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("returns 400 when property not found", async () => {
        mockPrisma.property.findUnique.mockResolvedValue(null);
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Property not found");
    });

    it("returns 400 on invalid data", async () => {
        const res = await POST(makeRequest({ name: "X" }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.findUnique.mockResolvedValue({ id: "p1" });
        mockPrisma.tenant.create.mockRejectedValue(new Error("DB"));
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/payments", () => {
    const { GET } = require("@/app/api/payments/route");

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns payments when authenticated", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const payments = [{ id: "pay1", amount: 50000, tenant: { name: "Alice" } }];
        mockPrisma.payment.findMany.mockResolvedValue(payments);
        const res = await GET(makeRequest());
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(payments);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.payment.findMany.mockRejectedValue(new Error("DB"));
        const res = await GET(makeRequest());
        expect(res.status).toBe(500);
    });
});

describe("POST /api/payments", () => {
    const { POST } = require("@/app/api/payments/route");

    const validBody = {
        tenantId: "t1",
        amount: 50000,
        date: "2024-01-15",
        type: "RENT",
        method: "CASH",
        status: "COMPLETED",
    };

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(401);
    });

    it("creates payment and sends WhatsApp receipt", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const created = { id: "pay1", ...validBody };
        mockPrisma.payment.create.mockResolvedValue(created);
        mockPrisma.tenant.findUnique.mockResolvedValue({ id: "t1", name: "Alice", phone: "0600000000" });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("creates payment without WhatsApp when tenant has no phone", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.payment.create.mockResolvedValue({ id: "pay1", ...validBody });
        mockPrisma.tenant.findUnique.mockResolvedValue({ id: "t1", name: "Alice", phone: null });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("returns 400 on invalid data", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await POST(makeRequest({ amount: -1 }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.payment.create.mockRejectedValue(new Error("DB"));
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/dashboard", () => {
    const { GET } = require("@/app/api/dashboard/route");

    it("returns dashboard stats", async () => {
        mockPrisma.property.count.mockResolvedValue(5);
        mockPrisma.tenant.count
            .mockResolvedValueOnce(10)
            .mockResolvedValueOnce(8);
        mockPrisma.payment.findMany
            .mockResolvedValueOnce([{ amount: 50000 }, { amount: 25000 }])
            .mockResolvedValueOnce([
                { id: "p1", amount: 50000, status: "COMPLETED", tenant: { name: "Alice", email: "a@test.com" } },
            ]);
        const res = await GET();
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.totalRevenue).toBe(75000);
        expect(json.totalProperties).toBe(5);
        expect(json.totalTenants).toBe(10);
        expect(json.activeTenants).toBe(8);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.property.count.mockRejectedValue(new Error("DB"));
        const res = await GET();
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════════════════════
describe("POST /api/register", () => {
    const { POST } = require("@/app/api/register/route");

    const validBody = {
        name: "New User",
        email: "newuser@test.com",
        password: "password123",
        role: "LANDLORD",
    };

    it("registers a new landlord user", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({
            id: "u1", name: "New User", email: "newuser@test.com",
            password: "hashed_password", role: "LANDLORD", status: "APPROVED",
        });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(201);
        const json = await res.json();
        expect(json.password).toBeUndefined();
    });

    it("tenant registration sets status to PENDING", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({
            id: "u2", name: "Tenant User", email: "tenant2@test.com",
            password: "hashed_password", role: "TENANT", status: "PENDING",
        });
        const res = await POST(makeRequest({ ...validBody, email: "tenant2@test.com", role: "TENANT" }, undefined, "POST"));
        expect(res.status).toBe(201);
    });

    it("returns 409 when email already exists", async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "newuser@test.com" });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(409);
    });

    it("returns 400 on invalid data", async () => {
        const res = await POST(makeRequest({ name: "X", email: "bad" }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockRejectedValue(new Error("DB"));
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/approvals", () => {
    const { GET } = require("@/app/api/approvals/route");

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 for non-landlord role", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns pending tenants for landlord", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.findMany.mockResolvedValue([{ id: "u1", name: "Bob", email: "bob@test.com", phone: null }]);
        const res = await GET(makeRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json[0].id).toBe("u1");
        expect(json[0].name).toBe("Bob");
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.findMany.mockRejectedValue(new Error("DB"));
        const res = await GET(makeRequest());
        expect(res.status).toBe(500);
    });
});

describe("PATCH /api/approvals/[id]", () => {
    const { PATCH } = require("@/app/api/approvals/[id]/route");

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await PATCH(makeRequest({ status: "APPROVED" }, undefined, "PATCH"), { params: Promise.resolve({ id: "u1" }) });
        expect(res.status).toBe(401);
    });

    it("returns 401 for non-landlord", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        const res = await PATCH(makeRequest({ status: "APPROVED" }, undefined, "PATCH"), { params: Promise.resolve({ id: "u1" }) });
        expect(res.status).toBe(401);
    });

    it("approves a user", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.update.mockResolvedValue({ id: "u1", status: "APPROVED" });
        const res = await PATCH(makeRequest({ status: "APPROVED" }, undefined, "PATCH"), { params: Promise.resolve({ id: "u1" }) });
        expect(res.status).toBe(200);
    });

    it("rejects a user", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.update.mockResolvedValue({ id: "u1", status: "REJECTED" });
        const res = await PATCH(makeRequest({ status: "REJECTED" }, undefined, "PATCH"), { params: Promise.resolve({ id: "u1" }) });
        expect(res.status).toBe(200);
    });

    it("returns 400 for invalid status value", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await PATCH(makeRequest({ status: "MAYBE" }, undefined, "PATCH"), { params: Promise.resolve({ id: "u1" }) });
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.update.mockRejectedValue(new Error("DB"));
        const res = await PATCH(makeRequest({ status: "APPROVED" }, undefined, "PATCH"), { params: Promise.resolve({ id: "u1" }) });
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/invoices", () => {
    const { GET } = require("@/app/api/invoices/route");

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns invoices when authenticated", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.invoice.findMany.mockResolvedValue([{ id: "inv1", amount: 50000 }]);
        const res = await GET(makeRequest());
        expect(res.status).toBe(200);
    });

    it("filters invoices by type query param", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.invoice.findMany.mockResolvedValue([]);
        const res = await GET(makeRequest(undefined, "http://localhost/api/invoices?type=WATER"));
        expect(res.status).toBe(200);
        expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { type: "WATER" } })
        );
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.invoice.findMany.mockRejectedValue(new Error("DB"));
        const res = await GET(makeRequest());
        expect(res.status).toBe(500);
    });
});

describe("POST /api/invoices", () => {
    const { POST } = require("@/app/api/invoices/route");

    const validBody = {
        tenantId: "t1",
        amount: 50000,
        dueDate: "2024-02-01",
        type: "RENT",
        status: "PENDING",
    };

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(401);
    });

    it("creates an invoice", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.invoice.create.mockResolvedValue({ id: "inv1", ...validBody });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("returns 400 on invalid data", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await POST(makeRequest({ amount: -1 }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.invoice.create.mockRejectedValue(new Error("DB"));
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════
describe("PATCH /api/user/profile", () => {
    const { PATCH } = require("@/app/api/user/profile/route");

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await PATCH(makeRequest({ name: "Alice", email: "alice@test.com" }, undefined, "PATCH"));
        expect(res.status).toBe(401);
    });

    it("updates profile successfully", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "admin@test.com" });
        mockPrisma.user.update.mockResolvedValue({
            id: "user-1", name: "Updated", email: "admin@test.com", notificationsEnabled: true,
        });
        const res = await PATCH(makeRequest({ name: "Updated", email: "admin@test.com" }, undefined, "PATCH"));
        expect(res.status).toBe(200);
    });

    it("returns 400 when name is missing", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await PATCH(makeRequest({ email: "admin@test.com" }, undefined, "PATCH"));
        expect(res.status).toBe(400);
    });

    it("returns 409 when email is taken by another user", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user-999", email: "other@test.com" });
        const res = await PATCH(makeRequest({ name: "Alice", email: "other@test.com" }, undefined, "PATCH"));
        expect(res.status).toBe(409);
    });

    it("updates notificationsEnabled flag", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "admin@test.com" });
        mockPrisma.user.update.mockResolvedValue({
            id: "user-1", name: "Alice", email: "admin@test.com", notificationsEnabled: false,
        });
        const res = await PATCH(makeRequest({ name: "Alice", email: "admin@test.com", notificationsEnabled: false }, undefined, "PATCH"));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.notificationsEnabled).toBe(false);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "admin@test.com" });
        mockPrisma.user.update.mockRejectedValue(new Error("DB"));
        const res = await PATCH(makeRequest({ name: "Alice", email: "admin@test.com" }, undefined, "PATCH"));
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// TENANT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/tenant/dashboard", () => {
    const { GET } = require("@/app/api/tenant/dashboard/route");

    it("returns 401 for non-tenant", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 when unauthenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns tenant dashboard data", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({
            id: "t1",
            rentAmount: 50000,
            balance: 0,
            leaseStart: new Date("2024-01-01"),
            property: { name: "Apt A" },
            payments: [{ id: "p1", amount: 50000, status: "COMPLETED", createdAt: new Date() }],
        });
        const res = await GET(makeRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.propertyName).toBe("Apt A");
        expect(json.rentAmount).toBe(50000);
    });

    it("returns 404 when tenant profile not found", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(404);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockRejectedValue(new Error("DB"));
        const res = await GET(makeRequest());
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// TENANT PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/tenant/payments", () => {
    const { GET } = require("@/app/api/tenant/payments/route");

    it("returns 401 for non-tenant", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 404 when tenant not found", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue(null);
        const res = await GET(makeRequest());
        expect(res.status).toBe(404);
    });

    it("returns tenant payments", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: "t1" });
        mockPrisma.payment.findMany.mockResolvedValue([{ id: "p1", amount: 50000 }]);
        const res = await GET(makeRequest());
        expect(res.status).toBe(200);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: "t1" });
        mockPrisma.payment.findMany.mockRejectedValue(new Error("DB"));
        const res = await GET(makeRequest());
        expect(res.status).toBe(500);
    });
});

describe("POST /api/tenant/payments", () => {
    const { POST } = require("@/app/api/tenant/payments/route");

    const validBody = {
        amount: 50000,
        date: "2024-01-15",
        type: "RENT",
        method: "MOBILE_MONEY",
    };

    it("returns 401 for non-tenant", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(401);
    });

    it("returns 404 when tenant not found", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue(null);
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(404);
    });

    it("creates a payment for tenant", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: "t1", name: "Alice", phone: "0600000000" });
        mockPrisma.payment.create.mockResolvedValue({ id: "p1", ...validBody, tenantId: "t1", status: "COMPLETED" });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("creates payment when tenant has no phone (no WhatsApp)", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: "t1", name: "Alice", phone: null });
        mockPrisma.payment.create.mockResolvedValue({ id: "p1", ...validBody, tenantId: "t1", status: "COMPLETED" });
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("returns 400 on invalid data", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: "t1" });
        const res = await POST(makeRequest({ amount: -100 }, undefined, "POST"));
        expect(res.status).toBe(400);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: "t1", name: "Alice", phone: null });
        mockPrisma.payment.create.mockRejectedValue(new Error("DB"));
        const res = await POST(makeRequest(validBody, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SELECT PROPERTY
// ═══════════════════════════════════════════════════════════════════════════
describe("POST /api/select-property", () => {
    const { POST } = require("@/app/api/select-property/route");

    it("returns 401 for non-tenant", async () => {
        mockGetServerSession.mockResolvedValue(landlordSession);
        const res = await POST(makeRequest({ propertyId: "p1" }, undefined, "POST"));
        expect(res.status).toBe(401);
    });

    it("returns 404 when property not found", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.property.findUnique.mockResolvedValue(null);
        const res = await POST(makeRequest({ propertyId: "bad" }, undefined, "POST"));
        expect(res.status).toBe(404);
    });

    it("returns 404 when user not found", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.property.findUnique.mockResolvedValue({ id: "p1", name: "Apt A", rentAmount: 50000 });
        mockPrisma.user.findUnique.mockResolvedValue(null);
        const res = await POST(makeRequest({ propertyId: "p1" }, undefined, "POST"));
        expect(res.status).toBe(404);
    });

    it("creates tenant record when property and user exist", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.property.findUnique.mockResolvedValue({ id: "p1", name: "Apt A", rentAmount: 50000 });
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user-2", name: "Tenant", email: "tenant@test.com", phone: "0600000000" });
        mockPrisma.tenant.create.mockResolvedValue({ id: "t1", propertyId: "p1", userId: "user-2" });
        const res = await POST(makeRequest({ propertyId: "p1" }, undefined, "POST"));
        expect(res.status).toBe(200);
    });

    it("returns 500 on db error", async () => {
        mockGetServerSession.mockResolvedValue(tenantSession);
        mockPrisma.property.findUnique.mockResolvedValue({ id: "p1", rentAmount: 50000 });
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user-2", name: "T", email: "t@t.com", phone: "" });
        mockPrisma.tenant.create.mockRejectedValue(new Error("DB"));
        const res = await POST(makeRequest({ propertyId: "p1" }, undefined, "POST"));
        expect(res.status).toBe(500);
    });
});
