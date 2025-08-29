export const STREAM_ROW_GRID = {
  display: "grid",
  alignItems: "center",
  gap: 2,
  // 1st col = flexible label (name), 2nd/3rd = fixed controls, 4th = actions
  gridTemplateColumns: {
    xs: "1fr",                      // stack on mobile
    sm: "1fr 160px",                // name | amount
    md: "1fr 140px 140px auto",     // name | amount | recurrence | actions
  },
};
