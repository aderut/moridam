export type Category = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export type Product = {
    id: string;
    name: string;
    price: number;
    category: Category;
    image: string; // path from /public
    desc: string;
};

export const products: Product[] = [
    {
        id: "p1",
        name: "Avocado Toast",
        price: 3200,
        category: "Breakfast",
        image: "/images/ai/avocado-toast.png",
        desc: "Crispy toast, avocado, tomatoes, herbs.",
    },
    {
        id: "p2",
        name: "Grilled Chicken Salad",
        price: 6500,
        category: "Lunch",
        image: "/images/ai/chicken-salad.png",
        desc: "Fresh greens, grilled chicken, house dressing.",
    },
    {
        id: "p3",
        name: "Steak & Veg",
        price: 12000,
        category: "Dinner",
        image: "/images/ai/steak-veg.png",
        desc: "Juicy steak with seasonal vegetables.",
    },
    // SNACKS
    {
        id: "s1",
        name: "Chicken Pie",
        price: 1800,
        category: "Snacks",
        image: "/images/ai/chicken-pie.png",
        desc: "Buttery pastry with chicken filling.",
    },
    {
        id: "s2",
        name: "Meat Pie",
        price: 1500,
        category: "Snacks",
        image: "/images/ai/meat-pie.png",
        desc: "Classic meat pie, soft and tasty.",
    },
    {
        id: "s3",
        name: "Chin Chin",
        price: 1200,
        category: "Snacks",
        image: "/images/ai/chin-chin.png",
        desc: "Crunchy sweet snack pack.",
    },
];
