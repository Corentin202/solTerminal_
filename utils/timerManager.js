class TimerManager {
  constructor(durationMinutes = 60) {
    this.startTime = new Date();
    this.duration = durationMinutes * 60 * 1000;
  }

  reset() {
    this.startTime = new Date();
  }

  getRemainingTime() {
    const elapsed = new Date() - this.startTime;
    const remaining = Math.max(0, this.duration - elapsed);
    return Math.floor(remaining / 1000); // seconds
  }
}

export default TimerManager;
