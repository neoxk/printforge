### Minimal useDroppable Setup

Source: https://dndkit.com/vue/composables/use-droppable

This example demonstrates the essential setup for `useDroppable`, requiring a unique `id` and an `element` template ref to designate a droppable region.

```vue
<script setup>
import {ref} from 'vue';
import {useDroppable} from '@dnd-kit/vue';

const element = ref(null);
const {isDropTarget} = useDroppable({id: 'my-droppable', element});
</script>

<template>
  <div ref="element" :data-highlight="isDropTarget">
    Drop here
  </div>
</template>
```

--------------------------------

### Install @dnd-kit/solid

Source: https://dndkit.com/solid/quickstart

Install the `@dnd-kit/solid` package using your preferred package manager.

```bash
npm install @dnd-kit/solid
```

```bash
yarn add @dnd-kit/solid
```

```bash
pnpm add @dnd-kit/solid
```

```bash
bun add @dnd-kit/solid
```

--------------------------------

### Install @dnd-kit/react package

Source: https://dndkit.com/react/quickstart

Install the @dnd-kit/react package using your preferred package manager. Choose one of the four options based on your project setup.

```bash
npm install @dnd-kit/react
```

```bash
yarn add @dnd-kit/react
```

```bash
pnpm add @dnd-kit/react
```

```bash
bun add @dnd-kit/react
```

--------------------------------

### Droppable Class - Basic Setup

Source: https://dndkit.com/concepts/droppable

Initialize a Droppable instance to create a drop target. This example demonstrates creating a basic droppable element and listening for drop events through the DragDropManager.

```APIDOC
## Droppable Class - Basic Setup

### Description
Creates a drop target that can receive draggable elements. Requires a DragDropManager instance to manage drag and drop operations.

### Constructor
```js
new Droppable(config, manager)
```

### Parameters
#### Constructor Arguments
- **config** (object) - Required - Configuration object for the droppable target
  - **id** (string | number) - Required - Unique identifier for this droppable target
  - **element** (Element) - Required - DOM element to make droppable
- **manager** (DragDropManager) - Required - The drag and drop manager instance

### Usage Example
```js
import {Droppable, DragDropManager} from '@dnd-kit/dom';

const manager = new DragDropManager();

const element = document.createElement('div');
element.classList.add('droppable');

// Create a droppable target
const droppable = new Droppable({
  id: 'drop-zone',
  element
}, manager);

document.body.appendChild(element);

// Listen for drop events
manager.monitor.addEventListener('dragend', (event) => {
  if (event.operation.target?.id === droppable.id) {
    console.log('Item dropped!', event.operation.source);
  }
});
```
```

--------------------------------

### Basic Draggable Element Setup with @dnd-kit/dom

Source: https://dndkit.com/concepts/draggable

This example shows how to initialize a Draggable instance and integrate it into a basic application structure. It includes the main application logic and the entry point for the sandbox.

```javascript
import {Draggable, DragDropManager} from '@dnd-kit/dom';

export function App() {
  const manager = new DragDropManager();

  const element = document.createElement('button');
  element.innerText = 'draggable';
  element.classList.add('btn');

  const draggable = new Draggable({
    id: 'draggable-1', // Required - must be unique
    element,
  }, manager);

  document.body.appendChild(element);
}
```

```javascript
import './styles.css';
import {App} from './draggable.js';

App();
```

--------------------------------

### Complete Draggable Application Example

Source: https://dndkit.com/quickstart

A full example demonstrating how to initialize the DragDropManager and mount a draggable element to the DOM.

```javascript
import {Draggable, DragDropManager} from '@dnd-kit/dom';

function createDraggable(manager) {
  // Create a DOM element (or use an existing one)
  const element = document.createElement('button');
  element.innerText = 'draggable';
  element.classList.add('btn');

  // Make the element draggable
  return new Draggable({id: 'draggable-button', element}, manager);
}

export default function App() {
  // Create a manager to coordinate drag and drop
  const manager = new DragDropManager();

  // Create a draggable element
  const draggable = createDraggable(manager);

  // Add the draggable element to the DOM
  document.body.append(draggable.element);
}
```

--------------------------------

### INSTALL @dnd-kit/dom

Source: https://dndkit.com/quickstart

Install the @dnd-kit/dom package using various package managers.

```APIDOC
## INSTALL @dnd-kit/dom

### Description
Install the @dnd-kit/dom library to your project.

### Method
CLI

### Endpoint
@dnd-kit/dom

### Request Example
npm install @dnd-kit/dom
```

--------------------------------

### Install @dnd-kit/vue with npm, yarn, pnpm, or bun

Source: https://dndkit.com/vue/quickstart

Multiple package manager options for installing @dnd-kit/vue in your project.

```bash
npm install @dnd-kit/vue
```

```bash
yarn add @dnd-kit/vue
```

```bash
pnpm add @dnd-kit/vue
```

```bash
bun add @dnd-kit/vue
```

--------------------------------

### Basic App Integration of Draggable and Droppable

Source: https://dndkit.com/quickstart

This example demonstrates the initial setup of an application with a `DragDropManager`, creating both draggable and droppable elements, and appending them to the DOM without any drag event handling.

```javascript
import {DragDropManager} from '@dnd-kit/dom';

import {createDraggable} from './Draggable.js';
import {createDroppable} from './Droppable.js';

export default function App() {
  const manager = new DragDropManager();
  const app = document.getElementById('app');

  const draggable = createDraggable(manager);
  const droppable = createDroppable(manager);

  app.append(draggable.element, droppable.element);
}
```

```javascript
import './styles.css';
import App from './App.js';

App();
```

--------------------------------

### Install @dnd-kit/dom

Source: https://dndkit.com/quickstart

Add the @dnd-kit/dom package to your project using your preferred package manager.

```bash
npm install @dnd-kit/dom
```

```bash
yarn add @dnd-kit/dom
```

```bash
pnpm add @dnd-kit/dom
```

```bash
bun add @dnd-kit/dom
```

--------------------------------

### Replacing All Default Plugins in DragDropProvider

Source: https://dndkit.com/solid/components/drag-drop-provider

This example demonstrates how to completely replace the default plugins with a custom array of plugins.

```javascript
plugins={[MyPlugin]}
```

--------------------------------

### Basic Draggable Element Setup with useDraggable (Solid)

Source: https://dndkit.com/solid/hooks/use-draggable

Demonstrates the fundamental setup for a draggable element using `useDraggable` and wrapping it with `DragDropProvider` in Solid. It assigns a unique ID to the draggable.

```javascript
import {DragDropProvider, useDraggable} from '@dnd-kit/solid';
import './styles.css';
  
function Draggable() {
const {ref} = useDraggable({id: 'draggable'});
  
return <button ref={ref} class="btn">draggable</button>;
}
  
export default function App() {
return (
<DragDropProvider>
<Draggable />
</DragDropProvider>
);
}
```

--------------------------------

### Install @dnd-kit/svelte

Source: https://dndkit.com/svelte/quickstart

Install the @dnd-kit/svelte package using your preferred package manager. This package requires Svelte 5.29 or later.

```bash
npm install @dnd-kit/svelte
```

```bash
yarn add @dnd-kit/svelte
```

```bash
pnpm add @dnd-kit/svelte
```

```bash
bun add @dnd-kit/svelte
```

--------------------------------

### Basic createDraggable setup with DragDropProvider

Source: https://dndkit.com/svelte/primitives/create-draggable

Import createDraggable and DragDropProvider, then create a draggable instance with a unique id and attach it to a button element using the {@attach} directive.

```svelte
<script>
import {DragDropProvider, createDraggable} from '@dnd-kit/svelte';
import './styles.css';
</script>
  

<DragDropProvider>
{@const draggable = createDraggable({id: 'draggable'})}
<button {@attach draggable.attach} class="btn">
draggable
</button>
</DragDropProvider>
```

--------------------------------

### Adding a Plugin to DragDropProvider Defaults

Source: https://dndkit.com/solid/components/drag-drop-provider

This example shows how to extend the default plugins by adding a custom plugin alongside them using a function.

```javascript
plugins={(defaults) => [...defaults, MyPlugin]}
```

--------------------------------

### Basic useSortable Hook Setup with move Helper

Source: https://dndkit.com/solid/hooks/use-sortable

Create a sortable list using useSortable with the move helper for automatic state management. Use getter syntax for reactive props to maintain Solid's fine-grained reactivity.

```javascript
import {createSignal, For} from 'solid-js';
import {DragDropProvider} from '@dnd-kit/solid';
import {useSortable} from '@dnd-kit/solid/sortable';
import {move} from '@dnd-kit/helpers';
import './styles.css';
  

function SortableItem(props) {
const {ref} = useSortable({
get id() { return props.id; },
get index() { return props.index; },
});
  

return <li ref={ref} class="item">Item {props.id}</li>;
}
  

export default function App() {
const [items, setItems] = createSignal([1, 2, 3, 4]);
  

return (
<DragDropProvider
onDragEnd={(event) => {
setItems((items) => move(items, event));
}}
>
<ul class="list">
<For each={items()}>
```

--------------------------------

### Basic useDraggable implementation

Source: https://dndkit.com/vue/composables/use-draggable

Initial setup for making an element draggable using `useDraggable` with a template ref.

```vue
<script setup>
import { ref } from 'vue';
import { useDraggable } from '@dnd-kit/vue';
  

const element = ref(null);
useDraggable({ id: 'draggable', element });
</script>
  

<template>
<button ref="element" class="btn">draggable</button>
</template>
```

--------------------------------

### Basic DragOverlay Setup in Svelte

Source: https://dndkit.com/svelte/components/drag-overlay

Import DragOverlay and place it inside a DragDropProvider. The children snippet renders only during active drag operations.

```svelte
<script>
  import {DragDropProvider, DragOverlay, createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'my-item'});
</script>

<DragDropProvider>
  <button {@attach draggable.attach}>draggable</button>
  <DragOverlay>
    {#snippet children(source)}
      <div>I will be rendered while dragging...</div>
    {/snippet}
  </DragOverlay>
</DragDropProvider>
```

--------------------------------

### PointerSensor.configure(options)

Source: https://dndkit.com/extend/sensors/pointer-sensor

Configures the Pointer Sensor with activation constraints to define when a drag operation should start based on pointer movement or delay.

```APIDOC
## PointerSensor.configure(options)

### Description
Configures the Pointer Sensor to detect pointer events and initiate drag and drop operations. The primary configuration is done via the `activationConstraints` option, which defines the conditions under which a drag operation will start.

### Method
N/A (This is a JavaScript class configuration)

### Endpoint
N/A (This is a JavaScript class configuration)

### Parameters
#### Request Body (Configuration Object)
- **options** (object) - Required - Configuration object for the PointerSensor.
  - **activationConstraints** (ActivationConstraints<PointerEvent> | (event: PointerEvent, source: Draggable) => ActivationConstraints<PointerEvent>) - Optional - Defines when dragging should start.
    - **Type 1: Array of Constraint Instances**
      - `ActivationConstraints<E extends Event>`: An array of `ActivationConstraint<E>` instances.
        - **PointerActivationConstraints.Distance** (object) - Activates dragging after the pointer moves a certain distance.
          - **value** (number) - Required - The required distance in pixels the pointer must move to activate dragging.
          - **tolerance** (number | {x?: number; y?: number}) - Optional - A movement threshold in pixels. If exceeded, the activation is aborted.
        - **PointerActivationConstraints.Delay** (object) - Activates dragging after holding the pointer for a specified duration.
          - **value** (number) - Required - The required hold duration in milliseconds.
          - **tolerance** (number | {x?: number; y?: number}) - Required - The maximum movement tolerance in pixels during the delay period before activation is aborted.
    - **Type 2: Function**
      - `(event: PointerEvent, source: Draggable) => ActivationConstraints<PointerEvent>`: A function that returns an array of constraint instances based on the `PointerEvent` and `Draggable` source. This allows for dynamic constraint application.

### Request Example
```javascript
import {DragDropManager} from '@dnd-kit/dom';
import {PointerSensor, PointerActivationConstraints} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: [
    PointerSensor.configure({
      activationConstraints: [
        // Start dragging after moving 5px
        new PointerActivationConstraints.Distance({value: 5}),
        // Or after holding for 200ms with 10px tolerance
        new PointerActivationConstraints.Delay({value: 200, tolerance: 10}),
      ],
    }),
  ],
});

// Example with a function for dynamic constraints
PointerSensor.configure({
  activationConstraints(event, source) {
    const {pointerType, target} = event;

    switch (pointerType) {
      case 'mouse':
        return [
          new PointerActivationConstraints.Distance({value: 5}),
        ];
      case 'touch':
        return [
          new PointerActivationConstraints.Delay({value: 250, tolerance: 5}),
        ];
      default:
        return [
          new PointerActivationConstraints.Delay({value: 200, tolerance: 10}),
          new PointerActivationConstraints.Distance({value: 5}),
        ];
    }
  },
});
```

### Response
N/A (This method configures the sensor and does not return a direct response.)
```

--------------------------------

### Configuring DragDropProvider Plugins

Source: https://dndkit.com/svelte/components/drag-drop-provider

The plugins prop accepts an array of plugins or a function to extend default plugins. This example shows how to add a custom plugin or replace the default set.

```javascript
plugins={(defaults) => [...defaults, MyPlugin]}
```

```javascript
plugins={[MyPlugin]}
```

--------------------------------

### Configure Pointer Sensor with Activation Constraints

Source: https://dndkit.com/extend/sensors/pointer-sensor

Initialize the DragDropManager with a PointerSensor, applying both Distance and Delay activation constraints to define when a drag operation should start.

```javascript
import {DragDropManager} from '@dnd-kit/dom';
import {PointerSensor, PointerActivationConstraints} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: [
    PointerSensor.configure({
      activationConstraints: [
        // Start dragging after moving 5px
        new PointerActivationConstraints.Distance({value: 5}),
        // Or after holding for 200ms with 10px tolerance
        new PointerActivationConstraints.Delay({value: 200, tolerance: 10}),
      ],
    }),
  ],
});
```

--------------------------------

### Basic DragOverlay Setup with Vue

Source: https://dndkit.com/vue/components/drag-overlay

Import DragOverlay and place it inside DragDropProvider with draggable elements. The overlay content renders only when a drag operation is active.

```vue
<script setup>
import {ref} from 'vue';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/vue';

const element = ref(null);
useDraggable({id: 'my-item', element});
</script>

<template>
  <DragDropProvider>
    <button ref="element">Drag me</button>
    <DragOverlay>
      <div>I will be rendered while dragging...</div>
    </DragOverlay>
  </DragDropProvider>
</template>
```

--------------------------------

### Initial App Component Setup for Multiple Sortable Lists (React)

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This snippet sets up the main `App` component, defining the initial state for items across different columns. It renders the `Column` and `Item` components to display the lists.

```javascript
import React, {useState} from 'react';
import {Column} from './Column.js';
import {Item} from './Item.js';
import './styles.css';
  

export default function App() {
const [items] = useState({
A: ['A0', 'A1', 'A2'],
B: ['B0', 'B1'],
C: [],
});
  

return (
<div className="Root">
{Object.entries(items).map(([column, items]) => (
<Column key={column} id={column}>
{items.map((id, index) => (
<Item key={id} id={id} index={index} column={column} />
))}
</Column>
))}
</div>
);
}
```

--------------------------------

### Create droppable target with useDroppable

Source: https://dndkit.com/react/hooks/use-droppable

Basic example showing how to set up a droppable component using the useDroppable hook. The hook returns a ref to attach to the target element and an isDropTarget boolean to conditionally style the element.

```JavaScript
import {useDroppable} from '@dnd-kit/react';
  

export function Droppable({children}) {
const {isDropTarget, ref} = useDroppable({id: 'droppable'});
  

return (
<div ref={ref} className={isDropTarget ? "droppable active" : "droppable"}>
{children}
</div>
);
}
```

```JavaScript
import {useDroppable} from '@dnd-kit/react';

function Droppable(props) {
  const {isDropTarget, ref} = useDroppable({
    id: props.id,
  });

  return (
    <div ref={ref}>
      {isDropTarget ? 'Draggable element is over me' : 'Drag something over me'}
    </div>
  );
}
```

--------------------------------

### App Integration with Drag and Drop Event Handling

Source: https://dndkit.com/quickstart

This example extends the basic integration by adding a `dragend` event listener to the `DragDropManager`. It handles moving the draggable element to the droppable target upon a successful drop, or returning it if dropped elsewhere.

```javascript
import {DragDropManager} from '@dnd-kit/dom';

import {createDraggable} from './Draggable.js';
import {createDroppable} from './Droppable.js';

export default function App() {
  const manager = new DragDropManager();
  const app = document.getElementById('app');

  const draggable = createDraggable(manager);
  const droppable = createDroppable(manager);

  manager.monitor.addEventListener('dragend', (event) => {
    const {operation, canceled} = event;
    const {source, target} = operation;

    // Skip if drag operation was canceled (e.g. if escape key was pressed)
    if (canceled) return;

    // Move element to drop target if dropped on droppable
    if (target && target.id === droppable.id) {
      droppable.element.append(source.element);
    } else {
      app.prepend(source.element);
    }
  });

  app.append(draggable.element, droppable.element);
}
```

```javascript
import './styles.css';
import App from './App.js';

App();
```

--------------------------------

### Create custom sensor by extending Sensor class

Source: https://dndkit.com/extend/sensors

Implement a custom sensor by extending the Sensor base class and implementing the bind method to register event listeners. The example shows a CustomSensor that listens for 'customstart' events.

```TypeScript
import {Sensor} from '@dnd-kit/abstract';

interface CustomSensorOptions {
  delay?: number;
}

class CustomSensor extends Sensor {
  constructor(manager, options?: CustomSensorOptions) {
    super(manager, options);
  }

  public bind(source) {
    // Register event listeners
    const unbind = this.registerEffect(() => {
      const target = source.handle ?? source.element;

      if (!target) return;

      const handleStart = (event) => {
        if (this.disabled) return;

        this.manager.actions.setDragSource(source.id);
        this.manager.actions.start({
          event,
          coordinates: getCoordinates(event)
        });
      };

      target.addEventListener('customstart', handleStart);

      return () => {
        target.removeEventListener('customstart', handleStart);
      };
    });

    return unbind;
  }
}
```

--------------------------------

### Handle multiple droppable targets

Source: https://dndkit.com/react/quickstart

Extend the basic example to support multiple drop targets. Track which target received the dragged item and conditionally render the draggable element in the appropriate droppable.

```jsx
import React, {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';

import {Droppable} from './Droppable';
import {Draggable} from './Draggable';

function App() {
  const targets = ['A', 'B', 'C'];
  const [target, setTarget] = useState();
  const draggable = (
    <Draggable id="draggable">Drag me</Draggable>
  );

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        setTarget(event.operation.target?.id);
      }}
    >
      {!target ? draggable : null}

      {targets.map((id) => (
        <Droppable key={id} id={id}>
          {target === id ? draggable : `Droppable ${id}`}
        </Droppable>
      ))}
    </DragDropProvider>
  );
};
```

--------------------------------

### Customizing Draggable Feedback with Plugins

Source: https://dndkit.com/concepts/draggable

Configure visual feedback during dragging using the Feedback plugin. This example sets the feedback to 'clone', creating a copy of the element while the original moves.

```javascript
import {Draggable, DragDropManager, Feedback} from '@dnd-kit/dom';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  plugins: [Feedback.configure({ feedback: 'clone' })],
}, manager);
```

--------------------------------

### Basic useDraggable Hook Setup

Source: https://dndkit.com/react/hooks/use-draggable

Create a draggable button element using the useDraggable hook. Requires a unique id and returns a ref to attach to the element.

```JavaScript
import {useDraggable} from '@dnd-kit/react';
  

export function Draggable(props) {
const {ref} = useDraggable({
id: props.id,
});
  

return <button ref={ref} className="btn">draggable</button>;
}
```

--------------------------------

### Basic useSortable Hook Setup

Source: https://dndkit.com/react/hooks/use-sortable

Create a sortable list item component using useSortable with required id and index parameters. The hook returns a ref that must be attached to the element you want to make sortable.

```JavaScript
import {useSortable} from '@dnd-kit/react/sortable';
  

function Sortable({id, index}) {
const {ref} = useSortable({id, index});
  

return (
<li ref={ref} className="item">Item {id}</li>
);
}
  

export default function App() {
const items = [1, 2, 3, 4];
  

return (
<ul className="list">
{items.map((id, index) =>
<Sortable key={id} id={id} index={index} />
)}
</ul>
);
}
```

--------------------------------

### Multiple Lists with Manual State Management in React

Source: https://dndkit.com/react/guides/sortable-state-management

Complete example showing how to manage multiple sortable lists with cross-list drag-and-drop. Uses initialGroup and group to detect whether an item stayed in the same list or moved to a different one. Save a snapshot in onDragStart to enable cancellation support.

```jsx
import {useState, useRef} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable, isSortable} from '@dnd-kit/react/sortable';

function SortableItem({id, index, column}) {
  const {ref} = useSortable({
    id,
    index,
    group: column,
    type: 'item',
    accept: 'item',
  });

  return <li ref={ref}>{id}</li>;
}

export default function App() {
  const [items, setItems] = useState({
    A: ['A1', 'A2', 'A3'],
    B: ['B1', 'B2'],
    C: [],
  });
  const snapshot = useRef(structuredClone(items));

  return (
    <DragDropProvider
      onDragStart={() => {
        snapshot.current = structuredClone(items);
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
          return;
        }

        const {source} = event.operation;

        if (isSortable(source)) {
          const {initialIndex, index, initialGroup, group} = source;

          if (initialGroup == null || group == null) return;

          setItems((items) => {
            if (initialGroup === group) {
              // Same group: reorder within the list
              const groupItems = [...items[group]];
              const [removed] = groupItems.splice(initialIndex, 1);
              groupItems.splice(index, 0, removed);
              return {...items, [group]: groupItems};
            }

            // Cross-group transfer
            const sourceItems = [...items[initialGroup]];
            const [removed] = sourceItems.splice(initialIndex, 1);
            const targetItems = [...items[group]];
            targetItems.splice(index, 0, removed);
            return {
              ...items,
              [initialGroup]: sourceItems,
              [group]: targetItems,
            };
          });
        }
      }}
    >
      {Object.entries(items).map(([column, columnItems]) => (
        <ul key={column}>
          {columnItems.map((id, index) => (
            <SortableItem key={id} id={id} index={index} column={column} />
          ))}
        </ul>
      ))}
    </DragDropProvider>
  );
}
```

--------------------------------

### Render Dynamic Drag Overlay with Source Data in dnd-kit

Source: https://dndkit.com/react/hooks/use-draggable

