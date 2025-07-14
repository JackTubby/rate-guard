class CleanUp {
  store: any;
  interval: number;

  constructor(store: any, interval: number) {
    this.store = store;
    this.interval = interval;
  }

  public async scheduleCleanup() {
    setTimeout(() => {
      this.cleanupOldBuckets();
      this.scheduleCleanup();
    }, 3600000);
  }

  private async cleanupOldBuckets() {
    const getBuckets = await this.store.getAll();
    if (getBuckets.size === 0) {
      console.log("No buckets exist to clean up...");
      return true;
    } else {
      const now = new Date().getTime();
      const deletions: any = [];
      getBuckets.forEach((i: any, k: any) => {
        const timePassed = now - i.lastRefill;
        if (timePassed >= this.interval) {
          console.log("Cleaning up bucket: ", k);
          deletions.push(this.store.delete(k));
        }
      });
      await Promise.all(deletions);
    }
  }
}

export default CleanUp;
