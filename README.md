# Docket ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

A small, mobile-friendly kanban to-do app. Drag tasks between columns, set a priority, and track status with a stamp-style badge. It is a single HTML file with no build step and no dependencies.

## Features

- **Four columns:** Backlog, To do, Doing and Done, each with a live task count. Backlog cards have a dashed outline.
- **Drag and drop:** grab a task by its grip handle and move it between columns or reorder it within one. It works with mouse, pen and touch.
- **Priority:** Low, Medium or High, shown as signal-style bars plus a text label. Tap the priority chip on a card to cycle it.
- **Status badge:** a rotated stamp in the column's colour (pink, yellow, mint). Tap it to move the task to the next column (Done wraps back to Backlog).
- **Add and delete tasks:** pick a priority and choose whether the new task goes to To do or Backlog.
- **Burndown chart:** tracks tasks remaining (To do plus Doing) across a 7-day sprint against an ideal line, with a note on whether you are ahead or behind. Backlog is not counted. Use Restart sprint to begin a new one.
- **Summary line:** shows how many tasks are open and how many are done.
- **Saved in the browser:** tasks persist between visits using `localStorage`.
- **Light and dark mode:** follows the system theme.

## Layout

| Screen | Behaviour |
| --- | --- |
| Desktop | Four columns side by side |
| Tablet (1000px and narrower) | Two columns per row |
| Phone (760px and narrower) | Columns stacked vertically, no horizontal scrolling |

While dragging, the page scrolls automatically when the pointer is near the top or bottom edge (and sideways when the columns sit in a row).

## Design

The look is inspired by print shop tickets: hard 2px outlines, offset shadows, and one accent colour per status. Type is set in Bricolage Grotesque for headings and badges, and Figtree for body text, both loaded from Google Fonts with system fallbacks.

## Getting started

1. Keep `index.html`, `styles.css` and `app.js` together in one folder.
2. Open `index.html` in a modern browser.

There is nothing to install or compile. To host it, upload the three files to any static host.

## How it works

- **State:** a single `tasks` array of `{ id, title, pri, status }` objects. `pri` is 0 to 2 (Low to High) and `status` is `backlog`, `todo`, `doing` or `done`. A `sprint` object holds the start date and one remaining-task count per sprint day.
- **Rendering:** `render()` rebuilds the board from the array. Task titles are inserted as text, not HTML.
- **Drag and drop:** built on pointer events instead of the HTML5 drag API, which does not work on touch screens. A floating copy of the card follows the pointer while the original is moved through the DOM to show where it will land. On release, the DOM order is read back into the `tasks` array.
- **Burndown:** each change records today's remaining count. Days with no activity carry the previous value forward, and adding tasks mid-sprint shows up as the line rising.
- **Storage:** tasks and sprint data are saved to `localStorage` under the key `docket-v2`. If storage is unavailable, the app still works but will not remember tasks.

## Project structure

```
index.html   # markup and font links
styles.css   # all styling, light and dark themes, responsive rules
app.js       # state, rendering, drag and drop, burndown chart, storage
README.md    # this file
```

## Limitations and ideas

- Task titles cannot be edited after creation (delete and re-add instead).
- Columns are fixed. Reordering or adding columns is not supported.
- The burndown counts tasks, not effort, and the sprint length is fixed at 7 days.
- Data lives only in one browser on one device, with no sync or export.
- Possible additions: story points, custom sprint length, due dates, search and filter by priority, undo for deletes, and keyboard shortcuts for moving tasks.
