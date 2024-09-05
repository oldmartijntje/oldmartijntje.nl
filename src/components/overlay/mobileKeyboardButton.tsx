import React, { useRef } from 'react';

const KeyboardOpener: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    const openKeyboard = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            // On some mobile browsers, we might need to scroll to the input
            inputRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            <button onClick={openKeyboard}>Open Keyboard</button>
            <input
                ref={inputRef}
                type="text"
                style={{ position: 'absolute', left: '-9999px' }}
                aria-hidden="true"
            />
        </div>
    );
};

export default KeyboardOpener;