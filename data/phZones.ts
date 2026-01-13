export type PHZone = {
    id: string;
    name: string;
    fee: number;
    notes?: string;
};

export const PH_ZONES: PHZone[] = [
    { id: "rumuokwuta", name: "Rumuokwuta", fee: 700 },
    { id: "rumuevorlu", name: "Rumuevorlu", fee: 600 },
    { id: "gra", name: "GRA (PH)", fee: 1500 },
    { id: "woji", name: "Woji", fee: 1200 },
    { id: "rumuigbo", name: "Rumuigbo", fee: 900 },
    { id: "choba", name: "Choba", fee: 1500 },
    { id: "alakahia", name: "Alakahia", fee: 1400 },
    { id: "elioparanwo", name: "Elioparanwo", fee: 1400 },
    { id: "rumuola", name: "Rumuola", fee: 1100 },
    { id: "mile1", name: "Mile 1", fee: 1200 },
    { id: "mile3", name: "Mile 3", fee: 1300 },
    { id: "diobu", name: "Diobu", fee: 1300 },
];
