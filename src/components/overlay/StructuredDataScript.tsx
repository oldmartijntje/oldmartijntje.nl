import { useEffect } from 'react';

interface StructuredDataScriptProps {
    id: string;
    data: unknown;
}

const StructuredDataScript: React.FC<StructuredDataScriptProps> = ({ id, data }) => {
    useEffect(() => {
        const scriptId = `structured-data-${id}`;
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);

        return () => {
            script.remove();
        };
    }, [id, data]);

    return null;
};

export default StructuredDataScript;