This example demonstrates passing a function as a child to `<DragOverlay>` to dynamically render content based on the `source` (the dragged item's data), useful for displaying information like the dragged item's ID.

```javascript
import {useDraggable, DragOverlay} from '@dnd-kit/react';

function App(props) {
  return (
    <DragDropProvider>
      <Draggable id="foo" />
      <Draggable id="bar" />
      <DragOverlay>
        {source => (
          <div>
            Dragging {source.id}
          </div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
```

--------------------------------

### Extend default sensors with PointerSensor configuration

Source: https://dndkit.com/extend/sensors

Use the function form to add or configure sensors while preserving defaults. This example adds a Distance activation constraint to PointerSensor.

```TypeScript
import {DragDropManager} from '@dnd-kit/dom';
import {PointerSensor, PointerActivationConstraints} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: (defaults) => [
    ...defaults,
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({value: 5}),
      ],
    }),
  ],
});
```

--------------------------------

### Replace DragDropManager Defaults with dnd-kit

Source: https://dndkit.com/concepts/drag-drop-manager

Provide an array to completely override the default sensors, plugins, or modifiers. This is useful for a full custom setup.

```js
import {
  DragDropManager,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: [
    PointerSensor,  // Handles mouse and touch
    KeyboardSensor, // Enables keyboard navigation
  ],

  plugins: [
    AutoScroller,   // Automatic scrolling during drag
    Accessibility,  // ARIA attributes management
  ],

  modifiers: [
    RestrictToWindow, // Keeps dragged items within window bounds
  ],
});
```

--------------------------------

### Accessing drag state with useDraggable

Source: https://dndkit.com/vue/composables/use-draggable

Demonstrates how to use `useDraggable` to get the `isDragging` state and apply it to the element.

```vue
<script setup>
import {ref} from 'vue';
import {useDraggable} from '@dnd-kit/vue';

const element = ref(null);
const {isDragging} = useDraggable({id: 'my-draggable', element});
</script>

<template>
  <button ref="element" :data-dragging="isDragging">
    Drag me
  </button>
</template>
```

--------------------------------

### Replace default sensors with custom array

Source: https://dndkit.com/extend/sensors

Pass an array to fully replace default sensors. This example configures PointerSensor with Distance and Delay constraints, and adds KeyboardSensor.

```TypeScript
import {DragDropManager} from '@dnd-kit/dom';
import {
  PointerSensor,
  PointerActivationConstraints,
  KeyboardSensor
} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({value: 5}),
        new PointerActivationConstraints.Delay({
          value: 200,
          tolerance: {x: 10, y: 5},
        }),
      ]
    }),
    KeyboardSensor,
  ]
});
```

--------------------------------

### Default Keyboard Sensor Key Bindings

Source: https://dndkit.com/extend/sensors/keyboard-sensor

View the predefined `keyboardCodes` that the Keyboard sensor uses by default. These bindings control starting, canceling, ending, and directional movement.

```javascript
const defaultKeyboardCodes = {
  start: ['Space', 'Enter'],    // Start dragging
  cancel: ['Escape'],           // Cancel drag operation
  end: ['Space', 'Enter'],      // End dragging
  up: ['ArrowUp'],             // Move up
  down: ['ArrowDown'],         // Move down
  left: ['ArrowLeft'],         // Move left
  right: ['ArrowRight'],       // Move right
};
```

--------------------------------

### Observe DragDropManager Events with dnd-kit

Source: https://dndkit.com/concepts/drag-drop-manager

Attach event listeners to the manager's monitor to react to various drag and drop lifecycle events like start, move, collision, and end.

```js
// Observe drag start
manager.monitor.addEventListener('beforedragstart', (event) => {
  // Optionally prevent dragging
  if (shouldPreventDrag(event.operation.source)) {
    event.preventDefault();
  }
});

// Track movement
manager.monitor.addEventListener('dragmove', (event) => {
  const {source, position} = event.operation;
  console.log(`Dragging ${source.id} to ${position.current}`);
});

// Detect collisions
manager.monitor.addEventListener('collision', (event) => {
  const [firstCollision] = event.collisions;
  if (firstCollision) {
    console.log(`Colliding with ${firstCollision.id}`);
  }
});

// Listen for when dragging ends
manager.monitor.addEventListener('dragend', (event) => {
  const {source, target, canceled} = event.operation;
  if (!canceled && target) {
    console.log(`Dropped ${source.id} onto ${target.id}`);
  }
});
```

--------------------------------

### Configure sensors on individual draggable elements

Source: https://dndkit.com/extend/sensors

Local sensors configured on draggable elements take precedence over global sensors. This example sets KeyboardSensor only for a specific draggable.

```TypeScript
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  sensors: [KeyboardSensor],
}, manager);
```

--------------------------------

### Restrict Draggable to Container Element with dnd-kit

Source: https://dndkit.com/react/hooks/use-draggable

This example shows how to use the `RestrictToElement` modifier to confine a draggable element's motion within a specified container, such as `document.body`.

```javascript
import {useDraggable} from '@dnd-kit/react';
import {RestrictToElement} from '@dnd-kit/dom/modifiers';

function Draggable({id}) {
  const {ref} = useDraggable({
    id,
    modifiers: [RestrictToElement.configure({element: document.body})],
  });
}
```

--------------------------------

### Handle Canceled Drag Operations in dnd-kit App

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This example shows how to modify the `App` component to handle canceled drag operations by reverting the state of items to their previous order using a `useRef` to store the previous state.

```javascript
import React, {useRef, useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import "./styles.css";

import {Column} from './Column';
import {Item} from './Item';

export function App({style = styles}) {
  const [items, setItems] = useState({
    A: ['A0', 'A1', 'A2'],
    B: ['B0', 'B1'],
    C: [],
  });
  const previousItems = useRef(items);
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(items));

  return (
    <DragDropProvider
      onDragStart={() => {
        previousItems.current = items;
      }}
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (source?.type === 'column') return;

        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        const {source, target} = event.operation;

        if (event.canceled) {
          if (source.type === 'item') {
            setItems(previousItems.current);
          }

          return;
        }

        if (source.type === 'column') {
          setColumnOrder((columns) => move(columns, event));
        }
      }}
    >
      <div className="Root">
        {columnOrder.map((column, columnIndex) => (
          <Column key={column} id={column} index={columnIndex}>
            {items[column].map((id, index) => (
              <Item key={id} id={id} index={index} column={column} />
            ))}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
}
```

--------------------------------

### React Hook: useDraggable

Source: https://dndkit.com/react/hooks/use-draggable

Documentation for the `useDraggable` React hook, including its arguments, return values, and usage examples. This hook is used to make elements draggable within a dnd-kit context.

```APIDOC
## `useDraggable` Hook

### Description
Use the `useDraggable` hook to make draggable elements that can be dropped over droppable targets. It is a thin wrapper around the Draggable class and accepts all of the same input arguments.

### Hook Name
`useDraggable`

### Arguments
#### Hook Options
- **id** (string | number) - Required - The identifier of the draggable element. Should be unique within the same drag and drop context provider.
- **type** (string | number | Symbol) - Optional - Optionally supply a type to only allow this draggable element to be dropped over droppable targets that accept this `type`.
- **element** (Element | Ref<Element>) - Optional - If you already have a reference to the element, you can pass it to the `element` option instead of using the `ref` that is returned by the `useDraggable` hook to connect the draggable source element.
- **handle** (Element | Ref<Element>) - Optional - If you already have a reference to the drag handle element, you can pass it to the `handle` option instead of using the `handleRef` that is returned by the `useDraggable` hook to connect the drag handle element.
- **disabled** (boolean) - Optional - Set to `true` to prevent the draggable element from being draggable.
- **plugins** (PluginDescriptor[]) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **modifiers** (Modifier[]) - Optional - An array of modifiers that can be used to modify or restrict the behavior of the draggable element.
- **sensors** (Sensors[]) - Optional - An array of sensors that can be bound to the draggable element to detect drag interactions.
- **data** ({[key: string]: any}) - Optional - The data argument is for advanced use-cases where you may need access to additional data about the draggable element in event handlers, modifiers, sensors or custom plugins.
- **effects** (() => Effect[]) - Optional - This is an advanced feature and should not need to be used by most consumers. You can supply a function that returns an array of reactive effects that can be set up and automatically cleaned up when the component invoking the `useDraggable` hook element is unmounted.

### Return Value
#### Hook Return Object
- **ref** (function) - A ref callback function that can be attached to the element that you want to make draggable.
- **handleRef** (function) - A ref callback function that can be attached to an element to create a drag handle.
- **isDraggingSource** (boolean) - A boolean value that indicates whether the draggable is the source of the drag operation that is in progress.
- **isDragging** (boolean) - A boolean value that indicates whether the draggable is currently being dragged.
- **isDropping** (boolean) - A boolean value that indicates whether the draggable is being dropped. This can be used to style the draggable element differently during the drop animation.
- **draggable instance** (object) - The draggable instance that is created by the `useDraggable` hook.

### Usage Example
```javascript
import {useDraggable} from '@dnd-kit/react';

export function Draggable(props) {
  const {ref} = useDraggable({
    id: props.id,
  });

  return <button ref={ref} className="btn">draggable</button>;
}
```

### Usage Example with Drag Handle
```javascript
import {useDraggable} from '@dnd-kit/react';

function Draggable(props) {
  const {ref, handleRef} = useDraggable({
    id: props.id,
  });

  return (
    <div ref={ref}>
      Draggable
      <button ref={handleRef}>Drag handle</button>
    </div>
  );
}
```

### Return Value Example
```json
{
  "ref": "function",
  "handleRef": "function",
  "isDraggingSource": "boolean",
  "isDragging": "boolean",
  "isDropping": "boolean",
  "draggable instance": "object"
}
```
```

--------------------------------

### Declare CSS Cascade Layer Order

Source: https://dndkit.com/extend/plugins/feedback

Explicitly define the dnd-kit layer at the start of your CSS to ensure it has the lowest priority. This is useful when integrating with frameworks like Tailwind CSS v4.

```css
@layer dnd-kit, base, components, utilities;

```

--------------------------------

### Customize Keyboard Sensor Key Bindings

Source: https://dndkit.com/extend/sensors/keyboard-sensor

Override default key bindings for the Keyboard sensor by providing a custom `keyboardCodes` object. This allows remapping actions like start, end, and movement to different keys.

```javascript
KeyboardSensor.configure({
  keyboardCodes: {
    // Use Tab to start/end dragging
    start: ['Tab'],
    end: ['Tab'],

    // Use WASD for movement
    up: ['KeyW'],
    down: ['KeyS'],
    left: ['KeyA'],
    right: ['KeyD'],

    // Additional cancel keys
    cancel: ['Escape', 'KeyQ'],
  },
});
```

--------------------------------

### Sandbox Entry Point

Source: https://dndkit.com/quickstart

The entry point file used to initialize the application within the interactive sandbox environment.

```javascript
import './styles.css';
import App from './app.js';

App();
```

--------------------------------

### Default Screen Reader Instructions

Source: https://dndkit.com/extend/plugins/accessibility

The plugin includes default keyboard navigation instructions that are announced to screen reader users when they focus on a draggable element.

```APIDOC
## Default Screen Reader Instructions

### Description
Default instructions displayed to screen reader users for keyboard navigation.

### Instructions

> To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item in a given direction. Press space again to drop the item in its new position, or press escape to cancel.
```

--------------------------------

### Basic sortable list with move helper

Source: https://dndkit.com/vue/composables/use-sortable

Set up a sortable list using the move helper from @dnd-kit/helpers for automatic state management. Wrap the list in DragDropProvider and use SortableItem for each element.

```vue
<script setup>
import { ref } from 'vue';
import { DragDropProvider } from '@dnd-kit/vue';
import { move } from '@dnd-kit/helpers';
import SortableItem from './SortableItem.vue';
import './styles.css';
  

const items = ref([1, 2, 3, 4]);
  

function onDragEnd(event) {
items.value = move(items.value, event);
}
</script>
  

<template>
<DragDropProvider @dragEnd="onDragEnd">
<ul class="list">
<SortableItem
v-for="(id, index) in items"
:key="id"
:id="id"
:index="index"
/>
</ul>
</DragDropProvider>
</template>
```

--------------------------------

### Configure Cursor plugin in Solid

Source: https://dndkit.com/extend/plugins/cursor

Set up the Cursor plugin with a custom cursor style in a Solid application using DragDropProvider. The plugin configuration is passed to the plugins prop.

```Solid
import {DragDropProvider} from '@dnd-kit/solid';
import {Cursor} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Cursor.configure({ cursor: 'move' }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Plugin Lifecycle

Source: https://dndkit.com/extend/plugins

Overview of the plugin lifecycle stages from construction through cleanup.

```APIDOC
## Plugin Lifecycle

### Description
Plugins follow a defined lifecycle from construction through destruction.

### Lifecycle Stages

1. **Construction**
   - Plugin instance created with manager reference
   - Constructor is called with manager and optional options

2. **Configuration**
   - Options applied if provided
   - Plugin is configured with initial settings

3. **Registration**
   - Plugin registered with manager
   - Plugin becomes active and integrated with DragDropManager

4. **Operation**
   - Plugin effects are run
   - Plugin responds to drag and drop events
   - Custom methods can be invoked

5. **Cleanup**
   - Plugin destroyed when manager is destroyed
   - All registered effects are cleaned up
   - Resources are released
```

--------------------------------

### Basic sortable list with move helper in Svelte

Source: https://dndkit.com/svelte/primitives/create-sortable

Set up a sortable list using createSortable with the move() helper for automatic state management. Pass reactive index values as getter properties to maintain reactivity during reordering. Call move() in onDragOver for live visual sorting and restore snapshot in onDragEnd only when canceled.

```svelte
<script>
import {DragDropProvider} from '@dnd-kit/svelte';
import {createSortable} from '@dnd-kit/svelte/sortable';
import {move} from '@dnd-kit/helpers';
import './styles.css';
  

let items = [1, 2, 3, 4];
let snapshot = [];
  

function onDragStart() {
snapshot = items.slice();
}
  

function onDragOver(event) {
items = move(items, event);
}
  

function onDragEnd(event) {
if (event.canceled) items = snapshot;
}
</script>
  

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
<ul class="list">
{#each items as id, index (id)}
{@const sortable = createSortable({id, get index() { return index; }})}
<li {@attach sortable.attach} class="item">
```

--------------------------------

### Configure Pointer Sensor with Distance Activation Constraint

Source: https://dndkit.com/extend/sensors/pointer-sensor

Set up the PointerSensor to activate dragging only after the pointer moves a specified distance, with an optional tolerance to abort activation if exceeded.

```javascript
import {PointerActivationConstraints} from '@dnd-kit/dom';

PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Distance({
      // Required distance in pixels
      value: 5,
      // Optional tolerance - aborts if exceeded
      tolerance: 10,
    }),
  ],
});
```

--------------------------------

### Basic DragOverlay with static content

Source: https://dndkit.com/solid/components/drag-overlay

Import DragOverlay and place it inside a DragDropProvider. The overlay content renders only when a drag operation is active.

```jsx
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/solid';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return (
    <>
      <button ref={ref}>Draggable</button>
      <DragOverlay>
        <div>I will be rendered while dragging...</div>
      </DragOverlay>
    </>
  );
}
```

--------------------------------

### Configure a Plugin Using the Static `configure` Method (TypeScript)

Source: https://dndkit.com/extend/plugins

Use the static `configure` method on a plugin class to create a pre-configured plugin descriptor before passing it to the manager.

```ts
const configuredPlugin = MyPlugin.configure({
  delay: 500
});

const manager = new DragDropManager({
  plugins: [configuredPlugin]
});
```

--------------------------------

### Creating a Custom Plugin

Source: https://dndkit.com/extend/plugins

Create a custom plugin by extending the Plugin class and implementing custom functionality with event listeners and effects.

```APIDOC
## Creating a Custom Plugin

### Description
Extend the Plugin class to create custom plugins that integrate with @dnd-kit drag and drop operations.

### Method
Class-based plugin creation

### Request Example
```ts
import {Plugin} from '@dnd-kit/abstract';

interface MyPluginOptions {
  delay?: number;
}

class MyPlugin extends Plugin {
  constructor(manager, options?: MyPluginOptions) {
    super(manager, options);

    this.registerEffect(() => {
      const {monitor} = this.manager;

      const cleanup = monitor.addEventListener('dragstart', (event) => {
        console.log('Drag started:', event.operation.source.id);
      });

      return cleanup;
    });
  }

  public customMethod() {
    if (this.disabled) return;
    // Custom functionality
  }
}
```

### Response
Custom plugin class ready to be instantiated or configured with DragDropManager.
```

--------------------------------

### Configure Pointer Sensor with Delay Activation Constraint

Source: https://dndkit.com/extend/sensors/pointer-sensor

Configure the PointerSensor to activate dragging after holding the pointer for a specific duration, allowing for a defined movement tolerance during the delay.

```javascript
import {PointerActivationConstraints} from '@dnd-kit/dom';

PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Delay({
      // Required hold duration in ms
      value: 200,
      // Movement tolerance during delay (in pixels)
      tolerance: 5,
    }),
  ],
});
```

--------------------------------

### Basic DragOverlay usage with static content

Source: https://dndkit.com/react/components/drag-overlay

Import DragOverlay and place it inside a DragDropProvider with static children that render only during active drag operations.

```JavaScript
import {useDraggable, DragOverlay} from '@dnd-kit/react';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return (
    <>
      <button ref={ref}>Draggable</button>
      <DragOverlay>
        <div>I will be rendered while dragging...</div>
      </DragOverlay>
    </>
  );
}
```

--------------------------------

### Handling Drag and Drop Events with DragDropProvider

Source: https://dndkit.com/react/components/drag-drop-provider

Listen to drag and drop events like `onBeforeDragStart`, `onDragStart`, `onDragMove`, `onDragOver`, and `onDragEnd` to respond to user interactions.

```javascript
function App() {
  return (
    <DragDropProvider
      onBeforeDragStart={({source, event}) => {
        // Optionally prevent dragging
        if (shouldPreventDrag(source)) {
          event.preventDefault();
        }
      }}
      onDragStart={({source}) => {
        console.log('Started dragging', source.id);
      }}
      onDragMove={({operation}) => {
        const {position} = operation;
        console.log('Current position:', position);
      }}
      onDragOver={({source, target}) => {
        console.log(`${source.id} is over ${target.id}`);
      }}
      onDragEnd={({source, target}) => {
        if (target) {
          console.log(`Dropped ${source.id} onto ${target.id}`);
        }
      }}
    >
      <YourDraggableContent />
    </DragDropProvider>
  );
}
```

--------------------------------

### Create DragDropManager Instance (JavaScript)

Source: https://dndkit.com/concepts/drag-drop-manager

Instantiate the DragDropManager to coordinate drag and drop interactions. This is the entry point for using @dnd-kit/dom.

```js
import {DragDropManager} from '@dnd-kit/dom';

const manager = new DragDropManager();
```

--------------------------------

### Composable /useSortable

Source: https://dndkit.com/vue/composables/use-sortable

Details the `useSortable` composable, its input properties for configuration, and its output properties for reactive state.

```APIDOC
## Composable /useSortable

### Description
The `useSortable` composable provides functionality for creating sortable elements in Vue applications, combining draggable and droppable behavior with sorting logic. It allows developers to define sortable items with various configurations and react to drag-and-drop events.

### Method
Composable

### Endpoint
/useSortable

### Parameters
#### Input Properties
- **id** (MaybeRefOrGetter<UniqueIdentifier>) - Required - A unique identifier for this sortable instance.
- **index** (MaybeRefOrGetter<number>) - Required - The current index of this item in the sorted list.
- **element** (MaybeRefOrGetter<HTMLElement | null>) - Required - A template ref pointing to the sortable element.
- **group** (MaybeRefOrGetter<string>) - Optional - The group this sortable belongs to. Used for sorting across multiple lists.
- **handle** (MaybeRefOrGetter<HTMLElement | null>) - Optional - A template ref for a drag handle.
- **accept** (MaybeRefOrGetter<string | string[]>) - Optional - The types of draggable elements this sortable accepts.
- **type** (MaybeRefOrGetter<string>) - Optional - The type of this sortable element.
- **plugins** (MaybeRefOrGetter<PluginDescriptor[]>) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **transition** (MaybeRefOrGetter<SortableTransition>) - Optional - Animation transition configuration for sort operations.
- **modifiers** (MaybeRefOrGetter<Modifier[]>) - Optional - Modifiers to apply to this sortable instance.
- **sensors** (MaybeRefOrGetter<Sensor[]>) - Optional - Sensors to use for this sortable instance.
- **collisionDetector** (MaybeRefOrGetter<CollisionDetector>) - Optional - A custom collision detection algorithm.
- **collisionPriority** (MaybeRefOrGetter<number>) - Optional - The collision priority of this sortable element. Higher values take precedence when multiple droppable elements overlap.
- **disabled** (MaybeRefOrGetter<boolean>) - Optional - Whether the sortable is disabled.
- **data** (MaybeRefOrGetter<Data>) - Optional - Custom data to attach to this sortable instance.

### Request Example
```javascript
import { useSortable } from '@dnd-kit/vue/sortable';
import { ref } from 'vue';

const itemRef = ref(null);
const { isDragging, isDropping } = useSortable({
  id: 'my-sortable-item',
  index: 0,
  element: itemRef,
  group: 'my-group'
});
```

### Response
#### Output Properties
- **isDragging** (boolean) - Whether this element is currently being dragged.
- **isDropping** (boolean) - Whether this element is in the process of being dropped.
- **isSource** (boolean) - Whether this element is the source of the current drag operation.
- **isTarget** (boolean) - Whether this element is currently a drop target.
- **sortableInstance** (Sortable) - The underlying `Sortable` instance.

#### Response Example
```javascript
{
  "isDragging": false,
  "isDropping": false,
  "isSource": false,
  "isTarget": false,
  "sortableInstance": { /* Sortable object details */ }
}
```
```

--------------------------------

### Multiple DragDropProvider Contexts

Source: https://dndkit.com/react/components/drag-drop-provider

Create multiple independent drag and drop contexts within the same application. Each context manages its own drag and drop state separately.

```APIDOC
## Multiple DragDropProvider Contexts

### Description
You can create multiple independent drag and drop contexts. Elements can only be dropped within their respective context.

### Usage Example

```jsx
function App() {
  return (
    <div>
      <DragDropProvider>
        <FileList /> {/* Files can only be dropped in this context */}
      </DragDropProvider>

      <DragDropProvider>
        <TaskList /> {/* Tasks can only be dropped in this context */}
      </DragDropProvider>
    </div>
  );
}
```
```

--------------------------------

### Manager Methods

Source: https://dndkit.com/concepts/drag-drop-manager

Reference documentation for methods available on the dndkit Manager instance. Includes lifecycle management and cleanup operations.

```APIDOC
## Manager Methods

### destroy()
**Type:** function

**Description:** Clean up the manager and all registered elements.

**Operations:**
- Unregisters all draggables and droppables
- Cleans up all plugins, sensors, and modifiers
- Removes all event listeners

**Request Example:**
```js
manager.destroy();
```

**Response:** Manager and all resources are cleaned up. No return value.
```

--------------------------------

### Initialize DragDropManager with KeyboardSensor

Source: https://dndkit.com/extend/sensors/keyboard-sensor

Integrate the KeyboardSensor into `DragDropManager` to enable keyboard-driven drag and drop. Configure specific `keyboardCodes` to define custom actions.

```javascript
import {DragDropManager} from '@dnd-kit/dom';
import {KeyboardSensor} from '@dnd-kit/dom/sensors';

const manager = new DragDropManager({
  sensors: [
    KeyboardSensor.configure({
      keyboardCodes: {
        start: ['Space', 'Enter'],
        cancel: ['Escape'],
        end: ['Space', 'Enter'],
        up: ['ArrowUp'],
        down: ['ArrowDown'],
        left: ['ArrowLeft'],
        right: ['ArrowRight'],
      },
    }),
  ],
});
```

--------------------------------

### Sensor Configuration - Replacing Defaults

Source: https://dndkit.com/extend/sensors

Fully replace the default sensors by passing an array of sensor configurations. This approach gives complete control over which sensors are available but requires explicitly including all desired sensors.

```APIDOC
## DragDropManager Sensors Configuration (Replace Defaults)

### Description
Replace all default sensors with a custom sensor configuration array.

### Usage
Pass an array of sensor configurations to the `sensors` option to completely replace default sensors.

### Parameters
#### Configuration Object
- **sensors** (array) - Required - Array of sensor configurations to use

### Request Example
```ts
import {DragDropManager} from '@dnd-kit/dom';
import {
  PointerSensor,
  PointerActivationConstraints,
  KeyboardSensor
} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({value: 5}),
        new PointerActivationConstraints.Delay({
          value: 200,
          tolerance: {x: 10, y: 5},
        }),
      ]
    }),
    KeyboardSensor,
  ]
});
```

### Response
Returns a DragDropManager instance with only the specified sensors.

### Notes
- This approach completely replaces default sensors
- Must explicitly include all desired sensors
```

--------------------------------

### Class: Sortable

Source: https://dndkit.com/concepts/sortable

Detailed API documentation for the `Sortable` class, covering its constructor parameters, instance properties, and available methods.

```APIDOC
## Class: Sortable

### Description
The `Sortable` class is used to create individual sortable items within a drag-and-drop context. It allows configuration of item behavior, appearance, and interaction.

### Constructor Arguments
- **id** (string | number) - Required - A unique identifier for this sortable item within the drag and drop manager.
- **index** (number) - Required - The position of this item within its sortable group.
- **element** (Element) - Optional - The DOM element to make sortable. While not required in the constructor, it must be set to enable sorting.
- **group** (string | number) - Optional - Optionally assign this item to a group. Items can only be sorted within their group.
- **handle** (Element) - Optional - Optionally specify a drag handle element. If not provided, the entire element will be draggable.
- **target** (Element) - Optional - Optionally specify a different element to use as the drop target. By default, uses the main element.
- **transition** (SortableTransition | null) - Optional - Configure the animation when items are reordered:
  ```ts
  interface SortableTransition {
    duration?: number; // Duration in ms (default: 250)
    easing?: string;  // CSS easing function (default: cubic-bezier)
    idle?: boolean;   // Animate when not dragging (default: false)
  }
  ```
- **disabled** (boolean) - Optional - Set to `true` to temporarily disable sorting for this item.
- **type** (string | number | Symbol) - Optional - Optionally restrict which types of items can be sorted together.
- **accepts** (string | number | Symbol | ((type) => boolean)) - Optional - Optionally restrict which types of items can be dropped on this item.
- **modifiers** (Modifier[]) - Optional - An array of [modifiers](/extend/modifiers) to customize drag behavior.
- **sensors** (Sensors[]) - Optional - An array of [sensors](/extend/sensors) to detect drag interactions.
- **data** ({[key: string]: any}) - Optional - Optional data to associate with this sortable item, available in event handlers.

### Properties
- **index** (number) - The current position in the list.
- **group** (string | number) - The assigned group identifier.
- **isDragging** (boolean) - Whether this item is currently being dragged.
- **isDropTarget** (boolean) - Whether this item is currently a drop target.
- **disabled** (boolean) - Whether sorting is disabled for this item.
- **element** (Element) - The main DOM element.
- **target** (Element) - The drop target element (if different from main element).

### Methods
- **register()** - Register this sortable item with the manager.
- **unregister()** - Remove this item from the manager.
- **destroy()** - Clean up this sortable instance.
- **accepts(draggable)** - Check if this item accepts a draggable.
- **refreshShape()** - Recalculate the item's dimensions.
```

--------------------------------

### new Droppable(options, manager)

Source: https://dndkit.com/quickstart

Initializes a new droppable target. Requires a unique ID and a DOM element to be associated with the DragDropManager.

```APIDOC
## CONSTRUCTOR Droppable

### Description
Creates a droppable target that can interact with draggable elements. It tracks whether a draggable is currently over the target and handles drop logic.

### Method
CONSTRUCTOR

### Endpoint
new Droppable(options, manager)

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the droppable container.
- **element** (HTMLElement) - Required - The DOM element to make droppable.
- **accepts** (string[]) - Optional - Specific types of draggable elements that this target will accept.
- **disabled** (boolean) - Optional - Whether the droppable target is currently disabled.
- **effects** (function) - Optional - A function returning an array of reactive effects, such as toggling CSS classes based on `isDropTarget`.

### Request Example
{
  "id": "droppable-container",
  "element": document.createElement('div'),
  "effects": "() => droppable.isDropTarget ? element.classList.add('active') : element.classList.remove('active')"
}

### Response
#### Success Response (200)
- **droppable** (object) - The instantiated Droppable instance containing properties like `id`, `element`, and `isDropTarget`.
```

--------------------------------

### NEW DragDropManager

Source: https://dndkit.com/quickstart

Initializes a manager to coordinate drag and drop interactions.

```APIDOC
## NEW DragDropManager

### Description
Creates a manager instance to coordinate interactions between draggable and droppable elements.

### Method
CONSTRUCTOR

### Endpoint
new DragDropManager()

### Request Example
const manager = new DragDropManager();
```

--------------------------------

### Render a Static Drag Overlay with dnd-kit

Source: https://dndkit.com/react/hooks/use-draggable

This snippet illustrates how to use the `<DragOverlay>` component to display a custom, static element while a draggable item is being dragged.

```javascript
import {useDraggable, DragOverlay} from '@dnd-kit/react';

function Draggable() {
  const {ref} = useDraggable({
    id: 'draggable',
  });

  return (
    <>
      <button ref={ref}>
        Draggable
      </button>
      <DragOverlay>
        <div>I will be rendered while dragging...</div>
      </DragOverlay>
    </>
  );
}
```

--------------------------------

### Define Custom DND Kit Screen Reader Instructions Interface

Source: https://dndkit.com/extend/plugins/accessibility

This interface defines the structure for customizing the screen reader instructions displayed for draggable activator elements. It allows overriding the default instruction text.

```ts
interface ScreenReaderInstructions {
  draggable: string;
}
```

--------------------------------

### Manager Lifecycle

Source: https://dndkit.com/concepts/drag-drop-manager

Overview of the dndkit Manager lifecycle stages from initialization through cleanup. Describes the sequence of operations and state transitions during drag and drop operations.

```APIDOC
## Manager Lifecycle

### Stage 1: Initialization
- Manager created
- Default plugins and sensors registered
- Custom configuration applied

### Stage 2: Registration
- Draggable and droppable elements register
- Plugins initialize
- Event listeners bound

### Stage 3: Operation
- Drag operations tracked
- Events dispatched
- Collisions detected

### Stage 4: Cleanup
- Elements unregister
- Event listeners removed
- Resources released
```

--------------------------------

### Extending Default DragDropProvider Configuration

Source: https://dndkit.com/react/components/drag-drop-provider

Use a function to extend default `plugins` or `modifiers` by receiving the defaults and returning a new array, adding custom configurations without replacing existing ones.

```javascript
import {DragDropProvider} from '@dnd-kit/react';
import {Feedback} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

function App() {
  return (
    <DragDropProvider
      // Add a plugin alongside defaults
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
      // Add a modifier
      modifiers={(defaults) => [...defaults, RestrictToWindow]}
    >
      <YourDraggableContent />
    </DragDropProvider>
  );
}
```

--------------------------------

### Plugin Static Configuration Method

Source: https://dndkit.com/extend/plugins

Static method to create a configured plugin descriptor that can be passed to DragDropManager. Allows pre-configuration of plugins before instantiation.

```APIDOC
## Static Method: configure()

### Description
Static method to create a configured plugin descriptor with predefined options.

### Method
```ts
static configure(options: PluginOptions): PluginDescriptor
```

### Parameters
- **options** (PluginOptions) - Required - Configuration options for the plugin

### Returns
- **PluginDescriptor** - A configured plugin descriptor ready to be passed to DragDropManager

