export interface BrowserChangedEvent {
    browsers: Browser[]
}

export interface BrowserResult {
    startTime: number;
    total: number;
    success: number;
    failed: number;
    skipped: number;
    totalTime: number;
    netTime: number;
    error: boolean,
    disconnected: boolean
}

export interface Browser {        
    id: string;
    fullName: string;
    name: string;
    lastResult: BrowserResult;
    disconnectsCount: 0,
    state: string; //'CONNECTED'
  }