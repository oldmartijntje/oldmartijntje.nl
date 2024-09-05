import React from 'react';

interface ConsoleLine {
    text: string;
    type: 'input' | 'output';
}

interface ConsoleState {
    lines: ConsoleLine[];
    currentLine: string;
    cursorPosition: number;
    cursorVisible: boolean;
    currentPath: string;
}

class ConsoleApp extends React.Component<{}, ConsoleState> {
    private canvasRef: React.RefObject<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D | null = null;
    private animationFrameId: number | null = null;

    // Console settings
    private readonly lineHeight = 20;
    private readonly padding = 10;
    private readonly fontSize = 16;
    private readonly cursorBlinkInterval = 500; // milliseconds
    private readonly maxLines = 100;
    private readonly consoleLineStart = '~$ ';
    activeKeys: Set<string>;
    recentKeys: string[];
    allowInput: boolean;

    constructor(props: {}) {
        super(props);
        this.state = {
            lines: [],
            currentLine: '',
            cursorPosition: 0,
            cursorVisible: true,
            currentPath: 'C:/desktop'
        };
        this.activeKeys = new Set();
        this.recentKeys = [];
        this.allowInput = true; // Changed to true for immediate input

        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        if (this.canvasRef.current) {
            this.ctx = this.canvasRef.current.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
            window.addEventListener('resize', this.handleResize); // Listen for window resize
            this.startCursorBlink();
            this.animationFrameId = requestAnimationFrame(() => this.updateCanvas());
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleResize); // Remove resize listener
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    handleResize = () => {
        this.resizeCanvas();
    };

    resizeCanvas = () => {
        if (this.canvasRef.current) {
            this.canvasRef.current.width = window.innerWidth;
            this.canvasRef.current.height = window.innerHeight;
        }
    };

    onEnter = (command: string) => {
        let { lines } = this.state;
        lines.push({ text: command, type: 'input' });
        lines.push({ text: `Command entered: ${command}`, type: 'output' });
        this.setState({ lines, currentLine: '' });
    }

    startCursorBlink = () => {
        setInterval(() => {
            this.setState(prevState => ({ cursorVisible: !prevState.cursorVisible }));
        }, this.cursorBlinkInterval);
    }

    updateCanvas = () => {
        if (this.ctx && this.canvasRef.current) {
            const { width, height } = this.canvasRef.current;

            // Clear the canvas
            this.ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
            this.ctx.fillRect(0, 0, width, height);

            // Apply CRT effect
            this.applyCRTEffect();

            this.ctx.font = `${this.fontSize}px monospace`;
            this.ctx.fillStyle = '#00ff00'; // Green text color

            // Draw previous lines
            const startY = height - this.lineHeight * 2 - this.padding;
            this.state.lines.slice(-this.maxLines).forEach((line, index) => {
                const y = startY - (this.state.lines.length - index - 1) * this.lineHeight;
                this.ctx!.fillText((line.type === 'input' ? this.consoleLineStart : '') + line.text, this.padding, y);
            });

            // Draw current line
            this.ctx.fillText(this.consoleLineStart + this.state.currentLine, this.padding, height - this.lineHeight - this.padding);

            // Draw cursor
            if (this.state.cursorVisible) {
                const cursorX = (this.state.cursorPosition + this.consoleLineStart.length) * (this.fontSize * 0.55) + this.padding + 2;
                const cursorY = height - this.lineHeight * 1.8 - this.padding + 2;
                this.ctx.fillRect(cursorX, cursorY, 2, this.fontSize);
            }
        }
        this.animationFrameId = requestAnimationFrame(this.updateCanvas);
    }

    applyCRTEffect = () => {
        if (this.ctx && this.canvasRef.current) {
            const { width, height } = this.canvasRef.current;

            // Add scanlines
            for (let y = 0; y < height; y += 4) {
                this.ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
                this.ctx.fillRect(0, y, width, 2);
            }

            // Add slight blur
            this.ctx.filter = 'blur(0.5px)';

            // Add vignette effect
            const gradient = this.ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            gradient.addColorStop(0, 'rgba(0, 30, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 30, 0, 0.4)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, width, height);

            // Reset filter
            this.ctx.filter = 'none';
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        this.activeKeys.delete(e.key);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (!this.allowInput) return;
        let runProgram = null;
        e.preventDefault();
        let { currentLine, cursorPosition, lines, currentPath } = this.state;

        this.activeKeys.add(e.key);
        this.recentKeys.push(e.key);

        switch (e.key) {
            case 'Enter':
                runProgram = currentLine;
                currentLine = '';
                cursorPosition = 0;
                break;
            case 'Backspace':
                if (cursorPosition > 0) {
                    currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
                    cursorPosition--;
                }
                break;
            case 'ArrowLeft':
                if (cursorPosition > 0) cursorPosition--;
                break;
            case 'ArrowRight':
                if (cursorPosition < currentLine.length) cursorPosition++;
                break;
            case 'Delete':
                if (cursorPosition < currentLine.length) {
                    currentLine = currentLine.slice(0, cursorPosition) + currentLine.slice(cursorPosition + 1);
                }
                break;
            default:
                if (this.activeKeys.has('Control')) {
                    switch (e.key) {
                        case 'c':
                            lines.push({ text: currentLine, type: 'input' });
                            navigator.clipboard.writeText(currentLine);
                            currentLine = '';
                            cursorPosition = 0;
                            break;
                        case 'v':
                            navigator.clipboard.readText().then(text => {
                                currentLine = currentLine.slice(0, cursorPosition) + text + currentLine.slice(cursorPosition);
                                cursorPosition += text.length;
                                this.setState({ currentLine, cursorPosition, lines });
                            });
                            return;
                        case 's':
                            localStorage.setItem('console', JSON.stringify({ currentLine, cursorPosition, lines, currentPath }));
                            break;
                        case 'r':
                            const savedData = JSON.parse(localStorage.getItem('console') || '{}');
                            currentLine = savedData.currentLine || '';
                            cursorPosition = savedData.cursorPosition || 0;
                            lines = savedData.lines || [];
                            currentPath = savedData.currentPath || 'C:/desktop';
                            break;
                        default:
                            break;
                    }
                } else {
                    if (e.key.length === 1) {
                        currentLine = currentLine.slice(0, cursorPosition) + e.key + currentLine.slice(cursorPosition);
                        cursorPosition++;
                    }
                }
        }

        this.setState({ currentLine, cursorPosition, lines, currentPath });
        if (runProgram) {
            this.onEnter(runProgram);
        }
    }

    render() {
        return (
            <div className="crt-container">
                <canvas ref={this.canvasRef} style={{ display: 'block' }} />
                <style>{`
                    .crt-container {
                        position: relative;
                        overflow: hidden;
                    }
                    .crt-container::before {
                        content: " ";
                        display: block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                        z-index: 2;
                        background-size: 100% 2px, 3px 100%;
                        pointer-events: none;
                    }
                `}</style>
            </div>
        );
    }
}

export default ConsoleApp;