### Request Example
```ts
const configuredPlugin = MyPlugin.configure({
  delay: 500
});

const manager = new DragDropManager({
  plugins: [configuredPlugin]
});
```

### Response Example
```ts
{
  "pluginClass": "MyPlugin",
  "options": {
    "delay": 500
  }
}
```
```

--------------------------------

### Built-in Plugins Overview

Source: https://dndkit.com/extend/plugins

Reference of built-in plugins included by default when creating a new DragDropManager.

```APIDOC
## Built-in Plugins

### Description
Several plugins are included by default when creating a new DragDropManager.

### Available Plugins

#### Accessibility
- **Purpose**: Manages ARIA attributes and screen reader announcements for drag and drop operations
- **Use Case**: Ensure drag and drop operations are accessible to users with assistive technologies

#### AutoScroller
- **Purpose**: Automatically scrolls containers when dragging near edges
- **Use Case**: Enable smooth scrolling during drag operations in scrollable containers

#### Cursor
- **Purpose**: Updates cursor styles during drag operations
- **Use Case**: Provide visual feedback by changing cursor appearance during dragging

#### Debug
- **Purpose**: Visualize drag shapes, droppable zones, and collisions for debugging
- **Use Case**: Visualize and debug drag and drop behavior during development

#### Feedback
- **Purpose**: Manages visual feedback during dragging, including top layer promotion and drop animations
- **Use Case**: Provide visual feedback and animations during drag and drop operations

#### StyleInjector
- **Purpose**: Centralized style injection with CSP nonce support
- **Use Case**: Inject styles safely with Content Security Policy support
```

--------------------------------

### Configure custom sensor using static configure method

Source: https://dndkit.com/extend/sensors

Use the static configure method to create a configured sensor descriptor that can be passed to DragDropManager.

```TypeScript
const configuredSensor = CustomSensor.configure({
  delay: 500
});

const manager = new DragDropManager({
  sensors: [configuredSensor]
});
```

--------------------------------

### Migrate DndContext to DragDropProvider

Source: https://dndkit.com/react/guides/migration

Replace the legacy `DndContext` from `@dnd-kit/core` with the new `DragDropProvider` from `@dnd-kit/react`. The new provider offers access to a `manager` instance in event handlers for advanced control.

```javascript
import {DndContext} from '@dnd-kit/core';

function App() {
  return (
    <DndContext
      onDragStart={({active}) => {
        console.log(`Started dragging ${active.id}`);
      }}
      onDragEnd={({active, over}) => {
        if (over) {
          console.log(`Dropped ${active.id} over ${over.id}`);
        }
      }}
      onDragCancel={({active}) => {
        console.log(`Cancelled dragging ${active.id}`);
      }}
    >
      <YourComponents />
    </DndContext>
  );
}
```

```javascript
import {DragDropProvider} from '@dnd-kit/react';

function App() {
  return (
    <DragDropProvider
      onDragStart={(event, manager) => {
        const {operation} = event;
        console.log(`Started dragging ${operation.source.id}`);
      }}
      onDragEnd={(event, manager) => {
        const {operation, canceled} = event;
        const {source, target} = operation;

        if (canceled) {
          // Replaces onDragCancel
          console.log(`Cancelled dragging ${source.id}`);
          return;
        }

        if (target) {
          console.log(`Dropped ${source.id} over ${target.id}`);
          // Access rich data
          console.log('Source data:', source.data);
          console.log('Drop position:', operation.position.current);
        }
      }}
    >
      <YourComponents />
    </DragDropProvider>
  );
}
```

--------------------------------

### Screen Reader Instructions Option

Source: https://dndkit.com/extend/plugins/accessibility

Configure custom screen reader instructions displayed in a visually hidden element that is referenced by aria-describedby on draggable activator elements.

```APIDOC
## screenReaderInstructions

### Description
Custom screen reader instructions displayed in a visually hidden element that is referenced by `aria-describedby` on draggable activator elements.

### Type
```ts
interface ScreenReaderInstructions {
  draggable: string;
}
```

### Properties
- **draggable** (string) - Required - Instructions for draggable elements
```

--------------------------------

### Basic DragDropProvider Usage in SolidJS

Source: https://dndkit.com/solid/components/drag-drop-provider

This snippet demonstrates how to integrate the DragDropProvider component into a SolidJS application, handling the onDragEnd event.

```javascript
import {DragDropProvider} from '@dnd-kit/solid';

function App() {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        // Handle drop
      }}
    >
      {/* Your draggable and droppable elements */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Available Events Overview

Source: https://dndkit.com/concepts/drag-drop-manager

Complete reference of all drag and drop lifecycle events fired by the dndkit Manager. These events allow you to hook into various stages of the drag operation and respond to user interactions.

```APIDOC
## Available Events

### beforedragstart
**Type:** Event

**Description:** Fires before drag begins. Can be prevented.

**Properties:**
- **operation** (object) - The drag operation that is about to begin
- **preventDefault** (function) - Call to prevent the drag operation from starting

---

### dragstart
**Type:** Event

**Description:** Fires when drag starts.

**Properties:**
- **operation** (object) - The current drag operation
- **nativeEvent** (Event) - The original browser event that triggered the drag

---

### dragmove
**Type:** Event

**Description:** Fires during movement. Can be prevented.

**Properties:**
- **operation** (object) - The current drag operation
- **to** (Point) - The destination coordinates
- **by** (Point) - The movement delta
- **nativeEvent** (Event) - The original browser event

---

### dragover
**Type:** Event

**Description:** Fires when over a droppable. Call `event.preventDefault()` to prevent the default behavior of plugins that respond to this event.

**Properties:**
- **operation** (object) - The current drag operation

---

### collision
**Type:** Event

**Description:** Fires on droppable collision. Can be prevented.

**Properties:**
- **collisions** (Collision[]) - Array of detected collisions with droppable targets

---

### dragend
**Type:** Event

**Description:** Fires when drag ends.

**Properties:**
- **operation** (object) - The completed drag operation
- **canceled** (boolean) - Whether the operation was canceled
- **nativeEvent** (Event) - The original browser event
```

--------------------------------

### Configure Collision Detection Algorithm

Source: https://dndkit.com/concepts/droppable

Customize collision detection behavior using built-in algorithms like closestCenter for card stacking. Import collision detectors from @dnd-kit/collision and pass to the collisionDetector property.

```javascript
import {
  closestCenter,
  pointerIntersection,
  directionBiased
} from '@dnd-kit/collision';

// Use closest center point for card stacking
const droppable = new Droppable({
  id: 'card-stack',
  element,
  collisionDetector: closestCenter
}, manager);
```

--------------------------------

### DragOverlay Component API

Source: https://dndkit.com/svelte/components/drag-overlay

Detailed API documentation for the `DragOverlay` component, including its props and available snippets.

```APIDOC
## COMPONENT DragOverlay

### Description
The `DragOverlay` component renders a custom overlay element while a drag operation is in progress. This allows you to display a completely different element than the one being dragged, which is useful for rendering a styled clone, a preview, or a simplified representation of the dragged element. It should be placed inside a `DragDropProvider` and its children are only rendered when a drag operation is active.

### Props
- **disabled** (boolean) - Optional - Default: `false` - Whether the drag overlay is disabled. When `true`, the overlay will not render its children during drag operations.
- **dropAnimation** (DropAnimation | null) - Optional - Customize or disable the drop animation that plays when a drag operation ends.
    - `undefined`: use the default animation (`250ms` ease)
    - `null`: disable the drop animation entirely
    - `{duration, easing}`: customize the animation timing
    - `(context) => Promise<void> | void`: provide a fully custom animation function

### Snippets
#### children
- **Type**: `Snippet<[Draggable]>`
- **Description**: The content to render as the drag overlay. Only rendered when a drag operation is in progress.
#### Snippet Parameters
- **source** (Draggable) - Description: the Draggable instance that is the source of the current drag operation.
```

--------------------------------

### Rendering a custom drag overlay

Source: https://dndkit.com/vue/composables/use-draggable

Shows how to use `<DragOverlay>` within `DragDropProvider` to display a different element during dragging.

```vue
<script setup>
import {ref} from 'vue';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/vue';

const element = ref(null);
useDraggable({id: 'draggable', element});
</script>

<template>
  <DragDropProvider>
    <button ref="element">Draggable</button>
    <DragOverlay>
      <div>I will be rendered while dragging...</div>
    </DragOverlay>
  </DragDropProvider>
</template>
```

--------------------------------

### Using Drag Handles

Source: https://dndkit.com/svelte/primitives/create-draggable

Demonstrates how to use the attachHandle function to designate a specific element as the drag handle, allowing users to drag the element only from that specific area.

```APIDOC
## Using Drag Handles

### Description
Use the `attachHandle` function to designate a specific element as the drag handle for a draggable element.

### Usage Pattern
Attach the main draggable element using `attach`, and attach the handle element using `attachHandle`.

### Code Example
```svelte
<script>
  import {createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<div {@attach draggable.attach}>
  Drag me by the handle
  <button {@attach draggable.attachHandle} class="handle" />
</div>
```

### Behavior
When a drag handle is specified, the draggable element can only be dragged from the handle element. Attempting to drag from other parts of the element will not initiate a drag operation.
```

--------------------------------

### Manager Properties

Source: https://dndkit.com/concepts/drag-drop-manager

Reference documentation for all properties available on the dndkit Manager instance. Includes registry, drag operation state, event monitoring, and renderer integration.

```APIDOC
## Manager Properties

### registry
**Type:** object

**Description:** Tracks active elements and extensions.

**Sub-properties:**
- **draggables** (Map) - Map of registered draggable elements
- **droppables** (Map) - Map of registered droppable elements
- **plugins** (Registry) - Registry of active plugins
- **sensors** (Registry) - Registry of active sensors
- **modifiers** (Registry) - Registry of active modifiers

---

### dragOperation
**Type:** object

**Description:** Current drag operation state.

**Sub-properties:**
- **source** (object) - Currently dragged element
- **target** (object) - Current drop target
- **position** (object) - Current drag coordinates
- **status** (string) - Current operation status
- **canceled** (boolean) - Whether operation was canceled

---

### monitor
**Type:** object

**Description:** Event system for listening to drag and drop events.

**Methods:**
- **addEventListener** (function) - Add event listener
- **removeEventListener** (function) - Remove listener

---

### renderer
**Type:** object

**Description:** Integration with asynchronous renderers such as React.
```

--------------------------------

### Rendering Drag Overlay

Source: https://dndkit.com/svelte/primitives/create-draggable

Demonstrates how to use the DragOverlay component to render a different element while the draggable element is being dragged, providing visual feedback during drag operations.

```APIDOC
## Rendering Drag Overlay

### Description
Use the `<DragOverlay>` component to render a completely different element while a draggable element is being dragged.

### Component Usage
The `<DragOverlay>` component should be rendered once per `<DragDropProvider>` and will only render its children when a drag operation is in progress.

### Code Example
```svelte
<script>
  import {DragDropProvider, DragOverlay, createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<DragDropProvider>
  <button {@attach draggable.attach}>Draggable</button>
  <DragOverlay>
    {#snippet children(source)}
      <div>I will be rendered while dragging...</div>
    {/snippet}
  </DragOverlay>
</DragDropProvider>
```

### Behavior
The `<DragOverlay>` component:
- Only renders its children when a drag operation is in progress
- Receives the source draggable as a parameter in the snippet
- Should be rendered once per `<DragDropProvider>`
- Useful for rendering visual feedback or a different representation of the dragged element
```

--------------------------------

### Replacing Default Plugins

Source: https://dndkit.com/extend/plugins

Fully replace the default plugins by passing an array of plugins to DragDropManager configuration.

```APIDOC
## Replacing Default Plugins

### Description
Pass an array to fully replace the default plugins with custom plugin configuration.

### Method
Array-based plugin configuration

### Parameters
- **plugins** (array) - Required - Array of plugin instances or configured plugin descriptors

### Request Example
```ts
const manager = new DragDropManager({
  plugins: [
    MyPlugin.configure({ delay: 500 }),
    AutoScroller
  ]
});
```

### Response
DragDropManager instance with only the specified plugins configured and active.
```

--------------------------------

### Creating Multiple Independent Drag and Drop Contexts

Source: https://dndkit.com/react/components/drag-drop-provider

Use multiple `DragDropProvider` instances to create independent drag and drop contexts, allowing different sections of your application to manage their own interactions.

```javascript
function App() {
  return (
    <div>
      <DragDropProvider>
        <FileList /> {/* Files can only be dropped in this context */}
      </DragDropProvider>

      <DragDropProvider>
        <TaskList /> {/* Tasks can only be dropped in this context */}
      </DragDropProvider>
    </div>
  );
}
```

--------------------------------

### Sensor Static Configuration Method

Source: https://dndkit.com/extend/sensors

Use the static configure method to create a configured sensor descriptor that can be passed to DragDropManager or Draggable.

```APIDOC
## Sensor.configure() Static Method

### Description
Create a configured sensor descriptor using the static configure method.

### Usage
Call the static `configure` method on a Sensor class to create a descriptor with options.

### Parameters
#### Configuration Options
- **options** (object) - Optional - Configuration options specific to the sensor

### Request Example
```ts
const configuredSensor = CustomSensor.configure({
  delay: 500
});

const manager = new DragDropManager({
  sensors: [configuredSensor]
});
```

### Response
Returns a configured sensor descriptor that can be used in sensor arrays.

### Notes
- Returns a descriptor, not an instance
- Can be used in both global and per-draggable sensor configurations
```

--------------------------------

### Configure Feedback plugin globally

Source: https://dndkit.com/extend/plugins/feedback

Use Feedback.configure() to customize global options like disabling drop animations across the entire manager or provider.

```typescript
import {DragDropManager, Feedback} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Feedback.configure({ dropAnimation: null }),
  ],
});
```

```tsx
import {DragDropProvider} from '@dnd-kit/react';
import {Feedback} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

```vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {Feedback} from '@dnd-kit/dom';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {Feedback} from '@dnd-kit/dom';
</script>

<DragDropProvider
  plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]}
>
  <!-- ... -->
</DragDropProvider>
```

```tsx
import {DragDropProvider} from '@dnd-kit/solid';
import {Feedback} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Update dnd-kit Dependencies

Source: https://dndkit.com/react/guides/migration

Update your `package.json` to include the new `@dnd-kit/react` and `@dnd-kit/helpers` packages, and ensure other `@dnd-kit` packages are at compatible versions.

```json
  "dependencies": {
    "@dnd-kit/core": "^x.x.x",      
    "@dnd-kit/sortable": "^x.x.x",  
    "@dnd-kit/utilities": "^x.x.x", 
    "@dnd-kit/react": "^x.x.x",     
    "@dnd-kit/helpers": "^x.x.x"   
  }
```

--------------------------------

### Configure an Existing Default Plugin (TypeScript)

Source: https://dndkit.com/extend/plugins

Modify the configuration of a built-in plugin, like `Feedback`, while retaining other default plugins.

```ts
import {DragDropManager, Feedback} from '@dnd-kit/dom;

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Feedback.configure({ dropAnimation: null }),
  ],
});
```

--------------------------------

### Combine Multiple Pointer Sensor Activation Constraints

Source: https://dndkit.com/extend/sensors/pointer-sensor

Combine Delay and Distance constraints for the PointerSensor, allowing drag activation when either the delay is met or the pointer moves a certain distance.

```javascript
PointerSensor.configure({
  activationConstraints: [
    // Activate after 200ms delay OR 5px movement
    new PointerActivationConstraints.Delay({value: 200, tolerance: 10}),
    new PointerActivationConstraints.Distance({value: 5}),
  ],
});
```

--------------------------------

### DragOverlay with customized drop animations

Source: https://dndkit.com/react/components/drag-overlay

Configure drop animation behavior using the dropAnimation prop: disable it with null, customize timing with duration and easing, or provide a custom animation function.

```JavaScript
{/* Disable the drop animation */}
<DragOverlay dropAnimation={null}>
  <div>No animation on drop</div>
</DragOverlay>
```

```JavaScript
{/* Customize the animation timing */}
<DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
  <div>Fast drop animation</div>
</DragOverlay>
```

```JavaScript
{/* Provide a custom animation function */}
<DragOverlay dropAnimation={async ({ element, feedbackElement, translate }) => {
  // Custom animation logic using Web Animations API, GSAP, etc.
}}>
  <div>Custom animation</div>
</DragOverlay>
```

--------------------------------

### Element Registration System

Source: https://dndkit.com/concepts/drag-drop-manager

Documentation for registering and unregistering draggable and droppable elements with the dndkit Manager. Covers manual registration, auto-registration, and opt-out mechanisms.

```APIDOC
## Element Registration

### Manual Registration

**Description:** Manually register and unregister draggable or droppable elements with the manager's registry.

**Method:** `manager.registry.register(element)` / `manager.registry.unregister(element)`

**Request Example:**
```js
const cleanup = manager.registry.register(draggable);
cleanup(); // Unregister the element
// Or explicitly:
manager.registry.unregister(draggable);
```

**Response:** Returns cleanup function that unregisters the element when called.

---

### Auto-Registration with Manager Reference

**Description:** Elements automatically register when created with a manager reference.

**Request Example:**
```js
const draggable = new Draggable({
  id: 'draggable-1',
  element
}, manager);
```

**Response:** Element is automatically registered with the manager's registry.

---

### Opt Out of Auto-Registration

**Description:** Create an element without automatic registration by setting `register: false`.

**Request Example:**
```js
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  register: false
}, manager);
```

**Response:** Element is created but not automatically registered. Manual registration required.
```

--------------------------------

### StyleInjector.configure()

Source: https://dndkit.com/extend/plugins/style-injector

Configures the StyleInjector plugin with a CSP nonce value. This method returns a configured plugin instance that should be included in the plugins array of DragDropManager or DragDropProvider.

```APIDOC
## StyleInjector.configure()

### Description
Configures the StyleInjector plugin with a Content Security Policy nonce value that will be applied to all injected `<style>` elements.

### Method
Static configuration method

### Parameters
#### Configuration Object
- **nonce** (string) - Optional - A nonce value applied to all `<style>` elements injected into Document roots. Required when your site uses a Content Security Policy that restricts inline styles.

### Request Example
```typescript
import {DragDropManager, StyleInjector} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    StyleInjector.configure({ nonce: 'abc123' }),
  ],
});
```

### Response
Returns a configured StyleInjector plugin instance ready to be included in the plugins array.
```

--------------------------------

### Feedback.configure() - Global Configuration

Source: https://dndkit.com/extend/plugins/feedback

Configure the Feedback plugin globally on the DragDropManager to customize drop animations and other visual feedback options. This configuration applies to all draggable entities unless overridden at the per-entity level.

```APIDOC
## Feedback.configure()

### Description
Configures the Feedback plugin globally on the DragDropManager to customize visual feedback behavior during drag operations.

### Method
Configuration Method

### Parameters

#### Global Options
- **dropAnimation** (DropAnimation | null) - Optional - Customize or disable the drop animation that plays when a dragged element is released. Default is undefined (use built-in animation). Set to null to disable entirely, or provide DropAnimationOptions or DropAnimationFunction for custom animation.
- **keyboardTransition** (KeyboardTransition | null) - Optional - Customize or disable the CSS transition applied when moving elements via keyboard. Default is undefined (use built-in 250ms cubic-bezier(0.25, 1, 0.5, 1) transition). Set to null to disable, or provide { duration, easing } object to customize.
- **rootElement** (Element | ((source: Draggable) => Element)) - Optional - An element or function returning an element to use as the root container for the dragged element during drag operations.

### Configuration Example (TypeScript)
```typescript
import {DragDropManager, Feedback} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Feedback.configure({ dropAnimation: null }),
  ],
});
```

### Configuration Example (React)
```tsx
import {DragDropProvider} from '@dnd-kit/react';
import {Feedback} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

### Configuration Example (Vue)
```vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {Feedback} from '@dnd-kit/dom';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

### Configuration Example (Svelte)
```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {Feedback} from '@dnd-kit/dom';
</script>

<DragDropProvider
  plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]}
>
  <!-- ... -->
</DragDropProvider>
```

### Configuration Example (Solid)
```tsx
import {DragDropProvider} from '@dnd-kit/solid';
import {Feedback} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```
```

--------------------------------

### Create Droppable with DragDropManager

Source: https://dndkit.com/concepts/droppable

Initialize a droppable target with a DragDropManager instance and listen for drop events. The manager monitors drag operations and fires dragend events when items are dropped.

```javascript
import {Droppable, DragDropManager} from '@dnd-kit/dom';

const manager = new DragDropManager();

const element = document.createElement('div');
element.classList.add('droppable');

// Create a droppable target
const droppable = new Droppable({
  id: 'drop-zone',
  element,
}, manager);

document.body.appendChild(element);

// Listen for drop events
manager.monitor.addEventListener('dragend', (event) => {
  if (event.operation.target?.id === droppable.id) {
    console.log('Item dropped!', event.operation.source);
  }
});
```

--------------------------------

### Configure Cursor plugin in TypeScript

Source: https://dndkit.com/extend/plugins/cursor

Set up the Cursor plugin with a custom cursor style in a TypeScript DragDropManager. Pass the configured plugin to the plugins array.

```TypeScript
import {DragDropManager, Cursor} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Cursor.configure({ cursor: 'move' }),
  ],
});
```

--------------------------------

### Droppable Class - API Reference

Source: https://dndkit.com/concepts/droppable

Complete API reference for the Droppable class constructor parameters, including all configuration options and their types.

```APIDOC
## Droppable Class - API Reference

### Constructor Parameters

#### id
- **Type**: string | number
- **Required**: Yes
- **Description**: A unique identifier for this droppable target within the same drag and drop context provider.

#### element
- **Type**: Element
- **Required**: No (but must be set to enable dropping)
- **Description**: The DOM element to make droppable. While not required in the constructor, it must be set to enable dropping.

#### accepts
- **Type**: string | number | Symbol | ((draggable: Draggable) => boolean)
- **Required**: No
- **Description**: Specify which draggable elements can be dropped on this target. Can be a single type, array of types, or a custom validation function.

#### collisionDetector
- **Type**: CollisionDetector
- **Required**: No
- **Description**: A function to determine when draggable elements are over this target. Built-in options include shapeIntersection (default), pointerIntersection, closestCenter, and directionBiased.

#### collisionPriority
- **Type**: number
- **Required**: No
- **Description**: Priority level when multiple droppable targets overlap. Higher numbers take precedence.

#### disabled
- **Type**: boolean
- **Required**: No
- **Description**: Set to true to temporarily prevent dropping on this target.

#### data
- **Type**: {[key: string]: any}
- **Required**: No
- **Description**: Optional data to associate with this droppable target, available in event handlers.

#### effects
- **Type**: () => Effect[]
- **Required**: No
- **Description**: Advanced feature. Supply a function that returns an array of reactive effects that can be set up and automatically cleaned up when invoking the destroy() method of this instance.
```

--------------------------------

### Manage Column Order in App Component with dnd-kit

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This snippet demonstrates how to update the `App` component to control the state of columns, using the `onDragEnd` callback to manage column order after a drag operation completes.

```javascript
export function App() {
  const [items, setItems] = useState({
    A: ['A0', 'A1', 'A2'],
    B: ['B0', 'B1'],
    C: [],
  });
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(items));

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (source?.type === 'column') return;

        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        const {source, target} = event.operation;

        if (event.canceled || source.type !== 'column') return;

        setColumnOrder((columns) => move(columns, event));
      }}
    >
      <div className="Root">
        {columnOrder.map((column, columnIndex) => (
          <Column key={column} id={column} index={columnIndex}>
            {items[column].map((id, index) => (
              <Item key={id} id={id} index={index} column={column} />
            ))}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
}
```

--------------------------------

### Configure Cursor plugin in React

Source: https://dndkit.com/extend/plugins/cursor

Set up the Cursor plugin with a custom cursor style in a React application using DragDropProvider. The plugin configuration is passed to the plugins prop.

```React
import {DragDropProvider} from '@dnd-kit/react';
import {Cursor} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Cursor.configure({ cursor: 'move' }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Configure Accessibility Announcements

Source: https://dndkit.com/extend/plugins/accessibility

Use Accessibility.configure() to define custom screen reader announcements for dragstart, dragover, and dragend events across different frameworks.

```TypeScript
import {DragDropManager, Accessibility} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Accessibility.configure({
      announcements: {
        dragstart({operation: {source}}) {
          if (!source) return;
          return `Started dragging ${source.id}`;
        },
        dragover({operation: {source, target}}) {
          if (!source || !target) return;
          return `${source.id} is over ${target.id}`;
        },
        dragend({operation: {source, target}, canceled}) {
          if (!source) return;
          if (canceled) return `Dragging canceled`;
          return `Dropped ${source.id} on ${target?.id ?? 'nothing'}`;
        },
      },
    }),
  ],
});
```

```React
import {DragDropProvider} from '@dnd-kit/react';
import {Accessibility} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Accessibility.configure({
          announcements: {
            dragstart({operation: {source}}) {
              if (!source) return;
              return `Started dragging ${source.id}`;
            },
            dragover({operation: {source, target}}) {
              if (!source || !target) return;
              return `${source.id} is over ${target.id}`;
            },
            dragend({operation: {source, target}, canceled}) {
              if (!source) return;
              if (canceled) return `Dragging canceled`;
              return `Dropped ${source.id} on ${target?.id ?? 'nothing'}`;
            },
          },
        }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

```Vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {Accessibility} from '@dnd-kit/dom';

const plugins = (defaults) => [
  ...defaults,
  Accessibility.configure({
    announcements: {
      dragstart({operation: {source}}) {
        if (!source) return;
        return `Started dragging ${source.id}`;
      },
      dragover({operation: {source, target}}) {
        if (!source || !target) return;
        return `${source.id} is over ${target.id}`;
      },
      dragend({operation: {source, target}, canceled}) {
        if (!source) return;
        if (canceled) return `Dragging canceled`;
        return `Dropped ${source.id} on ${target?.id ?? 'nothing'}`;
      },
    },
  }),
];
</script>

<template>
  <DragDropProvider :plugins="plugins">
    <!-- ... -->
  </DragDropProvider>
</template>
```

```Svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {Accessibility} from '@dnd-kit/dom';

  const plugins = (defaults) => [
    ...defaults,
    Accessibility.configure({
      announcements: {
        dragstart({operation: {source}}) {
          if (!source) return;
          return `Started dragging ${source.id}`;
        },
        dragover({operation: {source, target}}) {
          if (!source || !target) return;
          return `${source.id} is over ${target.id}`;
        },
        dragend({operation: {source, target}, canceled}) {
          if (!source) return;
          if (canceled) return `Dragging canceled`;
          return `Dropped ${source.id} on ${target?.id ?? 'nothing'}`;
        },
      },
    }),
  ];
</script>

<DragDropProvider {plugins}>
  <!-- ... -->
</DragDropProvider>
```

```Solid
import {DragDropProvider} from '@dnd-kit/solid';
import {Accessibility} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Accessibility.configure({
          announcements: {
            dragstart({operation: {source}}) {
              if (!source) return;
              return `Started dragging ${source.id}`;
            },
            dragover({operation: {source, target}}) {
              if (!source || !target) return;
              return `${source.id} is over ${target.id}`;
            },
            dragend({operation: {source, target}, canceled}) {
              if (!source) return;
              if (canceled) return `Dragging canceled`;
              return `Dropped ${source.id} on ${target?.id ?? 'nothing'}`;
            },
          },
        }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Using Static Configure Method for Modifiers

Source: https://dndkit.com/extend/modifiers

Use the static configure method to instantiate a modifier with specific options before adding it to the manager.

```ts
const snapToGrid = SnapToGrid.configure({
  gridSize: 10
});

const manager = new DragDropManager({
  modifiers: [snapToGrid]
});
```

--------------------------------

### Configure Cursor plugin in Svelte

Source: https://dndkit.com/extend/plugins/cursor

Set up the Cursor plugin with a custom cursor style in a Svelte application using DragDropProvider. The plugins prop accepts a function that returns the configured plugin array.

```Svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {Cursor} from '@dnd-kit/dom';
</script>

<DragDropProvider
  plugins={(defaults) => [...defaults, Cursor.configure({ cursor: 'move' })]}
>
  <!-- ... -->
</DragDropProvider>
```

--------------------------------

### Extend DragDropManager Defaults with dnd-kit

Source: https://dndkit.com/concepts/drag-drop-manager

Use a function to add to or configure default sensors, plugins, and modifiers without replacing the entire set. This allows for incremental customization.

```js
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  // Add a plugin to the defaults
  plugins: (defaults) => [...defaults, MyPlugin],

  // Configure a default sensor
  sensors: (defaults) => [
    ...defaults,
    PointerSensor.configure({
      activationConstraints: { distance: 5 },
    }),
  ],

  // Add a modifier
  modifiers: (defaults) => [...defaults, RestrictToWindow],
});
```

--------------------------------

### Custom Sensor Creation

Source: https://dndkit.com/extend/sensors

Create custom sensors by extending the Sensor base class. Custom sensors can handle specialized input sources and implement custom event handling logic.

```APIDOC
## Custom Sensor Class

