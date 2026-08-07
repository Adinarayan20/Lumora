export interface MotionConfig {
  readonly duration: number;
  readonly scale: number;
  readonly springDamping: number;
  readonly springStiffness: number;
}

export class MotionEngine {
  public static press(): MotionConfig {
    return {
      duration: 200,
      scale: 0.97,
      springDamping: 20,
      springStiffness: 250,
    };
  }

  public static appear(): MotionConfig {
    return {
      duration: 250,
      scale: 1.0,
      springDamping: 18,
      springStiffness: 220,
    };
  }

  public static dismiss(): MotionConfig {
    return {
      duration: 180,
      scale: 0.95,
      springDamping: 22,
      springStiffness: 280,
    };
  }

  public static hero(): MotionConfig {
    return {
      duration: 350,
      scale: 1.02,
      springDamping: 15,
      springStiffness: 180,
    };
  }

  public static sheet(): MotionConfig {
    return {
      duration: 300,
      scale: 1.0,
      springDamping: 20,
      springStiffness: 200,
    };
  }

  public static dialog(): MotionConfig {
    return {
      duration: 250,
      scale: 1.0,
      springDamping: 18,
      springStiffness: 240,
    };
  }

  public static snackbar(): MotionConfig {
    return {
      duration: 200,
      scale: 1.0,
      springDamping: 20,
      springStiffness: 250,
    };
  }
}
