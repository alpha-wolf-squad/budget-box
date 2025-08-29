import { Typography, Button, Box } from "@mui/material";
import { useState } from "react";
import { useAuthenticatedApi } from "../../services/hooks.js";

export default function BudgetForm() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Added by Kevin.  Feel free to remove these useStates, and handleTestBackend.  Only used to test backend auth.
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const api = useAuthenticatedApi();

  const handleTestBackend = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await api.get("http://localhost:8000/api/entries/");
      setTestResult({ success: true, data: response.data });
      console.log(`Success: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      console.log(`Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <Typography>Income:</Typography> {/* Add the missing Button */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleTestBackend}
          disabled={testing}
        >
          {testing ? "Testing..." : "Test Backend Auth"}
        </Button>
      </Box>
      {testResult && (
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: testResult.success ? "green" : "red",
            fontFamily: "monospace",
          }}
        >
          {testResult.success
            ? '✅ Backend connection successful! Check console for "hello from backend"'
            : `❌ Error: ${testResult.error}`}
        </Typography>
      )}
    </>
  );

  // fetchDebt hook

  // TODO DebtStreamCards

  // TODO Income Stream cards
}
