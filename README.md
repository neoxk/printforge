# PrintForge — Tehnična dokumentacija

## Kazalo vsebine

1. [Uvod in namen projekta](#1-uvod-in-namen-projekta)
2. [Projektno vodenje](#2-projektno-vodenje)
3. [Zagotavljanje kakovosti](#3-zagotavljanje-kakovosti)
4. [Arhitektura sistema](#4-arhitektura-sistema)
5. [Podatkovni model](#5-podatkovni-model)
6. [Backend](#6-backend)
7. [Frontend — Admin SPA](#7-frontend--admin-spa)
8. [Frontend — Konfigurator](#8-frontend--konfigurator)
9. [WooCommerce integracija](#9-woocommerce-integracija)
10. [Varnost](#10-varnost)
11. [Namestitev in zagon](#11-namestitev-in-zagon)

---

## 1. Uvod in namen projekta

### 1.1 Kaj je PrintForge?

PrintForge je odprtokodna spletna platforma za tiskarne in produkcijska podjetja, ki prodajajo prilagodljive tiskarske produkte prek spletnih trgovin. Sistem se namesti in zaganja lokalno — lastnik tiskarne si postavi lasten primerek PrintForge na svojem strežniku s pomočjo Dockerja, se registrira v sistem in ga nato upravlja prek spletnega administratorskega vmesnika.

PrintForge ni zamenjava za obstoječo spletno trgovino — je razširitev. Sistem se poveže z obstoječo e-commerce platformo (WooCommerce, OpenCart ali katero koli drugo) in jo obogati z dvema zmogljivostima, ki jih generične platforme same po sebi ne ponujajo: **konfiguratorjem tiskarskih produktov** in **spletnim dizajnerjem**. Obe orodji sta vgrajeni kot iframe neposredno na produktno stran v e-commerce platformi in delujeta kot del nakupovalnega procesa stranke.

Celoten nakupovalni proces ostane v obstoječi e-commerce platformi. PrintForge prevzame samo korak konfiguracije in dizajniranja produkta — preden stranka doda artikel v košarico.

### 1.2 Namestitev in prvi zagon

PrintForge je zasnovan za lokalno namestitev. Lastnik tiskarne mora imeti na strežniku nameščen Docker, s katerim zažene celoten sistem (backend, administracijsko aplikacijo, konfiguratorsko aplikacijo in podatkovno bazo) z enim ukazom. Ob prvi vzpostavitvi se skozi administratorski vmesnik registrira (ustvari račun), nato pa se pri vsakem naslednjem obisku prijavi s svojimi podatki. Vse nastavitve sistema, produktov in cenilnega stroja se shranjujejo v lokalno PostgreSQL podatkovno bazo.

### 1.3 Problem, ki ga rešuje

Generične e-commerce platforme imajo pri tiskarskih produktih dve temeljni omejitvi:

**1. Kompleksne konfiguracijske možnosti** — Tiskarski produkt ni enostaven artikel z eno ceno in fiksnimi lastnostmi. Ima dimenzije, količino, vrsto papirja, vrsto tiska, laminacijo, rezanje in mnogo drugih parametrov. Večina e-commerce platform podpira le preproste variacije (npr. barva, velikost), ki ne zadostijo kompleksnosti tiskarniškega cenovnika. Vsaka kombinacija bi zahtevala ročno ustvarjanje ogromnega števila variacij, kar je nepraktično in neobvladljivo.

**2. Dinamično cenovanje** — Cena tiskarskega produkta ni enostavna vsota. Odvisna je od dimenzij (npr. koliko vizitk gre na en tiskarski pol), od količine (ekonomija obsega), od procesa obdelave (laminacija se zaračuna po tekočem metru, rezanje po kosu, preflight kot fiksni strošek na naročilo). E-commerce platforme tega izračuna ne znajo izvesti — cena mora biti statična ali ročno vnesena.

Na primer: platforma WooCommerce podpira variacije produktov, a ne zna modelirati kompleksnih tiskarskih cenovnikov. Enaka omejitev velja za OpenCart in večino ostalih platform.

PrintForge oba problema rešuje z ločenim sistemom, ki deluje vzporedno z e-commerce platformo:
- Konfiguratorski iframe prikaže stranki možnosti, ki jih je lastnik tiskarne predhodno definiral v administratorskem vmesniku, ter dizajnerski vmesnik s tiskovnimi območji, ki so prav tako definirana s strani lastnika tiskarne.
- Cenilni stroj v ozadju izračuna natančno ceno v realnem času na podlagi izbranih možnosti in dimenzij.
- Ko stranka potrdi konfiguracijo, se cena in konfiguracijski podatki prenesejo iz iframe-a nazaj v košarico e-commerce platforme.

---

**Brez PrintForge:**

```mermaid
graph TD
    A[Stranka obišče produkt] --> B[Statične variacije ali ročno vnesene kombinacije]
    B --> C[Fiksna cena brez dinamičnega izračuna]
    C --> D[Naročilo brez natančnih tiskarskih parametrov]
    D --> E[Ročna obdelava naročila v tiskarni]
```

**Z PrintForge:**

```mermaid
graph TD
    A[Stranka obišče produkt] --> B[Konfiguratorski iframe se naloži v produktno stran]
    B --> C[Stranka izbere možnosti definirane s strani administratorja]
    C --> D[Stranka po želji odpre dizajnerski vmesnik]
    D --> E[Cenilni stroj izračuna ceno v realnem času]
    E --> F[Stranka potrdi konfiguracijo in doda v košarico]
    F --> G[E-commerce platforma prejme konfiguracijo in točno ceno]
    G --> H[Naročilo z vsemi tiskarskimi parametri]
```

---

### 1.4 Konfigurator in dizajner

Ko se stranka znajde na produktni strani v e-commerce platformi, PrintForge vgradi iframe, ki vsebuje dve komponenti:

**Konfigurator možnosti** prikaže vse konfiguracijske možnosti za določen produkt — na primer vrsto papirja, laminacijo, dimenzije, količino in podobno. Katere možnosti so na voljo in kakšne so njihove cene, določi lastnik tiskarne vnaprej v administratorskem vmesniku. Ko stranka izbira, cenilni stroj sproti posodablja prikaz cene.

**Spletni dizajner** je vizualni urejevalnik, ki stranki omogoča, da na produkt doda besedilo, naloži grafiko in premika elemente. Ključno je, da lastnik tiskarne v administratorskem vmesniku vnaprej definira **tiskovna območja** (*print areas*) — torej območja znotraj katerih sme stranka postavljati elemente. S tem je zagotovljeno, da dizajn stranke ustreza tehničnim zahtevam tiska.

Ko stranka zaključi konfiguracijo ali dizajniranje, se cena in vsi konfiguracijski podatki prek `postMessage` mehanizma prenesejo iz iframe-a na stran e-commerce platforme, od koder jih stranka skupaj z artiklom doda v košarico.

### 1.5 Integracije s platformami

PrintForge je zasnovan tako, da se integrira s katerokoli e-commerce platformo. Vsaka integracija je ločena komponenta (vtičnik ali prilagoditev za ciljno platformo), ki vgradi konfiguracijski iframe na produktno stran in poskrbi za prenos podatkov v košarico.

Trenutno podprte integracije:

| Platforma | Status |
|---|---|
| **WooCommerce** | Implementirano — vtičnik za WordPress (`/plugins/printforge`) |
| **OpenCart** | V implementaciji |

Ker je arhitektura modularno zastavljena, je dodajanje novih integracij (Shopify, Magento, lastni storefront) stvar razvoja novega vtičnika ali prilagoditve za ciljno platformo, ne poseganja v jedro PrintForge sistema.

```mermaid
graph TD
    PF[PrintForge Backend + Admin]

    WC[WooCommerce] <-->|vtičnik| PF
    OC[OpenCart] <-->|vtičnik| PF
    CS[Lastni storefront] <-->|REST API| PF

    PF --> DB[(PostgreSQL)]
    PF --> S3[(S3 / MinIO)]
```

### 1.6 Ciljna publika

Sistem ima tri ločene tipe uporabnikov z različnimi potrebami:

| Tip uporabnika | Opis | Dostop |
|---|---|---|
| **Administrator (lastnik tiskarne)** | Konfigurira produkte, cenovnik, tiskovna območja, integracijo z e-commerce platformo. | Admin SPA (`/pf-admin/`) |
| **Stranka** | Obišče produktno stran, konfigurira in dizajnira produkt, doda v košarico. Ne ve, da obstaja PrintForge — vidi le iframe. | Konfiguratorski iframe (`/pf/`) |
| **Razvijalec / integrater** | Postavlja sistem, razvija integracije z novimi platformami, razširja funkcionalnost. | REST API, Docker, vtičniki |

### 1.7 Pregled primerov uporabe

```mermaid
graph TD
    Admin([Administrator])
    Customer([Stranka])
    Dev([Razvijalec])

    Admin --> UC1[Sinhronizacija produktov iz e-commerce platforme]
    Admin --> UC2[Konfiguracija možnosti za produkt]
    Admin --> UC3[Nastavitev tiskovnih območij]
    Admin --> UC4[Upravljanje cenilnega stroja]
    Admin --> UC5[Upravljanje integracije]

    Customer --> UC6[Konfiguracija produkta v iframeu]
    Customer --> UC7[Ogled cene v realnem času]
    Customer --> UC8[Dizajniranje produkta]
    Customer --> UC9[Dodajanje konfiguracije v košarico]

    Dev --> UC10[Namestitev sistema z Dockerjem]
    Dev --> UC11[Razvoj integracije z novo platformo]
    Dev --> UC12[Razširitev prek REST API]

    UC1 --> Backend[(PrintForge Backend)]
    UC2 --> Backend
    UC3 --> Backend
    UC4 --> Backend
    UC5 --> Backend
    UC6 --> Backend
    UC7 --> Backend
    UC8 --> Backend
    Backend --> DB[(PostgreSQL)]
    Backend --> S3[(S3 / MinIO)]
```

---

## 2. Projektno vodenje

Projekt je bil razvit po **agilni metodologiji Scrum**. Pred začetkom sprintov je potekala **faza vzpostavitve**, v kateri je ekipa postavila osnovno infrastrukturo: monorepo strukturo, Docker okolje, CI/CD pipeline, osnovno Fastify aplikacijo in začetne React aplikacije. Po vzpostavitvi je sledilo **4 iteracij (sprintov)**, vsak s trajanjem **1 teden**, v katerih se je razvijala dejanska funkcionalnost sistema.

### 2.1 Metodologija

Na začetku vsakega sprinta je ekipa iz product backlog-a izbrala naloge in jih razporedila po prioriteti. Vsake **2 dni** je potekalo kratko **stand-up srečanje**, na katerem so člani poročali o napredku, izpostavili morebitne ovire in se dogovorili, kdo bo kaj naredil v naslednjih dneh.

Na koncu vsakega sprinta je sledil pregled rezultatov in priprava backlog-a za naslednji sprint.

### 2.2 Ekipa

Ekipa je štela **tri razvijalce**, vsak z definiranim primarnim področjem, a vsi sposobni in aktivni na celotnem stacku:

| Član | Primarno področje |
|---|---|
| Ena Imamović | Frontend — Admin SPA, Konfigurator, shared UI paket |
| Neo Xander Kirbiš | Backend — Fastify API, Prisma, cenilni stroj, podatkovna baza |
| Gal Petelin | Vtičniki in DevOps — WooCommerce plugin, Docker, CI/CD pipeline |

Poleg razvojne ekipe je imel projekt **skrbnika projekta** — profesor Mitja Gradišnik, ki je opravljal vlogo **product ownerja**. Z ekipo je imel redne tedenske sestanke, predlagal funkcionalnosti in prioritete ter sprejemal deliverables. **Scrum master** znotraj ekipe je bil Neo Xander Kirbiš, ki je koordiniral sprint procese in stand-upe.

### 2.3 Sledenje nalogam — Jira

Za sledenje nalogam in sprintom je ekipa uporabljala **Jiro** (Jira Software). Vsaka naloga je bila predstavljena kot **user story** (nova funkcionalnost) ali **task/bug** (tehnična naloga ali popravek) in je šla skozi naslednje statuse v Kanbanu:

```mermaid
graph LR
    A[Backlog] --> B[Sprint / To Do]
    B --> C[In Progress]
    C --> D[Code Review / Testing]
    D --> E[Done]
```

Stanje **Code Review / Testing** je zajemalo odprtje Pull Requesta na GitHubu, pregled kode s strani ostalih članov ekipe in testiranje sprememb. Naloga se je premaknila v **Done** šele po uspešnem pregledu in odobritvi PR-ja.

### 2.4 Git workflow

Za upravljanje izvorne kode je ekipa uporabljala **GitHub**. Vsaka funkcionalnost ali sklop sprememb je bila razvita na **ločeni tematski veji**, ki je bila nato združena v `main` prek Pull Requesta.

Aktivne veje v repozitoriju:

| Veja | Namen |
|---|---|
| `main` | Stabilna produkcijska koda |
| `ui-architecture` | Razvoj Admin SPA in frontend arhitekture |
| `configurator` | Razvoj dizajnerskega iframe-a |
| `pricing` | Razvoj cenilnega stroja |
| `options` | Razvoj konfiguracijskih možnosti |
| `wp-plugin` | Razvoj WooCommerce vtičnika |
| `test` | Veja za pisanje in integracijo testov |

Primer uporabe vej in združevanja:

```mermaid
gitGraph
    commit id: "init" tag: "main"
    branch ui-architecture
    checkout ui-architecture
    commit id: "feat: admin layout"
    commit id: "feat: product page"
    checkout main
    branch pricing
    checkout pricing
    commit id: "feat: pricing processors"
    commit id: "fix: yield calculation"
    checkout main
    merge ui-architecture id: "PR #1 merged"
    merge pricing id: "PR #2 merged"
    branch wp-plugin
    checkout wp-plugin
    commit id: "feat: iframe injection"
    checkout main
    merge wp-plugin id: "PR #3 merged"
```

### 2.5 Konvencija commitov

Vsi commiti so sledili standardu **Conventional Commits**. Vsak commit je imel predpono glede na vrsto spremembe:

| Predpona | Pomen | Primer |
|---|---|---|
| `feat:` | Nova funkcionalnost (user story) | `feat: add pricing calculator endpoint` |
| `fix:` | Popravek napake (bug fix) | `fix: correct yield calculation for A4` |

S tem je bil git log pregleden in je jasno razvidno, katere spremembe so bile nove funkcionalnosti in katere popravki.

### 2.6 Pull requesti in pregled kode

Nobena sprememba ni šla direktno v `main` brez Pull Requesta. Vsak PR je moral izpolniti dva pogoja, preden je bil lahko združen:

1. **Uspešen CI/CD pipeline** — avtomatski testi, build in SonarCloud statična analiza so morali biti uspešno opravljeni.
2. **Code review** — vsaj en drug član ekipe je moral pregledati kodo in jo odobriti.

Ta proces je zagotavljal, da je bila koda v `main` vedno stabilna, pregledana in skladna s kakovostnimi standardi.

---

## 3. Zagotavljanje kakovosti

Kakovost kode je bila zagotovljena na treh nivojih: **statična analiza** (SonarQube / SonarCloud), **avtomatsko testiranje** (Vitest) in **pregled kode** (pull request proces). Nobena sprememba ni prišla v `main` brez uspešno opravljenih vseh treh.

### 3.1 Statična analiza — SonarQube

Ekipa je uporabljala **SonarQube** na dva načina:

- **SonarLint (SonarQube for IDE) plugin v VSCode** — sprotna analiza med pisanjem kode, ki opozori na probleme direktno v urejevalniku, še preden je koda commitana
- **SonarCloud v CI/CD pipeline-u** — ob vsakem pushu na GitHub in ob vsakem pull requestu se je avtomatsko sprožila analiza celotnega repozitorija v oblaku

SonarCloud je skeniral naslednjo izvorno kodo:
- `backend/src` — zaledna logika
- `apps/` — Admin SPA in Konfigurator
- `packages/` — deljeni UI paket

Analiza je zajemala statično preverjanje kode — code smells, potencialne hrošče in varnostne ranljivosti. Iz analize so bila izključena generirana in vendor dela: `node_modules`, `dist`, `build`, minirani JS/CSS in markdown datoteke.

### 3.2 CI/CD pipeline — GitHub Actions

Ob vsakem pushu na `main` in ob vsakem pull requestu se je avtomatsko sprožil pipeline definiran v `.github/workflows/main.yml`:

```mermaid
flowchart TD
    A[Push ali PR na GitHub] --> B[Checkout kode s polno zgodovino]
    B --> C[Setup Node.js 24 + npm cache]
    C --> D[npm ci - namestitev odvisnosti]
    D --> E[Vitest testi z generiranjem coverage poročila]
    E --> F[Build backend - tsc]
    F --> G[Build frontend apps]
    G --> H[SonarCloud scan]
    H --> I{Vse uspešno?}
    I -->|Da| J[PR se lahko združi v main]
    I -->|Ne| K[Merge je blokiran]
```

Pipeline je tekel na `ubuntu-24.04` z Node.js 24. Za SonarCloud scan je pipeline potreboval celotno git zgodovino (`fetch-depth: 0`), ker SonarCloud to zahteva za pravilno analizo novih vrstic glede na prejšnje stanje.

### 3.3 Testiranje: Vitest

Backend ima dve vrsti testov, pisanih z ogrodjem **Vitest**:

**Unit testi** (`backend/tests/unit/`) testirajo posamezne module v izolaciji — vsak modul ima svojo testno datoteko:

| Testna datoteka | Kaj testira |
|---|---|
| `auth/auth.service.test.ts` | Registracija, prijava, upravljanje uporabnikov |
| `auth/auth.controller.test.ts` | HTTP sloj auth endpointov |
| `auth/authenticate.middleware.test.ts` | JWT middleware |
| `pricing/pricing.lib.test.ts` | Cenilni stroj — izračuni po posameznih bazah |
| `pricing/pricing.service.test.ts` | Pricing service logika |
| `pricing/pricing.controller.test.ts` | HTTP sloj pricing endpointov |
| `products/products.service.test.ts` | Produktna logika |
| `products/products.controller.test.ts` | HTTP sloj products endpointov |
| `integration/integration.service.test.ts` | WooCommerce integracija |
| `integration/integration.controller.test.ts` | HTTP sloj integration endpointov |

**Integracijski testi** (`backend/tests/integration/app.integration.test.ts`) testirajo celoten HTTP API kot celoto — od sprejema zahtevka do odgovora — z mockano podatkovno bazo, brez potrebe po dejanskem PostgreSQL strežniku med izvajanjem testov.

Testi se zaženejo z ukazom:
```bash
npm run test:coverage --workspace=backend
```

Rezultat je `backend/coverage/lcov.info` — poročilo o pokritosti v LCOV formatu, ki ga SonarCloud prebere in prikaže kot metriko kakovosti.

### 3.4 Code review

Vsak Pull Request je moral biti pregledan s strani vsaj enega drugega člana ekipe pred združitvijo. Pregled je zajemal:

- Pravilnost implementirane logike
- Skladnost s konvencijami projekta (struktura modulov, poimenovanje, tipi)
- Morebitne varnostne pomisleke
- Čitljivost in vzdrževalnost kode

Šele po odobritvi kode in modrem pipeline-u je bil PR lahko združen v `main`.

---

## 4. Arhitektura sistema

### 4.1 Pregled

PrintForge je sestavljen iz štirih glavnih komponent, ki tečejo v Dockerju. Pred vsemi komponentami stoji **Caddy** kot obratni posrednik (*reverse proxy*), ki usmerja promet po URL poti do pravilne komponente — tako v lokalnem razvoju kot v produkciji. Sistem je v produkciji nameščen in dostopen na naslovu [printforge.neoxk.dev](https://printforge.neoxk.dev).

Spodnji diagram prikazuje produkcijsko arhitekturo (za podroben vizualni prikaz glej [`docs/overview/server-structure.png`](docs/overview/server-structure.png)):

```mermaid
graph TD
    Traffic[Promet] --> Caddy[Caddy reverse proxy]

    subgraph Docker - printforge
        Caddy -->|dev.printforge.neoxk.dev/api/*| Backend[Fastify Backend :3000]
        Caddy -->|dev.printforge.neoxk.dev/pf-admin/*| Admin[Admin SPA - compiled static]
        Caddy -->|dev.printforge.neoxk.dev/pf/*| Configurator[Konfigurator SPA - compiled static]
        Backend --> PostgreSQL[(PostgreSQL)]
    end

    subgraph Docker - wordpress
        Caddy -->|dev.printforge.neoxk.dev| WordPress[WordPress :8080]
        WordPress --- MariaDB[(MariaDB)]
        WordPress --- Plugin[Plugin - symlink]
    end
```

Caddy routing tabela:

| Pot | Cilj | Lokalni razvoj | Produkcija |
|---|---|---|---|
| `/api/*` | Fastify backend | Vite proxy → :3000 | Compiled binary :3000 |
| `/pf-admin/*` | Admin SPA | Vite dev server :5173 | Compiled static (`apps/admin/dist`) |
| `/pf/*` | Konfigurator SPA | Vite dev server :5174 | Compiled static (`apps/configurator/dist`) |
| `/__printforge/woocommerce-sync` | Admin SPA | Vite dev server :5173 | Compiled static |
| `/*` | WordPress | WordPress :8080 | WordPress :8080 |

### 4.2 Monorepo struktura

Repozitorij je organiziran kot **npm workspaces monorepo**. Vse komponente živijo v istem repozitoriju in delijo skupen `node_modules` na korenu:

```
printforge/
├── apps/
│   ├── admin/                    ← Admin SPA (React 19 + Vite)
│   └── configurator/             ← Konfigurator SPA (React 19 + Vite)
├── packages/
│   └── ui/                       ← Deljeni UI paket (@printforge/ui)
├── backend/                      ← Fastify API (TypeScript)
├── plugins/
│   ├── printforge/               ← WooCommerce vtičnik (košarica, cene, naročila)
│   └── printforge-configurator/  ← Vtičnik za prikaz konfiguratorja (gumb + modal + iframe)
├── docker/
│   ├── printforge/               ← Docker Compose za PrintForge storitve
│   └── wordpress/                ← Docker Compose za WordPress
├── docs/                         ← Tehnična dokumentacija
├── package.json                  ← Root workspace konfiguracija
└── .github/workflows/            ← CI/CD pipeline
```

Prednosti monorepo pristopa:
- Deljene spremembe (npr. tipi v `@printforge/ui`) so takoj vidne vsem aplikacijam brez objavljanja paketa
- En sam `npm ci` namesti vse odvisnosti hkrati
- CI/CD pipeline gradi in testira vse v enem koraku

### 4.3 Komponente

**Fastify Backend** je jedro sistema. Hrani vse podatke, ki jih e-commerce platforma ne zna modelirati: konfiguracijske možnosti, cenilni stroj, tiskovna območja in nastavitve integracije. Izpostavlja REST API na `/api/`.

**Admin SPA** je React aplikacija za lastnika tiskarne, dostopna na `/pf-admin/`. Komunicira izključno z backendom prek REST API-ja.

**Konfigurator SPA** je React aplikacija za stranke, dostopna na `/pf/`. Vgradi se kot iframe v produktno stran e-commerce platforme ter komunicira z backendom za podatke o produktu in s starševsko stranjo prek `postMessage`.

**PostgreSQL** hrani vse PrintForge podatke: uporabnike, produkte, konfiguracijske možnosti, cenilni stroj in nastavitve integracije.

**S3** (objektno shranjevanje) bo uporabljen za shranjevanje datotek dizajna, ki jih stranke naložijo med dizajniranjem produkta.

**WooCommerce vtičnik `printforge`** skrbi za celotno integracijo s košarico WooCommerce: zapiše konfiguracijo in ceno v metapodatke artikla, posodobi ceno v košarici in prenese podatke na naročilo.

**WooCommerce vtičnik `printforge-configurator`** vstavi gumb na produktno stran WooCommerce, ki ob kliku odpre modalni dialog z iframe-om konfiguratorja (pot `/pf/configurator/{productId}`). Vtičnik podpira tako klasičen WooCommerce prikaz produkta kot blok-based prikaz.

### 4.4 Komunikacijski tok

```mermaid
sequenceDiagram
    actor Stranka
    participant WC as WordPress / WooCommerce
    participant Plugin as printforge-configurator vtičnik
    participant Iframe as Konfigurator iframe
    participant Backend as Fastify Backend
    participant DB as PostgreSQL

    Stranka->>WC: Odpre produktno stran
    WC->>Plugin: Renderira stran
    Plugin->>Stranka: Vstavi gumb za odprtje konfiguratorja

    Stranka->>Plugin: Klikne gumb
    Plugin->>Stranka: Odpre modalni dialog z iframe-om (/pf/configurator/:id)

    Iframe->>Backend: GET /api/products/:id/config
    Backend->>DB: Poizvedba po konfiguraciji produkta
    DB-->>Backend: Konfiguracijske možnosti + cenovne postavke
    Backend-->>Iframe: Produktna konfiguracija

    Stranka->>Iframe: Izbere možnosti
    Iframe->>Backend: POST /api/pricing/calculate
    Backend-->>Iframe: Izračunana cena
    Iframe->>WC: postMessage → posodobi ceno na strani

    Stranka->>Iframe: Potrdi konfiguracijo
    Iframe->>WC: postMessage → konfiguracijski podatki + cena
    WC->>WC: Doda artikel v košarico (printforge vtičnik zapiše metapodatke)
    Stranka->>WC: Zaključi nakup
```

### 4.5 Tehnološki sklad

| Sloj | Tehnologija | Namen |
|---|---|---|
| **Backend** | Fastify 5, TypeScript | REST API, poslovna logika |
| **ORM** | Prisma 6 | Dostop do podatkovne baze, migracije |
| **Baza** | PostgreSQL 17 | Trajno shranjevanje podatkov |
| **Validacija** | Zod + fastify-type-provider-zod | Validacija API zahtevkov, odgovorov in env spremenljivk |
| **Avtentikacija** | JWT prek @fastify/jwt | Dvojni žetoni: access (kratkotrajen) + refresh (dolgotrajen) |
| **Frontend (Admin)** | React 19, Vite 6, TailwindCSS 4, shadcn/ui | Administratorski vmesnik |
| **Frontend (Konfigurator)** | React 19, Vite 6, fabric.js | Konfiguratorski + dizajnerski iframe |
| **Deljeni paket** | @printforge/ui | Skupne komponente med aplikacijama |
| **Proxy (lokalno)** | Caddy 2 | Usmerjanje prometa po poteh med razvojem |
| **Kontejnerizacija** | Docker, Docker Compose | Zagon celotnega sistema |
| **Vtičnika** | PHP (WordPress plugins) | Integracija z WooCommerce + prikaz konfiguratorja |
| **Objektno shranjevanje** | S3 | Shranjevanje datotek dizajna |

---

## 5. Podatkovni model

### 5.1 Pregled

Podatkovni model je definiran s **Prisma 6** ORM v datoteki `backend/prisma/schema.prisma` in se hrani v PostgreSQL 17. Model je razdeljen v tri logične sklope:

- **Avtentikacija** — uporabniški računi (`User`)
- **Integracija in produkti** — WooCommerce povezava, sinhronizirani produkti in tiskovna območja
- **Knjižnica cenovnih postavk in konfiguracija produktov** — skupne cenovne postavke, ki se nato dodelijo posameznim produktom prek konfiguracijskih zabojnikov

### 5.2 ER diagram

Za konceptualni prikaz podatkovnega modela si oglejte tudi obstoječe diagrame v repozitoriju:
- [`docs/backend/pricing/er-diagram.png`](docs/backend/pricing/er-diagram.png) — abstrakten pregled cenovnega modela
- [`docs/backend/pricing/er-diagram-concrete.png`](docs/backend/pricing/er-diagram-concrete.png) — konkreten prikaz z zabojniki

Spodnji diagram prikazuje celoten dejanski podatkovni model po Prisma shemi:

```mermaid
erDiagram
    User {
        uuid id PK
        varchar name
        varchar tenantName
        varchar email
        varchar passwordHash
    }

    IntegrationConnection {
        uuid id PK
        varchar connectionName
        varchar storeUrl
        varchar restApiBase
        enum authMethod
        varchar consumerKey
        varchar consumerSecret
        varchar apiStatus
        datetime lastSync
        boolean importPublishedProducts
        boolean importAttributes
        boolean importVariations
    }

    Product {
        uuid id PK
        uuid connectionId FK
        bigint wooProductId
        varchar name
        varchar category
        varchar status
        varchar sku
        varchar basePrice
        decimal width
        decimal height
        json importedFields
    }

    ProductPrintAreaConfig {
        uuid id PK
        uuid productId FK
        json views
    }

    OptionsGroup {
        uuid id PK
        varchar name
    }

    OptionItem {
        uuid id PK
        uuid groupId FK
        varchar name
        varchar slug
        decimal priceUnit
        int lengthMm
        int widthMm
        enum calculationBasis
    }

    OptionsContainer {
        uuid id PK
        uuid productId FK
        varchar name
        int sortOrder
        uuid defaultItemId FK
        enum containerType
        boolean isHidden
        boolean isRequired
    }

    ContainerOptionItem {
        uuid id PK
        uuid containerId FK
        uuid itemId FK
        int sortOrder
        decimal priceUnit
        varchar name
    }

    IntegrationConnection ||--o{ Product : "sinhronizira"
    Product ||--o| ProductPrintAreaConfig : "ima konfiguracijo tiskovnih območij"
    Product ||--o{ OptionsContainer : "ima zabojnike"
    OptionsGroup ||--o{ OptionItem : "vsebuje"
    OptionsContainer }o--o| OptionItem : "privzeta postavka"
    OptionsContainer ||--o{ ContainerOptionItem : "vsebuje"
    OptionItem ||--o{ ContainerOptionItem : "dodeljena v"
```

### 5.3 Opis entitet

#### `User`
Račun lastnika tiskarne. Vsak uporabnik ima svoje poverilnice za prijavo v Admin SPA. Polje `tenantName` označuje ime podjetja oz. tiskarne.

#### `IntegrationConnection`
Predstavlja eno povezavo z e-commerce platformo (npr. WooCommerce). Hrani URL trgovine, metodo avtentikacije in opcijsko `consumerKey`/`consumerSecret` za WooCommerce REST API. En primerek PrintForge ima lahko več integracij.

Polje `authMethod` je enum z vrednostma:
- `public_store_api` — branje brez ključev (javni API)
- `consumer_keys` — avtentikacija s ključema potrošnika

#### `Product`
Produkt, sinhroniziran iz e-commerce platforme. Hrani osnovna polja, ki pridejo iz WooCommerce (`wooProductId`, `name`, `sku`, `basePrice`, `category`), ter opcijsko dimenziji (`width`, `height`). Edinstvena kombinacija `connectionId + wooProductId` prepreči podvojene vnose.

#### `ProductPrintAreaConfig`
Konfiguracija tiskovnih območij za posamezen produkt — razmerje 1:1 s `Product`. Polje `views` je JSON, ki opisuje vse poglede produkta in tiskovna območja znotraj vsakega pogleda (koordinate, dimenzije, omejitve).

#### `OptionsGroup`
Organizacijska skupina v knjižnici cenovnih postavk (npr. "Papirji", "Laminacije"). Nima poslovne logike — služi samo za preglednost v administratorskem vmesniku.

#### `OptionItem`
Billable korak v produkcijskem procesu — osnovna enota cenilnega stroja. Vsaka postavka ima:
- `priceUnit` — cena na enoto izračuna
- `calculationBasis` — kako se enota izračuna (podrobno razloženo v razdelku 6)
- `lengthMm` / `widthMm` — dimenzije procesa (npr. velikost tiskarskega pola)
- `slug` — enolični identifikator za programsko referenciranje

Postavke so **globalna knjižnica** — definirane enkrat, nato dodeljene različnim produktom prek `OptionsContainer`.

#### `OptionsContainer`
Konfiguracijski zabojnik na produktu — na primer "Vrsta papirja", "Laminacija", "Rezanje". Vsak zabojnik pripada enemu produktu in vsebuje seznam `OptionItem` postavk, med katerimi stranka izbira.

Polje `containerType` določa vedenje:

| Vrednost | Pomen |
|---|---|
| `SINGLE_SELECT` | Stranka izbere točno eno postavko |
| `MULTI_SELECT` | Stranka lahko izbere več postavk |
| `AUTO_APPLIED` | Postavka se doda avtomatsko (skrita pred stranko) |

Zastavici `isHidden` in `isRequired` dodatno kontrolirata prikaz in obveznost v konfiguratorju.

#### `ContainerOptionItem`
Vezna tabela med `OptionsContainer` in `OptionItem`. Ker je vsaka dodelitev kontekstualna, lahko `ContainerOptionItem` preglasi `priceUnit` in `name` iz originalne `OptionItem` — kar pomeni, da ista postavka (npr. "Digitalni tisk") v različnih produktih nastopa z drugačno ceno ali imenom.

### 5.4 Enumi

| Enum | Vrednosti | Uporabljen v |
|---|---|---|
| `CalculationBasis` | `YIELD_PCS`, `LINEAR_M`, `SQM`, `PERIMETER`, `PCS`, `ORDER`, `FREE` | `OptionItem` |
| `ContainerType` | `SINGLE_SELECT`, `MULTI_SELECT`, `AUTO_APPLIED` | `OptionsContainer` |
| `WooAuthMethod` | `public_store_api`, `consumer_keys` | `IntegrationConnection` |
| `ValidationSeverity` | `Critical`, `Warning`, `Info` | Rezervirano za prihodnje validacijske funkcionalnosti |
| `OptionType` | `select`, `boolean`, `integer`, `decimal` | Rezervirano za prihodnje razširitve |
| `PricingRuleType` | `flat_surcharge`, `percentage`, `quantity_discount` | Rezervirano za prihodnje cenovne pravile |

---

## 6. Backend

### 6.1 Struktura

Backend je **Fastify 5** aplikacija v TypeScriptu, organizirana v module. Vstopna točka je `index.ts`, ki pokliče tovarniško funkcijo `createApp()` iz `src/app.ts`. Ta registrira vse vtičnike in module:

```
backend/
├── index.ts                    ← vstopna točka
├── src/
│   ├── app.ts                  ← createApp() — registracija vtičnikov in modulov
│   ├── config/
│   │   └── env.ts              ← validacija env spremenljivk z Zodom
│   ├── middleware/
│   │   ├── authenticate.ts     ← JWT preHandler za zaščitene rute
│   │   └── errorHandler.ts     ← globalni upravljalec napak
│   ├── lib/
│   │   ├── prisma.ts           ← singleton Prisma odjemalec
│   │   ├── errors.ts           ← AppError, NotFoundError, ConflictError, ...
│   │   └── pricing/            ← cenilni stroj (čista knjižnica)
│   │       ├── index.ts
│   │       ├── engine.ts
│   │       ├── context.ts
│   │       ├── types.ts
│   │       └── processors/     ← en procesor na bazo izračuna
│   └── modules/
│       ├── auth/               ← registracija, prijava, osvežitev žetona
│       ├── integration/        ← WooCommerce integracija in sinhronizacija
│       ├── products/           ← produkti, tiskovna območja, zabojniki
│       └── pricing/            ← cenovne skupine, postavke, izračun
```

Vsak modul je sestavljen iz štirih datotek:
- `*.routes.ts` — registracija HTTP rut
- `*.controller.ts` — HTTP sloj (razčlenitev zahtevka, klic service-a, oblikovanje odgovora)
- `*.service.ts` — poslovna logika in dostop do baze
- `*.schema.ts` — Zod sheme za validacijo zahtevkov in odgovorov

### 6.2 Inicializacija aplikacije

`createApp()` v `src/app.ts` izvede naslednje korake v točno določenem vrstnem redu:

```mermaid
flowchart TD
    A[createApp] --> B[Registracija Zod type provider-ja]
    B --> C[Registracija CORS vtičnika]
    C --> D[Registracija JWT - access namespace]
    D --> E[Registracija JWT - refresh namespace]
    E --> F[Registracija auth vtičnika]
    F --> G[Registracija modulov z /api/ predpono]
    G --> H[Nastavitev globalnega errorHandler-ja]
    H --> I[Vrnitev app instance]
```

### 6.3 REST API endpointi

#### Avtentikacija (`/api/auth`)

| Metoda | Pot | Zaščita | Opis |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Registracija novega računa |
| `POST` | `/api/auth/login` | — | Prijava, vrne access + refresh žeton |
| `POST` | `/api/auth/refresh` | — | Izmenjava refresh žetona za nov access žeton |

#### Integracija (`/api/integration`)

| Metoda | Pot | Zaščita | Opis |
|---|---|---|---|
| `GET` | `/api/integration` | JWT | Pridobi trenutno integracijo |
| `PUT` | `/api/integration` | JWT | Shrani/posodobi nastavitve integracije |
| `POST` | `/api/integration/sync` | JWT | Sproži sinhronizacijo produktov iz WooCommerce |

#### Produkti (`/api/products`)

| Metoda | Pot | Zaščita | Opis |
|---|---|---|---|
| `GET` | `/api/products` | JWT | Seznam vseh produktov |
| `PATCH` | `/api/products/:id` | JWT | Posodobi produkt |
| `GET` | `/api/products/:id/config` | — | Javna konfiguracija produkta za konfigurator |
| `GET` | `/api/products/:id/print-areas` | — | Tiskovna območja produkta |
| `PUT` | `/api/products/:id/print-areas` | JWT | Shrani tiskovna območja |
| `GET` | `/api/products/woo/:wooProductId/config` | — | Javna konfiguracija po WooCommerce ID |
| `GET` | `/api/products/woo/:wooProductId/print-areas` | — | Tiskovna območja po WooCommerce ID |
| `GET` | `/api/products/:id/containers` | JWT | Seznam zabojnikov produkta |
| `POST` | `/api/products/:id/containers` | JWT | Ustvari nov zabojnik |
| `GET` | `/api/products/:id/containers/:cid` | JWT | Pridobi en zabojnik |
| `PUT` | `/api/products/:id/containers/:cid` | JWT | Posodobi zabojnik |
| `DELETE` | `/api/products/:id/containers/:cid` | JWT | Izbriši zabojnik |
| `GET` | `/api/products/:id/containers/:cid/items` | JWT | Seznam postavk v zabojniku |
| `POST` | `/api/products/:id/containers/:cid/items` | JWT | Dodaj postavko v zabojnik |
| `PATCH` | `/api/products/:id/containers/:cid/items/:itemId` | JWT | Preglasi nastavitve postavke |
| `DELETE` | `/api/products/:id/containers/:cid/items/:itemId` | JWT | Odstrani postavko iz zabojnika |

#### Cenilni stroj (`/api/pricing`)

| Metoda | Pot | Zaščita | Opis |
|---|---|---|---|
| `GET` | `/api/pricing/groups` | JWT | Seznam skupin |
| `POST` | `/api/pricing/groups` | JWT | Ustvari skupino |
| `GET` | `/api/pricing/groups/:id` | JWT | Pridobi skupino |
| `PUT` | `/api/pricing/groups/:id` | JWT | Posodobi skupino |
| `DELETE` | `/api/pricing/groups/:id` | JWT | Izbriši skupino |
| `POST` | `/api/pricing/groups/:id/items/:itemId` | JWT | Dodaj postavko v skupino |
| `DELETE` | `/api/pricing/groups/:id/items/:itemId` | JWT | Odstrani postavko iz skupine |
| `GET` | `/api/pricing/items` | JWT | Seznam postavk (opcijski filter po skupini) |
| `POST` | `/api/pricing/items` | JWT | Ustvari postavko |
| `GET` | `/api/pricing/items/:id` | JWT | Pridobi postavko |
| `PUT` | `/api/pricing/items/:id` | JWT | Posodobi postavko |
| `DELETE` | `/api/pricing/items/:id` | JWT | Izbriši postavko |
| `POST` | `/api/pricing/calculate` | — | Izračunaj ceno (kliče konfigurator) |

### 6.4 Avtentikacija — dvojni JWT

Backend uporablja **dvojni JWT namespace** prek `@fastify/jwt`:

```mermaid
sequenceDiagram
    actor Admin
    participant Backend

    Admin->>Backend: POST /api/auth/login
    Backend-->>Admin: accessToken (kratkotrajen) + refreshToken (dolgotrajen)

    Admin->>Backend: GET /api/products (Bearer accessToken)
    Backend-->>Admin: 200 OK

    Note over Admin,Backend: Access žeton poteče

    Admin->>Backend: POST /api/auth/refresh (refreshToken)
    Backend-->>Admin: Nov accessToken
```

- **Access žeton** — kratkotrajen, posredovan v `Authorization: Bearer` glavi za vsak zaščiten API klic
- **Refresh žeton** — dolgotrajen, posredovan ob osvežitvi za pridobitev novega access žetona
- Oba žetona sta podpisana z ločenima skrivnostma (`JWT_SECRET` in `JWT_REFRESH_SECRET`)

Zaščitene rute imajo `preHandler: authenticate`, ki žeton preveri in zavrne z `401 Unauthorized` če ni veljaven.

### 6.5 Cenilni stroj (Pricing Engine)

Cenilni stroj je **čista knjižnica** v `src/lib/pricing/` — brez odvisnosti od baze ali HTTP. Sprejme seznam `OptionItem` postavk in kontekst naročila ter vrne skupno ceno z razčlenitvijo po postavkah.

**Kontekst naročila:**
```typescript
type OrderContext = {
  widthMm: number    // širina produkta v mm
  heightMm: number   // višina produkta v mm
  quantity: number   // količina kosov
}
```

**Rezultat:**
```typescript
type PricingResult = {
  total: number
  breakdown: Array<{
    itemId: string
    name: string
    calculationBasis: CalculationBasis
    cost: number
  }>
}
```

Vsaka `OptionItem` postavka ima svojo **bazo izračuna**, ki določa procesor:

| Baza | Logika izračuna | Primer uporabe |
|---|---|---|
| `YIELD_PCS` | Izračuna koliko kosov gre na en tiskarski pol (preizkusi obe orientaciji), nato število polov × cena/pol | Vizitke, letaki, nalepke |
| `LINEAR_M` | Skupna dolžina materiala × cena/m | Laminacijska folija (po dolžini) |
| `SQM` | Skupna površina × cena/m² | Tisk na blago, velika platna |
| `PERIMETER` | Skupni obseg × cena/m | Rezanje po robu, žična vezava |
| `PCS` | Količina × cena/kos | Tisk na majico, obdelava po kosu |
| `ORDER` | Fiksna cena neodvisno od količine/dimenzij | Predpriprava, preflight |
| `FREE` | Vedno 0 | Brezplačno vključene storitve |

Primer — izračun za 500 vizitk (85×55 mm) na pol 720×500 mm:
```
YIELD_PCS: floor(720/85) × floor(500/55) = 8 × 9 = 72 kosov/pol
           ali floor(720/55) × floor(500/85) = 13 × 5 = 65 kosov/pol
           → vzame max = 72 kosov/pol
           → ceil(500/72) = 7 polov × 0.80 €/pol = 5.60 €
```

Arhitektura procesorjev je registrna — vsak procesor je funkcija tipa `(item, ctx) => number`, ki se poveže z bazo izračuna v `processors/index.ts`. Dodajanje nove baze pomeni samo napisati novo funkcijo in jo dodati v register.

### 6.6 Upravljanje napak

Globalni `errorHandler` v `src/middleware/errorHandler.ts` obravnava tri vrste napak:

| Vrsta | Primer | Odgovor |
|---|---|---|
| `AppError` (lastna hierarhija) | `NotFoundError`, `ConflictError`, `UnauthorizedError` | HTTP status iz napake + `{ error: message }` |
| Fastify validacijska napaka (400) | Manjkajoče/napačno polje v telesu | 400 + človeško berljivo sporočilo |
| Neobravnavana napaka | Nepričakovana izjema | 500 + `{ error: "Internal server error" }` |

Hierarhija lastnih napak:
```
AppError (bazni razred)
├── UnauthorizedError  → 401
├── ForbiddenError     → 403
├── NotFoundError      → 404
└── ConflictError      → 409
```

---

## 7. Frontend — Admin SPA

### 7.1 Namen in tehnologije

Admin SPA je React aplikacija za lastnika tiskarne, dostopna na `/pf-admin/`. Omogoča upravljanje produktov, konfiguracijo cenilnega stroja, nastavitev tiskovnih območij in upravljanje integracije z WooCommerce. Zgrajena je z:

- **React 19** + **Vite 6** — aplikacijski okvir in razvojno okolje
- **React Router DOM 7** — odjemalsko usmerjanje
- **TailwindCSS 4** + **shadcn/ui** — stiliranje in UI komponente
- **useReducer** — upravljanje stanja (brez Redux ali TanStack)
- **@printforge/ui** — deljene komponente iz shared paketa

### 7.2 Trislojna arhitektura

Admin SPA je zasnovan po **tristopenjskem vzorcu**, kjer vsak sloj ima natančno eno odgovornost:

```mermaid
flowchart TD
    Page[Stran / komponenta]
    Service[Service sloj]
    Client[API client - apiRequest]
    Backend[Fastify Backend]
    Reducer[Reducer]
    State[Lokalno stanje]

    Page -->|kliče| Service
    Service -->|kliče| Client
    Client -->|HTTP fetch| Backend
    Backend -->|JSON odgovor| Client
    Client -->|vrne podatke| Service
    Service -->|vrne podatke| Page
    Page -->|dispatch action| Reducer
    Reducer -->|nov state| State
    State -->|re-render| Page
```

**Sloj 1 — API client (`src/lib/api/client.ts`):** Centralna funkcija `apiRequest<T>()` skrbi za vse HTTP klice. Samodejno doda `Authorization: Bearer` glavo, zazna `401 Unauthorized` odgovor in transparentno osveži access žeton prek refresh žetona — brez da bi to moral vedeti kateri koli drug del aplikacije.

**Sloj 2 — Services (`src/lib/services/`):** Namespace objekti (ne razredi) grupirajo API klice po domenah. Vsaka funkcija kliče `apiRequest` in vrne čiste podatke. Services nimajo stranskih učinkov in ne vedo nič o stanju aplikacije.

**Sloj 3 — Reducers (`src/lib/reducers/`):** Čiste funkcije `(state, action) → nextState`, ki upravljajo lokalno stanje strani. Vsak reducer ima pripadajoče `ActionCreators`, ki preprečijo napake pri pisanju akcij.

### 7.3 Rute in zaščita

```mermaid
flowchart TD
    Root[BrowserRouter basename=/pf-admin/]

    Root --> Login[/login - samo javno]
    Root --> Register[/register - samo javno]
    Root --> Protected[/ - zaščiteno]

    Protected --> Dashboard[/ - nadzorna plošča]
    Protected --> Products[/products - seznam produktov]
    Protected --> ProductDetail[/products/:productId - urejevalnik produkta]
    Protected --> Pricing[/pricing - cenilni stroj]
    Protected --> Settings[/settings - nastavitve integracije]

    Login -->|isAuthenticated| RedirectHome[Preusmeri na /]
    Protected -->|ni isAuthenticated| RedirectLogin[Preusmeri na /login]
```

Rute so razdeljene v dve skupini:
- **Javne rute** (`/login`, `/register`) — dostopne samo neprijavljenim. Prijavljeni so preusmerjeni na `/`
- **Zaščitene rute** (`/`, `/products`, `/pricing`, `/settings`) — ovojene v `ProtectedLayout`, ki preveri `isAuthenticated` in preusmeri na `/login` če ni veljavne seje

### 7.4 API client in JWT tok

`apiRequest<T>()` v `src/lib/api/client.ts` avtomatsko obvladuje celoten JWT cikel:

```mermaid
sequenceDiagram
    participant Komponenta
    participant apiRequest
    participant Backend

    Komponenta->>apiRequest: apiRequest('/api/products')
    apiRequest->>Backend: GET /api/products + Bearer accessToken
    alt Access žeton veljaven
        Backend-->>apiRequest: 200 OK + data
        apiRequest-->>Komponenta: typed data T
    else Access žeton potekel - 401
        Backend-->>apiRequest: 401 Unauthorized
        apiRequest->>Backend: POST /api/auth/refresh + refreshToken
        Backend-->>apiRequest: Nov accessToken
        apiRequest->>Backend: GET /api/products + nov Bearer accessToken
        Backend-->>apiRequest: 200 OK + data
        apiRequest-->>Komponenta: typed data T
    else Refresh žeton potekel
        Backend-->>apiRequest: 401 Unauthorized
        apiRequest->>apiRequest: Izbriši sejo iz localStorage
        apiRequest-->>Komponenta: Vrže napako - seja je potekla
    end
```

### 7.5 Service sloj

Services so **namespace objekti** — ne razredi, ne singleton instance. Vsak klic je čista funkcija brez stranskih učinkov:

| Service | Namespace | Odgovornost |
|---|---|---|
| `groups.ts` | `Groups` | CRUD za cenovne skupine |
| `items.ts` | `Items` | CRUD za cenovne postavke |
| `pricing.ts` | `Pricing` | Izračun cene |
| `containers.ts` | `Containers` | CRUD za zabojnike in postavke v zabojnikih |
| `products.ts` | `Products` | Seznam produktov, dimenzije, tiskovna območja |

Primer uporabe v komponenti:
```typescript
// Klic service-a — ne ve nič o stanju
const group = await Groups.create(name)

// Posodobitev stanja prek reducerja
dispatch(PricingActions.GROUP_CREATED(group))
```

### 7.6 Upravljanje stanja — Reducer vzorec

Stanje se upravlja z `useReducer` in tipiziranimi **ActionCreators**, ki preprečijo napake pri pisanju imen akcij:

```typescript
// V komponenti
const [state, dispatch] = useReducer(pricingReducer, initialPricingState)

// Po uspešnem API klicu
dispatch(PricingActions.ITEM_UPDATED(updatedItem))

// Reducer (čista funkcija — ne pozna API-ja)
case 'ITEM_UPDATED':
  return {
    ...state,
    items: state.items.map(i => i.id === action.item.id ? action.item : i)
  }
```

Obstoječi reducerji:

| Datoteka | State tip | Akcije |
|---|---|---|
| `reducers/pricing.ts` | `PricingState` | LOADED, GROUP_CREATED/RENAMED/DELETED, ITEM_CREATED/UPDATED/DELETED/MOVED |
| `reducers/containers.ts` | `ContainersState` | Upravljanje zabojnikov in njihovih postavk |

Prednosti tega vzorca:
- Stanje je lokalno pri strani, ki ga potrebuje — ni globalnega store-a
- Reducer je čista funkcija, enostavna za testiranje
- `ActionCreators` dajejo avtodopolnjevanje in preprečijo napake pri pisanju

---

## 8. Frontend — Konfigurator

### 8.1 Namen in tehnologije

Konfigurator SPA je React aplikacija za stranke, dostopna na `/pf/`. Vgradi se kot iframe v produktno stran e-commerce platforme in stranki ponudi vmesnik za konfiguracijo in dizajniranje produkta. Zgrajena je z:

- **React 19** + **Vite 6**
- **fabric.js 6** — canvas knjižnica za dizajnerski vmesnik
- **@printforge/ui** — deljene komponente
- **Lasten router** na osnovi `window.location` (brez BrowserRouter — iframe ne sme upravljati zgodovine brskalnika)

### 8.2 Struktura

```
apps/configurator/src/
├── Router.tsx              ← lasten router na osnovi window.location
├── options/                ← konfigurator možnosti (opcije, dimenzije, količina, cena)
│   ├── OptionsPage.tsx
│   ├── DimensionsFields.tsx
│   ├── QuantityField.tsx
│   ├── PricePanel.tsx
│   ├── parentMessaging.ts
│   ├── useIframeResize.ts
│   ├── useParentConfigurationSync.ts
│   └── useParentQuantitySync.ts
├── designer/               ← dizajnerski vmesnik (fabric.js canvas)
│   ├── UserDesignerPage.tsx
│   ├── TextPropertiesPanel.tsx
│   ├── parentMessaging.ts
│   ├── designerConfig.ts
│   └── fonts.ts
├── product-details/        ← pregled produktnih podrobnosti
├── shared/                 ← deljeni tipi in pomožne funkcije
└── components/             ← skupne UI komponente
```

### 8.3 Lasten router

Ker konfigurator teče znotraj iframe-a, ne sme posegati v zgodovino nadrejenega brskalnika. Zato ne uporablja `BrowserRouter` iz React Router, temveč **lasten router**, ki bere `window.location.pathname` in ob vsakem `popstate` dogodku posodobi prikazano komponento.

```mermaid
flowchart TD
    URL[window.location.pathname]
    URL -->|/pf ali /pf/configurator/*| Designer[UserDesignerPage]
    URL -->|/pf/options/*| Options[OptionsPage]
    URL -->|vse ostalo| NotFound[NotFoundRoute]
```

Ob obisku `/pf` se URL samodejno preusmeri na `/pf/configurator` z `replaceState` — brez dodajanja vnosa v zgodovino.

### 8.4 Komunikacija z nadrejeno stranjo (postMessage)

Ker konfigurator teče v iframe-u, ne more direktno dostopati do DOM elementa nadrejene strani. Vsa komunikacija poteka prek **`window.postMessage`** mehanizma. Ciljna origin se pridobi iz `window.location.ancestorOrigins[0]` ali `document.referrer`.

Definirana sporočila:

| Tip sporočila | Smer | Vsebina | Namen |
|---|---|---|---|
| `printforge:options:resize` | iframe → starš | `{ height }` | Obvesti starša o novi višini iframe-a |
| `printforge:designer:change` | iframe → starš | `{ productId, wooProductId, design }` | Pošlje aktualno stanje dizajna |

Konfigurator sproti sporoča višino svojega vsebnika nadrejeni strani, ki nato prilagodi višino iframe elementa. To zagotavlja, da se iframe nikoli ne prikaže z drsnim trakom.

### 8.5 Konfigurator možnosti

`OptionsPage` naloži konfiguracijo produkta iz backenda (`GET /api/products/woo/:id/config`), prikaže konfiguracijske zabojnike z možnostmi in ob vsaki spremembi sproži izračun cene. Cena se prikaže v `PricePanel` komponenti in se prek `postMessage` pošlje na nadrejeno stran.

### 8.6 Dizajnerski vmesnik

`UserDesignerPage` je celovit vizualni urejevalnik zgrajen na **fabric.js** canvasu. Stranki omogoča:
- Dodajanje in urejanje besedila (pisava, barva, velikost, poravnava)
- Nalaganje lastnih grafik
- Premikanje, skaliranje in rotiranje elementov
- Vse znotraj vnaprej definiranih **tiskovnih območij** (*print areas*), ki jih je lastnik tiskarne določil v Admin SPA

Tiskovna območja so pridobljena iz backenda (`GET /api/products/woo/:id/print-areas`) in se na canvasu prikažejo kot vizualne meje, ki jih stranka ne more prekoračiti. Ko stranka zaključi dizajniranje, se stanje dizajna (serializirano fabric.js stanje) prek `postMessage` pošlje na nadrejeno stran.

```mermaid
sequenceDiagram
    actor Stranka
    participant Designer as UserDesignerPage
    participant Backend
    participant Parent as WooCommerce stran

    Designer->>Backend: GET /api/products/woo/:id/print-areas
    Backend-->>Designer: Tiskovna območja (koordinate, dimenzije)
    Designer->>Designer: Inicializacija fabric.js canvasa s tiskovnimi območji

    Stranka->>Designer: Doda besedilo / grafiko
    Designer->>Designer: Omeji elemente na tiskovna območja
    Designer->>Parent: postMessage printforge:designer:change + design JSON

    Stranka->>Designer: Zaključi dizajniranje
    Designer->>Parent: postMessage printforge:designer:change + končni design JSON
```

---

## 9. WooCommerce integracija

### 9.1 Pregled

Integracija z WooCommerce je razdeljena med dva ločena WordPress vtičnika in JavaScript kodo na strani brskalnika. Vsak del ima natančno definirano odgovornost:

| Komponenta | Datoteka | Odgovornost |
|---|---|---|
| `printforge` vtičnik | `plugins/printforge/` | Vstavi opcijski iframe, prevzame košarico, preveri ceno na strežniku, shrani naročilo |
| `printforge-configurator` vtičnik | `plugins/printforge-configurator/` | Vstavi gumb in modalni dialog z dizajnerskim iframe-om |
| `frontend.js` (printforge) | `plugins/printforge/assets/js/` | Posluša postMessage sporočila, sinhronizira količino, shranjuje konfiguracijo v skrita polja obrazca |
| `frontend.js` (configurator) | `plugins/printforge-configurator/assets/js/` | Odpira/zapira modalni dialog, posreduje sporočila med opcijskim in dizajnerskim iframe-om |

### 9.2 Vtičnika in WordPress kljuke

**`printforge` vtičnik** se registrira na naslednje WooCommerce kljuke:

| Kljuka | Funkcija | Namen |
|---|---|---|
| `woocommerce_single_product_summary` | `printforge_render_options_iframe` | Vstavi opcijski iframe v produktno stran |
| `render_block` | `printforge_render_options_iframe_block_fallback` | Rezervna pot za block-based teme |
| `woocommerce_is_purchasable` | `printforge_allow_configured_product_purchase` | Dovoli nakup produktov brez cene (cena pride iz konfiguratorja) |
| `woocommerce_add_to_cart_validation` | `printforge_validate_add_to_cart` | Strežniška validacija konfiguracije ob dodajanju v košarico |
| `woocommerce_add_cart_item_data` | `printforge_add_cart_item_data` | Shrani konfiguracijo in ceno v metapodatke košarice |
| `woocommerce_before_calculate_totals` | `printforge_apply_cart_item_price` | Posodobi ceno ob spremembi količine |
| `woocommerce_check_cart_items` | `printforge_validate_cart_pricing` | Preveri veljavnost cen pred zaključkom |
| `woocommerce_cart_item_price` | `printforge_get_cart_item_price` | Prikaže skupno ceno (osnova + opcije) |
| `woocommerce_get_item_data` | `printforge_get_cart_item_data` | Prikaže izbrane opcije v košarici |
| `woocommerce_checkout_create_order_line_item` | `printforge_add_order_line_item_meta` | Shrani polno konfiguracijo in ceno v metapodatke naročila |

**`printforge-configurator` vtičnik** se registrira na:

| Kljuka | Funkcija | Namen |
|---|---|---|
| `woocommerce_single_product_summary` | `printforge_configurator_render_launcher` | Vstavi gumb za odprtje dizajnerja |
| `render_block` | `printforge_configurator_render_launcher_block_fallback` | Rezervna pot za block-based teme |

### 9.3 Celoten tok od produktne strani do naročila

```mermaid
sequenceDiagram
    actor Stranka
    participant WP as WordPress / WooCommerce
    participant JS as frontend.js
    participant OptionsIframe as Opcijski iframe /pf/options
    participant DesignerIframe as Dizajnerski iframe /pf/configurator
    participant Backend as Fastify Backend

    WP->>Stranka: Renderira produktno stran
    WP->>Stranka: Vstavi opcijski iframe (printforge vtičnik)
    WP->>Stranka: Vstavi gumb za dizajner (printforge-configurator vtičnik)

    OptionsIframe->>Backend: GET /api/products/woo/:id/config
    Backend-->>OptionsIframe: Konfiguracijske možnosti

    Stranka->>OptionsIframe: Izbere opcije
    OptionsIframe->>JS: postMessage printforge:options:change + konfiguracija
    JS->>WP: Shrani v skrito polje printforge_configuration

    OptionsIframe->>JS: postMessage printforge:options:resize + višina
    JS->>WP: Nastavi višino iframe-a

    Stranka->>WP: Klikne gumb za dizajner
    JS->>DesignerIframe: Odpre modalni dialog
    DesignerIframe->>Backend: GET /api/products/woo/:id/print-areas
    Backend-->>DesignerIframe: Tiskovna območja
    Stranka->>DesignerIframe: Ureja dizajn
    DesignerIframe->>JS: postMessage printforge:designer:change + design JSON
    JS->>WP: Shrani v skrito polje printforge_designer_configuration

    Stranka->>WP: Klikne Dodaj v košarico
    WP->>Backend: GET /api/products/woo/:id/config (validacija)
    WP->>Backend: POST /api/pricing/calculate (strežniška verifikacija cene)
    Backend-->>WP: Verificirana konfiguracija + cena
    WP->>WP: Shrani v košarico z metapodatki
    WP-->>Stranka: Artikel v košarici s konfiguracijo in ceno

    Stranka->>WP: Zaključi naročilo
    WP->>WP: Shrani _printforge_configuration + _printforge_pricing v naročilo
```

### 9.4 Varnostna verifikacija cene

Ključna varnostna lastnost integracije je, da se **cena vedno verificira strežniško** ob dodajanju v košarico. Konfigurator v brskalniku pošlje konfiguracijo (seznam izbranih `itemId`-jev in kontekst), WooCommerce vtičnik pa to pošlje na PrintForge backend, ki:

1. Preveri, ali produkt obstaja v PrintForge
2. Validira vse `itemId`-je (UUID format, stroga sanacija)
3. Validira dimenzije in količino (pozitivne vrednosti)
4. Izračuna ceno neodvisno od tega, kar je brskalnik prikazal

To preprečuje manipulacijo cene na strani odjemalca — stranka ne more spremeniti cene z urejanjem JavaScript kode ali omrežnih zahtevkov.

### 9.5 Sinhronizacija količine

Ko stranka spremeni količino na produktni strani, `frontend.js` samodejno pošlje novo količino v opcijski iframe prek `postMessage`:

```
WooCommerce quantity input → sprememba → frontend.js → postMessage printforge:quantity:change → OptionsPage → posodobi prikaz cene
```

Ob spremembi količine v košarici pa vtičnik na strežniku samodejno preračuna ceno prek `printforge_apply_cart_item_price`.

### 9.6 Metapodatki naročila

Ko stranka zaključi nakup, se v vsako vrstico naročila shranijo:

| Ključ metapodatka | Vidnost | Vsebina |
|---|---|---|
| `_printforge_configuration` | Zasebno | Polna konfiguracija v JSON (productId, selectedItemIds, context, dimenzije) |
| `_printforge_pricing` | Zasebno | Polni cenovni razčlenitveni prikaz v JSON |
| `Dimensions` | Javno | Človeško berljive dimenzije (npr. "85 × 55 mm, 500 kos") |
| `[Ime zabojnika]` | Javno | Izbrana opcija za vsak zabojnik (npr. "Vrsta papirja: Premazni 135g") |

---

## 10. Varnost

### 10.1 Avtentikacija in zaščita API-ja

Vse rute v Admin SPA in na backenddu, ki niso namenjene javnemu dostopu, so zaščitene z JWT access žetonom. Backend uporablja `preHandler: authenticate` middleware, ki:
- Prebere `Authorization: Bearer <token>` glavo
- Verificira žeton z `JWT_SECRET`
- Vrne `401 Unauthorized` če žeton ni prisoten, je neveljaven ali je potekel

Javne rute (brez zaščite) so eksplicitno definirane in namenjene konfiguratorju:
- `GET /api/products/:id/config`
- `GET /api/products/woo/:wooProductId/config`
- `GET /api/products/woo/:wooProductId/print-areas`
- `POST /api/pricing/calculate`

### 10.2 Validacija vhodnih podatkov

Vsak API endpoint validira vhodne podatke z **Zod** shemami prek `fastify-type-provider-zod`. Zahtevek, ki ne ustreza shemi, je zavrnjen z `400 Bad Request` in človeško berljivim sporočilom napake — brez da bi kdaj dosegel poslovno logiko.

Enako velja za okoljske spremenljivke: `src/config/env.ts` validira vse spremenljivke ob zagonu z Zodom in takoj zaustavi aplikacijo, če katera manjka ali je napačnega tipa.

### 10.3 Strežniška verifikacija cene

Cena se vedno verificira na strežniku ob dodajanju v košarico (podrobno opisano v razdelku 9.4). Vtičnik sanitira vse `itemId`-je z UUID regex validacijo in preveri dimenzije ter količino pred klicem cenilnega stroja. Stranka ne more manipulirati cene prek brskalnika.

### 10.4 Gesla

Gesla so shranjena izključno kot **bcrypt** hash — nikoli v čistem tekstu. Primerjava gesla ob prijavi poteka prek `bcrypt.compare()`, ki je odporna na timing napade.

---

## 11. Namestitev in zagon

### 11.1 Predpogoji

- **Docker** in **Docker Compose** nameščena na strežniku
- **Node.js 24+** za lokalni razvoj (opcijsko, Docker ga nadomesti)
- Git za kloniranje repozitorija

### 11.2 Lokalni razvoj

```bash
# 1. Kloniraj repozitorij
git clone <url> printforge && cd printforge

# 2. Ustvari okoljske datoteke
cp backend/.env.example backend/.env
# Uredi backend/.env z vrednostmi za lokalni razvoj

# 3. Zaženi celoten sistem (WordPress + PrintForge + Caddy)
npm run dev:local
```

Dostopne točke po zagonu:

| URL | Storitev |
|---|---|
| `http://localhost:5174/pf-admin/` | Admin SPA |
| `http://localhost:5174/pf/` | Konfigurator |
| `http://localhost:5174/api/` | Fastify backend |
| `http://localhost:8080/` | WordPress / WooCommerce |

### 11.3 Produkcijska namestitev

```bash
# 1. Ustvari produkcijske okoljske datoteke
cp backend/.env.example backend/.env.server
# Uredi backend/.env.server s produkcijskimi vrednostmi

# 2. Zaženi produkcijski stack
npm run deploy:server
```

V produkciji se frontend aplikaciji zgradita v statične datoteke (`apps/admin/dist`, `apps/configurator/dist`) in se strežeta prek Caddy-ja.

### 11.4 Okoljske spremenljivke

**Backend** (`backend/.env`):

| Spremenljivka | Opis | Primer |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@postgres:5432/printforge` |
| `JWT_SECRET` | Skrivnost za access žetone | dolg naključen niz |
| `JWT_REFRESH_SECRET` | Skrivnost za refresh žetone | dolg naključen niz |
| `PORT` | Port backenda | `3000` |
| `NODE_ENV` | Okolje | `development` / `production` |

**WordPress vtičnika** (okoljske spremenljivke Docker kontejnerja):

| Spremenljivka | Opis | Privzeto |
|---|---|---|
| `PRINTFORGE_OPTIONS_BASE_URL` | URL opcijskega iframe-a | `/pf/options` |
| `PRINTFORGE_API_BASE_URL` | URL PrintForge API-ja | `http://fastify:3000/api` |
| `PRINTFORGE_CONFIGURATOR_BASE_URL` | URL dizajnerskega iframe-a | `/pf/configurator` |

### 11.5 Prva vzpostavitev

Po prvem zagonu:
1. Odpri Admin SPA na `/pf-admin/`
2. Klikni **Register** in ustvari račun lastnika tiskarne
3. V nastavitvah poveži WooCommerce integracijo (URL trgovine + consumer keys)
4. Klikni **Sync** za uvoz produktov iz WooCommerce
5. Za vsak produkt konfiguriraj možnosti, cenilni stroj in tiskovna območja
