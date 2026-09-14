# openIMIS Frontend Menu System Documentation (Updated)

## Overview

The menu system is contribution-driven, with CoreModule (@openimis/fe-core) providing the base via MainMenuBar.jsx and MainMenuContribution.jsx. Modules contribute top-level via "fe-core.menus" (declarative configs with id, text, icon, position, entries?, contributionKey?). Backend "fe-core"."menus" overrides organize hierarchy, adding new top-levels if unmatched. Submenus are prepared using prepareMenuEntries, pulling from contributionKey (defaulting to id) or direct entries, filtered by rights and route permissions. Icons are resolved from config or defaults (see [Icons Guide](../frontend/docs/icons.md) for details). Rendering uses MUI Accordion/Popper for drawer/appbar variants.

## Layout Variants

Where the main menu sits is one setting, `theme.menu.variant`, which the app theme fills from the
backend `fe-core` config (`menu.variant`). It picks between the two **wide-screen** layouts:

| Variant | Alias | Wide screen |
| --- | --- | --- |
| `AppBar` (default) | `top` | Horizontal menu row under the top bar, submenus in a Popper |
| `Drawer` | `left` | Permanent sidebar down the left edge, submenus in Accordions |

**Narrow screens ignore the variant.** Below `theme.layout.menuDrawerBreakpoint` (`lg` by default)
there is room for neither wide layout, so both configurations collapse to the same thing: a
hamburger in the top bar that opens the left drawer, whose header carries the hamburger again next
to the app icon. Everything else in the top bar (search, AppBar icons, language picker, journal)
is identical between the two variants at that width.

`menuLeft` is the deprecated boolean this replaced. A config that still sets it keeps its sidebar:
`menuLeft: true` is read as `menu.variant: "Drawer"` (see `resolveMenuVariant` in
`helpers/utils.jsx`, which normalises, warns on an unknown value and applies that fallback).

## Current Top-Level Menus (04/2026)

The following top-level menus are currently defined in the system (sorted by position):

1. **insuree.MainMenu** (Client Registry) - Icon: AssignmentInd
2. **claim.MainMenu** (Claims) - Icon: ScreenShare
3. **admin.MainMenu** (Admin) - Icon: LocationCity
4. **invoice.MainMenu** (Legal & Finance) - Icon: BalanceIcon
5. **socialProtection.MainMenu** (Social Protection) - Icon: Diversity2Icon
6. **tasksManagement.MainMenu** (Tasks Management) - Icon: Assignment
7. **OpenSearch.MainMenu** (Open Search Reports) - Icon: DashboardIcon
8. **profile.MainMenu** (Profile) - Icon: AccountCircle
9. **tools.MainMenu** (Tools) - Icon: Settings
10. **grievance.MainMenu** (Grievance) - Icon: (dynamic)

Note: Positions may be overridden via django fe-core configuration (exposed:true, frontend). Icons are Material-UI icons.

## Flow

1. **Config Load**: GraphQL fetches moduleConfigurations; "fe-core"."menus" parsed into modulesManager.

2. **Module Load**: loadModules initializes modules; contributions collected (e.g., ProfileModule adds "profile.MainMenu" subitems, "core.MainMenu" legacy top-level).

3. **Top-Level Gathering (MainMenuBar.jsx getMenus)**:
   - Fetch backendMenuConfigs from modulesManager.getConf("fe-core", "menus", []); fallback to modulesManager.getMenuEntries() if empty.
   - For each config, set contributionKey to id if not specified; 
   - Sort configs by position (default 99).
   - For each config, prepare filteredEntries using prepareMenuEntries(modulesManager, config.id, rights, intl, history, menuVariant), which pulls sub-entries from contributionKey or direct entries, filters by rights/route.
   - hide if no filteredEntries.
   - Resolve icon using GetIconComponent(config.icon).
   - Detect active menu for initial open state.
   - Render MainMenuContribution components with props.