### Description
Create a custom sensor by extending the Sensor base class from @dnd-kit/abstract.

### Usage
Extend the Sensor class and implement the `bind` method to register event listeners and handle drag operations.

### Parameters
#### Constructor
- **manager** (DragDropManager) - Required - Reference to the drag and drop manager instance
- **options** (SensorOptions) - Optional - Configuration options for the sensor

### Request Example
```ts
import {Sensor} from '@dnd-kit/abstract';

interface CustomSensorOptions {
  delay?: number;
}

class CustomSensor extends Sensor {
  constructor(manager, options?: CustomSensorOptions) {
    super(manager, options);
  }

  public bind(source) {
    const unbind = this.registerEffect(() => {
      const target = source.handle ?? source.element;

      if (!target) return;

      const handleStart = (event) => {
        if (this.disabled) return;

        this.manager.actions.setDragSource(source.id);
        this.manager.actions.start({
          event,
          coordinates: getCoordinates(event)
        });
      };

      target.addEventListener('customstart', handleStart);

      return () => {
        target.removeEventListener('customstart', handleStart);
      };
    });

    return unbind;
  }
}
```

### Response
Returns a custom Sensor instance that can be used with DragDropManager.

### Methods
- **bind(source: Draggable)** - Bind sensor to draggable element and register event listeners
- **enable()** - Enable the sensor
- **disable()** - Disable the sensor
- **isDisabled()** - Check if sensor is disabled
- **destroy()** - Clean up sensor resources
- **registerEffect(callback)** - Register an effect that returns cleanup function

### Static Methods
- **configure(options)** - Create a configured sensor descriptor
```

--------------------------------

### Create a Droppable Element with dnd-kit/dom

Source: https://dndkit.com/quickstart

This function creates and returns a new `Droppable` instance, requiring a `DragDropManager`. It includes an effect to visually indicate when it's an active drop target.

```javascript
import {Droppable, DragDropManager} from '@dnd-kit/dom';

export function createDroppable(manager) {
  const element = document.createElement('div');
  element.classList.add('droppable');

  const droppable = new Droppable({
    element,
    id: 'droppable-container', // Required - must be unique
    effects(){
      return [
        () => droppable.isDropTarget
          ? element.classList.add('active')
          : element.classList.remove('active')
      ];
    }
  }, manager);

  return droppable;
}
```

--------------------------------

### Configure AutoScroller Plugin

Source: https://dndkit.com/extend/plugins/auto-scroller

Customize the AutoScroller's behavior by setting `acceleration` for scroll speed and `threshold` for the activation zone. This configuration is applied when initializing the DragDropManager or DragDropProvider.

```TypeScript
import {DragDropManager, AutoScroller} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    AutoScroller.configure({
      acceleration: 15,
      threshold: { x: 0, y: 0.3 },
    }),
  ],
});
```

```React
import {DragDropProvider} from '@dnd-kit/react';
import {AutoScroller} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        AutoScroller.configure({
          acceleration: 15,
          threshold: { x: 0, y: 0.3 },
        }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

```Vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {AutoScroller} from '@dnd-kit/dom';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => [...defaults, AutoScroller.configure({ acceleration: 15, threshold: { x: 0, y: 0.3 } })]"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

```Svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {AutoScroller} from '@dnd-kit/dom';
</script>

<DragDropProvider
  plugins={(defaults) => [...defaults, AutoScroller.configure({ acceleration: 15, threshold: { x: 0, y: 0.3 } })]}
>
  <!-- ... -->
</DragDropProvider>
```

```Solid
import {DragDropProvider} from '@dnd-kit/solid';
import {AutoScroller} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        AutoScroller.configure({
          acceleration: 15,
          threshold: { x: 0, y: 0.3 },
        }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Handle dragend for multiple lists with isSortable

Source: https://dndkit.com/concepts/sortable

Use initialGroup and group properties to detect same-list reordering versus cross-list transfers. Handle both scenarios by updating the appropriate list(s) in state.

```javascript
manager.monitor.addEventListener('dragend', (event) => {
  if (event.canceled) return;

  const {source} = event.operation;

  if (isSortable(source)) {
    const {initialIndex, index, initialGroup, group} = source;

    if (initialGroup === group) {
      // Same group: reorder within the list
      const groupItems = [...items[group]];
      const [removed] = groupItems.splice(initialIndex, 1);
      groupItems.splice(index, 0, removed);
      items = {...items, [group]: groupItems};
    } else {
      // Cross-group transfer
      const sourceItems = [...items[initialGroup]];
      const [removed] = sourceItems.splice(initialIndex, 1);
      const targetItems = [...items[group]];
      targetItems.splice(index, 0, removed);
      items = {...items, [initialGroup]: sourceItems, [group]: targetItems};
    }
  }
});
```

--------------------------------

### Hook: useDroppable

Source: https://dndkit.com/solid/hooks/use-droppable

Creates droppable targets with the `useDroppable` hook, returning a ref and a signal for the drop target status.

```APIDOC
## Hook: useDroppable

### Description
The `useDroppable` hook from `@dnd-kit/solid` allows you to create droppable targets in your application. It requires a unique identifier and provides a ref callback to attach to the droppable element, along with a signal indicating if it's currently a drop target.

### Usage
```javascript
import {useDroppable} from '@dnd-kit/solid';

function Droppable(props) {
  const {ref, isDropTarget} = useDroppable({id: props.id});

  return (
    <div ref={ref} data-highlight={isDropTarget()}>
      {props.children}
    </div>
  );
}
```

### Parameters
#### Input Options (Object)
- **id** (UniqueIdentifier) - Required - A unique identifier for this droppable instance.
- **accept** (string | string[]) - Optional - The types of draggable elements this droppable accepts.
- **type** (string) - Optional - The type of this droppable element.
- **collisionDetector** (CollisionDetector) - Optional - A custom collision detection algorithm.
- **disabled** (boolean) - Optional - Whether the droppable is disabled.
- **data** (Data) - Optional - Custom data to attach to this droppable instance.

### Returns
The `useDroppable` hook returns an object with the following properties:
- **ref** (function) - A callback ref to attach to the droppable element.
- **isDropTarget** (function) - A signal indicating whether this element is currently a drop target. Call as `isDropTarget()` in JSX.
- **droppableInstance** (Droppable) - The underlying `Droppable` instance.
```

--------------------------------

### useSortable Hook API Reference

Source: https://dndkit.com/react/hooks/use-sortable

Detailed API reference for the `useSortable` hook, including all accepted input arguments and their descriptions for configuring sortable elements in React.

```APIDOC
## useSortable Hook

### Description
The `useSortable` hook is a thin wrapper around the Sortable class that makes it easier to create sortable elements in React. It therefore accepts all of the same input arguments as the `useDraggable` and `useDroppable` hooks, as well as additional arguments that are specific to sortable elements.

### Parameters
#### Request Body
- **id** (string | number) - Required - The identifier of the sortable element. Should be unique within the same drag and drop context provider.
- **index** (number) - Required - The index of the sortable element. This is used to determine the position of the element in the list.
- **transition** ({duration?: number; easing?: string: idle: boolean} | null) - Optional - Optionally supply a transition to animate the sortable element when it is being sorted.
    - **duration** (number) - The duration of the transition in milliseconds.
    - **easing** (string) - The easing function to use for the transition.
    - **idle** (boolean) - Whether the sortable item should transition to its new position when its index changes, but there is no drag operation in progress.
- **element** (Element | Ref<Element>) - Optional - If you already have a reference to the element, you can pass it to the `element` option instead of using the `ref` that is returned by the `useSortable` hook to connect the sortable element.
- **handle** (Element | Ref<Element>) - Optional - If you already have a reference to the drag handle element, you can pass it to the `handle` option instead of using the `handleRef` that is returned by the `useSortable` hook to connect the sortable handle element.
- **modifiers** (Modifier[]) - Optional - An array of modifiers that can be used to modify or restrict the behavior of the sortable element.
- **sensors** (Sensors[]) - Optional - An array of sensors that can be bound to the sortable element to detect drag interactions.
- **target** (Element | Ref<Element>) - Optional - If you already have a reference to the element you want to use as the droppable target for this sortable element, you can pass it to the `target` option instead of using the `targetRef` that is returned by the `useSortable` hook.
- **accepts** (string | number | Symbol | (type: string | number | Symbol) => boolean) - Optional - Optionally supply a type of draggable element to only allow it to be dropped over certain droppable targets that accept this `type`.
- **collisionDetector** ((input: CollisionDetectorInput) => Collision | null) - Optional - Optionally supply a collision detector function can be used to detect collisions between the droppable element and draggable elements.
- **collisionPriority** (number) - Optional - Optionally supply a number to set the collision priority of the droppable target of this sortable element. The higher the number, the higher the priority when detecting collisions. This can be useful if there are multiple droppable elements that overlap.
- **disabled** (boolean) - Optional - Set to `true` to prevent the sortable element from being sortable.
- **plugins** (PluginDescriptor[]) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **data** ({[key: string]: any}) - Optional - The data argument is for advanced use-cases where you may need access to additional data about the sortable element in event handlers, modifiers, sensors or custom plugins.
- **effects** (() => Effect[]) - Optional - This is an advanced feature and should not need to be used by most consumers. You can supply a function that returns an array of reactive effects that can be set up and automatically cleaned up when the component invoking the `useSortable` hook element is unmounted.

### Request Example
```javascript
import {useSortable} from '@dnd-kit/react/sortable';
  
function Sortable({id, index}) {
  const {ref} = useSortable({id, index});
  
  return (
    <li ref={ref} className="item">Item {id}</li>
  );
}
```

### Response
#### Success Response (N/A)
The `useSortable` hook returns an object containing properties necessary for connecting to the DOM element and managing sortable state.

#### Response Example
```javascript
{
  "ref": "React.RefObject<HTMLElement>"
}
```
```

--------------------------------

### Create a Custom Plugin by Extending Plugin Class (TypeScript)

Source: https://dndkit.com/extend/plugins

Define a custom plugin by extending the `Plugin` class, implementing a constructor, and registering effects for lifecycle management.

```ts
import {Plugin} from '@dnd-kit/abstract;

interface MyPluginOptions {
  delay?: number;
}

class MyPlugin extends Plugin {
  constructor(manager, options?: MyPluginOptions) {
    super(manager, options);

    this.registerEffect(() => {
      const {monitor} = this.manager;

      const cleanup = monitor.addEventListener('dragstart', (event) => {
        console.log('Drag started:', event.operation.source.id);
      });

      return cleanup;
    });
  }

  public customMethod() {
    if (this.disabled) return;
    // Custom functionality
  }
}
```

--------------------------------

### Basic Usage of DragDropProvider in React

Source: https://dndkit.com/react/components/drag-drop-provider

Wrap your application or a section with `DragDropProvider` to enable drag and drop interactions for its children.

```javascript
import {DragDropProvider} from '@dnd-kit/react';

function App() {
  return (
    <DragDropProvider>
      <YourDraggableContent />
    </DragDropProvider>
  );
}
```

--------------------------------

### useSortable Hook Output

Source: https://dndkit.com/react/hooks/use-sortable

Details the properties returned by the `useSortable` hook, including refs for various elements and boolean states for drag/drop status.

```APIDOC
## Hook: `useSortable`

### Description
The `useSortable` hook provides functionality to make an element sortable within a dndkit context, returning various refs and state indicators.

### Output Properties
- **ref** (Ref<Element>) - A React ref that can be assigned to the element you want to connect as the draggable element and droppable target for this sortable instance.
- **targetRef** (Ref<Element>) - A React ref that can be assigned to the element you want to use as the droppable target for this sortable element.
- **sourceRef** (Ref<Element>) - A React ref that can be assigned to the element you want to use as the draggable source element for this sortable element.
- **handleRef** (Ref<Element>) - A React ref that can be assigned to the element you want to use as the drag handle element for this sortable element.
- **isDropTarget** (boolean) - A boolean value that indicates whether the sortable element is currently a drop target.
- **isDragSource** (boolean) - A boolean value that indicates whether the sortable is the source of the drag operation that is in progress.
```

--------------------------------

### Sensor Configuration - Extending Defaults

Source: https://dndkit.com/extend/sensors

Configure sensors globally while preserving default sensors using the function form. This approach allows you to add custom constraints or additional sensors without replacing the built-in ones.

```APIDOC
## DragDropManager Sensors Configuration (Extend Defaults)

### Description
Configure sensors globally by extending the default sensors provided by dnd-kit.

### Usage
Pass a function to the `sensors` option that receives the default sensors array and returns a modified array.

### Parameters
#### Configuration Object
- **sensors** (function) - Required - Function that receives default sensors and returns configured sensors array

### Request Example
```ts
import {DragDropManager} from '@dnd-kit/dom';
import {PointerSensor, PointerActivationConstraints} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: (defaults) => [
    ...defaults,
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({value: 5}),
      ],
    }),
  ],
});
```

### Response
Returns a DragDropManager instance with configured sensors.

### Notes
- Local sensors configured on individual draggable elements take precedence over global sensors
- Use spread operator to preserve default sensors
```

--------------------------------

### register() Method

Source: https://dndkit.com/concepts/draggable

Registers a draggable element with the dndkit manager, making it available for drag-and-drop operations.

```APIDOC
## register()

### Description
Register this draggable with the manager
```

--------------------------------

### Customize Sortable Animation with Transition Options

Source: https://dndkit.com/concepts/sortable

Configure animation behavior for position changes using the transition property with duration, easing, and idle settings. The idle flag controls whether animations play when no drag is in progress.

```javascript
new Sortable({
  id: 'item-1',
  index: 0,
  transition: {
    duration: 250, // Animation duration in ms
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Animation easing
    idle: false, // Whether to animate when no drag is in progress
  }
}, manager);
```

--------------------------------

### ID Prefix Option

Source: https://dndkit.com/extend/plugins/accessibility

Configure custom prefixes for the generated element ids. Allows customization of the id attributes for the hidden description and announcement elements.

```APIDOC
## idPrefix

### Description
Custom prefixes for the generated element ids.

### Type
```ts
type idPrefix = {
  description?: string;
  announcement?: string;
}
```

### Default
```ts
{
  description: 'dnd-kit-description',
  announcement: 'dnd-kit-announcement'
}
```

### Properties
- **description** (string) - Optional - Prefix for the hidden description element id
- **announcement** (string) - Optional - Prefix for the announcement/live region element id
```

--------------------------------

### Customize Pointer Sensor Activation Constraints by Pointer Type

Source: https://dndkit.com/extend/sensors/pointer-sensor

Provide a function to the PointerSensor's activationConstraints option to dynamically apply different constraints based on the pointer type (e.g., mouse, touch) or target element.

```javascript
import {PointerActivationConstraints} from '@dnd-kit/dom';

PointerSensor.configure({
  activationConstraints(event, source) {
    const {pointerType, target} = event;

    // Custom constraints based on pointer type
    switch (pointerType) {
      case 'mouse':
        return [
          new PointerActivationConstraints.Distance({value: 5}),
        ];
      case 'touch':
        return [
          new PointerActivationConstraints.Delay({value: 250, tolerance: 5}),
        ];
      default:
        return [
          new PointerActivationConstraints.Delay({value: 200, tolerance: 10}),
          new PointerActivationConstraints.Distance({value: 5}),
        ];
    }
  },
});
```

--------------------------------

### Sensor Base Class API Reference

Source: https://dndkit.com/extend/sensors

Complete API reference for the Sensor base class including properties, methods, and lifecycle information.

```APIDOC
## Sensor Base Class

### Description
Base class for all sensors in dnd-kit. Provides core functionality for detecting user input and managing drag operations.

### Constructor Parameters
- **manager** (DragDropManager) - Required - Reference to the drag and drop manager instance
- **options** (SensorOptions) - Optional - Configuration options for the sensor

### Instance Methods
- **bind(source: Draggable)** - Bind sensor to draggable element and register event listeners. Returns unbind function.
- **enable()** - Enable the sensor for detecting input
- **disable()** - Disable the sensor from detecting input
- **isDisabled()** - Check if sensor is currently disabled. Returns boolean.
- **destroy()** - Clean up sensor resources and remove event listeners
- **registerEffect(callback: () => void | (() => void))** - Register an effect with automatic cleanup

### Static Methods
- **configure(options: SensorOptions)** - Create a configured sensor descriptor

### Lifecycle
1. **Construction** - Sensor instance created with options configured
2. **Binding** - Sensor bound to draggable element with event listeners registered
3. **Operation** - Input detected, coordinates tracked, drag operations managed
4. **Cleanup** - Event listeners removed, effects cleaned up, resources released

### Built-in Sensors
- **PointerSensor** - Handles mouse, touch, and pen input with configurable activation constraints
- **KeyboardSensor** - Enables keyboard navigation and activation using customizable key bindings
```

--------------------------------

### Basic DragDropProvider Usage in Vue

Source: https://dndkit.com/vue/components/drag-drop-provider

This snippet shows how to import and use the DragDropProvider component in a Vue application, attaching an event listener for dragEnd.

```vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
</script>

<template>
  <DragDropProvider @dragEnd="handleDragEnd">
    <!-- Your draggable and droppable elements -->
  </DragDropProvider>
</template>
```

--------------------------------

### Replacing Default DragDropProvider Configuration

Source: https://dndkit.com/react/components/drag-drop-provider

Pass an array directly to `sensors`, `plugins`, or `modifiers` props to completely replace the default configurations with custom ones.

```javascript
import {DragDropProvider} from '@dnd-kit/react';
import {PointerSensor, KeyboardSensor} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      sensors={[
        PointerSensor,
        KeyboardSensor,
      ]}
      plugins={[
        AutoScroller,
        Accessibility,
      ]}
      modifiers={[
        RestrictToWindow,
      ]}
    >
      <YourDraggableContent />
    </DragDropProvider>
  );
}
```

--------------------------------

### Create Sortable Items with DragDropManager

Source: https://dndkit.com/concepts/sortable

Initialize a DragDropManager and create sortable list items with required id, index, and element properties. Each sortable item becomes both draggable and droppable for reordering.

```javascript
import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

export function App() {
  const manager = new DragDropManager();

  const wrapper = document.createElement('ul');
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  wrapper.classList.add('list');

  items.forEach((item, index) => {
    const element = document.createElement('li');

    element.classList.add('item');
    element.innerText = item;

    const sortable = new Sortable({
      id: item,
      index, // Required - the position in the list
      element,
    }, manager);

    wrapper.appendChild(element);
  });

  document.body.appendChild(wrapper);
}
```

--------------------------------

### DragOverlay Props Reference

Source: https://dndkit.com/solid/components/drag-overlay

Complete reference of all available props for the DragOverlay component, including children, tag, disabled, dropAnimation, class, and style properties.

```APIDOC
## DragOverlay Props

### children
- **Type**: JSX.Element | ((source: Draggable) => JSX.Element)
- **Required**: Yes
- **Description**: The content to render as the drag overlay. Only rendered when a drag operation is in progress. Can be a JSX element or a function that receives the drag `source` as an argument.

### tag
- **Type**: ValidComponent
- **Default**: 'div'
- **Description**: The component or HTML tag to render as the overlay wrapper element.

### disabled
- **Type**: boolean | ((source: Draggable | null) => boolean)
- **Description**: Whether the drag overlay is disabled. Can be a boolean or a function that receives the current drag source.

### dropAnimation
- **Type**: DropAnimation | null
- **Description**: Customize or disable the drop animation that plays when a drag operation ends.
  - `undefined` – use the dault animation (250ms ease)
  - `null` – disable the drop animation entirely
  - `{duration, easing}` – customize the animation timing
  - `(context) => Promise<void> | void` – provide a fully custom animation function

### class
- **Type**: string
- **Description**: CSS class name for the overlay wrapper element.

### style
- **Type**: JSX.CSSProperties
- **Description**: Inline styles for the overlay wrapper element.
```

--------------------------------

### Feedback.configure() - Per-Entity Confign

Source: https://dndkit.com/extend/plugins/feedback

Configure the Feedback plugin on individual draggable or sortable entities to override global settings. Per-entity options take precedence over global configuration for that specific entity.

```APIDOC
## Feedback.configure() - Per-Entity

### Description
Configures the Feedback plugin on individual draggable or sortable entities. Per-entity options override the global configuration for that entity.

### Method
Configuration Method

### Parameters

#### Per-Entity Options
- **feedback** (FeedbackType) - Optional - The type of visual feedback to show during drag for this entity. Options: 'default' (original element moves with drag), 'clone' (copy stays in place while original moves), 'move' (element moves without placeholder), 'none' (no visual feedback for custom overlays).
- **dropAnimation** (DropAnimation | null) - Optional - Customize or disable the drop animation for this entity. Overrides the global dropAnimation option.

### Per-Entity Configuration Example (React)
```tsx
import {useDraggable} from '@dnd-kit/react';
import {Feedback} from '@dnd-kit/dom';

function Draggable({id}) {
  const {ref} = useDraggable({
    id,
    plugins: [
      Feedback.configure({
        feedback: 'clone',
        dropAnimation: null,
      }),
    ],
  });

  return <button ref={ref}>Draggable</button>;
}
```

### Per-Entity Configuration Example (TypeScript)
```typescript
import {Draggable, Feedback} from '@dnd-kit/dom';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  plugins: [
    Feedback.configure({
      feedback: 'clone',
      dropAnimation: null,
    }),
  ],
}, manager);
```
```

--------------------------------

### Configure StyleInjector with CSP Nonce

Source: https://dndkit.com/extend/plugins/style-injector

Use `StyleInjector.configure()` to apply a CSP nonce to all injected <style> elements. This is required when your site uses a Content Security Policy that restricts inline styles.

```TypeScript
import {DragDropManager, StyleInjector} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    StyleInjector.configure({ nonce: 'abc123' }),
  ],
});
```

```React
import {DragDropProvider} from '@dnd-kit/react';
import {StyleInjector} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        StyleInjector.configure({ nonce: 'abc123' }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

```Vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {StyleInjector} from '@dnd-kit/dom';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => [...defaults, StyleInjector.configure({ nonce: 'abc123' })]"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

```Svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {StyleInjector} from '@dnd-kit/dom';
</script>

<DragDropProvider
  plugins={(defaults) => [...defaults, StyleInjector.configure({ nonce: 'abc123' })]}
>
  <!-- ... -->
</DragDropProvider>
```

```Solid
import {DragDropProvider} from '@dnd-kit/solid';
import {StyleInjector} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        StyleInjector.configure({ nonce: 'abc123' }),
      ]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Plugin Class Constructor

Source: https://dndkit.com/extend/plugins

The base Plugin class constructor that all custom plugins must extend. Accepts a DragDropManager instance and optional configuration options.

```APIDOC
## Plugin Class Constructor

### Description
Base class for creating custom plugins in @dnd-kit. All plugins must extend this class to integrate with the DragDropManager.

### Constructor
```ts
class Plugin {
  constructor(manager: DragDropManager, options?: PluginOptions)
}
```

### Parameters
- **manager** (DragDropManager) - Required - Reference to the drag and drop manager instance
- **options** (PluginOptions) - Optional - Configuration options for the plugin

### Properties
- **disabled** (boolean) - Whether the plugin is currently disabled
- **options** (PluginOptions) - Current plugin options

### Methods
- **enable()** - Enable the plugin
- **disable()** - Disable the plugin
- **isDisabled()** (boolean) - Check if plugin is disabled
- **configure(options: PluginOptions)** - Update plugin options
- **destroy()** - Clean up plugin resources
- **registerEffect(callback: () => void | (() => void))** - Register a reactive effect that automatically cleans up
```

--------------------------------

### DragDropProvider Configuration

Source: https://dndkit.com/react/components/drag-drop-provider

Configure DragDropProvider behavior by customizing sensors, plugins, and modifiers. You can either replace defaults with an array or extend defaults using a function.

```APIDOC
## DragDropProvider Configuration

### Description
Customize DragDropProvider behavior with plugins, sensors, and modifiers. Each accepts either an array (which replaces the defaults) or a function that receives the defaults.

### Extending Defaults

Use the function form to add to or configure the defaults without replacing them:

```jsx
import {DragDropProvider} from '@dnd-kit/react';
import {Feedback} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        Feedback.configure({ dropAnimation: null }),
      ]}
      modifiers={(defaults) => [...defaults, RestrictToWindow]}
    >
      <YourDraggableContent />
    </DragDropProvider>
  );
}
```

### Replacing Defaults

Pass an array to fully replace the defaults:

```jsx
import {DragDropProvider} from '@dnd-kit/react';
import {PointerSensor, KeyboardSensor} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      sensors={[
        PointerSensor,
        KeyboardSensor,
      ]}
      plugins={[
        AutoScroller,
        Accessibility,
      ]}
      modifiers={[
        RestrictToWindow,
      ]}
    >
      <YourDraggableContent />
    </DragDropProvider>
  );
}
```
```

--------------------------------

### useDraggable with Drag Handle

Source: https://dndkit.com/react/hooks/use-draggable

Configure a drag handle element so that only the handle initiates the drag operation, not the entire draggable element. Use handleRef to connect the handle element.

```JavaScript
import {useDraggable} from '@dnd-kit/react';

function Draggable(props) {
  const {ref, handleRef} = useDraggable({
    id: props.id,
  });

  return (
    <div ref={ref}>
      Draggable
      <button ref={handleRef}>Drag handle</button>
    </div>
  );
}
```

--------------------------------

### useSortable Hook

Source: https://dndkit.com/solid/hooks/use-sortable

The `useSortable` hook from `@dnd-kit/solid/sortable` is used to create sortable elements by combining draggable and droppable behavior with sorting logic. It takes an options object as input to configure its behavior.

```APIDOC
## HOOK useSortable

