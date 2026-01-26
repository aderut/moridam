export type MenuCategory = "food" | "pastries" | "drinks" | "cakes" | "all";

export type MenuItem = {
    id: string;              // ✅ MUST be required
    title: string;
    description: string;
    price: number;
    category: "food" | "pastries" | "drinks" | "cakes";
    image?: string;
};