4. **Submenu Merging (MainMenuContribution.jsx fetchSubmenuConfig)**:
   - If backend menus present: Map submenu positions/icons from backend to allEntries (getMenuEntries()), filter by matched id/position, unique by id, sort by position.
   - If no matches, check for direct entries in backend config, filter by rights.
   - Fallback: If backend empty, use module entries directly, unique/sort.
   - Icons: Backend overrides module; string to component, defaults to "Adjust" with console.warn if invalid/missing.
   - Filter rights again; empty = no render.

5. **Rendering**:
   - MainMenuBar injects into AppBar/Drawer via Contributions("core.MainMenu" or custom key).
   - MainMenuContribution: Renders header/icon (defaults to "Adjust" if missing), toggles accordion/popper, lists filtered subentries as Link/MenuItem with icons/text (intl translated).
   - Active detection: Highlights based on current path matching entry.route.

6. **Error Handling**:
   - Console.error for malformed backend menus (non-array), with fallbacks.
   - Console.warn for missing/invalid icons, empty menus, invalid modulesManager/entries/rights.
   - Permissions hide as feature (no render if !rights match).

## Menu Building Process Diagram

```mermaid
flowchart TD
    A[Config Load: GraphQL fetches moduleConfigurations] --> B[Module Load: loadModules initializes modules]
    B --> C[getMenus: Fetch backend configs or fallback to menuEntries]
    C --> D[Set contributionKey to id if missing]
    D --> E[Sort by position]
    E --> F[For each config: prepareMenuEntries]
    F --> G[Filter by rights/route, resolve icons]
    G --> H[Skip empty, render MainMenuContribution]
    H --> I[fetchSubmenuConfig: Merge backend submenus with allEntries]
    I --> J[Filter/unique/sort subentries]
    J --> K[Render AppBar (Popper) or Drawer (Accordion)]
```

## Key Components

- **MainMenuBar.jsx**: Top-level merger/renderer; getMenus fetches configs, sets defaults, sorts, prepares entries, resolves icons, renders MainMenuContribution. Uses useMemo for optimization. 
    possible customisation of the bar menu text, icon_text or icon 
      @/../frontend-packages/CoreModule/src/components/MainMenuBar.jsx
    ```
      const mainMenuVariant = "icon_text"

    ```
