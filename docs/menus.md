# openIMIS Frontend Menu System Documentation (Updated)

## Overview

The menu system is contribution-driven, with CoreModule (@openimis/fe-core) providing the base via MainMenuBar.jsx and MainMenuContribution.jsx. Modules contribute top-level via "core.MainMenu" (legacy) or "fe-core.menus" (declarative configs with id, name, icon, position, entries/contributionKey). Backend "fe-core"."menus" overrides organize hierarchy, adding new top-levels if unmatched. Submenus pull from module "{module}.MainMenu" or config "entries", filtered by rights. Rendering uses MUI Accordion/Popper for drawer/appbar variants.

## Flow

1. **Config Load**: GraphQL fetches moduleConfigurations; "fe-core"."menus" parsed into modulesManager.

2. **Module Load**: loadModules initializes modules; contributions collected (e.g., ProfileModule adds "profile.MainMenu" subitems, "core.MainMenu" legacy top-level).

3. **Top-Level Gathering (MainMenuBar.jsx getMenus)**:
   - Collects module "fe-core.menus" (declarative top-level configs: {id, name, icon, position, entries?, contributionKey?}).
   - Merges with backend "fe-core"."menus" via mergeMenuConfigs: backend overrides existing (e.g., position/name), adds new top-levels if id not in modules.
   - Defaults contributionKey to id for all configs (backend/module); override if specified.
   - Sorts by position (default 99 if missing; stable for duplicates).
   - For each config:
     - Entries = config.entries || getContribs(config.contributionKey) (e.g., "individual.MainMenu").
     - Fallback: If no contribs, generates entries from "submenus" array (derives route/text/rights/icons; no rights filter unless submenu.rights specified).
     - Filters by rights (entry.filter(rights) or route rights; generated entries pass if no explicit rights).
     - Converts icon strings to components (Icons[iconName]; defaults to "Adjust" with console.warn if invalid/missing).
     - If empty after filter, skips render.
   - Backward compat: Adds legacy "core.MainMenu" components if no matching declarative id.
   - Renders <MainMenuContribution> for each, with isInitiallyOpen for active menu.

4. **Submenu Merging (MainMenuContribution.jsx fetchSubmenuConfig)**:
   - If backend menus present: Maps submenu positions/icons from backend to all module entries (getMenuEntries()), filters by matched id/position, uniques by id, sorts (default 99 for positions).
   - Fallback: If no backend match, uses direct config.entries or contributionKey pulls.
   - If backend empty, uses module entries directly (uniqued/sorted by default position).
   - Icons: Backend overrides module; string to component, defaults to "Adjust" with console.warn if invalid/missing.
   - Filters rights again; empty = no render.

5. **Rendering**:
   - MainMenuBar injects into AppBar/Drawer via Contributions("core.MainMenu" or custom key).
   - MainMenuContribution: Renders header/icon (defaults to "Adjust" if missing), toggles accordion/popper, lists filtered subentries as Link/MenuItem with icons/text (intl translated).
   - Active detection: Highlights based on current path matching entry.route.

6. **Error Handling**:
   - Console.error for malformed backend menus (non-array), with fallbacks.
   - Console.warn for missing/invalid icons, empty menus, invalid modulesManager/entries/rights.
   - Permissions hide as feature (no render if !rights match).

## Key Components

- **MainMenuBar.jsx**: Top-level merger/renderer; getMenus/mergeMenuConfigs handle declarative + legacy.
- **MainMenuContribution.jsx**: Per-menu renderer; fetchSubmenuConfig merges submenus, appBarMenu/drawerMenu for variants.
- **Contributions**: Injects MainMenuBar into layout (e.g., <Contributions contributionKey="core.MainMenu" /> in AppBar).

## Potential Issues (Updated with Code Insights)

- **New Top-Level Creation**: Backend adds unmatched ids, but requires "entries" array or contributionKey (now defaults to id) for submenus; without, filteredEntries empty → no render. Your JSON has submenus by id/position, but no "entries" or key—mismatch causes skip.
- **Position Defaults**: Code uses 99, not 0; duplicates sort stably (no block). Customize in merge if needed.
- **Icon Defaults**: "Adjust" if invalid/missing; console.warn added.
- **Permission Hiding**: Feature—subentries filter if !rights; top-level shows if any sub visible.
- **Malformed Menus**: Console.error for non-arrays; fallback to modules.
- **Id Mismatches**: Backend submenus map to allEntries by id; if no match (e.g., "individual.groups" not in any module.MainMenu), empty.
- **Empty Backend**: Falls to module "fe-core.menus" or legacy; if none, no menus.
- **Legacy Skip**: getMenuEntries skips "core.MainMenu", but MainMenuBar includes unmatched legacy—your JSON overrides may hide them if ids conflict.
- **No Submenu for New Menus**: Backend top-level without contributionKey/entries = empty render.

Your JSON structure is close but needs ids set to contribution keys (e.g., "ClientRegistryMainMenu" → "individual.MainMenu"), remove "contributionKey" field. This explains no show: submenus defined by id but not pulled/matched.

### Recommended JSON Update (Minimal, with Overrides)

Update via solution-builder to set top-level ids to contribution keys, include rights/icons for overrides, position defaults to 99 if missing. Example for ClientRegistryMainMenu:

```json
{
  "position": 1,
  "id": "individual.MainMenu",  // Now serves as contributionKey to pull submenus
  "name": "Client Registry",
  "icon": "GroupsIcon",
  "description": "Client Registry menu",
  "submenus": [  // Overrides for position/icon/rights
    {
      "position": 4,
      "id": "individual.groups",
      "icon": "GroupIcon",
      "rights": ["individual.groups"]  // Override module rights
    }
    // ... other submenus
  ]
}
```

For new/unmatched top-level (e.g., custom), add "entries": [{id, route, text, icon, rights}] array.

This will create/render new menus, merge submenus, apply overrides. Regenerate backend, restart frontend.
