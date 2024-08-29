import React, { useState } from 'react';

interface CopyToClipboardButtonProps {
    text: string;
    className?: string;
    displayText?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ text, className, displayText = "Copy to Clipboard" }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = text;

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset the "Copied" status after 2 seconds
            })
            .catch((err) => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div>
            <button onClick={handleCopy} className={className}>
                {copied ? "Copied!" : displayText}
            </button>
        </div>
    );
};

export default CopyToClipboardButton;
