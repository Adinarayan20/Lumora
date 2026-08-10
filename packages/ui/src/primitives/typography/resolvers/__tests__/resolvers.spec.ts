import { describe, it, expect } from "vitest";
import { LightThemeColors } from "@lumora/theme";
import { TypographyColorResolver } from "../TypographyColorResolver";
import { TypographyWeightResolver } from "../TypographyWeightResolver";
import { TypographyTrackingResolver } from "../TypographyTrackingResolver";
import { TypographyScaleResolver } from "../TypographyScaleResolver";
import { TypographyStyleComposer } from "../TypographyStyleComposer";

describe("Typography Resolvers Suite", () => {
  describe("TypographyColorResolver", () => {
    it("resolves semantic colors from JSON token map", () => {
      const primaryColor = TypographyColorResolver.resolveColor(
        "primary",
        "default",
        LightThemeColors,
      );
      expect(primaryColor).toBe(LightThemeColors.primary);

      const dangerColor = TypographyColorResolver.resolveColor(
        "danger",
        "default",
        LightThemeColors,
      );
      expect(dangerColor).toBe(LightThemeColors.danger);
    });

    it("resolves emphasis color override from JSON token map", () => {
      const strongColor = TypographyColorResolver.resolveColor(
        "textSecondary",
        "strong",
        LightThemeColors,
      );
      expect(strongColor).toBe(LightThemeColors.textPrimary);

      const disabledColor = TypographyColorResolver.resolveColor(
        "primary",
        "disabled",
        LightThemeColors,
      );
      expect(disabledColor).toBe(LightThemeColors.textMuted);
    });
  });

  describe("TypographyWeightResolver", () => {
    it("resolves default font weight from role configuration", () => {
      const bodyWeight = TypographyWeightResolver.resolveWeight(
        "Body",
        "default",
      );
      expect(bodyWeight).toBe("400");

      const headlineWeight = TypographyWeightResolver.resolveWeight(
        "Headline",
        "default",
      );
      expect(headlineWeight).toBe("700");
    });

    it("resolves emphasis weight override from JSON token map", () => {
      const strongWeight = TypographyWeightResolver.resolveWeight(
        "Body",
        "strong",
      );
      expect(strongWeight).toBe("700");
    });
  });

  describe("TypographyTrackingResolver", () => {
    it("resolves tracking values from semantic typography map", () => {
      const displayTracking =
        TypographyTrackingResolver.resolveTracking("Display XL");
      expect(displayTracking).toBe(-0.32);

      const overlineTracking =
        TypographyTrackingResolver.resolveTracking("Overline");
      expect(overlineTracking).toBe(1.28);
    });
  });

  describe("TypographyScaleResolver", () => {
    it("resolves optical scales for phone, tablet, and desktop viewports", () => {
      const phoneScale = TypographyScaleResolver.resolveScale(
        "Display XL",
        "phone",
      );
      expect(phoneScale.fontSize).toBe(48);

      const desktopScale = TypographyScaleResolver.resolveScale(
        "Display XL",
        "desktop",
      );
      expect(desktopScale.fontSize).toBe(60); // 48 * 1.25
    });
  });

  describe("TypographyStyleComposer", () => {
    it("composes all resolvers into a valid memoized style object", () => {
      const style = TypographyStyleComposer.composeStyle({
        role: "Title Large",
        colorToken: "primary",
        emphasis: "default",
        colors: LightThemeColors,
        deviceType: "phone",
      });

      expect(style.fontSize).toBe(24);
      expect(style.fontWeight).toBe("600");
      expect(style.color).toBe(LightThemeColors.primary);
      expect(style.letterSpacing).toBe(-0.16);
    });
  });
});
