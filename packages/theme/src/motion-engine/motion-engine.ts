export interface MotionConfig {
  readonly duration: number;
  readonly scale: number;
  readonly springDamping: number;
  readonly springStiffness: number;
}

export class MotionEngine {
  public static press(): MotionConfig {
    'worklet';
    return {
      duration: 200,
      scale: 0.97,
      springDamping: 20,
      springStiffness: 250,
    };
  }

  public static fadeIn(): MotionConfig {
    'worklet';
    return {
      duration: 250,
      scale: 1.0,
      springDamping: 18,
      springStiffness: 220,
    };
  }

  public static fadeOut(): MotionConfig {
    'worklet';
    return {
      duration: 180,
      scale: 0.95,
      springDamping: 22,
      springStiffness: 280,
    };
  }

  public static cardLift(): MotionConfig {
    'worklet';
    return {
      duration: 220,
      scale: 1.02,
      springDamping: 16,
      springStiffness: 210,
    };
  }

  public static heroExpand(): MotionConfig {
    'worklet';
    return {
      duration: 350,
      scale: 1.04,
      springDamping: 15,
      springStiffness: 180,
    };
  }

  public static sheet(): MotionConfig {
    'worklet';
    return {
      duration: 300,
      scale: 1.0,
      springDamping: 20,
      springStiffness: 200,
    };
  }

  public static dialog(): MotionConfig {
    'worklet';
    return {
      duration: 250,
      scale: 1.0,
      springDamping: 18,
      springStiffness: 240,
    };
  }

  public static snackbar(): MotionConfig {
    'worklet';
    return {
      duration: 200,
      scale: 1.0,
      springDamping: 20,
      springStiffness: 250,
    };
  }

  public static fabMorph(): MotionConfig {
    'worklet';
    return {
      duration: 280,
      scale: 1.05,
      springDamping: 18,
      springStiffness: 230,
    };
  }
}
