"use client";

import { useEffect, useState } from "react";
import { getAllPachikus } from "@/utils/getPachiku";
import Pachiku from "../APachikuComponents/Pachiku/Pachiku";
import { useSession } from "next-auth/react";
import { PachikuWithDetails } from "@/types/pachiku";

export default function AllPachikus() {
    const { data: session } = useSession();
    const [allPachikus, setAllPachikus] = useState<PachikuWithDetails[]>([]);

    useEffect(() => {
        const fetchPachikus = async () => {
            const data = await getAllPachikus();
            setAllPachikus(data);
        };
        fetchPachikus();
    }, []);

    if (!session) {
        return <h2>Please sign in</h2>;
    }

    if (!allPachikus || allPachikus.length === 0) {
        return <h2>No Pachikus available</h2>;
    }

    return (
        <ul>
            {allPachikus.map((pachiku) => (
                <Pachiku
                    key={pachiku.id}
                    pachiku={pachiku}
                    currentUser={session.user}
                />
            ))}
        </ul>
    );
}
