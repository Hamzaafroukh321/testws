declare module 'eventsource-polyfill' {
    const EventSourcePolyfill: {
      new (url: string, eventSourceInitDict?: EventSourceInit): EventSource;
      prototype: EventSource;
      readonly CLOSED: number;
      readonly CONNECTING: number;
      readonly OPEN: number;
    };
    export = EventSourcePolyfill;
  }
  