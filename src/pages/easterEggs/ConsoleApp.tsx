import React from 'react';

interface ConsoleState {
    lines: string[];
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

    constructor(props: {}) {
        super(props);
        this.state = {
            lines: [],
            currentLine: '',
            cursorPosition: 0,
            cursorVisible: true
        };
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        if (this.canvasRef.current) {
            this.ctx = this.canvasRef.current.getContext('2d');
            this.canvasRef.current.width = window.innerWidth;
            this.canvasRef.current.height = window.innerHeight;
            window.addEventListener('keydown', this.handleKeyDown);
            this.startCursorBlink();
            this.animationFrameId = requestAnimationFrame(this.updateCanvas);
        }
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
                this.ctx!.fillText(line, this.padding, y);
            });

            // Draw current line
            this.ctx.fillText(this.state.currentLine, this.padding, height - this.lineHeight - this.padding);

            // Draw cursor
            if (this.state.cursorVisible) {
                const cursorX = this.state.cursorPosition * (this.fontSize * 0.55) + this.padding + 2;
                const cursorY = height - this.lineHeight * 1.8 - this.padding + 2;
                this.ctx.fillRect(cursorX, cursorY, 2, this.fontSize);
            }
        }
        this.animationFrameId = requestAnimationFrame(this.updateCanvas);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        let { currentLine, cursorPosition, lines } = this.state;

        switch (e.key) {
            case 'Enter':
                lines = [...lines, currentLine];
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
            default:
                if (e.key.length === 1) {
                    currentLine = currentLine.slice(0, cursorPosition) + e.key + currentLine.slice(cursorPosition);
                    cursorPosition++;
                }
        }

        this.setState({ currentLine, cursorPosition, lines });
    }

    render() {
        return <canvas ref={this.canvasRef} style={{ display: 'block' }} />;
    }
}

export default ConsoleApp;