import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontFamily: ["Rubik", "Roboto", '"Helvetica Neue"', "sans-serif"].join(","),
    fontSize: 14,
    fontWeightRegular: 300,
    fontWeightMedium: 400,
    title: {
      fontSize: 20,
      fontWeight: 300,
    },
  },
  palette: {
    primary: { main: "#006273" },
    secondary: { main: "#fff" },
    text: {
      primary: { main: "#006273" },
      secondary: { main: "#fff" },  
    }
  },
});

export default theme;
