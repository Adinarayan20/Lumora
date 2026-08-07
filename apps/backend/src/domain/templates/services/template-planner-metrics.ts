export class TemplatePlannerMetrics {
  private static totalPlansGenerated = 0;
  private static totalDryRuns = 0;
  private static totalPlanningDurationMs = 0;

  public static recordPlanGenerated(
    durationMs: number,
    isDryRun: boolean,
  ): void {
    this.totalPlansGenerated += 1;
    this.totalPlanningDurationMs += durationMs;
    if (isDryRun) {
      this.totalDryRuns += 1;
    }
  }

  public static getMetrics(): {
    totalPlansGenerated: number;
    totalDryRuns: number;
    avgPlanningDurationMs: number;
  } {
    const avgDuration =
      this.totalPlansGenerated > 0
        ? this.totalPlanningDurationMs / this.totalPlansGenerated
        : 0;

    return {
      totalPlansGenerated: this.totalPlansGenerated,
      totalDryRuns: this.totalDryRuns,
      avgPlanningDurationMs: avgDuration,
    };
  }

  public static reset(): void {
    this.totalPlansGenerated = 0;
    this.totalDryRuns = 0;
    this.totalPlanningDurationMs = 0;
  }
}
