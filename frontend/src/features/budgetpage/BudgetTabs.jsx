import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import BudgetPage from './BudgetPage';
import CurrentTransactionsPage from './CurrentTransactionsPage';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
CustomTabPanel.propTypes = { children: PropTypes.node, index: PropTypes.number.isRequired, value: PropTypes.number.isRequired };
const a11yProps = (index) => ({ id: `simple-tab-${index}`, "aria-controls": `simple-tabpanel-${index}` });


// Tabs here
export default function BudgetTabs() {
  const [value, setValue] = React.useState(0);  
  
  // format adjustments
  const COLOR = '#6EC5A4';
  const TEXT = "#ffffffff";
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (

    <Box sx={{ width: "100%", mt: 5}}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
<Tabs
  value={value}
  onChange={handleChange}
  aria-label="budget tabs"
  centered
  slotProps={{ indicator: { style: { display: "none" } } }}
  sx={{
    minHeight: 0, 
    "& .MuiTabs-flexContainer": {
      justifyContent: "center",
      alignItems: "stretch", 
    },

    "& .MuiTab-root": {
      minHeight: 0,         
      height: "100%",       
      textTransform: "none",
      fontWeight: 700,
      px: 3,
      py: 1.25,

      "&:not(:first-of-type)": {
        borderLeft: "1px solid",
        borderColor: "divider",
      },
      "&:hover": { bgcolor: "action.hover" },
    },
    "& .MuiTab-root.Mui-selected": {
      bgcolor: COLOR,     
      color: TEXT,       
    },
    "& .MuiTab-root.Mui-selected + .MuiTab-root": {
      borderLeftColor: "transparent",
    },
  }}
>
            {["Planned Budget", "Tracked Expenses", "Transaction Review"].map((label, i) => (
              <Tab
                key={label}
                label={label}
                {...a11yProps(i)}
                disableRipple
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.25,
                  minHeight: 44,
                  "&:not(:last-of-type)": {
                    borderRight: "1px solid",
                    borderColor: "divider",
                  },
                  "&:hover": { bgcolor: "action.hover" },
                  // selected styling
                  "&.Mui-selected": {
                    bgcolor: COLOR,
                    color: TEXT,
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <BudgetPage />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <CurrentTransactionsPage />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
}