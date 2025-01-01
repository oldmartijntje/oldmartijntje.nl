import { useEffect } from "react";

export function useKonamiDebug() {
    const konamiCode: string[] = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a",
    ];
    const importCode: string[] = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "a",
        "b",
    ];

    let konamiIndex = 0;
    let importIndex = 0;

    function exportLocalStorage() {
        const localStorageData: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                localStorageData[key] = localStorage.getItem(key);
            }
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorageData, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "localStorageExport.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    }

    function importLocalStorage(file: File) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                console.log("Exporting current localStorage to console before import:", { ...localStorage });
                localStorage.clear();
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        localStorage.setItem(key, data[key]);
                    }
                }
                alert("LocalStorage import successful!");
            } catch (e) {
                alert("Failed to import localStorage: " + (e as Error).message);
            }
        };
        reader.readAsText(file);
    }

    function triggerFileInput() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.addEventListener("change", (event) => {
            const file = (event.target as HTMLInputElement)?.files?.[0];
            if (file) {
                importLocalStorage(file);
            }
        });
        fileInput.click();
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    exportLocalStorage();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }

            if (event.key === importCode[importIndex]) {
                importIndex++;
                if (importIndex === importCode.length) {
                    triggerFileInput();
                    importIndex = 0;
                }
            } else {
                importIndex = 0;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
}
