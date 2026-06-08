# PrintForge Overview

PrintForge is a WooCommerce integration platform for print-on-demand product customization. It extends WooCommerce with two capabilities it cannot handle natively: a **product options configurator** and an **online designer**, both delivered as iframes embedded on the WooCommerce product page.

PrintForge does not replace WooCommerce — it plugs into it. Cart, checkout, orders, and fulfillment all remain in WooCommerce. PrintForge owns only the configuration and design step.

---

## Actors

| Actor | Role |
|---|---|
| **Store owner** | Sets up products in WooCommerce, then configures print options, pricing rules, and the designer in the PF Admin |
| **End customer** | Browses the store, customizes a product via the configurator and/or designer, then proceeds to checkout in WooCommerce |

---

## How It Works

### Store owner setup
The store owner creates a product in WooCommerce as normal, then opens the PF Admin to configure the PrintForge side: available print options (size, material, color, etc.), advanced pricing rules, and optionally an online designer for that product.

### Customer flow
1. Customer opens a product page in WooCommerce
2. The WordPress plugin injects an iframe pointing to the **Configurator**
3. The Configurator contacts the Fastify backend with the product ID and renders the configured options
4. If a designer has been set up for the product, a button appears — clicking it opens a second iframe with the **Designer**
5. As the customer selects options or finalizes a design, the price is pushed back to the WooCommerce page in real time
6. The customer adds to cart and checks out entirely within WooCommerce — PrintForge's role ends here

---

## Components

### WordPress + WooCommerce
The storefront. Owns the product catalog, cart, checkout, orders, and payments. Runs in a Docker container backed by **MariaDB**.

### WordPress Plugin (`/plugins/printforge`)
The bridge between WooCommerce and PrintForge. Responsible for injecting the configurator iframe into the product page and exposing a JS interface that receives price updates from the iframe and reflects them on the WooCommerce page.

### Fastify Backend (`/backend`)
The PrintForge API. Owns everything WooCommerce cannot model: print option definitions, advanced pricing logic, and designer configuration per product. Backed by **PostgreSQL**. Runs in a Docker container, exposed at `/api/`.

### Admin SPA (`/apps/admin`)
The store owner interface for managing the PrintForge side of things — configuring print options, pricing, and designers per product. Served as compiled static files at `/pf-admin/`.

### Configurator SPA (`/apps/configurator`)
The customer-facing frontend. Serves both iframes: the options configurator and the designer. Communicates with the Fastify backend for product data and with the parent WooCommerce page for price updates. Served as compiled static files at `/pf/`.

### Caddy
The edge proxy. Routes incoming traffic to the correct service based on path:

| Path | Target |
|---|---|
| `/api/` | Fastify backend (port 3000) |
| `/pf-admin/` | Admin SPA static files |
| `/pf/` | Configurator SPA static files |
| `/` (root) | WordPress (port 8080) |

### Databases
| Database | Used by |
|---|---|
| **PostgreSQL** | PrintForge (Fastify backend) |
| **MariaDB** | WordPress / WooCommerce |

---

## Architecture Diagram

See [`server-structure.png`](server-structure.png) for the full infrastructure diagram.