### Description
The `useSortable` hook from `@dnd-kit/solid/sortable` combines draggable and droppable behavior with sorting logic to create sortable elements. It requires `id` and `index` for reactive sorting.

### Method
HOOK

### Endpoint
`useSortable(options)`

### Parameters
#### Options Object
- **id** (UniqueIdentifier) - Required - A unique identifier. Use `get id() { return props.id }` for reactive values.
- **index** (number) - Required - The current index in the sorted list. Use `get index() { return props.index }` for reactive values.
- **group** (string) - Optional - The group this sortable belongs to. Used for sorting across multiple lists.
- **handle** (Element) - Optional - A handle element. Use the `handleRef` callback to set it.
- **accept** (string | string[]) - Optional - The types of draggable elements this sortable accepts.
- **type** (string) - Optional - The type of this sortable element.
- **plugins** (PluginDescriptor[]) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **transition** (SortableTransition) - Optional - Animation transition configuration.
- **modifiers** (Modifier[]) - Optional - Modifiers to apply to this sortable instance.
- **sensors** (Sensor[]) - Optional - Sensors to use for this sortable instance.
- **collisionDetector** (CollisionDetector) - Optional - A custom collision detection algorithm.
- **collisionPriority** (number) - Optional - The collision priority of this sortable element. Higher values take precedence when multiple droppable elements overlap.
- **disabled** (boolean) - Optional - Whether the sortable is disabled.
- **data** (Data) - Optional - Custom data to attach to this sortable instance.

### Request Example
```javascript
const {ref} = useSortable({
  get id() { return props.id; },
  get index() { return props.index; },
  group: 'my-sortable-group',
  disabled: false
});
```

### Response
#### Success Response (Object)
- **ref** (RefCallback) - A ref callback to attach to the sortable element.

#### Response Example
```javascript
const {ref} = useSortable({ /* options */ });
```
```

--------------------------------

### Announcements Option

Source: https://dndkit.com/extend/plugins/accessibility

Configure custom announcement functions for drag events. Each function receives the event and the DragDropManager instance, and returns a string to announce or undefined to skip the announcement.

```APIDOC
## announcements

### Description
Custom announcement functions for drag events. Each function receives the event and the `DragDropManager` instance, and returns a string to announce (or `undefined` to skip the announcement).

### Type
```ts
interface Announcements {
  dragstart: (event, manager) => string | undefined;
  dragmove?: (event, manager) => string | undefined;
  dragover?: (event, manager) => string | undefined;
  dragend: (event, manager) => string | undefined;
}
```

### Properties
- **dragstart** (function) - Required - Called when dragging starts
- **dragmove** (function) - Optional - Called when dragging moves
- **dragover** (function) - Optional - Called when dragging over a target
- **dragend** (function) - Required - Called when dragging ends
```

--------------------------------

### Configure Feedback plugin per-entity

Source: https://dndkit.com/extend/plugins/feedback

Apply specific feedback behaviors, such as cloning, to individual draggable or sortable entities to override global settings.

```tsx
import {useDraggable} from '@dnd-kit/react';
import {Feedback} from '@dnd-kit/dom';

function Draggable({id}) {
  const {ref} = useDraggable({
    id,
    plugins: [
      Feedback.configure({
        feedback: 'clone',
        dropAnimation: null,
      }),
    ],
  });

  return <button ref={ref}>Draggable</button>;
}
```

```typescript
import {Draggable, Feedback} from '@dnd-kit/dom';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  plugins: [
    Feedback.configure({
      feedback: 'clone',
      dropAnimation: null,
    }),
  ],
}, manager);
```

--------------------------------

### Extending Default Plugins

Source: https://dndkit.com/extend/plugins

Configure DragDropManager to extend the default plugins with custom plugins or modified configurations without replacing the defaults.

```APIDOC
## Extending Default Plugins

### Description
Use the function form of the plugins option to add custom plugins to the defaults or configure existing ones.

### Method
Function-based plugin configuration

### Parameters
- **plugins** (function) - Required - Function that receives default plugins array and returns modified array

### Request Example - Add Custom Plugin
```ts
import {DragDropManager} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [...defaults, MyPlugin]
});
```

### Request Example - Configure Existing Plugin
```ts
import {DragDropManager, Feedback} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Feedback.configure({ dropAnimation: null })
  ]
});
```

### Response
DragDropManager instance with extended plugins configured and ready for use.
```

--------------------------------

### Draggable Feedback Configuration

Source: https://dndkit.com/concepts/draggable

Customize how the element behaves while being dragged using the Feedback plugin. Configure visual feedback options to control whether the original element moves, a clone is created, or custom feedback is provided.

```APIDOC
## Draggable Feedback

### Description
You can customize how the element behaves while being dragged using the Feedback plugin's per-entity configuration.

### Configuration
- **plugins** (PluginDescriptor[]) - An array of plugin descriptors. Use Feedback.configure() to create feedback descriptors

### Feedback Options
- **'default'** - The original element moves with the drag (best for most cases)
- **'clone'** - A copy of the element stays in place while the original moves (good for drag-to-copy)
- **'move'** - The element moves without a placeholder (minimal visual feedback)
- **'none'** - No visual feedback (useful for custom drag overlays)

### Request Example
```javascript
import {Draggable, DragDropManager, Feedback} from '@dnd-kit/dom';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  plugins: [Feedback.configure({ feedback: 'clone' })],
}, manager);
```
```

--------------------------------

### Render DragOverlay Based on Drag Source

Source: https://dndkit.com/svelte/components/drag-overlay

Access the drag source via the children snippet parameter to render different content depending on which element is being dragged.

```svelte
<script>
  import {DragDropProvider, DragOverlay} from '@dnd-kit/svelte';
</script>

<DragDropProvider>
  <!-- draggable elements -->
  <DragOverlay>
    {#snippet children(source)}
      <div>Dragging {source.id}</div>
    {/snippet}
  </DragOverlay>
</DragDropProvider>
```

--------------------------------

### Droppable Instance API

Source: https://dndkit.com/concepts/droppable

The Droppable instance provides a set of properties to monitor its state and methods to control its interaction within the drag and drop lifecycle.

```APIDOC
## Droppable Instance

### Description
The Droppable instance provides properties and methods to manage drop targets within the dndkit framework.

### Properties
- **id** (string) - The unique identifier
- **element** (HTMLElement) - The DOM element acting as the drop target
- **disabled** (boolean) - Whether dropping is currently disabled
- **isDropTarget** (boolean) - Whether a draggable is currently over this target
- **shape** (object) - The current bounding shape of the drop target

### Methods
- **accepts(draggable)** - Check if this target accepts a draggable element
- **refreshShape()** - Recalculate the target's dimensions
- **register()** - Register this target with the manager
- **unregister()** - Remove this target from the manager
- **destroy()** - Clean up this droppable instance and remove all listeners
```

--------------------------------

### Basic createDroppable Usage in Svelte

Source: https://dndkit.com/svelte/primitives/create-droppable

This Svelte component demonstrates how to use `DragDropProvider` and `createDroppable` to manage draggable and droppable elements, updating the parent state on drag end.

```svelte
<script>
import {DragDropProvider} from '@dnd-kit/svelte';
import Draggable from './Draggable.svelte';
import Droppable from './Droppable.svelte';
import './styles.css';
  
let parent = null;
  
function onDragEnd(event) {
if (event.canceled) return;
parent = event.operation.target?.id ?? null;
}
</script>
  
<DragDropProvider {onDragEnd}>
<div id="app">
{#if parent == null}
<Draggable />
{/if}
<Droppable>
{#if parent === 'droppable'}
<Draggable />
{/if}
</Droppable>
</div>
</DragDropProvider>
```

--------------------------------

### Replace Default Plugins with a Custom Set (TypeScript)

Source: https://dndkit.com/extend/plugins

Provide an array to the `plugins` option to completely override the default plugins with a custom selection.

```ts
const manager = new DragDropManager({
  plugins: [
    MyPlugin.configure({ delay: 500 }),
    AutoScroller,
  ]
});
```

--------------------------------

### Configure Cursor plugin in Vue

Source: https://dndkit.com/extend/plugins/cursor

Set up the Cursor plugin with a custom cursor style in a Vue application using DragDropProvider. The plugins prop accepts a function that returns the configured plugin array.

```Vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {Cursor} from '@dnd-kit/dom';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => [...defaults, Cursor.configure({ cursor: 'move' })]"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

--------------------------------

### Per-Draggable Sensor Configuration

Source: https://dndkit.com/extend/sensors

Configure sensors on individual draggable elements. Local sensors take precedence over global sensors configured on the DragDropManager.

```APIDOC
## Draggable Sensors Configuration

### Description
Configure sensors on individual draggable elements for element-specific input handling.

### Usage
Pass a `sensors` array to the Draggable constructor to configure sensors for that specific element.

### Parameters
#### Draggable Constructor Options
- **id** (string) - Required - Unique identifier for the draggable element
- **element** (HTMLElement) - Required - The DOM element to make draggable
- **sensors** (array) - Optional - Array of sensor configurations for this element

### Request Example
```ts
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  sensors: [KeyboardSensor],
}, manager);
```

### Response
Returns a Draggable instance with configured sensors.

### Notes
- Local sensors take precedence over global sensors
- Allows different input handling for different draggable elements
```

--------------------------------

### Rendering drag overlay with createDraggable

Source: https://dndkit.com/svelte/primitives/create-draggable

Use the DragOverlay component to render a different element while dragging is in progress. Only render one DragOverlay per DragDropProvider.

```svelte
<script>
  import {DragDropProvider, DragOverlay, createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<DragDropProvider>
  <button {@attach draggable.attach}>Draggable</button>
  <DragOverlay>
    {#snippet children(source)}
      <div>I will be rendered while dragging...</div>
    {/snippet}
  </DragOverlay>
</DragDropProvider>
```

--------------------------------

### Default Announcements Configuration

Source: https://dndkit.com/extend/plugins/accessibility

The plugin provides default announcements for drag events that are automatically announced to screen reader users. These announcements can be customized through the announcements option.

```APIDOC
## Default Announcements

### Description
The plugin ships with default announcements for the `dragstart`, `dragover`, and `dragend` events.

### Event Announcements

- **dragstart**: `"Picked up draggable item {id}."`
- **dragover** (over a target): `"Draggable item {id} was moved over droppable target {targetId}."`
- **dragover** (no target): `"Draggable item {id} is no longer over a droppable target."`
- **dragend** (dropped on target): `"Draggable item {id} was dropped over droppable target {targetId}"`
- **dragend** (canceled): `"Dragging was cancelled. Draggable item {id} was dropped."`
- **dragend** (no target): `"Draggable item {id} was dropped."`
```

--------------------------------

### Pointer Sensor Activation Constraints Type Definitions

Source: https://dndkit.com/extend/sensors/pointer-sensor

Reference for the type definitions of `ActivationConstraints`, `Distance`, and `Delay` options used to configure the Pointer Sensor.

```typescript
import {PointerActivationConstraints} from '@dnd-kit/dom';

// Array of constraint instances
type ActivationConstraints<E extends Event> = ActivationConstraint<E>[];

// Distance type
type Distance = number | {x?: number; y?: number};

// Distance constraint
new PointerActivationConstraints.Distance({
  value: number;        // Required distance in pixels
  tolerance?: Distance; // Optional abort threshold
});

// Delay constraint
new PointerActivationConstraints.Delay({
  value: number;        // Required duration in ms
  tolerance: Distance;  // Movement tolerance
});
```

--------------------------------

### Extend default plugins using functional configuration

Source: https://dndkit.com/changelog

Pass a function to the plugins property to receive and extend default configurations without overwriting them.

```typescript
const manager = new DragDropManager({
  plugins: (defaults) => [...defaults, MyPlugin],
});
```

--------------------------------

### Use Getter Syntax for Reactive Props in SolidJS Hooks

Source: https://dndkit.com/solid/quickstart

When passing reactive props to SolidJS hooks like `useSortable`, use getter syntax to maintain fine-grained reactivity.

```tsx
useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
  });
```

--------------------------------

### DragDropProvider Component API

Source: https://dndkit.com/svelte/components/drag-drop-provider

Details the properties (props) and event callbacks accepted by the DragDropProvider Svelte component for configuring drag and drop behavior.

```APIDOC
## DragDropProvider Component API

### Description
The `DragDropProvider` component is the root component for drag and drop interactions in Svelte applications. It creates and manages a `DragDropManager` instance, making it available to all descendant components via Svelte’s context API.

### Usage
```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';

  function onDragEnd(event) {
    // Handle drag end
  }
</script>

<DragDropProvider {onDragEnd}>
  <!-- Your draggable and droppable elements -->
</DragDropProvider>
```

### Props
- **manager** (`DragDropManager`) - Oponal - An optional externally created `DragDropManager` instance. If not provided, one will be created automatically.
- **plugins** (`Plugin[] | (defaults: Plugin[]) => Plugin[]`) - Optional - Plugins to use. Defaults to the default preset. Pass an array to replace defaults, or a function to extend them.
  ```javascript
  // Add a plugin alongside defaults
  plugins={(defaults) => [...defaults, MyPlugin]}

  // Replace defaults entirely
  plugins={[MyPlugin]}
  ```
- **sensors** (`Sensor[] | (defaults: Sensor[]) => Sensor[]`) - Optional - Sensors to use. Defaults to `PointerSensor` and `KeyboardSensor`. Pass an array to replace defaults, or a function to extend them.
- **modifiers** (`Modifier[] | (defaults: Modifier[]) => Modifier[]`) - Optional - Modifiers to apply to drag operations. Pass an array to replace defaults, or a function to extend them.

### Events (Callback Props)
- **onBeforeDragStart** - Fired before a drag operation begins. Can be used to prepare state.
- **onDragStart** - Fired when a drag operation starts.
- **onDragMove** - Fired when the dragged element moves.
- **onDragOver** - Fired when the dragged element moves over a droppable target. Call `event.preventDefault()` to prevent the default behavior of plugins that respond to this event.
- **onDragEnd** - Fired when a drag operation ends (dropped or canceled).
- **onCollision** - Fired when collisions are detected between draggable and droppable elements.
```

--------------------------------

### Create a Droppable Element in Svelte

Source: https://dndkit.com/svelte/quickstart

Use the `createDroppable` primitive with a unique ID to define a droppable target. Attach the returned `attach` function to the target element using the `{@attach}` directive.

```svelte
<script>
  import {createDroppable} from '@dnd-kit/svelte';

  const droppable = createDroppable({id: 'droppable'});
</script>

<div {@attach droppable.attach} style="width: 300px; height: 300px;">
  Droppable
</div>
```

--------------------------------

### Toggle AutoScroller at runtime - Solid

Source: https://dndkit.com/extend/plugins/auto-scroller

Use useDragDropManager hook to access the AutoScroller plugin and toggle it dynamically with a button that checks the disabled state.

```Solid
import {useDragDropManager} from '@dnd-kit/solid';
import {AutoScroller} from '@dnd-kit/dom';

function AutoScrollToggle() {
  const manager = useDragDropManager();
  const autoScroller = manager.registry.plugins.get(AutoScroller);

  return (
    <button onClick={() => {
      autoScroller.disabled
        ? autoScroller.enable()
        : autoScroller.disable();
    }}>
      Toggle auto-scroll
    </button>
  );
}
```

--------------------------------

### Define Custom DND Kit Announcements Interface

Source: https://dndkit.com/extend/plugins/accessibility

This interface specifies the structure for custom announcement functions for drag events. Each function should return a string to be announced or 'undefined' to skip.

```ts
interface Announcements {
  dragstart: (event, manager) => string | undefined;
  dragmove?: (event, manager) => string | undefined;
  dragover?: (event, manager) => string | undefined;
  dragend: (event, manager) => string | undefined;
}
```

--------------------------------

### Basic DragDropProvider Usage in Svelte

Source: https://dndkit.com/svelte/components/drag-drop-provider

Import the DragDropProvider component and wrap your draggable/droppable elements. Use the onDragEnd prop to handle the completion of a drag operation.

```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';

  function onDragEnd(event) {
    // Handle drag end
  }
</script>

<DragDropProvider {onDragEnd}>
  <!-- Your draggable and droppable elements -->
</DragDropProvider>
```

--------------------------------

### Creating a Custom SnapToGrid Modifier

Source: https://dndkit.com/extend/modifiers

Extend the base Modifier class and implement the apply method to define custom coordinate transformations.

```ts
import {Modifier} from '@dnd-kit/abstract';
import type {Coordinates} from '@dnd-kit/geometry';

interface GridOptions {
  gridSize: number;
}

class SnapToGrid extends Modifier {
  constructor(manager, options?: GridOptions) {
    super(manager, options);
  }

  public apply(operation): Coordinates {
    if (this.disabled) return operation.transform;

    const {gridSize = 20} = this.options ?? {};
    const {transform} = operation;

    return {
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  }
}
```

--------------------------------

### Create Droppable Elements with useDroppable

Source: https://dndkit.com/solid/quickstart

Use the `useDroppable` hook to define a drop target. Attach its `ref` callback to the target element.

```tsx
import {useDroppable} from '@dnd-kit/solid;

function Droppable(props) {
  const {ref, isDropTarget} = useDroppable({id: props.id});

  return (
    <div ref={ref} style={{width: '300px', height: '300px'}}>
      {props.children}
    </div>
  );
}
```

--------------------------------

### Function: createSortable

Source: https://dndkit.com/svelte/primitives/create-sortable

Details the `createSortable` primitive, including its purpose and the configuration options it accepts as input. This primitive is essential for implementing drag-and-drop sorting functionality in Svelte applications.

```APIDOC
## FUNCTION createSortable

### Description
The `createSortable` primitive from `@dnd-kit/svelte/sortable` is used to create sortable elements. It combines draggable and droppable behavior with sorting logic, allowing for interactive reordering of items within lists.

### Method
Function Call

### Function Signature
`createSortable(options: SortableOptions)`

### Parameters
#### Options Object
- **id** (UniqueIdentifier | (() => UniqueIdentifier)) - Required - A unique identifier for this sortable instance.
- **index** (number | (() => number)) - Required - The current index of this item in the sorted list.
- **group** (string | (() => string)) - Optional - The group this sortable belongs to. Used for sorting across multiple lists.
- **accept** (string | string[] | (() => string | string[])) - Optional - The types of draggable elements this sortable accepts.
- **type** (string | (() => string)) - Optional - The type of this sortable element.
- **plugins** (PluginDescriptor[] | (() => PluginDescriptor[])) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **transition** (SortableTransition | (() => SortableTransition)) - Optional - Animation transition configuration for sort operations.
- **modifiers** (Modifier[] | (() => Modifier[])) - Optional - Modifiers to apply to this sortable instance.
- **sensors** (Sensor[] | (() => Sensor[])) - Optional - Sensors to use for this sortable instance.
- **collisionDetector** (CollisionDetector | (() => CollisionDetector)) - Optional - A custom collision detection algorithm.
- **collisionPriority** (number | (() => number)) - Optional - The collision priority of this sortable element. Higher values take precedence when multiple droppable elements overlap.
- **disabled** (boolean | (() => boolean)) - Optional - Whether the sortable is disabled.
- **data** (Data | (() => Data)) - Optional - Custom data to attach to this sortable instance.

### Usage Example with `move` helper
```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {createSortable} from '@dnd-kit/svelte/sortable';
  import {move} from '@dnd-kit/helpers';
  import './styles.css';
  
  let items = [1, 2, 3, 4];
  let snapshot = [];
  
  function onDragStart() {
    snapshot = items.slice();
  }
  
  function onDragOver(event) {
    items = move(items, event);
  }
  
  function onDragEnd(event) {
    if (event.canceled) items = snapshot;
  }
</script>
  
<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <ul class="list">
    {#each items as id, index (id)}
      {@const sortable = createSortable({id, get index() { return index; }})}
      <li {@attach sortable.attach} class="item">
        Item {id}
      </li>
    {/each}
  </ul>
</DragDropProvider>
```

### Usage Example without `move` helper (manual state management)
```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {createSortable, isSortable} from '@dnd-kit/svelte/sortable';

  let items = $state([1, 2, 3, 4]);
  let snapshot = [];

  function onDragStart() {
    snapshot = items.slice();
  }

  function onDragOver(event) {
    const {source, target} = event.operation;

    if (isSortable(source) && isSortable(target)) {
      const fromIndex = source.index;
      const toIndex = target.index;

      if (fromIndex !== toIndex) {
        const newItems = [...items];
        const [removed] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, removed);
        items = newItems;
      }
    }
  }

  function onDragEnd(event) {
    if (event.canceled) items = snapshot;
  }
</script>

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <ul>
    {#each items as id, index (id)}
      {@const sortable = createSortable({id, get index() { return index; }})}
      <li {@attach sortable.attach}>
        Item {id}
      </li>
    {/each}
  </ul>
</DragDropProvider>
```

### Returns
The `createSortable` function returns an object that provides sortable functionality. This object typically includes properties and methods (e.g., `attach`) that can be bound to a DOM element to enable drag-and-drop sorting behavior.
```

--------------------------------

### Basic Droppable Component with useDroppable

Source: https://dndkit.com/vue/composables/use-droppable

This snippet illustrates how to define a droppable area using `useDroppable` in a Vue component, linking it to a template ref and dynamically applying a class based on its drop target status.

```vue
<script setup>
import { ref } from 'vue';
import { useDroppable } from '@dnd-kit/vue';
  

const element = ref(null);
const { isDropTarget } = useDroppable({ id: 'droppable', element });
</script>
  

<template>
<div ref="element" :class="['droppable', { active: isDropTarget }]">
<slot />
</div>
</template>
```

--------------------------------

### Create Draggable Logic

Source: https://dndkit.com/quickstart

Define a helper function to instantiate a Draggable object with a specific DOM element and manager.

```javascript
function createDraggable(manager) {
  // Create a DOM element (or use an existing one)
  const element = document.createElement('button');
  element.innerText = 'draggable';
  element.classList.add('btn');

  // Make the element draggable
  return new Draggable({id: 'draggable-button', element}, manager);
}
```

--------------------------------

### StyleInjector.addRoot()

Source: https://dndkit.com/extend/plugins/style-injector

Adds an additional root (Document or ShadowRoot) to track for style injection. This is useful when a dragged element is rendered in a different document or shadow root than the drag source. Returns a cleanup function that removes the root.

```APIDOC
## StyleInjector.addRoot()

### Description
Adds an additional root to track for style injection. This is useful when a dragged element is rendered in a different document or shadow root than the drag source.

### Method
Instance method

### Parameters
#### Method Parameters
- **root** (Document | ShadowRoot) - Required - The Document or ShadowRoot to add for style injection tracking.

### Request Example
```typescript
const styleInjector = manager.registry.plugins.get(StyleInjector);

const removeRoot = styleInjector.addRoot(shadowRoot);
```

### Response
Returns a cleanup function that removes the root from tracking when called.

#### Response Example
```typescript
// Later:
removeRoot();
```
```

--------------------------------

### useDroppable Composable

Source: https://dndkit.com/vue/composables/use-droppable

Creates a droppable target for drag-and-drop interactions. It requires a unique identifier and a reference to the DOM element.

```APIDOC
## COMPOSABLE useDroppable

### Description
Creates a droppable target for drag-and-drop interactions within the dnd-kit library. It allows you to define an area where draggable elements can be dropped.

### Method
Composable Function

### Endpoint
`useDroppable(options)`

### Parameters
#### Options Object
- **id** (MaybeRefOrGetter<UniqueIdentifier>) - Required - A unique identifier for this droppable instance.
- **element** (MaybeRefOrGetter<HTMLElement | null>) - Required - A template ref pointing to the droppable element.
- **accept** (MaybeRefOrGetter<string | string[]>) - Optional - The types of draggable elements this droppable accepts.
- **type** (MaybeRefOrGetter<string>) - Optional - The type of this droppable element.
- **collisionDetector** (MaybeRefOrGetter<CollisionDetector>) - Optional - A custom collision detection algorithm.
- **disabled** (MaybeRefOrGetter<boolean>) - Optional - Whether the droppable is disabled.
- **data** (MaybeRefOrGetter<Data>) - Optional - Custom data to attach to this droppable instance.

### Request Example
```javascript
import { ref } from 'vue';
import { useDroppable } from '@dnd-kit/vue';

const element = ref(null);
const { isDropTarget } = useDroppable({
  id: 'my-droppable-area',
  element: element,
  accept: ['item-type-A', 'item-type-B'],
  disabled: false,
  data: { custom: 'value' }
});
```

### Response
#### Return Value (Object)
- **isDropTarget** (boolean) - Whether this element is currently a drop target (a draggable is hovering over it).
- **droppableInstance** (Droppable) - The underlying `Droppable` instance.

#### Response Example
```javascript
// Example of destructured return value
const { isDropTarget } = useDroppable({ /* ...options */ });
// isDropTarget would be a Ref<boolean> that updates reactively.
```
```

--------------------------------

### Simplify DragOverlay Component

Source: https://dndkit.com/react/guides/migration

Update the `DragOverlay` component usage. The new `DragOverlay` expects a render prop that receives the `source` object, simplifying active item management.

```javascript
function App() {
  const [activeId, setActiveId] = useState(null);

  return (
    <DndContext
      onDragStart={() => setActiveId('item')}
      onDragEnd={() => setActiveId(null)}
    >
      <Draggable id="item" />
      <DragOverlay>
        {activeId ? <Item id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

```javascript
function App() {
  return (
    <DragDropProvider>
      <Draggable id="item" />
      <DragOverlay>
        {source => (
          <Item id={source.id} />
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
```

--------------------------------

### Manual sortable state management with isSortable in Svelte

Source: https://dndkit.com/svelte/primitives/create-sortable

Manually manage sortable state using the isSortable type guard and sortable properties (initialIndex, index) for fine-grained control. Splice items array directly in onDragOver for live visual sorting, and restore snapshot in onDragEnd only when canceled.

```svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {createSortable, isSortable} from '@dnd-kit/svelte/sortable';

  let items = $state([1, 2, 3, 4]);
  let snapshot = [];

  function onDragStart() {
    snapshot = items.slice();
  }

  function onDragOver(event) {
    const {source, target} = event.operation;

    if (isSortable(source) && isSortable(target)) {
      const fromIndex = source.index;
      const toIndex = target.index;

      if (fromIndex !== toIndex) {
        const newItems = [...items];
        const [removed] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, removed);
        items = newItems;
      }
    }
  }

  function onDragEnd(event) {
    if (event.canceled) items = snapshot;
  }
</script>

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <ul>
    {#each items as id, index (id)}
      {@const sortable = createSortable({id, get index() { return index; }})}
      <li {@attach sortable.attach}>
        Item {id}
      </li>
    {/each}
  </ul>
</DragDropProvider>
```

--------------------------------

### createDraggable Function

Source: https://dndkit.com/svelte/primitives/create-draggable

Creates a draggable instance with reactive state and attachment functions. Requires a unique id and returns an object with reactive properties for tracking drag state and functions for attaching draggable elements and handles.

```APIDOC
## createDraggable

### Description
Creates a draggable instance that makes elements draggable with reactive state tracking and attachment functions.

### Function Signature
```
createDraggable(options: CreateDraggableOptions): DraggableInstance
```

### Input Parameters

#### Required Parameters
- **id** (UniqueIdentifier | (() => UniqueIdentifier)) - Required - A unique identifier for this draggable instance.

#### Optional Parameters
- **disabled** (boolean | (() => boolean)) - Optional - Whether the draggable is disabled. Defaults to false.
- **plugins** (PluginDescriptor[] | (() => PluginDescriptor[])) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors.
- **modifiers** (Modifier[] | (() => Modifier[])) - Optional - Modifiers to apply to this draggable instance.
- **sensors** (Sensor[] | (() => Sensor[])) - Optional - Sensors to use for this draggable instance.
- **data** (Data | (() => Data)) - Optional - Custom data to attach to this draggable instance.

### Output Properties

#### Reactive State Properties
- **isDragging** (boolean) - Whether this element is currently being dragged (visually).
- **isDropping** (boolean) - Whether this element is in the process of being dropped (animating to final position).
- **isSource** (boolean) - Whether this element is the source of the current drag operation.

#### Instance Properties
- **node** (Draggable) - The underlying `Draggable` instance.

#### Attachment Functions
- **attach** (Action) - Attachment function for the draggable element. Use with `{@attach}` directive.
- **attachHandle** (Action) - Attachment function for a drag handle. Use with `{@attach}` directive.

### Request Example
```javascript
import {createDraggable} from '@dnd-kit/svelte';

const draggable = createDraggable({
  id: 'draggable',
  disabled: false,
  data: {customField: 'value'}
});
```

### Response Example
```javascript
{
  isDragging: false,
  isDropping: false,
  isSource: false,
  node: Draggable,
  attach: [Function],
  attachHandle: [Function]
}
```
```

--------------------------------

### Using Abstract Modifiers for Axis Restriction and Snapping

Source: https://dndkit.com/extend/modifiers

Apply environment-agnostic modifiers to restrict movement to a single axis or snap to a grid.

```ts
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';

// Only allow vertical movement
const manager = new DragDropManager({
  modifiers: [RestrictToVerticalAxis],
});
```

```ts
import {
  Snap,
  RestrictToHorizontalAxis
} from '@dnd-kit/abstract/modifiers';

// Horizontal movement that snaps to a grid
const manager = new DragDropManager({
  modifiers: [
    RestrictToHorizontalAxis,
    Snap.configure({
      size: {
        x: 20,  // Snap every 20px horizontally
        y: 0    // No vertical snapping (already restricted)
      }
    })
  ],
});
```

--------------------------------

### DragOverlay - Rendering Based on Drag Source

Source: https://dndkit.com/solid/components/drag-overlay

Pass a function as a child to the DragOverlay component to receive the drag source as an argument. This enables rendering different content depending on which element is being dragged.

```APIDOC
## Rendering Based on Drag Source

### Description
You can pass a function as a child to the `DragOverlay` component, which will receive the `source` as an argument. This is useful for rendering different content depending on which element is being dragged.

### Usage Example
```typescript
import {DragDropProvider, DragOverlay} from '@dnd-kit/solid';

function App() {
  return (
    <DragDropProvider>
      <Draggable id="foo" />
      <Draggable id="bar" />
      <DragOverlay>
        {source => (
          <div>Dragging {source.id}</div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
```

### Parameters
- **source** (Draggable) - The current drag source object containing information about the element being dragged
```

--------------------------------

### Make Column Component Sortable with dnd-kit

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This snippet shows how to integrate the `useSortable` hook into a `Column` component to enable column sorting. It defines the column's ID, index, type, and collision priority.

```javascript
import React from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {useSortable} from '@dnd-kit/react/sortable';
  

export function Column({children, id, index}) {
const {ref} = useSortable({
id,
index,
type: 'column',
collisionPriority: CollisionPriority.Low,
accept: ['item', 'column'],
});
  

return (
<div className="Column" ref={ref}>
{children}
</div>
);
}
```

--------------------------------

### NEW Draggable

Source: https://dndkit.com/quickstart

Creates a draggable element that can be dropped over droppable targets.

```APIDOC
## NEW Draggable

### Description
Initializes a new Draggable instance for a specific DOM element.

### Method
CONSTRUCTOR

### Endpoint
new Draggable(options, manager)

### Parameters
#### Request Body
- **id** (string) - Required - Unique identifier
- **element** (HTMLElement) - Required - The DOM element to make draggable
- **handle** (HTMLElement) - Optional - Optional drag handle element
- **disabled** (boolean) - Optional - Whether dragging is disabled

### Request Example
{
  "id": "draggable-button",
  "element": element
}
```

--------------------------------

### Integrate Drag and Drop with DragDropProvider

Source: https://dndkit.com/solid/quickstart

Wrap draggable and droppable components within `DragDropProvider` to enable drag and drop interactions and handle drag end events.

```tsx
import {createSignal} from 'solid-js';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/solid;

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});
  return <button ref={ref}>Draggable</button>;
}

function Droppable(props) {
  const {ref, isDropTarget} = useDroppable({id: 'droppable'});
  return <div ref={ref}>{props.children}</div>;
}

function App() {
  const [parent, setParent] = createSignal(undefined);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id);
      }}
    >
      {parent() == null ? <Draggable /> : null}

      <Droppable id="droppable">
        {parent() === 'droppable' ? <Draggable /> : null}
      </Droppable>
    </DragDropProvider>
  );
}
```

--------------------------------

### manager.monitor.addEventListener('dragend')

Source: https://dndkit.com/quickstart

Listens for the completion of a drag operation to update the DOM or application state based on the drop result.

```APIDOC
## EVENT manager.monitor.addEventListener

