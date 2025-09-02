import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import BudgetPage from './BudgetPage';
import CurrentTransactionsPage from '../homepage/CurrentTransactionsPage';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BudgetTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="basic tabs example" 
          sx={{ '& .MuiTab-root': { transition: 'color 0.3s', fontWeight: 'bold' } }}
        >
          <Tab 
            label="Planned Budget" 
            {...a11yProps(0)} 
            sx={{ '&:hover': { color: 'primary.main' } }} 
          />
          <Tab 
            label="Tracked Expenses" 
            {...a11yProps(1)} 
            sx={{ '&:hover': { color: 'primary.main' } }} 
          />
          <Tab 
            label="Transaction Review" 
            {...a11yProps(2)} 
            sx={{ '&:hover': { color: 'primary.main' } }} 
          />
        </Tabs>
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