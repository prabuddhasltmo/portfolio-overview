import { Box, BoxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/system';

interface CardBoxProps extends BoxProps {
  customSx?: SxProps<Theme>;
}

export default function CardBox({ customSx, children, ...rest }: CardBoxProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        justifyContent: 'space-between',
        padding: 2,
        width: '100%',
        borderRadius: 2,
        backgroundColor: theme.palette.background.default,
        ...customSx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
