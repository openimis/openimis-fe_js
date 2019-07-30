import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  menu: {
    variant: 'AppBar',
    drawer: {
      width: 300,
      fontSize: 16,
    },
    appBar: {
      fontSize: 16,
    },
  },
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
    label: {
      color: "grey",
    },
  },
  table: {
    header: {
      color: "#006273",
      align: "center",
    },
    row: {
      color: "#006273",
      align: "center",
    }
  },  
  palette: {
    primary: { main: "#006273" },
    secondary: { main: "#fff" },
    error: { main: "#801a00" },
    text: {
      primary: "#006273",
      secondary: "#fff",
      error: "#801a00"
    }
  },
  bigAvatar: {
    margin: 10,
    width: 120,
    height: 120,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
});

export default theme;
