import React, { startTransition, useEffect, useState, useTransition } from "react";
import { heavyHandler } from "../../hooks/useHeavyHandler";

export function HeavyStatusRenderer() {
    const [progress, setProgress] = useState(0);
    const [value, setValue] = useState(0);
    const [isPending,progressTransition] = useTransition();

    async function runHeavySync() {
        setProgress(0);
        console.log("click");
        const total = 100_000_000_0;
        for (let i = 1; i <= total; i++) {
            // Try to update UI every 10 million items
            if (i % 10_000_000 === 0) {
                const percentage = (i / total) * 100;
                progressTransition(() => {

                    setProgress(percentage) // ⚠️ Never updates live!
                })
            }
        }
    }
    
    
    
    function onClick(e) {
        e.preventDefault();
        console.log("Clicked")
    }
    
    useEffect(() => {
            (async () => {
                runHeavySync();
            })();
    },[])

    return <div className="progress"   
    style={{
        padding:"50px 200px"
    }} 
    >
        <button
            onClick={onClick}
        >

            Click me
        </button>
       { !isPending && <div 
            className="progress-bar"
            style={
                {
                    backgroundColor: "blue",
                    width: `${progress}%`,
                    transition:"width ease-in 0.5s",
                    borderRadius:"45px",
                    marginTop:"20px"
                }
            }
        >
            {Math.round(progress).toFixed(0)}
        </div>}
    </div>


}