### Description
Monitors drag and drop events globally within the manager context. The 'dragend' event is used to finalize the movement of elements.

### Method
EVENT_LISTENER

### Endpoint
manager.monitor.addEventListener('dragend', callback)

### Parameters
#### Path Parameters
- **type** (string) - Required - The event type to listen for (e.g., 'dragend').

#### Request Body
- **event** (object) - The event object passed to the callback.
- **event.operation** (object) - Contains `source` (draggable) and `target` (droppable) information.
- **event.canceled** (boolean) - Indicates if the drag operation was canceled (e.g., via Escape key).

### Request Example
manager.monitor.addEventListener('dragend', (event) => {
  const {operation, canceled} = event;
  if (canceled) return;
  if (operation.target) {
    operation.target.element.append(operation.source.element);
  }
});

### Response
#### Success Response (200)
- **void** - This method does not return a value.
```

--------------------------------

### Configuring a Drag Handle for Draggable Elements

Source: https://dndkit.com/concepts/draggable

Specify a "handle" element within the Draggable configuration to restrict drag initiation to a specific part of the element. This allows only the designated handle to trigger the drag operation.

```javascript
const element = document.createElement('div');
const handle = document.createElement('div');
handle.classList.add('handle');
handle.innerHTML = '⋮'; // Three dots menu icon for ag handle

element.appendChild(handle);

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  handle, // Only allow dragging from the handle
}, manager);
```

--------------------------------

### Debounce Option

Source: https://dndkit.com/extend/plugins/accessibility

Configure the debounce delay for announcement updates. Only dragover and dragmove announcements are debounced; dragstart and dragend announcements are dispatched immediately.

```APIDOC
## debounce

### Description
The number of milliseconds to debounce announcement updates. Only `dragover` and `dragmove` announcements are debounced; `dragstart` and `dragend` announcements are dispatched immediately.

### Type
- **number** - Default: `500`

### Details
This option controls how frequently announcements are made during drag operations to avoid overwhelming screen reader users with too many announcements.
```

--------------------------------

### Single Sortable List with Manual State Management

Source: https://dndkit.com/react/guides/sortable-state-management

Implements a single sortable list using React hooks and @dnd-kit. Handle state updates in onDragEnd by comparing initialIndex and index from the sortable source; use isSortable type guard to narrow the source type. The OptimisticSortingPlugin handles visual feedback during drag automatically.

```JavaScript
import {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable, isSortable} from '@dnd-kit/react/sortable';

function SortableItem({id, index}) {
  const {ref} = useSortable({id, index});

  return <li ref={ref}>{id}</li>;
}

export default function App() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const {source} = event.operation;

        if (isSortable(source)) {
          const {initialIndex, index} = source;

          if (initialIndex !== index) {
            setItems((items) => {
              const newItems = [...items];
              const [removed] = newItems.splice(initialIndex, 1);
              newItems.splice(index, 0, removed);
              return newItems;
            });
          }
        }
      }}
    >
      <ul>
        {items.map((id, index) => (
          <SortableItem key={id} id={id} index={index} />
        ))}
      </ul>
    </DragDropProvider>
  );
}
```

--------------------------------

### DragOverlay with function children based on drag source

Source: https://dndkit.com/react/components/drag-overlay

Use a function as children to render different overlay content depending on which element is being dragged. Render DragOverlay once per DragDropProvider.

```JavaScript
import {DragDropProvider, DragOverlay} from '@dnd-kit/react';

function App() {
  return (
    <DragDropProvider>
      <Draggable id="foo" />
      <Draggable id="bar" />
      <DragOverlay>
        {source => (
          <div>Dragging {source.id}</div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
```

--------------------------------

### DragDropProvider Component

Source: https://dndkit.com/solid/components/drag-drop-provider

The root component that creates and manages a DragDropManager instance for drag and drop interactions. It wraps your draggable and droppable elements and provides context to all descendant components.

```APIDOC
## DragDropProvider Component

### Description
The DragDropProvider component is the root component for drag and drop interactions in SolidJS applications. It creates a DragDropManager instance and makes it available to all descendant components via Solid's context API.

### Props

#### Configuration Props
- **manager** (DragDropManager) - Optional - An optional externally created DragDropManager instance. If not provided, one will be created automatically.
- **plugins** (Plugin[] | (defaults: Plugin[]) => Plugin[]) - Optional - Plugins to use. Defaults to the default preset. Pass an array to replace defaults, or a function to extend them.
- **sensors** (Sensor[] | (defaults: Sensor[]) => Sensor[]) - Optional - Sensors to use. Defaults to PointerSensor and KeyboardSensor. Pass an array to replace defaults, or a function to extend them.
- **modifiers** (Modifier[] | (defaults: Modifier[]) => Modifier[]) - Optional - Modifiers to apply to drag operations. Pass an array to replace defaults, or a function to extend them.

#### Event Props
- **onBeforeDragStart** (function) - Optional - Called before a drag operation begins.
- **onDragStart** (function) - Optional - Called when a drag operation starts.
- **onDragMove** (function) - Optional - Called when the dragged element moves.
- **onDragOver** (function) - Optional - Called when the dragged element moves over a droppable target. Call event.preventDefault() to prevent the default behavior of plugins that respond to this event.
- **onDragEnd** (function) - Optional - Called when a drag operation ends (dropped or canceled).
- **onCollision** (function) - Optional - Called when collisions are detected.

### Request Example
```jsx
import {DragDropProvider} from '@dnd-kit/solid';

function App() {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        // Handle drop
      }}
    >
      {/* Your draggable and droppable elements */}
    </DragDropProvider>
  );
}
```

### Plugin Configuration Example
```jsx
// Add a plugin alongside defaults
<DragDropProvider
  plugins={(defaults) => [...defaults, MyPlugin]}
>
  {/* content */}
</DragDropProvider>

// Replace defaults entirely
<DragDropProvider
  plugins={[MyPlugin]}
>
  {/* content */}
</DragDropProvider>
```
```

--------------------------------

### Create droppable elements with useDroppable

Source: https://dndkit.com/vue/quickstart

Use the useDroppable composable to create drop targets. Like useDraggable, it requires a unique id and an element ref, and returns reactive properties like isDropTarget.

```vue
<script setup>
import {ref} from 'vue';
import {useDroppable} from '@dnd-kit/vue';

const element = ref(null);
const {isDropTarget} = useDroppable({id: 'droppable', element});
</script>

<template>
  <div ref="element" :style="{width: '300px', height: '300px'}">
    <slot />
  </div>
</template>
```

--------------------------------

### KeyboardCodes Interface Definition

Source: https://dndkit.com/extend/sensors/keyboard-sensor

This TypeScript interface outlines the structure for the `keyboardCodes` configuration object. It details the expected `KeyCode` arrays for each drag and drop action.

```typescript
interface KeyboardCodes {
  start: KeyCode[];    // Start dragging
  cancel: KeyCode[];   // Cancel operation
  end: KeyCode[];      // End dragging
  up: KeyCode[];       // Move up
  down: KeyCode[];     // Move down
  left: KeyCode[];     // Move left
  right: KeyCode[];    // Move right
}

type KeyCode = KeyboardEvent['code'];
```

--------------------------------

### Create Multiple Sortable Lists with Groups

Source: https://dndkit.com/concepts/sortable

Assign sortable items to different groups to create multiple independent lists that do not share items. Each group maintains its own set of sortable elements.

```javascript
const list1 = ['Item 1', 'Item 2'];
const list2 = ['Item 3', 'Item 4'];

// First list
list1.forEach((item, index) => {
  new Sortable({
    id: item,
    index,
    group: 'list1', // Assign to first group
    element: createItemElement(item),
  }, manager);
});

// Second list
list2.forEach((item, index) => {
  new Sortable({
    id: item,
    index,
    group: 'list2', // Assign to second group
    element: createItemElement(item),
  }, manager);
});
```

--------------------------------

### Registering Draggable Elements

Source: https://dndkit.com/concepts/drag-drop-manager

Elements automatically register when created with a manager reference. Use manual registration only for advanced use cases or when opting out of auto-registration.

```javascript
// Manual registration
const cleanup = manager.registry.register(draggable);
cleanup(); // Or manager.registry.unregister(draggable);

// Auto-registration with manager reference
const draggable = new Draggable({
  id: 'draggable-1',
  element,
}, manager);

// Opt out of auto-registration
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  register: false
}, manager);
```

--------------------------------

### Manual State Management with isSortable Type Guard

Source: https://dndkit.com/solid/hooks/use-sortable

Manage sortable state manually using the isSortable type guard and sortable properties (initialIndex, index) for more control over state updates. Handles canceled drags and works with optimistic sorting enabled by default.

```javascript
import {createSignal, For} from 'solid-js';
import {DragDropProvider} from '@dnd-kit/solid';
import {useSortable, isSortable} from '@dnd-kit/solid/sortable';

function SortableItem(props) {
  const {ref} = useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
  });

  return <li ref={ref} class="item">Item {props.id}</li>;
}

export default function App() {
  const [items, setItems] = createSignal([1, 2, 3, 4]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const {source} = event.operation;

        if (isSortable(source)) {
          const {initialIndex, index} = source;

          if (initialIndex !== index) {
            setItems((items) => {
              const newItems = [...items];
              const [removed] = newItems.splice(initialIndex, 1);
              newItems.splice(index, 0, removed);
              return newItems;
            });
          }
        }
      }}
    >
      <ul class="list">
        <For each={items()}>
          {(id, index) => <SortableItem id={id} index={index()} />}
        </For>
      </ul>
    </DragDropProvider>
  );
}
```

--------------------------------

### Add Additional Root for Style Injection

Source: https://dndkit.com/extend/plugins/style-injector

Adds an extra `Document` or `ShadowRoot` to track for style injection, useful when a dragged element is in a different root. Call the returned cleanup function to remove the root.

```TypeScript
const removeRoot = styleInjector.addRoot(shadowRoot);

// Later:
removeRoot();
```

--------------------------------

### Using drag handles with createDraggable

Source: https://dndkit.com/svelte/primitives/create-draggable

Designate a specific element as the drag handle using attachHandle, allowing users to drag only from that element while the rest of the draggable element remains interactive.

```svelte
<script>
  import {createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<div {@attach draggable.attach}>
  Drag me by the handle
  <button {@attach draggable.attachHandle} class="handle" />
</div>
```

--------------------------------

### Add the Debug Plugin to DragDropManager or DragDropProvider

Source: https://dndkit.com/extend/plugins/debug

Add the `Debug` plugin to your `DragDropManager` instance or `DragDropProvider` component. This plugin is for development only and should be removed before production.

```TypeScript
import {DragDropManager} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';

const manager = new DragDropManager({
  plugins: (defaults) => [...defaults, Debug],
});
```

```React
import {DragDropProvider} from '@dnd-kit/react';
import {Debug} from '@dnd-kit/dom/plugins/debug';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [Debug, ...defaults]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

```Vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {Debug} from '@dnd-kit/dom/plugins/debug';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => [Debug, ...defaults]"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

```Svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {Debug} from '@dnd-kit/dom/plugins/debug';
</script>

<DragDropProvider
  plugins={(defaults) => [Debug, ...defaults]}
>
  <!-- ... -->
</DragDropProvider>
```

```Solid
import {DragDropProvider} from '@dnd-kit/solid';
import {Debug} from '@dnd-kit/dom/plugins/debug';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => [Debug, ...defaults]}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Custom Modifier - Extend Modifier Class

Source: https://dndkit.com/extend/modifiers

Create custom modifiers by extending the Modifier base class. Implement the apply() method to define custom movement transformation logic.

```APIDOC
## Custom Modifier Implementation

### Description
Create custom modifiers by extending the Modifier base class and implementing the apply() method.

### Base Class
`@dnd-kit/abstract` - Modifier

### Constructor Parameters
- **manager** (DragDropManager) - Required - Reference to the drag and drop manager instance
- **options** (Record<string, any>) - Optional - Configuration for the modifier

### Methods to Implement
- **apply(operation)** - Transform drag coordinates and return modified Coordinates

### Example Implementation
```ts
import {Modifier} from '@dnd-kit/abstract';
import type {Coordinates} from '@dnd-kit/geometry';

interface GridOptions {
  gridSize: number;
}

class SnapToGrid extends Modifier {
  constructor(manager, options?: GridOptions) {
    super(manager, options);
  }

  public apply(operation): Coordinates {
    if (this.disabled) return operation.transform;

    const {gridSize = 20} = this.options ?? {};
    const {transform} = operation;

    return {
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  }
}
```

### Usage
```ts
const manager = new DragDropManager({
  modifiers: [new SnapToGrid(manager, {gridSize: 10})]
});
```
```

--------------------------------

### Combine Draggable and Droppable Elements with DragDropProvider in Svelte

Source: https://dndkit.com/svelte/quickstart

Wrap draggable and droppable elements with `DragDropProvider` to enable drag and drop interactions. Use the `onDragEnd` prop to handle drag completion and update the state.

```svelte
<script>
  import {DragDropProvider, createDraggable, createDroppable} from '@dnd-kit/svelte';

  let parent = $state(undefined);

  const draggable = createDraggable({id: 'draggable'});
  const droppable = createDroppable({id: 'droppable'});

  function onDragEnd(event) {
    if (event.canceled) return;
    parent = event.operation.target?.id;
  }
</script>

<DragDropProvider {onDragEnd}>
  {#if parent == null}
    <button {@attach draggable.attach}>Draggable</button>
  {/if}

  <div {@attach droppable.attach} style="width: 300px; height: 300px;">
    {#if parent === 'droppable'}
      <button {@attach draggable.attach}>Draggable</button>
    {/if}
  </div>
</DragDropProvider>
```

--------------------------------

### DragOverlay with dynamic content based on drag source

Source: https://dndkit.com/solid/components/drag-overlay

Pass a function as a child to DragOverlay to render different content depending on which element is being dragged. The function receives the drag source as an argument.

```jsx
import {DragDropProvider, DragOverlay} from '@dnd-kit/solid';

function App() {
  return (
    <DragDropProvider>
      <Draggable id="foo" />
      <Draggable id="bar" />
      <DragOverlay>
        {source => (
          <div>Dragging {source.id}</div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
```

--------------------------------

### Handle dragend for single list with isSortable

Source: https://dndkit.com/concepts/sortable

Use isSortable type guard to narrow source and access initialIndex and index properties. With optimistic sorting enabled, only handle dragend to reorder items within a single list.

```javascript
import {isSortable} from '@dnd-kit/dom/sortable';

manager.monitor.addEventListener('dragend', (event) => {
  if (event.canceled) return;

  const {source} = event.operation;

  if (isSortable(source)) {
    const {initialIndex, index} = source;

    if (initialIndex !== index) {
      // Reorder your data: move the item from initialIndex to index
      const newItems = [...items];
      const [removed] = newItems.splice(initialIndex, 1);
      newItems.splice(index, 0, removed);
      items = newItems;
    }
  }
});
```

--------------------------------

### Extend Default Plugins with a Custom Plugin (TypeScript)

Source: https://dndkit.com/extend/plugins

Use the function form in the `plugins` option to add a custom plugin to the default set without replacing them.

```ts
import {DragDropManager} from '@dnd-kit/dom;

const manager = new DragDropManager({
  plugins: (defaults) => [...defaults, MyPlugin],
});
```

--------------------------------

### Draggable Class Constructor

Source: https://dndkit.com/concepts/draggable

Initialize a new Draggable instance with a unique ID and DOM element. The Draggable class orchestrates drag behavior for individual elements within a DragDropManager context.

```APIDOC
## Draggable Constructor

### Description
Creates a new Draggable instance to make a DOM element draggable.

### Constructor Signature
```
new Draggable(config, manager)
```

### Parameters

#### Constructor Arguments
- **id** (string | number) - Required - A unique identifier for this draggable element within the same drag and drop context
- **element** (Element) - Optional - The DOM element to make draggable. Must be set to enable dragging
- **handle** (Element) - Optional - A drag handle element. If not provided, the entire element will be draggable
- **type** (string | number | Symbol) - Optional - Assign a type to restrict which droppable targets can accept this element
- **plugins** (PluginDescriptor[]) - Optional - An array of plugin descriptors for per-entity plugin configuration
- **disabled** (boolean) - Optional - Set to true to temporarily prevent dragging this element
- **modifiers** (Modifier[]) - Optional - An array of modifiers to customize drag behavior
- **sensors** (Sensors[]) - Optional - An array of sensors to detect drag interactions
- **data** ({[key: string]: any}) - Optional - Optional data to associate with this draggable element, available in event handlers
- **effects** (() => Effect[]) - Optional - Advanced feature: a function that returns an array of reactive effects that can be set up and automatically cleaned up when invoking destroy()

#### Constructor Parameters
- **config** (object) - Configuration object containing the parameters listed above
- **manager** (DragDropManager) - The DragDropManager instance to orchestrate the drag and drop system

### Request Example
```javascript
import {Draggable, DragDropManager} from '@dnd-kit/dom';

const manager = new DragDropManager();
const element = document.createElement('button');
element.innerText = 'draggable';
element.classList.add('btn');

const draggable = new Draggable({
  id: 'draggable-1',
  element,
}, manager);

document.body.appendChild(element);
```
```

--------------------------------

### Manual sortable state management with isSortable type guard

Source: https://dndkit.com/vue/composables/use-sortable

Manually manage sortable state using the isSortable type guard and sortable properties (initialIndex, index). Handles canceled drags and works with optimistic sorting enabled by default.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/vue';
import { isSortable } from '@dnd-kit/vue/sortable';
import SortableItem from './SortableItem.vue';

const items = ref([1, 2, 3, 4]);

function onDragEnd(event: DragEndEvent) {
  if (event.canceled) return;

  const { source } = event.operation;

  if (isSortable(source)) {
    const { initialIndex, index } = source;

    if (initialIndex !== index) {
      const newItems = [...items.value];
      const [removed] = newItems.splice(initialIndex, 1);
      newItems.splice(index, 0, removed);
      items.value = newItems;
    }
  }
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <ul class="list">
      <SortableItem
        v-for="(id, index) in items"
        :key="id"
        :id="id"
        :index="index"
      />
    </ul>
  </DragDropProvider>
</template>
```

--------------------------------

### createDroppable Primitive

Source: https://dndkit.com/svelte/primitives/create-droppable

The `createDroppable` primitive allows you to define areas where draggable elements can be dropped. It requires a unique `id` and returns an object with an `attach` function and reactive state.

```APIDOC
## PRIMITIVE createDroppable

### Description
The `createDroppable` primitive allows you to define areas where draggable elements can be dropped. It requires a unique `id` and returns an object with an `attach` function and reactive state.

### Method
N/A (This is a function/primitive, not an HTTP method)

### Endpoint
`createDroppable` (This is the name of the primitive/function)

### Parameters
#### Input Parameters
- **id** (UniqueIdentifier | (() => UniqueIdentifier)) - Required - A unique identifier for this droppable instance.
- **accept** (string | string[] | (() => string | string[])) - Optional - The types of draggable elements this droppable accepts.
- **type** (string | (() => string)) - Optional - The type of this droppable element.
- **collisionDetector** (CollisionDetector | (() => CollisionDetector)) - Optional - A custom collision detection algorithm.
- **disabled** (boolean | (() => boolean)) - Optional - Whether the droppable is disabled.
- **data** (Data | (() => Data)) - Optional - Custom data to attach to this droppable instance.

### Request Example
```javascript
import { createDroppable } from '@dnd-kit/svelte';

const droppable = createDroppable({
  id: 'my-droppable-area',
  accept: ['item-type-1', 'item-type-2'],
  disabled: false,
  data: { custom: 'value' }
});
```

### Response
#### Output
- **isOver** (boolean) - Whether this element is currently a drop target (a draggable is hovering over it).
- **droppableInstance** (Droppable instance) - The underlying `Droppable` instance.
- **attach** (function) - Attachment function for the droppable element. Use with `{@attach}`.

#### Response Example
```javascript
// Example of the object returned by createDroppable
const droppable = {
  id: 'my-droppable-area',
  isOver: false, // reactive state
  droppableInstance: { /* ... internal instance details ... */ },
  attach: (node) => { /* ... attaches the DOM node ... */ }
};
```
```

--------------------------------

### Combine draggable and droppable with DragDropProvider

Source: https://dndkit.com/react/quickstart

Wrap draggable and droppable elements with DragDropProvider to enable drag and drop interactions. Use the onDragEnd callback to handle drop events and update component state.

```jsx
import {DragDropProvider} from '@dnd-kit/react';
import Draggable from './Draggable';
import Droppable from './Droppable';

function App() {
  const [isDropped, setIsDropped] = useState(false);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const {target} = event.operation;
        setIsDropped(target?.id === 'droppable');
      }}
    >
      {!isDropped && <Draggable />}

      <Droppable id="droppable">
        {isDropped && <Draggable />}
      </Droppable>
    </DragDropProvider>
  );
}
```

```jsx
import {useDraggable} from '@dnd-kit/react';

export function Draggable() {
  const {ref} = useDraggable({
    id: 'draggable',
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
}
```

```jsx
import {useDroppable} from '@dnd-kit/react';

function Droppable({id, children}) {
  const {ref} = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{width: 300, height: 300}}>
      {children}
    </div>
  );
}
```

--------------------------------

### DragDropManager Configuration - Global Modifiers

Source: https://dndkit.com/extend/modifiers

Configure modifiers globally on a DragDropManager instance. Supports both array form for replacement and function form for extending defaults.

```APIDOC
## DragDropManager Modifiers Configuration

### Description
Configure modifiers globally on a DragDropManager instance to apply transformation logic to all draggable elements.

### Configuration Options

#### Array Form (Replace Defaults)
Pass an array to fully replace the default modifiers:

