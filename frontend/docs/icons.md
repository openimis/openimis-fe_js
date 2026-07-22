# Icons Guide

## Overview

The frontend uses Material Symbols for icons, loaded via a local WOFF2 font file (`public/fonts/material-symbols/MaterialSymbolsOutlined-Regular.woff2`). Icons are accessed through the `GetIconComponent` helper from CoreModule, which provides a consistent API for rendering and transforming icons.

## Importing GetIconComponent

```jsx
import GetIconComponent from "@openimis/fe-core";
```

## Basic Usage

Create an icon component by passing the icon name as a string:

```jsx
const SearchIcon = GetIconComponent("Search");
const AddIcon = GetIconComponent("Add");

// In JSX
<IconButton>
  <SearchIcon />
</IconButton>
```

This renders a `<span>` with the appropriate Material Symbols class and name.

## Icon Naming

Icon names are automatically converted from PascalCase to snake_case using the `toIconName` function:

- `"ArrowBack"` → `"arrow_back"`
- `"DoubleArrow"` → `"double_arrow"`
- `"CheckCircleOutline"` → `"check_circle_outline"`

Exceptions (e.g., for non-standard names) are defined in the `ICON_MAP` in `icons.jsx`. If an icon doesn't render, verify the name matches the [Material Symbols reference](https://fonts.google.com/icons).

## Advanced Options

Pass an options object as the second parameter for variants, rotations, and flips:

```jsx
const RotatedArrow = GetIconComponent("ArrowForward", { rotate: 180 });
const FlippedIcon = GetIconComponent("ArrowUp", { flip: 'horizontal' });
const FilledIcon = GetIconComponent("Home", { variant: 'filled' });
```

### Options Reference

- **`variant`**: `'outlined'` | `'filled'` | `'rounded'` | `'sharp'` (default: `'outlined'`)  
  Changes the Material Symbols class (e.g., `'material-symbols-outlined'` to `'material-symbols-filled'`).

- **`rotate`**: `number` (degrees, e.g., `90`, `180`, `270`)  
  Applies a CSS `rotate()` transform.

- **`flip`**: `'horizontal'` | `'vertical'` | `null`  
  Applies `scaleX(-1)` for horizontal flip or `scaleY(-1)` for vertical flip.

- **`styleOverrides`**: `object`  
  Merges custom styles with defaults (e.g., `{ color: 'red' }`).

Transforms are applied inline via the `style` prop for high specificity, avoiding CSS conflicts.

## Examples

### From RoleRightsPanel.jsx

```jsx
import GetIconComponent from "../helpers/icons";

const ArrowBackIcon = GetIconComponent("ArrowBack");
const ArrowForwardIcon = GetIconComponent("ArrowForward");
const SearchIcon = GetIconComponent("Search");
const DoubleArrowIcon = GetIconComponent("DoubleArrow");
const ReversedDoubleArrowIcon = GetIconComponent("DoubleArrow", { rotate: 180 });

// Usage
<IconButton>
  <ArrowForwardIcon />
</IconButton>
<Tooltip title="Add All">
  <IconButton>
    <DoubleArrowIcon />
  </IconButton>
</Tooltip>
<Tooltip title="Remove All">
  <IconButton>
    <ReversedDoubleArrowIcon />
  </IconButton>
</Tooltip>
```

### Other Common Icons

Based on usage across CoreModule:

- **Actions**: `"Add"`, `"Delete"`, `"Edit"`, `"Save"`, `"Clear"`, `"Replay"`
- **Navigation**: `"ArrowBack"`, `"ArrowForward"`, `"ChevronLeft"`, `"ChevronRight"`, `"ExpandMore"`, `"ExpandLess"`
- **UI Elements**: `"Search"`, `"FilterList"`, `"MoreHoriz"`, `"Menu"`, `"Tab"`
- **Status**: `"Check"`, `"Error"`, `"Visibility"`, `"VisibilityOff"`, `"HelpOutline"`
- **Forms**: `"CheckOutlined"`, `"ErrorOutlineOutlined"`, `"RadioButtonChecked"`, `"RadioButtonUnchecked"`

### Advanced Example

```jsx
const CustomIcon = GetIconComponent("Star", {
  variant: 'filled',
  rotate: 45,
  flip: 'horizontal',
  styleOverrides: { color: 'gold', fontSize: '2rem' }
});

<CustomIcon />
```

## Troubleshooting

- **Icon not rendering**: Confirm the name exists in [Material Symbols](https://fonts.google.com/icons). Check browser console for font loading errors. The local font may not include all icons—consider loading from Google Fonts if needed.
- **Rotation/flip not working**: Use options instead of external CSS, as inline styles have higher specificity.
- **Performance**: Icons are lightweight `<span>` elements; reuse components where possible.
- **Fallbacks**: Passing `null` or empty string falls back to `"indeterminate_question_box"`.

## Best Practices

- Use descriptive names for icon constants (e.g., `DeleteIcon` instead of `Icon`).
- Prefer options for transforms over CSS to avoid specificity issues.
- Check existing usage in CoreModule before adding new icons.
- For dynamic icons, pass the name string directly: `GetIconComponent(dynamicName)`.

## Reference

- [Google Material Symbols](https://fonts.google.com/icons) - Full icon list and variants.
- Source: `frontend-packages/CoreModule/src/helpers/icons.jsx`