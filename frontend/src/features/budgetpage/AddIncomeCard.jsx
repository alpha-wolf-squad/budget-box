import { Card, CardActionArea, CardContent, Typography, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function AddIncomeCard({ onClick, sx }) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        borderStyle: "dashed",
        borderColor: "divider",
        ...sx,
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <AddIcon />
            <Typography fontWeight={600}>New Recurring Income</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