- **MainMenuContribution.jsx**: Per-menu renderer; fetchSubmenuConfig merges backend overrides with module entries, uniques/sorts/filters. appBarMenu uses Popper/MenuList, drawerMenu uses Accordion/List. State manages expanded/anchor.
- **prepareMenuEntries (helpers/utils.jsx)**: Pulls sub-entries from contributionKey or direct entries, filters by rights/route, resolves icons/text/routes, sorts by position, and keeps group nodes (see [Entry Groups](#entry-groups-level-15)) as a level between the menu and its leaves.
- **buildMenuItems (helpers/utils.jsx)**: Expands prepared entries into the flat render list used by both menu variants, inserting the group title separator and its closing separator.
- **Contributions**: Injects MainMenuBar into layout (e.g., <Contributions contributionKey="core.MainMenu" /> in AppBar).


### Recommended JSON Configuration

Configure backend menus via solution-builder. Set top-level id to the contributionKey (defaults to id if not specified). Include submenus for overrides on position/icon/rights. Position defaults to 99.

Example for overriding Client Registry menu:

```json
{
  "position": 1,
  "id": "insuree.MainMenu",  // Serves as contributionKey to pull submenus
  "text": "Client Registry",
  "icon": "AssignmentInd",
  "submenus": [  // Overrides for position/icon/rights
    {
      "position": 1,
      "id": "insuree.familiesOrGroups",
      "icon": "People",
      "rights": [101001],
      "text": "family or Group", 
    },
    {
      "position": 2,
      "id": "insuree.addFamilyOrGroup",
      "icon": "GroupAdd",
      "rights": [101002]
    },
    {
      "position": 3,
      "id": "insuree.insurees",
      "icon": "Person",
      "rights": [101101]
    }
    // ... other submenus
  ]
}
```

For new custom top-level menus, add "entries": [{id, route, text, icon, rights}] array.

### Entry Groups (level 1.5)

Between a main menu and its entries, an optional **group** level organizes leaves visually.
A group is an entry that has children but no route of its own:

```json
{
  "position": 1,
  "id": "insuree.MainMenu",
  "text": "Client Registry",
  "icon": "AssignmentInd",
  "submenus": [
    {
      "type": "group",
      "id": "insuree.group.registration",
      "text": "insuree.menu.group.registration",
      "position": 1,
      "entries": [
        { "id": "insuree.familiesOrGroups", "position": 1, "icon": "People" },
        { "id": "insuree.addFamilyOrGroup", "position": 2, "icon": "GroupAdd" }
      ]
    },
    {
      "type": "group",
      "id": "insuree.group.individuals",
      "text": "insuree.menu.group.individuals",
      "position": 2,
      "entries": [
        { "id": "insuree.insurees", "position": 1, "icon": "Person" }
      ]
    },
    { "id": "insuree.policies", "position": 3 }
  ]
}
```

Rules:

- **Shape**: `type: "group"` is optional — any item with an `entries` array and no `route` is treated as a group. Group fields: `id`, `text` (i18n key, translated like any menu text), `position`, optional `rights`, `entries`.
- **Rendering**: a group opens with a separator carrying the group title, and closes with a plain separator — omitted when the group is the last item or is immediately followed by another group (consecutive groups share the boundary). Applies to both the drawer (Accordion) and the AppBar (Popper) variants.
- **Ordering**: groups and ungrouped entries are sorted together by `position` at the menu level (default 99); entries inside a group are sorted among themselves. Grouped and ungrouped entries can be mixed freely in one menu.
- **Rights**: entries are filtered as usual; a group whose entries are all filtered out disappears with its separators. A group may also carry its own `rights` to hide the whole block.
- **Nesting**: only one group level is rendered. A group nested inside a group is flattened into its parent (no level 1.75).
- **Contributions**: modules can contribute group objects in their `<module>.MainMenu` contribution arrays exactly like leaf entries — the same shape works from code and from the backend `fe-core.menus` config.

Helpers exported by `@openimis/fe-core`: `isMenuGroup(entry)`, `flattenMenuLeaves(entries)` (leaves only, used e.g. for active-route detection) and `buildMenuItems(entries)` (flat render list of `{kind: "entry"|"groupHeader"|"groupFooter"}`).

This merges with module configs, applies overrides, and renders menus. Regenerate backend config and restart frontend.

## AppBar Contributions

In addition to menus, the AppBar supports contribution-driven components for custom UI elements like search inputs and icon buttons.

### Current AppBar Contribution Keys

- **core.AppBar**: Used for components rendered in the AppBar's middle section (e.g., search inputs). Contributions are arrays of React components. Example: Enquiry component from InsureeModule.

- **core.AppBarIcons**: New contribution key for clickable icon buttons next to the search input. Contributions are arrays of AppBarIconButton components, each with {icon, route, text} props. Icons use GetIconComponent, routes navigate via history.push, text is translated via formatMessage for hover tooltips. Example: Home and People icons from InsureeModule.

### Usage

Modules can contribute to these keys in their index.jsx:

```javascript
"core.AppBar": [Enquiry],
"core.AppBarIcons": [
  { icon: "Home", route: "/", text: "core.appName" },
  { icon: "People", route: "/insuree/families", text: "insuree.menu.familiesOrGroups" },
],
```
```json
"core.AppBarIcons": [
  { "icon": "Home", "route": "/", "text": "core.appName" },
  { "icon": "People", "route": "/insuree/families", "text": "insuree.menu.familiesOrGroups" },
],
```
These are rendered in RequireAuth.jsx as Contributions, placing icons adjacent to the search input for quick navigation.
