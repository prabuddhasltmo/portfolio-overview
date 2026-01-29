import { Box, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type MonthSelectorProps = {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
};

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const MonthSelector = ({ month, year, onChange }: MonthSelectorProps) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const ui = (theme.palette as { ui?: Record<string, string> }).ui;

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value), year);
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    onChange(month, Number(event.target.value));
  };

  const selectStyles = {
    fontSize: '14px',
    color: neutral?.[800],
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: ui?.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select value={month} onChange={handleMonthChange} sx={selectStyles}>
          {months.map((m) => (
            <MenuItem key={m.value} value={m.value} sx={{ fontSize: '14px' }}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 80 }}>
        <Select value={year} onChange={handleYearChange} sx={selectStyles}>
          {years.map((y) => (
            <MenuItem key={y} value={y} sx={{ fontSize: '14px' }}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MonthSelector;
