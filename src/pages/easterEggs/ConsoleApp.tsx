import React from 'react';

interface ConsoleState {
    consoleText: string;
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

    constructor(props: {}) {
        super(props);
        this.state = {
            consoleText: '',
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
        if (this.ctx) {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.canvasRef.current!.width, this.canvasRef.current!.height);

            this.ctx.font = `${this.fontSize}px monospace`;
            this.ctx.fillStyle = 'white';

            const lines = this.state.consoleText.split('\n');
            lines.forEach((line, index) => {
                this.ctx!.fillText(line, this.padding, (index + 1) * this.lineHeight);
            });

            if (this.state.cursorVisible) {
                const cursorX = (this.state.cursorPosition % 80) * (this.fontSize * 0.6) + this.padding;
                const cursorY = Math.floor(this.state.cursorPosition / 80) * this.lineHeight + this.lineHeight - this.fontSize / 2;
                this.ctx.fillRect(cursorX, cursorY, this.fontSize * 0.6, 2);
            }
        }
        this.animationFrameId = requestAnimationFrame(this.updateCanvas);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        let { consoleText, cursorPosition } = this.state;

        switch (e.key) {
            case 'Enter':
                consoleText = consoleText.slice(0, cursorPosition) + '\n' + consoleText.slice(cursorPosition);
                cursorPosition++;
                break;
            case 'Backspace':
                if (cursorPosition > 0) {
                    consoleText = consoleText.slice(0, cursorPosition - 1) + consoleText.slice(cursorPosition);
                    cursorPosition--;
                }
                break;
            case 'ArrowLeft':
                if (cursorPosition > 0) cursorPosition--;
                break;
            case 'ArrowRight':
                if (cursorPosition < consoleText.length) cursorPosition++;
                break;
            case 'ArrowUp':
                cursorPosition = Math.max(0, cursorPosition - 80);
                break;
            case 'ArrowDown':
                cursorPosition = Math.min(consoleText.length, cursorPosition + 80);
                break;
            default:
                if (e.key.length === 1) {
                    consoleText = consoleText.slice(0, cursorPosition) + e.key + consoleText.slice(cursorPosition);
                    cursorPosition++;
                }
        }

        this.setState({ consoleText, cursorPosition });
    }

    render() {
        return <canvas ref={this.canvasRef} style={{ display: 'block' }} />;
    }
}

export default ConsoleApp;