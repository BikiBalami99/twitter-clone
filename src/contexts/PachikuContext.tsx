"use client";

import { PachikuWithDetails } from "@/types/pachiku";
import { getAllPachikus } from "@/utils/getPachiku";
import { createContext, useContext, useEffect, useState } from "react";

// Purpose: To provide the pachiku context to the feed and dynamically update its values.

// Context creation
type PachikuContextType = {
    allPachikus: PachikuWithDetails[];
    loading: boolean;
    refreshPachikuData: () => void;
};
const PachikuContext = createContext<PachikuContextType>({
    allPachikus: [],
    loading: false,
    refreshPachikuData: () => {},
});

// Context provider
export function PachikuProvider({ children }: { children: React.ReactNode }) {
    const [allPachikus, setAllPachikus] = useState<PachikuWithDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllPachikus();
            if (data === null || !data) {
                throw new Error("Failed loading Pachiku data.");
            }

            setAllPachikus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const refreshPachikuData = () => {
        loadData();
    };

    return (
        <PachikuContext.Provider
            value={{ allPachikus, loading, refreshPachikuData }}
        >
            {children}
        </PachikuContext.Provider>
    );
}

export function usePachikuContext() {
    const context = useContext(PachikuContext);
    if (context === undefined) {
        throw new Error(
            "usePachikuContext must be used within a PachikuProvider"
        );
    }

    return context;
}
