
export interface EventListener {
    (...params: any[]): any;
}

export abstract class EventEmitter {

    private listeners: Map<string, EventListener[]> = new Map();

    addListener(event: string, listener: EventListener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [listener]);
        } else {
            this.listeners.get(event)!.push(listener);
        }
    }

    removeListener(event: string, listener: EventListener) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    protected fireEvent(event: string, ...params: any[]) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            for (const listener of listeners) {
                listener(...params);
            }
        }
    }
}
