// Events.ts
type Callback = (value: any) => void;

interface StoredCallback {
    id: number;
    eventName: string;
    caller?: any;
    callback: Callback;
}

class Events {
    private callbacks: StoredCallback[] = [];
    private nextId: number = 0;

    emit(eventName: string, value: any = null): void {
        this.callbacks.forEach(stored => {
            if (stored.eventName === eventName) {
                stored.callback(value);
            }
        });
    }

    on(eventName: string, caller: any, callback: Callback): number {
        this.nextId++;
        const boundCallback = (caller && typeof caller === 'object') ? callback.bind(caller) : callback;
        this.callbacks.push({
            id: this.nextId,
            eventName,
            caller,
            callback: boundCallback
        });
        return this.nextId;
    }

    off(id: number): void {
        this.callbacks = this.callbacks.filter(stored => stored.id !== id);
    }

    unsubscribe(caller: any): void {
        this.callbacks = this.callbacks.filter(stored => stored.caller !== caller);
    }
}

export const allEvents = new Events();