```ts
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  modifiers: [RestrictToWindow],
});
```

#### Function Form (Extend Defaults)
Use a function to add modifiers without replacing the defaults:

```ts
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  modifiers: (defaults) => [...defaults, RestrictToWindow],
});
```

### Modifier Order
Modifiers are applied in order, so place restrictions before transformations.
```

--------------------------------

### DragOverlay - Drop Animation Customization

Source: https://dndkit.com/solid/components/drag-overlay

Customize or disable the drop animation that plays when a drag operation ends using the dropAnimation prop. Supports disabling animation, customizing timing, or providing a fully custom animation function.

```APIDOC
## Customizing the Drop Animation

### Description
By default, when a drag operation ends, the overlay animates back to the position of the source element. You can customize or disable this animation using the `dropAnimation` prop.

### Usage Examples

#### Disable the drop animation
```typescript
<DragOverlay dropAnimation={null}>
  <div>No animation on drop</div>
</DragOverlay>
```

#### Customize the animation timing
```typescript
<DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
  <div>Fast drop animation</div>
</DragOverlay>
```

### dropAnimation Options
- **undefined** – use the default animation (250ms ease)
- **null** – disable the drop animation entirely
- **{duration, easing}** – customize the animation timing
- **(context) => Promise<void> | void** – provide a fully custom animation function
```

--------------------------------

### Droppable - Collision Detection

Source//dndkit.com/concepts/droppable

Configure collision detection algorithms to determine when draggable elements are over the drop target. Multiple strategies are available including rectangle intersection, pointer intersection, closest center, and direction-biased detection.

```APIDOC
## Droppable - Collision Detection

### Description
Customize collision detection behavior to determine when draggable elements are over the drop target. By default, rectangle intersection is used.

### Parameters
#### Configuration
- **collisionDetector** (CollisionDetector) - Optional - Function to determine collision detection
  - `shapeIntersection`: Default, uses rectangle intersection
  - `pointerIntersection`: Uses pointer position for precise detection
  - `closestCenter`: Uses center point distance, ideal for card stacking
  - `directionBiased`: Considers drag direction, useful for sortable lists

### Usage Examples

#### Using Closest Center Detector
```js
import {
  closestCenter,
  pointerIntersection,
  directionBiased
} from '@dnd-kit/collision';

// Use closest center point for card stacking
const droppable = new Droppable({
  id: 'card-stack',
  element,
  collisionDetector: closestCenter
}, manager);
```

#### Default Rectangle Intersection
```js
// Rectangle intersection is used by default
const droppable = new Droppable({
  id: 'drop-zone',
  element
}, manager);
```
```

--------------------------------

### Droppable - Accepting Specific Types

Source: https://dndkit.com/concepts/droppable

Configure which draggable elements can be dropped on a target using the accepts property. Supports string types, arrays of types, or custom validation functions.

```APIDOC
## Droppable - Accepting Specific Types

### Description
Restrict which draggable elements can be dropped by using the `accepts` property. Supports single types, multiple types, or custom validation logic.

### Parameters
#### Configuration
- **accepts** (string | number | Symbol | function) - Optional - Specifies which draggables can be dropped
  - String/number/Symbol: Single type identifier
  - Array: Multiple type identifiers
  - Function: Custom validation function receiving draggable instance

### Usage Examples

#### Accept Single Type
```js
const droppable = new Droppable({
  id: 'drop-zone',
  element,
  accepts: 'item'
}, manager);
```

#### Accept Multiple Types
```js
const droppable = new Droppable({
  id: 'drop-zone',
  element,
  accepts: ['item', 'card']
}, manager);
```

