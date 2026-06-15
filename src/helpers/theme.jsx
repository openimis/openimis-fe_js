import { createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

const defaultColors = {
  primaryColor: "#006273",
  errorColor: "#801a00",
  whiteColor: "#fff",
  fontColor: "#003d4a",
  backgroundColor: "#dbeef0",
  headerColor: "#b7d4d8",
  greyColor: "grey",
  selectedTableRowColor: "rgba(0, 0, 0, 0.08)",
  hoveredTableRowColor: "rgba(0, 0, 0, 0.12)",
  toggledButtonColor: "#999999",
  lockedBackgroundPattern:
    "repeating-linear-gradient(45deg, #D3D3D3 1px, #D3D3D3 1px, #fff 10px, #fff 10px)",
};

const createAppTheme = (colorOverrides = {}) => {
  const {
    primaryColor,
    errorColor,
    whiteColor,
    fontColor,
    backgroundColor,
    headerColor,
    greyColor,
    selectedTableRowColor,
    hoveredTableRowColor,
    toggledButtonColor,
    lockedBackgroundPattern,
  } = { ...defaultColors, ...colorOverrides };

  const themeOptions = {
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: selectedTableRowColor,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "standard" },
      },
      MuiSelect: {
        defaultProps: { variant: "standard" },
      },
      MuiFormControl: {
        defaultProps: { variant: "standard" },
      },
    },
    palette: {
      primary: { main: primaryColor },
      secondary: { main: whiteColor },
      error: { main: errorColor },
      text: {
        primary: fontColor,
        secondary: fontColor,
        second: whiteColor,
        error: errorColor,
      },
      toggledButton: toggledButtonColor,
    },
    typography: {
      fontFamily: ["Rubik", "Roboto", '"Helvetica Neue"', "sans-serif"].join(","),
      fontSize: 14,
      fontWeightRegular: 300,
      fontWeightMedium: 400,
      h6: {
        fontSize: 20,
        fontWeight: 300,
      },
    
      title: {
        fontSize: 20,
        fontWeight: 300,
      },
      body2: {
        color: greyColor,
      },
    },
    jrnlDrawer: {
      open: {
        width: 500,
      },
      close: {
        width: 70,
      },
      itemDetail: {
        marginLeft: 8,
      },
      iconSize: 24,
    },
         menu: {
       variant: "AppBar", 
       drawer: {
         width: "300px", // Must be string for CSS calc() in RequireAuth
        fontSize: 16,
        fontWeight: 400,
        backgroundColor: primaryColor,
        textColor: whiteColor,
      },
      appBar: {
        fontSize: 15,
      },
    },
    page: {
      locked: {
        background: lockedBackgroundPattern,
      },
    },
    paper: {
      paper: {
        margin: 10,
        backgroundColor: backgroundColor,
      },
      header: {
        color: primaryColor,
        backgroundColor: headerColor,
        padding: 16,
      },
      message: {
        backgroundColor: headerColor,
      },
      title: {
        padding: 16,
        fontSize: 20,
        fontWeight: 500,
        color: primaryColor,
        backgroundColor: headerColor,
      },
      action: {
        padding: 8,
      },
      divider: {
        padding: 0,
        margin: 0,
      },
      body: {
        marginBottom: 10,
        backgroundColor: backgroundColor,
      },
      item: {
        padding: 10,
      },
    },
    table: {
      title: {
        padding: 16,
        fontWeight: 500,
        color: primaryColor,
        backgroundColor: headerColor,
      },
      header: {
        color: primaryColor,
      },
      headerAction: {
        padding: 8,
      },
      row: {
        color: primaryColor,
        textAlign: "center",
        '&:hover': {
          background: hoveredTableRowColor,
        },
      },
      container: {
        backgroundColor: backgroundColor,
      },
      cell: {
        padding: 5,
      },
      lockedRow: {
        background: lockedBackgroundPattern,
      },
      lockedCell: {},
      highlightedRow: {},
      highlightedCell: {
        fontWeight: 500,
        textAlign: "center",
      },
      secondaryHighlightedRow: {
        backgroundColor: "#cbedf2",
      },
      secondaryHighlightedCell: {},
      highlightedAltRow: {},
      highlightedAltCell: {
        fontStyle: "italic",
        textAlign: "center",
      },
      disabledRow: {},
      disabledCell: {
        color: greyColor,
        textAlign: "center",
      },
      footer: {
        color: primaryColor,
      },
      pager: {
        color: primaryColor,
      },
    },
    form: {
      spacing: 10,
    },
    formTable: {
      table: {
        color: primaryColor,
      },
      actions: {
        color: primaryColor,
      },
      header: {
        color: primaryColor,
        textAlign: "center",
      },
    },
    dialog: {
      title: {
        fontWeight: 500,
        color: greyColor,
      },
      content: {
        padding: 0,
      },
      primaryButton: {
        backgroundColor: primaryColor,
        color: whiteColor,
        fontWeight: "bold",
        '&:hover': {
          backgroundColor: alpha(primaryColor, 0.5),
          color: primaryColor,
        },
      },
      secondaryButton: {},
    },
    tooltipContainer: {
      position: "fixed",
      bottom: 15,
      right: 8,
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    flexTooltip: {
      marginBottom: 5,
    },
    fab: {
      position: "fixed",
      bottom: 20,
      right: 8,
      zIndex: 2000,
    },
    fakeInput: {},
    bigAvatar: {
      width: 160,
      height: 160,
    },
    buttonContainer: {
      horizontal: {
        display: "flex",
        flexWrap: "nowrap",
        overflowX: "auto",
        justifyContent: "flex-end",
      },
    },
   };

  let theme = createTheme(themeOptions);

  theme.jrnlDrawer = themeOptions.jrnlDrawer;
  theme.menu = themeOptions.menu;
  theme.page = themeOptions.page;
  theme.paper = themeOptions.paper;
  theme.table = themeOptions.table;
  theme.form = themeOptions.form;
  theme.formTable = themeOptions.formTable;
  theme.dialog = themeOptions.dialog;
  theme.tooltipContainer = themeOptions.tooltipContainer;
  theme.flexTooltip = themeOptions.flexTooltip;
  theme.fab = themeOptions.fab;
  theme.fakeInput = themeOptions.fakeInput;
  theme.bigAvatar = themeOptions.bigAvatar;
  theme.buttonContainer = themeOptions.buttonContainer;
  if (!theme.typography.title) {
    theme.typography.title = themeOptions.typography.title;
  }

  return theme;
};

export default createAppTheme;
