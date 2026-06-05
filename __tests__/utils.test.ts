import { cn } from "@/lib/utils";

describe("cn (classname utility)", () => {
    it("merges single class", () => {
        expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("merges multiple classes", () => {
        expect(cn("text-red-500", "bg-white")).toBe("text-red-500 bg-white");
    });

    it("handles conditional classes - falsy excluded", () => {
        expect(cn("base", false && "not-included")).toBe("base");
    });

    it("handles conditional classes - truthy included", () => {
        expect(cn("base", true && "included")).toBe("base included");
    });

    it("merges conflicting tailwind classes - last wins", () => {
        expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("handles undefined and null gracefully", () => {
        expect(cn("base", undefined, null as any)).toBe("base");
    });

    it("handles empty string", () => {
        expect(cn("")).toBe("");
    });

    it("returns empty string when no args", () => {
        expect(cn()).toBe("");
    });

    it("handles object syntax", () => {
        expect(cn({ "text-red-500": true, "bg-blue-500": false })).toBe("text-red-500");
    });

    it("handles array syntax", () => {
        expect(cn(["text-sm", "font-bold"])).toBe("text-sm font-bold");
    });

    it("deduplicates conflicting padding classes", () => {
        expect(cn("p-4", "p-2")).toBe("p-2");
    });
});
