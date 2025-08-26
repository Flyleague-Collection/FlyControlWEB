export class Timer {
    private timer: NodeJs.Timeout | null;
    private isRunning: boolean;
    private remainingSeconds: number;
    private readonly onTick?: (remainingSeconds: number) => void;
    private readonly onComplete?: Callback;

    constructor(option: TimerOption) {
        this.timer = null
        this.isRunning = false;
        this.remainingSeconds = option.duration;
        this.onTick = option.onTick;
        this.onComplete = option.onComplete;
        if (option.autoStart) {
            this.start()
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.remainingSeconds--;
            if (this.onTick) {
                this.onTick(this.remainingSeconds);
            }
            if (this.remainingSeconds <= 0) {
                clearInterval(this.timer);
                if (this.onComplete) {
                    this.onComplete()
                }
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        clearInterval(this.timer);
        this.isRunning = false;
    }
}