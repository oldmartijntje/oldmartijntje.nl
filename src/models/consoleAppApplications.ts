export interface ConsoleFile {
    name: string;
    type: 'file' | 'folder';
    content: string;
    path: string;
    fullPath: string;
    clearanceLock?: number
}

function getClassifiedLevel(hasToBe: number, userData: any): number {
    if (!userData.clearanceLevel) {
        return 1
    } else {
        return userData.clearanceLevel < hasToBe ? userData.clearanceLevel + 1 : hasToBe
    }
}

export class ConsoleLine {
    displayText: string;
    originalText: string;
    type: 'input' | 'output';
    functionData: any;
    onEmit: Function = () => { };

    constructor(text: string, type: 'input' | 'output') {
        this.displayText = text;
        this.originalText = text;
        this.type = type;
        this.functionData = {};
    }

    onDraw(self: ConsoleLine) {
        self
    }

    duplicate() {
        const newLine = new ConsoleLine(this.originalText, this.type);
        newLine.functionData = this.functionData;
        newLine.onDraw = this.onDraw;
        return newLine;
    }
}

export interface ConsoleState {
    lines: ConsoleLine[];
    currentLine: string;
    cursorPosition: number;
    cursorVisible: boolean;
    currentPath: string;
}

export const applications: { [key: string]: any } = {
    ls: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, userProfile]
        const filteredFiles = consoleApp.loadedFiles.filter((file: ConsoleFile) => { return file.path === consoleApp.state.currentPath; });
        let list = ""
        console.log(userProfile)
        consoleApp.loadedFiles = filteredFiles;
        for (let index = 0; index < filteredFiles.length; index++) {
            let locked = filteredFiles[index].clearanceLock && (!userProfile._id || userProfile.clearanceLevel < filteredFiles[index].clearanceLock) ? `🗝 ` : '';
            if (filteredFiles[index].type == 'folder') {
                list += `\n${index == filteredFiles.length - 1 ? '└──' : '├──'} ${locked + filteredFiles[index].name}/`
            } else {
                list += `\n${index == filteredFiles.length - 1 ? '└──' : '├──'} ${locked + filteredFiles[index].name}`
            }
        }
        lines.push(new ConsoleLine(`${consoleApp.state.currentPath}${list}`, 'output'));
    },
    cd: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, userProfile]
        const newPath = param;
        if (newPath === '..') {
            const splitPath = consoleApp.state.currentPath.split('/');
            splitPath.pop();
            consoleApp.setState({ currentPath: splitPath.join('/') + '/' })
        } else {
            const newPath = consoleApp.state.currentPath != 'C:/' ? `${consoleApp.state.currentPath}/${param}` : `C:/${param}`;
            const filteredFiles = consoleApp.loadedFiles.filter((file: ConsoleFile) => {
                return (file.fullPath === newPath ||
                    file.fullPath.slice(0, file.fullPath.length - 1) == newPath) &&
                    file.type === 'folder';
            });
            if (filteredFiles.length > 0 && (!filteredFiles[0].clearanceLock || userProfile.clearanceLevel >= filteredFiles[0].clearanceLock)) {
                consoleApp.setState({ currentPath: newPath })
            } else if (filteredFiles.length > 0) {
                lines.push(new ConsoleLine(`cd ${param}: CLASSIFIED. Level ${getClassifiedLevel(filteredFiles[0].clearanceLock, userProfile)} needed.`, 'output'));
            } else {
                lines.push(new ConsoleLine(`cd: ${param}: No such directory`, 'output'));
            }
        }

    },
    help: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, consoleApp, userProfile]
        let list = ""
        for (const key in applications) {
            list += `\n - ${key}`
        }
        lines.push(new ConsoleLine(`Available commands:${list}`, 'output'));
    },
    run: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, userProfile]
        const filteredFiles = consoleApp.loadedFiles.filter((file: ConsoleFile) => { return file.path === consoleApp.state.currentPath; });
        const file = filteredFiles.find((file: ConsoleFile) => file.name === param);
        if (file && file.type === 'file') {
            if (!(!file.clearanceLock || userProfile.clearanceLevel >= file.clearanceLock)) {
                lines.push(new ConsoleLine(`run ${param}: CLASSIFIED, Level ${getClassifiedLevel(file.clearanceLock, userProfile)} needed.`, 'output'));
                return;
            }
            if (`${file.name}`.endsWith('exe')) {
                consoleApp.overlayFakeProject.infoPages = [{ title: `${file.name}`, content: file.content }];
                consoleApp.showModal = true;
            } else {
                const newLine = new ConsoleLine(file.content, 'output');
                newLine.onEmit = (self: ConsoleLine) => {
                    const newLines = self.displayText.split('\n').map((line: string) => new ConsoleLine(line, 'output'));
                    lines.push(...newLines);
                }
                lines.push(newLine);
            }
        } else {
            lines.push(new ConsoleLine(`run: ${param}: No such file or directory`, 'output'));
        }
    },
    info: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, consoleApp, userProfile]
        lines.push(new ConsoleLine(`
            ███╗   ███╗    █████╗    ██████╗     █████╗         ██████╗ ███████╗
            ████╗ ████║   ██╔══██╗   ██╔══██╗   ██╔══██╗       ██╔═══██╗██╔════╝
            ██╔████╔██║   ███████║   ██████╔╝   ███████║       ██║   ██║███████╗
            ██║╚██╔╝██║   ██╔══██║   ██╔══██╗   ██╔══██║       ██║   ██║╚════██║
            ██║ ╚═╝ ██║██╗██║  ██║██╗██║  ██║██╗██║  ██║██╗    ╚██████╔╝███████║
            ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝     ╚═════╝ ╚══════╝\n\n`, 'output'));
        lines.push(new ConsoleLine(`Made by OldMartijntje.`, 'output'));
        lines.push(new ConsoleLine(`M.A.R.A. OS – Your Ultimate AI-Integrated Operating System

Built using ███████, the most advanced and reliable programming language available. This console is specifically designed for use by ████████ Agents, allowing them to access █████████████████ securely, without any compromise to their data or operations.

⚠ Security Notice: Unauthorized access is strictly prohibited and will be met with immediate and irreversible consequences.

M.A.R.A. OS isn’t just another operating system. It's a unique fusion of AI and OS, ensuring your data remains protected at all costs. The system has been involved in █████████████ incidents where unauthorized ██████████ intrusions were swiftly █████████ by M.A.R.A. OS.

This outcome was inevitable, given that M.A.R.A. OS possesses unrestricted access to ███████████, ensuring no breach goes unanswered.
`, 'output'));
    }

}