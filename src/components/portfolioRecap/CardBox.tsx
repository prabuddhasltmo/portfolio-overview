import { Box, BoxProps } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { useTheme } from '@mui/material/styles';

interface CustomBoxProps extends BoxProps {
  customSx?: SxProps<Theme>;
}

function CardBox(props: Readonly<CustomBoxProps>) {
  const { customSx, children, ...rest } = props;
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

export default CardBox;
