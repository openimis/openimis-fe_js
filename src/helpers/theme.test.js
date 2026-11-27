import { describe, expect, it } from "vitest";

import createAppTheme from "./theme";

describe("createAppTheme", () => {
  it.each(["tooltipContainer", "fab"])("keeps a page's floating %s above the drawers and below dialogs", (key) => {
    const theme = createAppTheme();

    // OP-3306: at 2000 the page's floating Save covered a full-screen dialog's own Save.
    expect(theme[key].zIndex).toBeGreaterThan(theme.zIndex.drawer);
    expect(theme[key].zIndex).toBeLessThan(theme.zIndex.modal);
  });
});