#### Custom Validation Function
```js
const droppable = new Droppable({
  id: 'drop-zone',
  element,
  accepts: (draggable) => {
    // Custom acceptance logic
    return draggable.type === 'item' && draggable.data.category === 'fruit';
  }
}, manager);
```
```

--------------------------------

### Customize DragOverlay Drop Animation

Source: https://dndkit.com/svelte/components/drag-overlay

Control the drop animation that plays when a drag operation ends using the dropAnimation prop. Set to null to disable, or provide custom duration and easing.

```svelte
<!-- Disable the drop animation -->
<DragOverlay dropAnimation={null}>
  {#snippet children(source)}
    <div>No animation on drop</div>
  {/snippet}
</DragOverlay>

<!-- Customize the animation timing -->
<DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
  {#snippet children(source)}
    <div>Fast drop animation</div>
  {/snippet}
</DragOverlay>
```

--------------------------------

### ID Option

Source: https://dndkit.com/extend/plugins/accessibility

Provide a stable identifier used to generate the id attributes for the hidden description and live region elements. When not provided, a unique id is generated automatically.

```APIDOC
## id

### Description
A stable identifier used to generate the `id` attributes for the hidden description and live region elements. When not provided, a unique id is generated automatically. Useful when you need to reference these elements from outside the plugin.

### Type
- **string** - Optional

### Details
Providing a stable id is useful when you need to reference the hidden description or live region elements from outside the plugin.
```

--------------------------------

### Update Droppable Components with useDroppable Hook

Source: https://dndkit.com/react/guides/migration

Migrate droppable components from the old `useDroppable` hook structure to the simplified version provided by `@dnd-kit/react`. The new hook returns a single `droppable` object.

```javascript
function Dropzone() {
  const {setNodeRef, isOver} = useDroppable({
    id: 'drop-zone'
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'lightblue' : 'white'
      }}
    >
      Drop here
    </div>
  );
}
```

```javascript
function Dropzone() {
  const droppable = useDroppable({
    id: 'drop-zone'
  });

  return (
    <div
      ref={droppable.ref}
      style={{
        background: droppable.isDropTarget ? 'green' : 'white'
      }}
    >
      Drop here
    </div>
  );
}
```

--------------------------------

### Render DragOverlay Content Based on Drag Source

Source: https://dndkit.com/vue/components/drag-overlay

Use the scoped slot with the source prop to render different overlay content depending on which draggable element is being dragged.

```vue
<script setup>
import {DragDropProvider, DragOverlay} from '@dnd-kit/vue';
</script>

<template>
  <DragDropProvider>
    <Draggable id="foo" />
    <Draggable id="bar" />
    <DragOverlay>
      <template #default="{ source }">
        <div>Dragging {{ source.id }}</div>
      </template>
    </DragOverlay>
  </DragDropProvider>
</template>
```

--------------------------------

### Create a Draggable Element in Svelte

Source: https://dndkit.com/svelte/quickstart

Use the `createDraggable` primitive with a unique ID to make an element draggable. Attach the returned `attach` function to the element using the `{@attach}` directive.

```svelte
<script>
  import {createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<button {@attach draggable.attach}>
  Draggable
</button>
```

--------------------------------

### Handling Drag Events with DragDropProvider and move Helper (React)

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This snippet integrates the `DragDropProvider` into the `App` component to manage drag-and-drop events. The `onDragOver` handler uses the `move` helper function to update the state and reorder items between columns.

```javascript
import React, {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import {Column} from './Column.js';
import {Item} from './Item.js';
import './styles.css';
  

export default function App() {
const [items, setItems] = useState({
A: ['A0', 'A1', 'A2'],
B: ['B0', 'B1'],
C: [],
});
  

return (
<DragDropProvider
onDragOver={(event) => {
setItems((items) => move(items, event));
}}
>
<div className="Root">
{Object.entries(items).map(([column, items]) => (
<Column key={column} id={column}>
{items.map((id, index) => (
<Item key={id} id={id} index={index} column={column} />
```

--------------------------------

### Accessing Drag State with useDraggable (Solid)

Source: https://dndkit.com/solid/hooks/use-draggable

Illustrates how to retrieve the `isDragging` state from `useDraggable` to conditionally apply styles or attributes to the draggable element based on its active drag status.

```javascript
import {useDraggable} from '@dnd-kit/solid';

function Draggable() {
  const {ref, isDragging} = useDraggable({id: 'my-draggable'});

  return (
    <button ref={ref} data-dragging={isDragging()}>
      Drag me
    </button>
  );
}
```

--------------------------------

### Modifier Base Class API

Source: https://dndkit.com/extend/modifiers

Complete API reference for the Modifier base class including constructor parameters, instance methods, and static methods.

```APIDOC
## Modifier Base Class API

### Module
`@dnd-kit/abstract`

### Constructor Parameters
- **manager** (DragDropManager) - Required - Reference to the drag and drop manager instance
- **options** (Record<string, any>) - Optional - Configuration for the modifier

### Instance Methods
- **apply(operation)** - Transform drag coordinates
  - Parameters: operation (DragOperation)
  - Returns: Coordinates - Transformed coordinates
  - Called during drag operations

- **enable()** - Enable the modifier
  - Returns: void

- **disable()** - Disable the modifier
  - Returns: void

- **isDisabled()** - Check if modifier is disabled
  - Returns: boolean

- **destroy()** - Clean up resources
  - Returns: void
  - Called when modifier is no longer needed

### Static Methods
- **configure(options)** - Create configured modifier instance
  - Parameters: options (Record<string, any>)
  - Returns: Modifier instance
  - Allows declarative modifier configuration

### Example
```ts
const snapToGrid = SnapToGrid.configure({
  gridSize: 10
});

const manager = new DragDropManager({
  modifiers: [snapToGrid]
});
```
```

--------------------------------

### DragOverlay Conditional Rendering

Source: https://dndkit.com/vue/components/drag-overlay

Use scoped slots to access the current drag source and render different content based on which element is being dragged.

```APIDOC
## Rendering based on the drag source

### Description
Access the current drag source through scoped slots to conditionally render different overlay content.

### Usage
```vue
<script setup>
import {DragDropProvider, DragOverlay} from '@dnd-kit/vue';
</script>

<template>
  <DragDropProvider>
    <Draggable id="foo" />
    <Draggable id="bar" />
    <DragOverlay>
      <template #default="{ source }">
        <div>Dragging {{ source.id }}</div>
      </template>
    </DragOverlay>
  </DragDropProvider>
</template>
```

### Slot Props
- **source** - The Draggable instance that is the source of the current drag operation
```

--------------------------------

### Draggable Properties

Source: https://dndkit.com/concepts/draggable

Access and monitor the state of a Draggable instance through its properties. These properties provide information about the draggable element's configuration and current drag state.

```APIDOC
## Draggable Instance Properties

### Description
The Draggable instance provides these key properties for accessing configuration and state information.

### Properties

- **id** (string | number) - The unique identifier for this draggable element
- **element** (Element) - The main DOM element that is draggable
- **handle** (Element) - The drag handle element, if specified during configuration
- **type** (string | number | Symbol) - The assigned type for droppable target restrictions
- **disabled** (boolean) - Whether dragging is currently disabled for this element
- **isDragging** (boolean) - Whether this element is currently being dragged
- **isDropping** (boolean) - Whether this element is currently being dropped

### Usage Example
```javascript
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  type: 'item',
}, manager);

// Access properties
console.log(draggable.id);        // 'draggable-1'
console.log(draggable.isDragging); // false (initially)
console.log(draggable.type);       // 'item'
```
```

--------------------------------

### DragOverlay Slots

Source: https://dndkit.com/vue/components/drag-overlay

Slot definitions for the DragOverlay component to customize overlay content rendering.

```APIDOC
## Slots

### default
- **Type:** Slot
- **Description:** The content to render as the drag overlay. Only rendered when a drag operation is in progress.
- **Slot Props:**
  - **source** – the Draggable instan that is the source of the current drag operation
```

--------------------------------

### Sortable Item Component with Drag State

Source: https://dndkit.com/react/guides/migration

Creates a draggable list item that applies a 'dragging' class when actively being dragged. Use with dnd-kit's useSortable hook to enable drag-and-drop reordering.

```jsx
className={sortable.isDragging ? 'dragging' : undefined}
>
  Item {id}
</div>
```

--------------------------------

### Create droppable element with useDroppable hook

Source: https://dndkit.com/react/quickstart

Use the useDroppable hook with a unique id to create drop targets. Attach the returned ref to the element where draggable items can be dropped.

```jsx
import {useDroppable} from '@dnd-kit/react';

function Droppable({id, children}) {
  const {ref} = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{width: 300, height: 300}}>
      {children}
    </div>
  );
}
```

--------------------------------

### Migrate Sortable Components with useSortable Hook

Source: https://dndkit.com/react/guides/migration

Update sortable components to use the new `useSortable` hook from `@dnd-kit/react/sortable`. The new hook returns a single `sortable` object.

```javascript
import {useSortable} from '@dnd-kit/sortable';

function SortableItem({id, index}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id,
    index
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      Item {id}
    </div>
  );
}
```

```javascript
import {useSortable} from '@dnd-kit/react/sortable';

function SortableItem({id, index}) {
  const sortable = useSortable({
    id,
    index
  });

  return (
    <div
      ref={sortable.ref}

```

--------------------------------

### Plugin Effects Registration

Source: https://dndkit.com/extend/plugins

Register reactive effects in plugins that automatically handle cleanup when the plugin is destroyed.

```APIDOC
## Plugin Effects Registration

### Description
Register effects that automatically clean up resources when the plugin is destroyed.

### Method
```ts
registerEffect(callback: () => void | (() => void)): void
```

### Parameters
- **callback** (function) - Required - Effect function that optionally returns a cleanup function

### Request Example
```ts
class MyPlugin extends Plugin {
  constructor(manager) {
    super(manager);

    this.registerEffect(() => {
      const interval = setInterval(() => {
        // Do something periodically
      }, 100);

      return () => clearInterval(interval);
    });
  }
}
```

### Response
Effect registered and will be automatically cleaned up when plugin is destroyed.
```

--------------------------------

### Create draggable elements with useDraggable

Source: https://dndkit.com/vue/quickstart

Use the useDraggable composable to make elements draggable. Requires a unique id and a template ref for the element. Returns reactive properties like isDragging for use in templates.

```vue
<script setup>
import {ref} from 'vue';
import {useDraggable} from '@dnd-kit/vue';

const element = ref(null);
const {isDragging} = useDraggable({id: 'draggable', element});
</script>

<template>
  <button ref="element">
    Draggable
  </button>
</template>
```

--------------------------------

### DragOverlay Component Overview

Source: https://dndkit.com/vue/components/drag-overlay

Basic usage of the DragOverlay component to render custom visual feedback during drag operations. The component renders its children only when a drag operation is active.

```APIDOC
## DragOverlay Component

### Description
Render a custom element as visual feedback during drag operations.

### Overview
The `DragOverlay` component renders a custom overlay element while a drag operation is in progress. This allows you to display a completely different element than the one being dragged, which is useful for rendering a styled clone, a preview, or a simplified representation of the dragged element.

### Basic Usage
```vue
<script setup>
import {ref} from 'vue';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/vue';

const element = ref(null);
useDraggable({id: 'my-item', element});
</script>

<template>
  <DragDropProvider>
    <button ref="element">Drag me</button>
    <DragOverlay>
      <div>I will be rendered while dragging...</div>
    </DragOverlay>
  </DragDropProvider>
</template>
```

### Important Notes
- Only render the `DragOverlay` component once per DragDropProvider
- Children are only rendered when a drag operation is active
```

--------------------------------

### Combining Multiple Modifiers

Source: https://dndkit.com/extend/modifiers

Combine multiple modifiers to create complex movement constraints. Modifiers are applied in order, so place restrictions before transformations.

```APIDOC
## Combining Multiple Modifiers

### Description
Combine multiple modifiers to create complex movement constraints and transformations. Modifiers are applied in order.

### Execution Order
Modifiers are applied sequentially, so place restrictions before transformations for optimal results.

### Example: Horizontal Movement with Grid Snapping
```ts
import {
  Snap,
  RestrictToHorizontalAxis
} from '@dnd-kit/abstract/modifiers';

const manager = new DragDropManager({
  modifiers: [
    RestrictToHorizontalAxis,
    Snap.configure({
      size: {
        x: 20,  // Snap every 20px horizontally
        y: 0    // No vertical snapping (already restricted)
      }
    })
  ],
});
```

### Best Practices
1. Apply axis restrictions first
2. Apply boundary restrictions second
3. Apply transformations (snap, etc.) last
4. This order ensures predictable and efficient movement behavior
```

--------------------------------

### DragOverlay with custom drop animation

Source: https://dndkit.com/solid/components/drag-overlay

Customize or disable the drop animation that plays when a drag operation ends using the dropAnimation prop. Set to null to disable animation, or provide an object with duration and easing properties.

```jsx
{/* Disable the drop animation */}
<DragOverlay dropAnimation={null}>
  <div>No animation on drop</div>
</DragOverlay>

{/* Customize the animation timing */}
<DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
  <div>Fast drop animation</div>
</DragOverlay>
```

--------------------------------

### Register a Reactive Effect in a Custom Plugin (TypeScript)

Source: https://dndkit.com/extend/plugins

Register an effect within a plugin's constructor to perform periodic actions, ensuring proper cleanup by returning a cleanup function.

```ts
class MyPlugin extends Plugin {
  constructor(manager) {
    super(manager);

    this.registerEffect(() => {
      const interval = setInterval(() => {
        // Do something periodically
      }, 100);

      return () => clearInterval(interval);
    });
  }
}
```

--------------------------------

### useDroppable Hook Basic Usage

Source: https://dndkit.com/solid/hooks/use-droppable

Create a droppable component using useDroppable with a unique id. The hook returns a ref to attach to the DOM element and isDropTarget() to conditionally apply active styling when the element is a valid drop target.

```JavaScript
import {useDroppable} from '@dnd-kit/solid';
  

export function Droppable(props) {
const {ref, isDropTarget} = useDroppable({id: 'droppable'});
  

return (
<div ref={ref} class={isDropTarget() ? "droppable active" : "droppable"}>
{props.children}
</div>
);
}
```

```JavaScript
import {useDroppable} from '@dnd-kit/solid';

function Droppable(props) {
  const {ref, isDropTarget} = useDroppable({id: props.id});

  return (
    <div ref={ref} data-highlight={isDropTarget()}>
      {props.children}
    </div>
  );
}
```

--------------------------------

### ARIA Attributes Configuration

Source: https://dndkit.com/extend/plugins/accessibility

The plugin automatically sets ARIA attributes on draggable activator elements to ensure proper accessibility. These attributes include role definitions, state indicators, and screen reader descriptions.

```APIDOC
## ARIA Attributes

### Description
The plugin automatically sets the following attributes on draggable activator elements (the handle or, if no handle is set, the draggable element itself).

### Attributes

- **role="button"** - Set unless the element is already a `<button>` or has an explicit `role`
- **aria-roledescription="draggable"** - Identifies the element as draggable
- **aria-describedby** - Points to a hidden element containing screen reader instructions
- **aria-pressed** - Reflects the current dragging state
- **aria-grabbed** - Reflects the current dragging state
- **aria-disabled** - Reflects the disabled state of the draggable
- **tabindex="0"** - Ensures the element is focusable (added when the element is not natively focusable)
```

--------------------------------

### StyleInjector.register()

Source: https://dndkit.com/extend/plugins/style-injector

Registers CSS rules to be injected into the active drag operation's document and shadow roots. Returns a cleanup function that unregisters the rules when called.

```APIDOC
## StyleInjector.register()

### Description
Registers CSS rules to be injected into the active drag operation's document and shadow roots. The rules are automatically injected during drag operations and cleaned up when the operation ends.

### Method
Instance method

### Parameters
#### Method Parameters
- **cssRules** (string) - Required - CSS rule string to be injected during drag operations.

### Request Example
```typescript
const styleInjector = manager.registry.plugins.get(StyleInjector);

const unregister = styleInjector.register(`
  .my-drag-styles { opacity: 0.5; }
`);
```

### Response
Returns a cleanup function that unregisters the CSS rules when called.

#### Response Example
```typescript
// Later, when no longer needed:
unregister();
```
```

--------------------------------

### DragOverlay Drop Animation

Source: https://dndkit.com/vue/components/drag-overlay

Customize or disable the drop animation that plays when a drag operation ends using the drop-animation prop.

```APIDOC
## Customizing the drop animation

### Description
By default, when a drag operation ends, the overlay animates back to the position of the source element. You can customize or disable this animation using the `drop-animation` prop.

### Disable the drop animation
```vue
<DragOverlay :drop-animation="null">
  <div>No animation on drop</div>
</DragOverlay>
```

### Customize the animation timing
```vue
<DragOverlay :drop-animation="{ duration: 150, easing: 'ease-out' }">
  <div>Fast drop animation</div>
</DragOverlay>
```

### Animation Options
- **undefined** – use the default animation (250ms ease)
- **null** – disable the drop animation entirely
- **{duration, easing}** – customize the animation timing
- **(context) => Promise<void> | void** – provide a fully custom animation function
```

--------------------------------

### DragOverlay Component Overview

Source: https://dn/solid/components/drag-overlay

The DragOverlay component renders a custom overlay element while a drag operation is in progress. It allows you to display a completely different element than the one being dragged, useful for rendering styled clones, previews, or simplified representations.

```APIDOC
## DragOverlay Component

### Description
Render a custom element as visual feedback during drag operations.

### Overview
The `DragOverlay` component renders a custom overlay element while a drag operation is in progress. This allows you to display a completely different element than the one being dragged, which is useful for rendering a styled clone, a preview, or a simplified representation of the dragged element.

### Basic Usage
Import and place the `DragOverlay` component inside a `DragDropProvider`. Its children will only be rendered when a drag operation is active.

```typescript
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/solid';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return (
    <>
      <button ref={ref}>Draggable</button>
      <DragOverlay>
        <div>I will be rendered while dragging...</div>
      </DragOverlay>
    </>
  );
}
```

### Important Notes
- You should only render the `DragOverlay` component once per DragDropProvider component.
```

--------------------------------

### Customize DragOverlay Drop Animation

Source: https://dndkit.com/vue/components/drag-overlay

Control the drop animation that plays when a drag operation ends using the drop-animation prop. Set to null to disable, or provide custom duration and easing values.

```vue
<!-- Disable the drop animation -->
<DragOverlay :drop-animation="null">
  <div>No animation on drop</div>
</DragOverlay>

<!-- Customize the animation timing -->
<DragOverlay :drop-animation="{ duration: 150, easing: 'ease-out' }">
  <div>Fast drop animation</div>
</DragOverlay>
```

--------------------------------

### Draggable Handles Configuration

Source: https://dndkit.com/concepts/draggable

Restrict dragging to a specific handle element instead of allowing the entire element to be draggable. This is useful for UI elements where you want to control which part initiates the drag.

```APIDOC
## Draggable Handles

### Description
By default, the entire element can be used to initiate dragging. You can restrict dragging to a specific handle element by providing a handle element in the configuration.

### Configuration
- **handle** (Element) - Optional - A DOM element that serves as the drag handle. Only interactions on this element will initiate dragging

### Request Example
```javascript
const element = document.createElement('div');
const handle = document.createElement('div');
handle.classList.add('handle');
handle.innerHTML = '⋮'; // Three dots menu icon for drag handle

element.appendChild(handle);

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  handle, // Only allow dragging from the handle
}, manager);
```
```

--------------------------------

### Create draggable elent with useDraggable hook

Source: https://dndkit.com/react/quickstart

Use the useDraggable hook with a unique id to make any element draggable. Attach the returned ref to the element you want to make draggable.

```jsx
import {useDraggable} from '@dnd-kit/react';

function Draggable() {
  const {ref} = useDraggable({
    id: 'draggable',
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
}
```

--------------------------------

### Update Draggable Components with useDraggable Hook

Source: https://dndkit.com/react/guides/migration

Migrate draggable components from the old `useDraggable` hook structure to the simplified version provided by `@dnd-kit/react`. The new hook returns a single `draggable` object.

```javascript
function DraggableItem({id}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform
  } = useDraggable({
    id
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform)
      }}
    >
      Item {id}
    </div>
  );
}
```

```javascript
function DraggableItem({id}) {
  const draggable = useDraggable({
    id,
  });

  return (
    <div
      ref={draggable.ref}
      className={isDragging ? 'dragging' : ''}
    >
      Item {id}
    </div>
  );
}
```

--------------------------------

### SortableTransition Interface Definition

Source: https://dndkit.com/concepts/sortable

Defines the structure for configuring animation behavior when sortable items are reordered, including duration, easing, and idle animation settings.

```ts
interface SortableTransition {
  duration?: number; // Duration in ms (default: 250)
  easing?: string;  // CSS easing function (default: cubic-bezier)
  idle?: boolean;   // Animate when not dragging (default: false)
}
```

--------------------------------

### Complete drag and drop interaction with DragDropProvider

Source: https://dndkit.com/vue/quickstart

Combine draggable and droppable elements using DragDropProvider to handle drag and drop interactions. Composables must be called in child components of DragDropProvider, not in the provider component itself due to Vue's provide/inject requirements.

```vue
<script setup>
import {ref} from 'vue';
import {DragDropProvider} from '@dnd-kit/vue';
import Draggable from './Draggable.vue';
import Droppable from './Droppable.vue';

const parent = ref(undefined);

function onDragEnd(event) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id;
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <Draggable v-if="parent == null" />

    <Droppable id="droppable">
      <Draggable v-if="parent === 'droppable'" />
    </Droppable>
  </DragDropProvider>
</template>
```

```vue
<script setup>
import {ref} from 'vue';
import {useDraggable} from '@dnd-kit/vue';

const element = ref(null);
const {isDragging} = useDraggable({id: 'draggable', element});
</script>

<template>
  <button ref="element">
    Draggable
  </button>
</template>
```

```vue
<script setup>
import {ref} from 'vue';
import {useDroppable} from '@dnd-kit/vue';

const props = defineProps(['id']);
const element = ref(null);
const {isDropTarget} = useDroppable({
  id: props.id,
  element,
});
</script>

<template>
  <div ref="element" :style="{width: '300px', height: '300px'}">
    <slot />
  </div>
</template>
```

--------------------------------

### Hook: useDraggable

Source: https://dndkit.com/solid/hooks/use-draggable

The `useDraggable` hook allows you to make elements draggable within a `DragDropProvider` context. It requires a unique `id` and provides a `ref` callback and reactive getters for drag state.

```APIDOC
## Hook: useDraggable

### Description
The `useDraggable` hook from `@dnd-kit/solid` enables elements to be draggable within a `DragDropProvider` context. It requires a unique `id` and returns a `ref` callback and reactive getters for drag state.

### Input Parameters (Hook Options)
- **id** (UniqueIdentifier) - Required - A unique identifier for this draggable instance. Use getter syntax (`get id() { return props.id }`) for reactive values.
- **handle** (Element) - Optional - A handle element. When set, only this element activates dragging. Use the `handleRef` callback to set it.
- **disabled** (boolean) - Optional - Whether the draggable is disabled.
- **plugins** (PluginDescriptor[]) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **modifiers** (Modifier[]) - Optional - Modifiers to apply to this draggable instance.
- **sensors** (Sensor[]) - Optional - Sensors to use for this draggable instance.
- **data** (Data) - Optional - Custom data to attach to this draggable instance.

### Usage Example
```javascript
import {useDraggable} from '@dnd-kit/solid';

function DraggableComponent() {
  const {ref, isDragging} = useDraggable({id: 'my-draggable'});

  return (
    <button ref={ref} data-dragging={isDragging()}>
      Drag me
    </button>
  );
}
```

### Output Values (Hook Return)
- **ref** (callback ref) - A callback ref to attach to the draggable element.
- **handleRef** (callback ref) - A callback ref to attach to a drag handle element.
- **isDragging** (function) - Whether this element is currently being dragged. Call as `isDragging()` in JSX.
- **isDropping** (function) - Whether this element is in the process of being dropped. Call as `isDropping()` in JSX.
- **isDragSource** (function) - Whether this element is the source of the current drag operation. Call as `isDragSource()` in JSX.
- **draggable** (Draggable instance) - The underlying `Draggable` instance.

### Output Example
```javascript
const {ref, handleRef, isDragging, isDropping, isDragSource, draggable} = useDraggable({
  id: 'my-draggable',
  // ... other options
});
```
```

--------------------------------

### Toggle AutoScroller at runtime - TypeScript

Source: https://dndkit.com/extend/plugins/auto-scroller

Access the AutoScroller plugin instance from the manager registry to dynamically enable or disable auto-scrolling at runtime using the disable() and enable() methods.

```TypeScript
import {DragDropManager, AutoScroller} from '@dnd-kit/dom';

const manager = new DragDropManager();
const autoScroller = manager.registry.plugins.get(AutoScroller);

// Disable auto-scrolling
autoScroller.disable();

// Re-enable auto-scrolling
autoScroller.enable();
```

--------------------------------

### Draggable Element - Per-Element Modifiers

Source: https://dndkit.com/extend/modifiers

Configure modifiers on individual draggable elements. Local modifiers take precedence over global modifiers configured on the DragDropManager.

```APIDOC
## Draggable Element Modifiers Configuration

### Description
Configure modifiers on individual draggable elements for element-specific movement constraints and transformations.

### Configuration
- **modifiers** (array) - Array of modifier instances or configured modifiers

### Usage
```ts
import {Draggable} from '@dnd-kit/dom';
import {RestrictToElement} from '@dnd-kit/dom/modifiers';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  modifiers: [
    RestrictToElement.configure({
      element: containerElement
    })
  ],
}, manager);
```

### Precedence
- Local modifiers on draggable elements take precedence over global modifiers
- Allows per-element customization of movement behavior
```

--------------------------------

### destroy() Method

Source: https://dndkit.com/concepts/draggable

Cleans up the draggable instance, removing all associated listeners and resources.

```APIDOC
## destroy()

### Description
Clean up this draggable instance and remove all listeners
```

--------------------------------

### useDroppable Hook

Source: https://dndkit.com/react/hooks/use-droppable

The `useDroppable` hook is used to create droppable targets for draggable elements in React applications. It wraps the `Droppable` class and provides a convenient way to manage droppable behavior.

```APIDOC
## useDroppable Hook

### Description
Use the `useDroppable` hook to create droppable targets for draggable elements.

### Usage
The `useDroppable` hook is a thin wrapper around the Droppable class that makes it easier to create droppable targets in React. It therefore accepts all of the same input arguments.

### Parameters
#### Input Arguments
- **id** (string | number) - Required - The identifier of the droppable element. Should be unique within the same drag and drop context provider.
- **element** (Element | Ref<Element>) - Optional - If you already have a reference to the element, you can pass it to the `element` option instead of using the `ref` that is returned by the `useDroppable` hook to connect the droppable target element.
- **accepts** (string | number | Symbol | (type: string | number | Symbol) => boolean) - Optional - Optionally supply a type of draggable element to only allow it to be dropped over certain droppable targets that accept this `type`.
- **collisionDetector** ((input: CollisionDetectorInput) => Collision | null) - Optional - Optionally supply a collision detector function that can be used to detect collisions between the droppable element and draggable elements.
- **collisionPriority** (number) - Optional - Optionally supply a number to set the collision priority of the droppable element. The higher the number, the higher the priority when detecting collisions. This can be useful if there are multiple droppable elements that overlap.
- **disabled** (boolean) - Optional - Set to `true` to prevent the droppable element from being a drop target.
- **data** ({[key: string]: any}) - Optional - The data argument is for advanced use-cases where you may need access to additional data about the droppable element in event handlers, modifiers, sensors or custom plugins.
- **effects** (() => Effect[]) - Optional - This is an advanced feature and should not need to be used by most consumers. You can supply a function that returns an array of reactive effects that can be set up and automatically cleaned up when the component using the `useDroppable` hook is unmounted.

### Example Usage
```javascript
import {useDroppable} from '@dnd-kit/react';

function Droppable(props) {
  const {isDropTarget, ref} = useDroppable({
    id: props.id,
  });

  return (
    <div ref={ref}>
      {isDropTarget ? 'Draggable element is over me' : 'Drag something over me'}
    </div>
  );
}
```

### Returns
#### Output Properties
- **ref** (function) - A ref callback function that can be attached to the element that you want to use as a droppable target.
- **isDropTarget** (boolean) - A boolean value that indicates whether the element is currently a drop target.
- **droppableInstance** (object) - The droppable instance that is created by the `useDroppable` hook.

#### Return Example
```json
{
  "ref": "[function_reference]",
  "isDropTarget": false,
  "droppableInstance": {
    "id": "droppable-1",
    "data": {},
    "rect": {
      "current": {
        "width": 100,
        "height": 50
      }
    }
  }
}
```
```

--------------------------------

### Toggle AutoScroller at runtime - Svelte

Source: https://dndkit.com/extend/plugins/auto-scroller

Use getDragDropManager function to access the AutoScroller plugin and toggle it dynamically with a button that checks the disabled state.

```Svelte
<script>
  import {getDragDropManager} from '@dnd-kit/svelte';
  import {AutoScroller} from '@dnd-kit/dom';

  const manager = getDragDropManager();
  const autoScroller = manager.registry.plugins.get(AutoScroller);

  function toggle() {
    autoScroller.disabled
      ? autoScroller.enable()
      : autoScroller.disable();
  }
</script>

<button onclick={toggle}>Toggle auto-scroll</button>
```

--------------------------------

### Restrict Dragging to a Handle Element

Source: https://dndkit.com/concepts/sortable

Pass a handle element to restrict drag initiation to that specific element only. The handle must be a child of or contained within the sortable element.

```javascript
const element = document.createElement('li');
const handle = document.createElement('div');
handle.classList.add('handle');

element.appendChild(handle);

new Sortable({
  id: 'item-1',
  index: 0,
  element,
  handle, // Only allow dragging from the handle
}, manager);
```

--------------------------------

### Disable optimistic sorting by omitting plugin

Source: https://dndkit.com/concepts/sortable

Remove OptimisticSortingPlugin from the plugins array to manage sorting entirely in application state. Without it, you must handle reordering in dragover listeners for smooth visual feedback.

```javascript
import {SortableKeyboardPlugin} from '@dnd-kit/dom/sortable';

new Sortable({
  id: 'item-1',
  index: 0,
  element,
  plugins: [SortableKeyboardPlugin], // No OptimisticSortingPlugin
}, manager);
```

--------------------------------

### Monitor Drag and Drop Events with useDragDropMonitor

Source: https://dndkit.com/react/hooks/use-drag-drop-monitor

Use this hook within a component wrapped by a DragDropProvider to listen for various drag and drop lifecycle events. Events can be optionally prevented using event.preventDefault().

```javascript
import {useDragDropMonitor} from '@dnd-kit/react';

function DragMonitor() {
  useDragDropMonitor({
    onBeforeDragStart(event, manager) {
      // Optionally prevent dragging
      if (shouldPreventDrag(event.operation.source)) {
        event.preventDefault();
      }
    },
    onDragStart(event, manager) {
      console.log('Started dragging', event.operation.source);
    },
    onDragMove(event, manager) {
      console.log('Current position:', event.operation.position);
    },
    onDragOver(event, manager) {
      console.log('Over droppable:', event.operation.target);
    },
    onCollision(event, manager) {
      console.log('Collisions:', event.collisions);
    },
    onDragEnd(event, manager) {
      const {operation, canceled} = event;

      if (canceled) {
        console.log('Drag cancelled');
        return;
      }

      if (operation.target) {
        console.log(`Dropped ${operation.source.id} onto ${operation.target.id}`);
      }
    }
  });

  return null;
}
```

--------------------------------

### Type guard isSortableOperation for narrowing entire operation

Source: https://dndkit.com/concepts/sortable

Use isSortableOperation to check that both source and target are sortable elements, narrowing the entire operation at once for safer access to sortable properties.

```javascript
import {isSortableOperation} from '@dnd-kit/dom/sortable';

const {operation} = event;

if (isSortableOperation(operation)) {
  // Both source and target are narrowed to sortable types
  console.log(operation.source.initialIndex);
  console.log(operation.target.index);
}
```

--------------------------------

### Applying Modifiers to Individual Draggable Elements

Source: https://dndkit.com/extend/modifiers

Configure modifiers on a per-draggable basis to override global manager settings.

```ts
import {RestrictToElement} from '@dnd-kit/dom/modifiers';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  modifiers: [
    RestrictToElement.configure({
      element: containerElement
    })
  ],
}, manager);
```

--------------------------------

### useDraggable Composable

Source: https://dndkit.com/vue/composables/use-draggable

The `useDraggable` composable makes elements draggable. It requires a unique `id` and an `element` template ref, and returns reactive computed properties for the drag state.

```APIDOC
## useDraggable Composable

### Description
The `useDraggable` composable from `@dnd-kit/vue` allows you to make any HTML element draggable within your Vue application. It requires a unique `id` and an `element` template ref, and returns reactive computed properties for the drag state.

### Parameters (Input Properties)
#### `useDraggable` Options
- **id** (MaybeRefOrGetter<UniqueIdentifier>) - Required - A unique identifier for this draggable instance.
- **element** (MaybeRefOrGetter<HTMLElement | null>) - Required - A template ref pointing to the draggable element.
- **handle** (MaybeRefOrGetter<HTMLElement | null>) - Optional - A template ref for a drag handle. When set, only this element activates dragging.
- **disabled** (MaybeRefOrGetter<boolean>) - Optional - Whether the draggable is disabled.
- **plugins** (MaybeRefOrGetter<PluginDescriptor[]>) - Optional - An array of plugin descriptors for per-entity plugin configuration. Use `Plugin.configure()` to create descriptors. For example, `Feedback.configure({ feedback: 'clone' })`.
- **modifiers** (MaybeRefOrGetter<Modifier[]>) - Optional - Modifiers to apply to this draggable instance.
- **sensors** (MaybeRefOrGetter<Sensor[]>) - Optional - Sensors to use for this draggable instance.
- **data** (MaybeRefOrGetter<Data>) - Optional - Custom data to attach to this draggable instance.

### Usage Example
```vue
<script setup>
import { ref } from 'vue';
import { useDraggable } from '@dnd-kit/vue';

const element = ref(null);
const { isDragging } = useDraggable({ id: 'my-draggable', element });
</script>

<template>
  <button ref="element" :data-dragging="isDragging">
    Drag me
  </button>
</template>
```

### Output Properties
- **isDragging** (boolean) - Whether this element is currently being dragged (visually).
- **isDropping** (boolean) - Whether this element is in the process of being dropped (animating to final position).
- **isSource** (boolean) - Whether this element is the source of the current drag operation.
- **draggableInstance** (Draggable) - The underlying `Draggable` instance.

### Related Components
#### DragOverlay Component
The `<DragOverlay>` component renders its children only when a drag operation is in progress. It can be used to render a completely different element while the draggable element is being dragged.

##### Usage Example with DragOverlay
```vue
<script setup>
import {ref} from 'vue';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/vue';

const element = ref(null);
useDraggable({id: 'draggable', element});
</script>

<template>
  <DragDropProvider>
    <button ref="element">Draggable</button>
    <DragOverlay>
      <div>I will be rendered while dragging...</div>
    </DragOverlay>
  </DragDropProvider>
</template>
```

##### Scoped Slot Example for DragOverlay
```vue
<script setup>
import {DragDropProvider, DragOverlay} from '@dnd-kit/vue';
</script>

<template>
  <DragDropProvider>
    <Draggable id="foo" />
    <Draggable id="bar" />
    <DragOverlay>
      <template #default="{ source }">
        <div>Dragging {{ source.id }}</div>
      </template>
    </DragOverlay>
  </DragDropProvider>
</template>
```
```

--------------------------------

### Disable AutoScroller in plugins array - Solid

Source: https://dndkit.com/extend/plugins/auto-scroller

Filter out the AutoScroller plugin from the default plugins array in DragDropProvider to prevent auto-scrolling in Solid applications.

```Solid
import {DragDropProvider} from '@dnd-kit/solid';
import {AutoScroller} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => defaults.filter((plugin) => plugin !== AutoScroller)}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Snap Modifier

Source: https://dndkit.com/extend/modifiers

Snaps draggable element movement to a configurable grid. This abstract modifier aligns movement to discrete grid intervals for both horizontal and vertical axes.

```APIDOC
## Snap

### Description
Snap movement to a grid with configurable size for both X and Y axes.

### Module
`@dnd-kit/abstract/modifiers`

### Configuration
- **size** (object) - Grid size configuration
  - **x** (number) - Horizontal grid spacing in pixels
  - **y** (number) - Vertical grid spacing in pixels

### Usage
```ts
import {Snap} from '@dnd-kit/abstract/modifiers';

const manager = new DragDropManager({
  modifiers: [
    Snap.configure({
      size: {
        x: 20,  // Snap every 20px horizontally
        y: 20   // Snap every 20px vertically
      }
    })
  ],
});
```

### Behavior
- Rounds coordinates to nearest grid intersection
- Applies independently to X and Y axes
- Can be combined with axis restriction modifiers
```

--------------------------------

### Set Collision Priority for Nested Containers

Source: https://dndkit.com/concepts/droppable

Use collisionPriority to determine which droppable receives the drop when multiple targets overlap. Higher numbers take precedence, useful for nested container scenarios.

```javascript
const container = new Droppable({
  id: 'container',
  element: containerElement,
  collisionPriority: 1 // Lower priority
}, manager);

const item = new Droppable({
  id: 'item',
  element: itemElement,
  collisionPriority: 2 // Higher priority
}, manager);
```

--------------------------------

### Configuring Global Modifiers in DragDropManager

Source: https://dndkit.com/extend/modifiers

Global modifiers can be applied by either extending the default set with a function or replacing them entirely with an array.

```ts
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  modifiers: (defaults) => [...defaults, RestrictToWindow],
});
```

```ts
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  modifiers: [RestrictToWindow],
});
```

--------------------------------

### Draggable Types Configuration

Source: https://dndkit.com/concepts/draggable

Assign types to draggable elements to restrict which droppable targets they can be dropped on. This enables type-based validation for drag and drop operations.

```APIDOC
## Draggable Types

### Description
You can assign types to draggable elements to restrict which droppable targets they can be dropped on. Only droppables that accept the assigned type will be valid drop targets.

### Configuration
- **type** (string | number | Symbol) - Optional - The type identifier for this draggable element

### Request Example
```javascript
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  type: 'item', // Only droppables accepting 'item' type will be valid targets
}, manager);
```
```

--------------------------------

### Toggle AutoScroller at runtime - Vue

Source: https://dndkit.com/extend/plugins/auto-scroller

Use useDragDropManager composable to access the AutoScroller plugin and toggle it dynamically with a button that checks the disabled state.

```Vue
<script setup>
import {useDragDropManager} from '@dnd-kit/vue';
import {AutoScroller} from '@dnd-kit/dom';

const manager = useDragDropManager();
const autoScroller = manager.registry.plugins.get(AutoScroller);

function toggle() {
  autoScroller.disabled
    ? autoScroller.enable()
    : autoScroller.disable();
}
</script>

<template>
  <button @click="toggle">Toggle auto-scroll</button>
</template>
```

--------------------------------

### Register CSS Rules with StyleInjector

Source: https://dndkit.com/extend/plugins/style-injector

Registers CSS rules for injection during an active drag operation. The returned cleanup function should be called to unregister the rules when no longer needed.

```TypeScript
const styleInjector = manager.registry.plugins.get(StyleInjector);

const unregister = styleInjector.register(`
  .my-drag-styles { opacity: 0.5; }
`);

// Later, when no longer needed:
unregister();
```

--------------------------------

### Droppable - Collision Priority

Source: https://dndkit.com/concepts/droppable

Set priority levels for overlapping droppable targets to determine which one receives the drop. Higher priority values take precedence, useful for nested containers.

```APIDOC
## Droppable - Collision Priority

### Description
When multiple droppable targets overlap, collision priority determines which one should receive the drop. This is particularly useful for nested containers.

### Parameters
#### Configuration
- **collisionPriority** (number) - Optional - Priority level for overlapping targets. Higher numbers take precedence.

### Usage Example
```js
const container = new Droppable({
  id: 'container',
  element: containerElement,
  collisionPriority: 1 // Lower priority
}, manager);

const item = new Droppable({
  id: 'item',
  element: itemElement,
  collisionPriority: 2 // Higher priority
}, manager);
```
```

--------------------------------

### Assigning Types to Draggable Elements

Source: https://dndkit.com/concepts/draggable

Assign a "type" to a Draggable instance to control which droppable targets can accept it. This enables filtering of valid drop targets based on type matching.

```javascript
// Assign a type
const draggable = new Draggable({
  id: 'draggable-1',
  element,
  type: 'item', // Only droppables accepting 'item' type will be valid targets
}, manager);
```

--------------------------------

### Toggle AutoScroller at runtime - React

Source: https://dndkit.com/extend/plugins/auto-scroller

Use useDragDropManager hook to access the AutoScroller plugin and toggle it dynamically with a button that checks the disabled state.

```React
import {useDragDropManager} from '@dnd-kit/react';
import {AutoScroller} from '@dnd-kit/dom';

function AutoScrollToggle() {
  const manager = useDragDropManager();
  const autoScroller = manager.registry.plugins.get(AutoScroller);

  return (
    <button onClick={() => {
      autoScroller.disabled
        ? autoScroller.enable()
        : autoScroller.disable();
    }}>
      Toggle auto-scroll
    </button>
  );
}
```

--------------------------------

### unregister() Method

Source: https://dndkit.com/concepts/draggable

Removes a previously registered draggable element from the dndkit manager.

```APIDOC
## unregister()

### Description
Remove this draggable from the manager
```

--------------------------------

### Making Columns Droppable with useDroppable Hook (React)

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This snippet updates the `Column` component to act as a drop target using the `useDroppable` hook. It sets a low `collisionPriority` to ensure item collisions are prioritized over column collisions.

```javascript
import React from 'react';
import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';
  

export function Column({children, id}) {
const {isDropTarget, ref} = useDroppable({
id,
type: 'column',
accept: 'item',
collisionPriority: CollisionPriority.Low,
});
const style = isDropTarget ? {background: '#00000030'} : undefined;
  

return (
<div className="Column" ref={ref} style={style}>
{children}
</div>
);
}
```

--------------------------------

### Accept Specific Draggable Types

Source: https://dndkit.com/concepts/droppable

Restrict which draggable elements can be dropped using the accepts property. Supports string type, array of types, or a custom function for complex filtering logic.

```javascript
// Accept only draggables with type 'item'
const droppable = new Droppable({
  id: 'drop-zone',
  element,
  accepts: 'item'
}, manager);
```

```javascript
// Accept multiple types
const droppable = new Droppable({
  id: 'drop-zone',
  element,
  accepts: ['item', 'card']
}, manager);
```

```javascript
// Use a function for custom logic
const droppable = new Droppable({
  id: 'drop-zone',
  element,
  accepts: (draggable) => {
    // Custom acceptance logic
    return draggable.type === 'item' && draggable.data.category === 'fruit';
  }
}, manager);
```

--------------------------------

### Type Guard: isSortable

Source: https://dndkit.com/react/guides/sortable-state-management

Narrows a Draggable or Droppable to a sortable instance, exposing index, initialIndex, group, and initialGroup properties. Use this to safely access sortable-specific properties in drag event handlers.

```javascript
import {isSortable} from '@dnd-kit/react/sortable';

const {source, target} = event.operation;

if (isSortable(source)) {
  source.index;        // number
  source.initialIndex; // number
  source.group;        // string | number | undefined
  source.initialGroup; // string | number | undefined
}
```

--------------------------------

### Making Items Sortable with useSortable Hook (React)

Source: https://dndkit.com/react/guides/multiple-sortable-lists

This snippet modifies the `Item` component to enable drag-and-drop functionality using the `useSortable` hook. The `group` property allows items to be sorted within and across columns.

```javascript
import React from 'react';
import {useSortable} from '@dnd-kit/react/sortable';
  

export function Item({id, index, column}) {
const {ref, isDragging} = useSortable({
id,
index,
type: 'item',
accept: 'item',
group: column
});
  

return (
<button className="Item" ref={ref} data-dragging={isDragging}>
{id}
</button>
);
}
```

--------------------------------

### Prevent optimistic sorting for single dragover event

Source: https://dndkit.com/concepts/sortable

Call event.preventDefault() in a dragover handler to skip the optimistic update for that specific event, useful for blocking moves into certain groups while letting the plugin handle other moves.

```javascript
manager.monitor.addEventListener('dragover', (event) => {
  const {source, target} = event.operation;

  if (shouldPreventMove(source, target)) {
    event.preventDefault(); // Optimistic sorting will not run for this event
  }
});
```

--------------------------------

### Type guard isSortable for narrowing draggable elements

Source: https://dndkit.com/concepts/sortable

Use isSortable to check if a Draggable or Droppable is sortable and narrow its type to access sortable-specific properties like index, initialIndex, group, and initialGroup.

```javascript
import {isSortable} from '@dnd-kit/dom/sortable';

const {source} = event.operation;

if (isSortable(source)) {
  console.log(source.index);        // number
  console.log(source.initialIndex);  // number
  console.log(source.group);         // string | number | undefined
  console.log(source.initialGroup);  // string | number | undefined
}
```

--------------------------------

### Disable AutoScroller in plugins array - Svelte

Source: https://dndkit.com/extend/plugins/auto-scroller

Filter out the AutoScroller plugin from the default plugins array in DragDropProvider to prevent auto-scrolling in Svelte applications.

```Svelte
<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {AutoScroller} from '@dnd-kit/dom';
</script>

<DragDropProvider
  plugins={(defaults) => defaults.filter((plugin) => plugin !== AutoScroller)}
>
  <!-- ... -->
</DragDropProvider>
```

--------------------------------

### Restrict Draggable to Horizontal Axis with dnd-kit

Source: https://dndkit.com/react/hooks/use-draggable

This snippet demonstrates how to use the `RestrictToHorizontalAxis` modifier with `useDraggable` to limit a draggable element's movement to only the horizontal axis.

```javascript
import {useDraggable} from '@dnd-kit/react';
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';

function Draggable({id}) {
  const {ref} = useDraggable({
    id,
    modifiers: [RestrictToHorizontalAxis],
  });
}
```

--------------------------------

### Disable AutoScroller in plugins array - React

Source: https://dndkit.com/extend/plugins/auto-scroller

Filter out the AutoScroller plugin from the default plugins array in DragDropProvider to prevent auto-scrolling in React applications.

```React
import {DragDropProvider} from '@dnd-kit/react';
import {AutoScroller} from '@dnd-kit/dom';

function App() {
  return (
    <DragDropProvider
      plugins={(defaults) => defaults.filter((plugin) => plugin !== AutoScroller)}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

--------------------------------

### Disable AutoScroller in plugins array - Vue

Source: https://dndkit.com/extend/plugins/auto-scroller

Filter out the AutoScroller plugin from the default plugins array in DragDropProvider to prevent auto-scrolling in Vue applications.

```Vue
<script setup>
import {DragDropProvider} from '@dnd-kit/vue';
import {AutoScroller} from '@dnd-kit/dom';
</script>

<template>
  <DragDropProvider
    :plugins="(defaults) => defaults.filter((plugin) => plugin !== AutoScroller)"
  >
    <!-- ... -->
  </DragDropProvider>
</template>
```

--------------------------------

### Disable AutoScroller in plugins array - TypeScript

Source: https://dndkit.com/extend/plugins/auto-scroller

Filter out the AutoScroller plugin from the default plugins array when creating a DragDropManager to prevent auto-scrolling during drag operations.

```TypeScript
import {DragDropManager, AutoScroller} from '@dnd-kit/dom';

const manager = new DragDropManager({
  plugins: (defaults) => defaults.filter((plugin) => plugin !== AutoScroller),
});
```

--------------------------------

### RestrictToWindow Modifier

Source: https://dndkit.com/extend/modifiers

Constrains draggable element movement within the window boundaries. This concrete DOM-specific modifier prevents elements from being dragged outside the visible viewport.

```APIDOC
## RestrictToWindow

### Description
Constrain movement within the window boundaries, preventing draggable elements from moving outside the viewport.

### Module
`@dnd-kit/dom/modifiers`

### Usage
```ts
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  modifiers: [RestrictToWindow],
});
```

### Behavior
- Restricts movement to window viewport boundaries
- Prevents elements from being dragged off-screen
- Environment-specific to DOM implementations
```

--------------------------------

### RestrictToElement Modifier

Source: https://dndkit.com/extend/modifiers

Constrains draggable element movement within a specific container element. This concrete DOM-specific modifier allows fine-grained control over movement boundaries.

```APIDOC
## RestrictToElement

### Description
Constrain movement within a specific container element, allowing fine-grained control over movement boundaries.

### Module
`@dnd-kit/dom/modifiers`

### Configuration
- **element** (HTMLElement) - Required - The container element to restrict movement within

### Usage
```ts
import {RestrictToElement} from '@dnd-kit/dom/modifiers';

const draggable = new Draggable({
  id: 'draggable-1',
  element,
  modifiers: [
    RestrictToElement.configure({
      element: containerElement
    })
  ],
}, manager);
```

### Behavior
- Restricts movement to container element boundaries
- Can be applied per-draggable element
- Local modifiers take precedence over global modifiers
```

--------------------------------

### RestrictToVerticalAxis Modifier

Source: https://dndkit.com/extend/modifiers

Constrains draggable element movement to the vertical axis only. This abstract modifier prevents any horizontal movement during drag operations.

```APIDOC
## RestrictToVerticalAxis

### Description
Constrain movement to the vertical axis only, preventing horizontal displacement during drag operations.

### Module
`@dnd-kit/abstract/modifiers`

### Usage
```ts
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';

const manager = new DragDropManager({
  modifiers: [RestrictToVerticalAxis],
});
```

### Behavior
- Blocks all horizontal (X-axis) movement
- Allows unrestricted vertical (Y-axis) movement
- Applied during drag operations to transform coordinates
```

--------------------------------

### RestrictToHorizontalAxis Modifier

Source: https://dndkit.com/extend/modifiers

Constrains draggable element movement to the horizontal axis only. This abstract modifier prevents any vertical movement during drag operations.

```APIDOC
## RestrictToHorizontalAxis

### Description
Constrain movement to the horizontal axis only, preventing vertical displacement during drag operations.

### Module
`@dnd-kit/abstract/modifiers`

### Usage
```ts
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';

const manager = new DragDropManager({
  modifiers: [RestrictToHorizontalAxis],
});
```

### Behavior
- Allows unrestricted horizontal (X-axis) movement
- Blocks all vertical (Y-axis) movement
- Applied during drag operations to transform coordinates
```

=== COMPLETE CONTENT === This response contains all available snippets from this library. No additional content exists. Do not make further requests.
