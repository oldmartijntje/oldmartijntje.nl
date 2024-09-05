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

    constructor(props: {}) {
        super(props);
        this.state = {
            lines: [],
            currentLine: '',
            cursorPosition: 0,
            cursorVisible: true
        };
        this.activeKeys = new Set();
        this.recentKeys = [];

        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        if (this.canvasRef.current) {
            this.ctx = this.canvasRef.current.getContext('2d');
            this.canvasRef.current.width = window.innerWidth;
            this.canvasRef.current.height = window.innerHeight;
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
            this.startCursorBlink();
            this.animationFrameId = requestAnimationFrame(this.updateCanvas);
        }
    }

    onEnter = (command: string) => {
        let { lines } = this.state;
        lines.push({ text: command, type: 'output' });
        this.setState({ lines });
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    startCursorBlink = () => {
        setInterval(() => {
            this.setState(prevState => ({ cursorVisible: !prevState.cursorVisible }));
        }, this.cursorBlinkInterval);
    }

    updateCanvas = () => {
        if (this.ctx && this.canvasRef.current) {
            const { width, height } = this.canvasRef.current;
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, width, height);

            this.ctx.font = `${this.fontSize}px monospace`;
            this.ctx.fillStyle = 'white';

            // Draw previous lines
            const startY = height - this.lineHeight * 2 - this.padding;
            this.state.lines.slice(-this.maxLines).forEach((line, index) => {
                const y = startY - (this.state.lines.length - index - 1) * this.lineHeight;
                this.ctx!.fillText((line.type == 'input' ? this.consoleLineStart : '') + line.text, this.padding, y);
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

    handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        this.activeKeys.delete(e.key);

    }

    handleKeyDown = (e: KeyboardEvent) => {
        let runProgram = null;
        e.preventDefault();
        let { currentLine, cursorPosition, lines } = this.state;

        this.activeKeys.add(e.key);
        this.recentKeys.push(e.key);

        switch (e.key) {
            case 'Enter':
                lines.push({ text: currentLine, type: 'input' });
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
                                console.log(text, currentLine);
                                this.setState({ currentLine, cursorPosition, lines });
                            });
                            return
                        case 's':
                            localStorage.setItem('console', JSON.stringify({ currentLine, cursorPosition, lines }));
                            break;
                        case 'r':
                            const savedData = JSON.parse(localStorage.getItem('console') || '{}');
                            currentLine = savedData.currentLine;
                            cursorPosition = savedData.cursorPosition;
                            lines = savedData.lines;
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
        this.setState({ currentLine, cursorPosition, lines });
        if (runProgram) {
            this.onEnter(runProgram);
        }
    }

    render() {
        return <>
            <canvas ref={this.canvasRef} style={{ display: 'block' }} />
        </>;
    }
}

export default ConsoleApp;