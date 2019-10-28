import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#006273" },
    secondary: { main: "#fff" },
    error: { main: "#801a00" },
    text: {
      primary: "#006273",
      secondary: "#006273", // HACK FOR material-table hardcoded toolbar!,
      second: "#fff",
      error: "#801a00"
    },
    toggledButton: "#999999",
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
  jrnlDrawer: {
    open: {
      width: 500,
    },
    close: {
      width: 80,
    },
    iconSize: 24,
  },
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
  paper: {
    paper: {
      margin: 10,
    },
    header: {
      padding: 10,
      color: "#006273",
    },
    title: {
      padding: 10,
      fontSize: 24,
      color: "#006273",
    },
    action: {

    },
    divider: {
      padding: 0,
      margin: 0,
    },
    body: {
      marginTop: 10,
    },
    item: {
      padding: 10,
    }
  },
  table: {
    title: {
      padding: 10,
      fontWeight: 500,
      color: "#006273",
    },
    header: {
      color: "#006273",
    },
    headerAction: {
    },
    row: {
      color: "#006273",
      align: "center",
    },
    highlightedRow: {
      fontWeight: 500,
      align: "center",
    },
    highlightedAltRow: {
      fontStyle: "italic",
      align: "center",
    },
    footer: {
      color: "#006273",
    },
    pager: {
      color: "#006273",
    },
  },
  form: {
    spacing: 10,
  },
  formTable: {
    table: {
      color: "#006273",
    },
    actions: {
      color: "#006273",
    },
    header: {
      color: "#006273",
      align: "center",
    }
  },
  dialog: {
    title: {
      fontWeight: 500,
      color: "grey",
    },
    content: {
      padding: 0,
    }
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 8,
    zIndex: 2000,
  },
  fakeInput: {

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
