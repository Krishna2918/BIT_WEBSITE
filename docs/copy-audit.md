# BIT Solution — Site Copy & Layout Audit

**Source:** [https://bitsolution.vercel.app](https://bitsolution.vercel.app)  
**Scraped:** 15 August 2026  
**Brand:** BIT Solution (Brampton / GTA, Ontario)  
**Primary tagline:** Your ONE stop IT solution.  
**Umbrella promise:** Software, hardware, AI, and security — under one flag.  
**Visual theme:** White / ice-blue product studio. Dark sticky nav.

This document is a page-by-page inventory of live copy, navigation, CTAs, service offerings, and layout flow for audit. Industry body copy is quoted from the live sector templates.

---

## 1. Site map

| Path | Page | Role |
| --- | --- | --- |
| `/` | Home | Hero + globe, sectors reel, partners, 2×2 pillars |
| `/software` | Software | Products + custom + AI-for-business |
| `/hardware` | Hardware | Cameras → servers → PCs, network, phones |
| `/ai` | AI | 8 support / product beats (now vs soon) |
| `/security` | Security | 6 protection beats + “Building trust.” |
| `/industries` | Sectors index | All 16 floors |
| `/industries/:slug` | Sector detail | Govern + 4 pillars (×16) |
| `/login` | Sign in | Utility (sign-in disabled on this deploy) |

**Not in primary nav:** `/login`.

---

## 2. Global chrome

### 2.1 Header (all marketing pages)

Sticky, dark (`#0e0e10`), 48px.

| Element | Copy | Destination |
| --- | --- | --- |
| Mark + wordmark | BIT SOLUTION | `/` |
| Nav | Software | `/software` |
| Nav | Hardware | `/hardware` |
| Nav | AI | `/ai` |
| Nav | Security | `/security` |
| Nav | Sectors | `/industries` |

Mobile: hamburger; same five links stacked.

### 2.2 Footer (all marketing pages)

**Blurb (exact):**

> Your ONE stop IT solution. BIT Solution connects software, hardware, AI, and security for transportation, construction, accounting, healthcare, legal, schools, colleges, city councils, dental, airports, retail, warehouses, and dealerships — from Brampton and the GTA to every site we run.

**Column 1 — Explore**

| Label | To |
| --- | --- |
| Software | `/software` |
| Hardware | `/hardware` |
| AI | `/ai` |
| Security | `/security` |

**Column 2 — Software**

| Label | To |
| --- | --- |
| Fleet | `/software` |
| College ERP | `/software` |
| Clinic | `/software` |
| Custom build | `/software` |

**Column 3 — Hardware**

| Label | To |
| --- | --- |
| Cameras | `/hardware` |
| Private servers | `/hardware` |
| Network | `/hardware` |
| Phones | `/hardware` |

**Column 4 — Company**

| Label | To |
| --- | --- |
| About BIT | `/` |
| Sectors | `/industries` |
| Trust | `/security` |
| Support | `/ai` |

**Sector strip (all 16):** Transportation, Construction, Accounting, Healthcare, Legal, Schools, Colleges, City councils, Dental, Public–private projects, Airports, Retail, Warehouses, Industrial, Auto dealerships, Hospitality.

**Legal:** Copyright © 2026 BIT Solution. All rights reserved.

---

## 3. Home `/`

### Layout flow

1. Hero lockup + value lines + CTAs  
2. Client-only Three.js particle globe (USA-forward, scroll-linked)  
3. **Who we cover** — sticky 8×2 sector reel (Transportation first; Dental under it)  
4. **Who we partner with** — logo field (not cards)  
5. **Four parts. One flag.** — 2×2 Software / Hardware / AI / Security  

### 3.1 Hero

| Role | Exact copy |
| --- | --- |
| Wordmark | BIT SOLUTION |
| Services line | SOFTWARE · HARDWARE · AI · SECURITY |
| Tagline | BUILDING TRUST |
| H1 support | Your ONE stop IT solution. |
| Sub | Best IT solution & cloud services — from Brampton and the GTA to every site we run. |

**CTAs**

| Copy | Destination |
| --- | --- |
| Learn more › | `/software` |
| Sectors › | `/industries` |

**Value proposition (hero):** One vendor for software + hardware + AI + security. Local (Brampton / GTA) with reach to every site they run. Reliability framed as “ONE stop,” not a feature list.

### 3.2 Who we cover

| Role | Exact copy |
| --- | --- |
| Eyebrow | Who we cover |
| Headline | One team. Every kind of floor. |
| Sub (current workspace) | From Brampton and the GTA out. |

**Interaction:** Two rows of eight tiles. Image left / text right on desktop. Full viewport width. Scroll walks the reel. Each tile: kicker `Sector`, name, one-liner, CTA `See how BIT runs it ›` → `/industries/{slug}`.

**Tile one-liners**

| Sector | Line |
| --- | --- |
| Transportation | The 401 does not wait on a frozen dispatcher. |
| Construction | The job site moves. The office has to keep up. |
| Accounting | Client files are the business. They cannot live everywhere. |
| Healthcare | The floor cannot wait on a frozen screen. |
| Legal | Privilege is a system, not a feeling. |
| Schools | Kids, staff, and a building that has to stay open. |
| Colleges | A campus is a town. It needs one stack. |
| City councils | The chamber is public. The files are not all public. |
| Dental | The chair cannot wait on a frozen chart. |
| Public–private projects | Two owners. One floor. It still has to be clear. |
| Airports | The building never closes. The stack cannot either. |
| Retail | The floor sells. The back room has to hold. |
| Warehouses | If the aisle is dark to the system, the truck waits. |
| Industrial | The plant cannot pause for a reboot speech. |
| Auto dealerships | The lot, the desk, and the bay are one business. |
| Hospitality | The desk, the kitchen, and the room have to agree. |

Row 1 starts Transportation. Row 2 starts Dental (directly under Transportation). Government is **not** on the live site.

### 3.3 Who we partner with

| Role | Exact copy |
| --- | --- |
| Eyebrow | Who we partner with |
| Headline | The stack behind the stack. |
| Body | Microsoft Cloud Solution Provider. CRTC regulated wholesaler. Product solutions from every major IT vendor — the same names on bitsolution.ca — with government pricing when the job needs it. |

Logos sit in the background field (no tiles). Names shown under marks:

| Partner | Internal line (data, not always on-canvas) |
| --- | --- |
| WatchGuard | Network security and unified threat management. |
| Webroot | Endpoint and DNS protection for the desk. |
| Trend Micro | Enterprise threat detection across mail and cloud. |
| SonicWall | Firewalls and secure remote access. |
| Sophos | Endpoint, firewall, and managed detection. |
| SentinelOne | Autonomous endpoint detection and response. |
| Microsoft | Cloud Solution Provider — 365, Azure, and the desktop. |
| Huntress | Managed detection for the mid-market floor. |
| Fortinet | Security fabric — firewall, switch, and wireless as one. |
| ESET | Endpoint antivirus with a light footprint. |
| CrowdStrike | Cloud-native endpoint and identity protection. |
| Bitdefender | GravityZone endpoint and prevention. |

**Credentials in this block:** Microsoft CSP, CRTC regulated wholesaler, government pricing.

### 3.4 Four parts (2×2)

| Role | Exact copy |
| --- | --- |
| Eyebrow | Four parts. One flag. |
| Headline | Software. Hardware. AI. Security. |
| Sub | Pick a door. Each one is the same team. |

| Tile | Line | CTA | To |
| --- | --- | --- | --- |
| Software | Modern systems that keep the work moving. | Learn more › | `/software` |
| Hardware | Cameras, private servers, and the machines that hold it all. | Learn more › | `/hardware` |
| AI | Help that’s there 24/7. Human when it matters. | Learn more › | `/ai` |
| Security | The layer that holds the rest. | Learn more › | `/security` |

---

## 4. Software `/software`

### Layout

Eyebrow → H1 → lede → hero still → stacked product rows → closer with sibling CTAs.

| Role | Exact copy |
| --- | --- |
| Eyebrow | Software |
| Headline | Built for how people work now. |
| Lede | We respect what came before. We just build what comes next — modern, AI-ready, made to save time. |

**Offerings**

| Product | Line |
| --- | --- |
| Fleet | Run the road side of the business. |
| College ERP | Run the campus side. |
| Clinic | Run appointments, billing, and the floor. |
| Vision | Run the practice side. |
| Custom | Need something that doesn’t exist yet? We build it in 1 — or you don’t pay for three. |
| AI for your business | Intelligence built for your company, not a generic tool. |

**Closer**

> Software needs hardware to run.  
> BIT’s got you covered.

| CTA | To |
| --- | --- |
| Hardware › | `/hardware` |
| AI › | `/ai` |
| Security › | `/security` |

**Audit notes:** Competitors (Jane, Sightview, Fleet Manager) are implied in sector pages, not named here. Guarantee is explicit: *build it in 1 or you don’t pay for three.*

---

## 5. Hardware `/hardware`

| Role | Exact copy |
| --- | --- |
| Eyebrow | Hardware |
| Headline | Software needs machines. |
| Lede | BIT puts them in place — cameras first, then private servers, then everything they connect. |

**Categories (stated order = install order)**

| Item | Line |
| --- | --- |
| Cameras | Eyes on site. |
| Private servers | The backbone. |
| PCs | Everyday work machines. |
| Network | Keeps the office connected. |
| Phones | Clear business calls. |

**Closer:** Hardware is one of four parts.

| CTA | To |
| --- | --- |
| Software › | `/software` |
| AI › | `/ai` |
| Security › | `/security` |

---

## 6. AI `/ai`

| Role | Exact copy |
| --- | --- |
| Eyebrow | AI |
| Headline | Help that stays on. |
| Lede | BIT AI is there when people need it — and a person takes over when they should. |

**Beats (status labeled on-page)**

| # | Feature | Status |
| --- | --- | --- |
| 01 | Help that is always on | Available now |
| 02 | Faster tickets and clear progress | Available now |
| 03 | Secure remote checks | Available now |
| 04 | Human steps in when needed | Available now |
| 05 | Watches before things break | Coming soon |
| 06 | Every action can be audited | Coming soon |
| 07 | Careful with customer data | Available now |
| 08 | We build the same AI for other companies | Available now |

Maps to the brief: 24/7 intake, faster tickets, secure remote diagnostics, human escalation, preventive monitoring (soon), auditable activity (soon), privacy-conscious handling, white-label / build-for-others.

**Closer:** AI is one of four parts.

| CTA | To |
| --- | --- |
| Software › | `/software` |
| Hardware › | `/hardware` |
| Security › | `/security` |

---

## 7. Security `/security`

| Role | Exact copy |
| --- | --- |
| Eyebrow | Security |
| Headline | The layer that holds the rest. |
| Lede | Quiet protection around software, hardware, and AI. Not a scare story — a shell that stays closed. |

**Beats**

| # | Feature |
| --- | --- |
| 01 | Watches around the clock |
| 02 | Stops threats at the edge |
| 03 | Locks down every device |
| 04 | Keeps encrypted copies |
| 05 | Recovers when something breaks |
| 06 | Trains people and sets the rules |

**Closer (dark band):** Building trust.

| CTA | To |
| --- | --- |
| Software › | `/software` |
| Hardware › | `/hardware` |
| AI › | `/ai` |

Positioning: security is the quiet shell around the other three — not “AI security” by name.

---

## 8. Sectors index `/industries`

| Role | Exact copy |
| --- | --- |
| Eyebrow | Sectors |
| Headline | Who we cover. |
| Lede | From Brampton and the GTA out. Software, hardware, AI, and security on every floor. |

2-column card grid. Each card: photo, name, one-liner, `How BIT runs it ›` → `/industries/{slug}`.

---

## 9. Sector template `/industries/:slug`

Shared layout for all 16:

1. Eyebrow `Sectors`  
2. `{Name}.` + one-liner  
3. Hero photo  
4. Two secondary stills (software / hardware plates)  
5. **How BIT governs it** — one paragraph  
6. **How BIT runs it.** — 2×2 of Software / Hardware / AI / Security  
   - Each card: photo, title, situation line, BIT line, `{Pillar} ›` → pillar page  
7. Closer: `Your ONE stop IT solution.` / `Software, hardware, AI, and security — under one flag.` + four pillar CTAs  
8. Other-sector text links  

Kicker on the 2×2: `Software · Hardware · AI · Security`

### 9.1 Transportation `/industries/transportation`

**Line:** The 401 does not wait on a frozen dispatcher.  
**Govern:** BIT governs the yard and the road as one map — dispatch, trackers, cameras, and a private server back at the shop. A driver should not also be the IT desk.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Loads, hours, and the shop live in three apps and a group chat. Nobody trusts the live truck. | Fleet software we already run — or a custom desk in 1 if your lanes will not fit a box. |
| Hardware | Trackers that die. Yard cameras nobody watches. The dispatcher on a leftover laptop. | Tracking devices, yard cameras, dispatch machines, and a private server that holds the day. |
| AI | A reefer alarm at 2 a.m. sits in voicemail. A late truck sits longer. | 24/7 intake that knows the unit, the load, and when to wake a person. |
| Security | Driver files and bills of lading on the shop wifi. A guest saw the board. | Split the yard, lock the files, and write down who opened the gate. |

### 9.2 Construction `/industries/construction`

**Line:** The job site moves. The office has to keep up.  
**Govern:** BIT runs the yard and the trailer as one system — schedules, cameras, private servers, and a lock on who sees what. We govern the stack so a superintendent is not also the IT department.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Crews, change orders, and drawings live in five tools. Nobody trusts the live number. | One modern system for jobs, crews, and documents — or we custom-build it in 1. Fleet software when trucks and equipment are part of the day. |
| Hardware | Trailers die on weak wifi. Cameras go in and never get watched. Laptops walk off. | Site cameras first, then a private server back at the shop, then the rugged machines and network that hold the day together. |
| AI | After hours, a pump alarm or a locked gate sits in voicemail until morning. | 24/7 intake that reads the ticket, flags the site, and hands a human the rest. Same AI we build for other floors. |
| Security | Subs on the wifi. Cameras with default passwords. Drawings on a shared drive. | The layer that ties the other three — access, cameras, and an audit of who touched the job file. |

### 9.3 Accounting `/industries/accounting`

**Line:** Client files are the business. They cannot live everywhere.  
**Govern:** BIT governs the books office the same way we govern a clinic: one place for the work, machines that stay on, help that answers at midnight in tax season, and a lock that would hold up in a review.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Tax season is a pile of portals. Staff copy files onto desktops to finish faster. | A clean system for the firm — or we edit what you have. Ready in 1, or you don’t pay for three. |
| Hardware | Cloud-only feels fast until a file is gone. Old towers under desks are worse. | Private servers for the books, workstations that don’t fight you, and a network that doesn’t drop a return at 11 p.m. |
| AI | Inboxes fill with PDFs. Someone sorts them by hand. | AI that takes the pile, labels it, and opens a ticket a person can finish. Available now vs coming soon, labeled honestly. |
| Security | Client money data on personal drives. No trail when something leaves. | Who can open a file, who copied it, and a quiet alarm if that pattern looks wrong. |

### 9.4 Healthcare `/industries/healthcare`

**Line:** The floor cannot wait on a frozen screen.  
**Govern:** BIT governs the clinic like a practice, not a hobby shop. Appointments and charts in software we already run. Machines that stay up. After-hours help. A privacy layer that is not a poster in the break room.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Jane-class tools are fine until they are not yours. Vision practices outgrow Sightview-class basics. | Clinic and vision software built for the floor — plus custom when the specialty does not fit a box. |
| Hardware | Front desk PCs freeze. Imaging has nowhere private to land. Cameras cover the lot, not the door you care about. | Workstations, private servers for images, waiting-room cameras, and phones that actually ring the right room. |
| AI | After hours, patients leave voicemails. Staff spend the morning calling back. | 24/7 intake that books, answers the simple thing, and escalates the rest to a person. |
| Security | Charts on a USB stick. Shared logins at the front desk. | Access that follows the role, an audit, and privacy handled like it would be read back to you. |

### 9.5 Legal `/industries/legal`

**Line:** Privilege is a system, not a feeling.  
**Govern:** BIT governs the firm so matter files, time, and access sit in one stack. We do not put your clients on a public drive and call it modern.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Matters live in email. Time is reconstructed on Friday. Conflicts are a spreadsheet. | A modern matter and time system — or a custom build that matches how the firm already works. |
| Hardware | Laptops go home with the whole practice on them. The server is a leftover tower. | Private servers, locked rooms, workstations, and cameras on the spaces that actually hold files. |
| AI | Intake sits in a general inbox. Someone reads it when they can. | AI that takes the new matter, tags it, and opens the right person’s list. Human when privilege is in play. |
| Security | A departed associate still has the share. Clients would not like that sentence. | Access that dies with the role, encryption on the private side, and a trail you can show a bench. |

### 9.6 Schools `/industries/schools`

**Line:** Kids, staff, and a building that has to stay open.  
**Govern:** BIT governs the school as a small city: labs that work, cameras that cover the right doors, help for the office, and student data that does not leak into a class share.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Attendance, notes, and the office still run on three logins and a binder. | Simple systems the office will actually use — or we custom-fit what you already bought. |
| Hardware | Lab machines are a lottery. Wifi dies in the gym. Cameras were installed in 2014. | PCs, network, phones, and new cameras — started on the doors, then the halls. |
| AI | A printer jam at 8:10 becomes a line at the office. | 24/7 help for staff tickets. A human when a child or a parent is in the request. |
| Security | Student photos and addresses on an open share. Guest wifi on the same box as records. | Split networks, locked records, and cameras that are watched — not just installed. |

### 9.7 Colleges `/industries/colleges`

**Line:** A campus is a town. It needs one stack.  
**Govern:** BIT governs the campus with college ERP we already run, plus the machines and the lock around it. Students, faculty, and the plant do not share a password.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Registrar, finance, and housing still do not agree on a student. | College ERP ready now. Custom modules in 1 if the campus does something the box will not. |
| Hardware | Labs, residence wifi, cameras, and a server room that is also a closet. | Campus network, private servers, cameras, and the PCs the offices actually sit at. |
| AI | IT tickets sit until a person is back from class support. | 24/7 AI intake for staff and students. Escalation when the ticket is a person in trouble, not a password. |
| Security | Research shares, student records, and guest wifi on the same flat network. | The layer that splits them, logs them, and keeps the ERP off the open side. |

### 9.8 City councils `/industries/city-councils`

**Line:** The chamber is public. The files are not all public.  
**Govern:** BIT governs the municipality so the meeting can be seen and the closed session cannot. Records, cameras, and resident help sit under one team.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Agendas, permits, and resident mail live in inboxes named after people who left. | A records and request system the clerk will use — custom if the town already has a half-fit. |
| Hardware | Chamber AV fails on camera night. The town hall wifi is the same as the public gallery. | Chamber cameras and sound, a private server for records, and a network that splits public from staff. |
| AI | A pothole report waits in a form nobody opens on weekends. | 24/7 intake that files the request and tells the resident it landed. A person when it is a safety call. |
| Security | Closed-session notes on a laptop that goes home. Cameras with no retention plan. | Access by role, an audit, and cameras that keep what the by-law says they should keep. |

### 9.9 Dental `/industries/dental`

**Line:** The chair cannot wait on a frozen chart.  
**Govern:** BIT runs the operatory and the front desk as one stack — charts, cameras, private servers, and a lock on who sees a patient file. Think the clinic software you already know, built to the chair.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Charts, billing, and the chair do not agree. Staff keep a paper side list. | Clinic software we already run — like the desk you know, or a custom build in 1. |
| Hardware | Sensors on leftover PCs. Cameras in the hall that never get watched. The server in a closet by the compressor. | Workstations at the chair, cameras, phones, and a private server that holds the night. |
| AI | A patient texts after hours. It sits. An autoclave alarm sits longer. | 24/7 intake for the desk and the chairs. A person when it is a patient or a leak. |
| Security | Patient files and card numbers on the same wifi as the waiting room. | Guest net stays guest. Charts stay locked. We know who opened the record. |

### 9.10 Public–private projects `/industries/public-private`

**Line:** Two owners. One floor. It still has to be clear.  
**Govern:** BIT governs the shared project so each side keeps its files, both sides see the work, and nobody “just uses the other wifi.” We sit above the stack, not inside one partner’s IT ticket.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Each partner brought a system. The project lives in email between them. | A shared project layer — or a custom build both sides can open without giving away the rest of the shop. |
| Hardware | Site office is a mash of leftover PCs and a camera nobody owns. | One set of cameras, one private server, named owners, named spare parts. |
| AI | A fault at 2 a.m. pages the wrong partner. | AI intake that knows the site, the contract hours, and who is on call. Human when it is a public-safety call. |
| Security | Access was granted “for the project” and never taken back. | Time-boxed access, an audit both sides can read, and a lock that outlives the groundbreaking photo. |

### 9.11 Airports `/industries/airports`

**Line:** The building never closes. The stack cannot either.  
**Govern:** BIT governs the air side and the land side as one operation: cameras, access, the network under the counters, and help that does not wait for Monday.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Ops, tenants, and maintenance each have a tool. The live picture is a radio. | A single ops view we build to the airport — custom in 1 if the box will not do the gate. |
| Hardware | Cameras from three eras. Counters on consumer wifi. A server room that is also storage. | Cameras first, then private servers, then the network and the machines at every desk. |
| AI | A reader fails at 4 a.m. The night shift leaves a note. | 24/7 intake, remote diagnostics, and a human when the floor cannot wait. |
| Security | Tenants on the same vlan as ops. Access cards that still open last year’s door. | Split networks, living access lists, and a trail that would hold in a review. |

### 9.12 Retail `/industries/retail`

**Line:** The floor sells. The back room has to hold.  
**Govern:** BIT governs the shop so the till, the cameras, and the back office are one team’s problem — not the manager’s night job.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | POS, stock, and staff hours live in three logins. Monday is a rebuild. | A modern floor system — or we custom-fit the one you already paid for. |
| Hardware | Cameras point at the door and nobody watches. The office PC is a leftover home tower. | Cameras, a private server for footage and stock, workstations, and phones that reach the right till. |
| AI | After close, a fridge alarm or a smash-and-grab sits until open. | 24/7 watch on the ticket. A person when it is a store, not a printer. |
| Security | Card data and camera footage on the same open wifi the guests use. | Split the floor from the guests. Lock the footage. Know who opened the back door. |

### 9.13 Warehouses `/industries/warehouses`

**Line:** If the aisle is dark to the system, the truck waits.  
**Govern:** BIT governs the shed as a live floor: cameras, scanners, the private server, and fleet when the dock has trucks. One team. One picture.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Inventory is a count you hope is true. Dispatch is a whiteboard. | Warehouse and fleet software ready now — custom if your dock does something odd. |
| Hardware | Dead zones in the racks. Cameras on the office, not the door. Scanners that drop. | Aisle cameras, private servers, network that reaches the last bay, and the PCs at shipping. |
| AI | A missed pick at 9 p.m. becomes a morning apology. | AI that flags the miss, opens the ticket, and wakes a person when the truck is loading. |
| Security | Contractors on the floor wifi. Footage nobody can find after a claim. | Access by shift, footage you can pull, and a lock between the office and the guests. |

### 9.14 Industrial `/industries/industrial`

**Line:** The plant cannot pause for a reboot speech.  
**Govern:** BIT governs the plant floor and the office as one map: the machines people sit at, the cameras on the line, the private server, and a lock between IT and the rest of the building.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Production numbers live on a PC next to the line. The office has a different story. | A modern ops layer — or a custom build that talks to what you already run. In 1. |
| Hardware | Line PCs are ten years old. Cameras miss the dock. The “server” is in a hot closet. | Workstations, cameras, private servers, and a network we can walk with you. |
| AI | A line stop pages nobody until first shift. | 24/7 intake that knows the cell, the vendor, and when to wake a human. |
| Security | A vendor laptop on the plant net. No record of what it saw. | The layer that splits office, line, and guests — and writes down who crossed. |

### 9.15 Auto dealerships `/industries/auto-dealerships`

**Line:** The lot, the desk, and the bay are one business.  
**Govern:** BIT governs the rooftop: showroom, service, and the lot cameras as one stack. Sales should not be the IT person. Service should not wait on a frozen writer.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | DMS, service, and the lot do not agree on a car. Staff keep a group chat. | A modern desk and service layer — custom if your rooftop will not fit a box. Fleet when you run a lot of movers. |
| Hardware | Lot cameras from a flyer. Writers on leftover PCs. The server is in the parts cage. | Lot and shop cameras, private servers, workstations, phones, and a network that reaches the far stall. |
| AI | A customer texts at 8 p.m. It sits. A bay door alarm sits longer. | 24/7 intake for service and the lot. A person when it is a customer or a missing car. |
| Security | Customer IDs, finance files, and lot footage on the guest wifi. | Split the floor. Lock the files. Know who opened the cage and when the lot camera blinked. |

### 9.16 Hospitality `/industries/hospitality`

**Line:** The desk, the kitchen, and the room have to agree.  
**Govern:** BIT runs the front desk, the floor, and the back office as one stack — POS, cameras, guest wifi, and a lock between visitors and the books.

| Pillar | Situation | BIT |
| --- | --- | --- |
| Software | Rooms, the kitchen, and payroll do not agree. Staff keep a paper side list. | A modern desk and floor layer — or a custom build in 1 if your property will not fit a box. |
| Hardware | POS on a dying terminal. Cameras in the lobby that never get watched. Guest wifi that takes the office with it. | Workstations, cameras, phones, and a private server that holds the night audit. |
| AI | A guest texts at 11 p.m. It sits. A cooler alarm sits longer. | 24/7 intake for the desk and the floor. A person when it is a guest or a walk-in. |
| Security | Cards, passports, and camera footage on the same wifi as the lobby. | Guest net stays guest. Files stay locked. We know who opened the back office. |

---

## 10. Login `/login`

| Role | Copy |
| --- | --- |
| Headline | Sign in |
| Empty state | Sign-in is disabled. |

Not linked from the marketing nav.

---

## 11. Service catalog (rolled up)

### Software
- Fleet / trucking
- College ERP
- Clinic (Jane-class, unnamed on software page)
- Vision (Sightview-class, unnamed on software page)
- Custom build in 1 month or no pay for 3
- AI built per company

### Hardware
- Cameras (lead offer)
- Private servers
- PCs / workstations
- Network
- Phones / VoIP
- Implied on sector pages: trackers, scanners, chamber AV

### AI
- 24/7 intake
- Faster tickets + progress
- Secure remote diagnostics
- Human escalation
- Preventive monitoring (soon)
- Auditable activity (soon)
- Privacy-conscious handling (now)
- Same stack sold to other companies (now)

### Security
- 24/7 watch
- Edge threat stop
- Device lock-down
- Encrypted copies
- Recovery
- Training / policy
- Cross-cutting on sectors: split guest/staff nets, role access, audit trails, camera retention

### Commercial claims
- Your ONE stop IT solution
- Building Trust
- Microsoft Cloud Solution Provider
- CRTC regulated wholesaler
- Government pricing when the job needs it
- From Brampton and the GTA to every site we run
- We build it in 1 — or you don’t pay for three
- Four parts. One flag. / One team. Every kind of floor.

---

## 12. CTA inventory

| Copy | Typical destination |
| --- | --- |
| Learn more › | `/software` (hero) or pillar page (2×2) |
| Sectors › | `/industries` |
| See how BIT runs it › | `/industries/{slug}` |
| How BIT runs it › | `/industries/{slug}` |
| Software › / Hardware › / AI › / Security › | matching pillar |
| `{Pillar} ›` on sector cards | `/software` `/hardware` `/ai` `/security` |
| Footer labels | see §2.2 |

**Missing vs a typical audit:** no phone number, no email, no “Book a call,” no contact form, no address, no pricing, no case studies. Conversion is pillar/sector deep-links only.

---

## 13. Layout / story flow (intended)

```
Home hero (trust + four parts)
    ↓ globe (reach)
    ↓ 16 floors walk (who)
    ↓ partners (oracle-level stack)
    ↓ 2×2 doors (how)
         ↙ software / hardware / AI / security
         ↘ each sector: govern → four pillars → back to doors
```

Story the copy is trying to tell: software runs on hardware, AI manages it, security ties the three, BIT sits on top — portrayed as *Building Trust*, not “AI security.”

---

## 14. Audit flags (copy / IA)

1. **Footer blurb** lists 14 named sectors and omits Public–private, Industrial, Hospitality (and still reads well, but it is incomplete vs the 16).  
2. **Software footer column** omits Vision; page body includes Vision.  
3. **Hardware footer column** omits PCs; page body includes PCs.  
4. **Healthcare software copy** names Jane-class / Sightview-class; software page does not. Inconsistent competitor posture.  
5. **No contact CTA** anywhere in the marketing loop.  
6. **Guarantee** (“in 1 or don’t pay for three”) appears on Software + several sector software cards; not on Hardware/AI/Security.  
7. **Coming soon** is honest on AI (05, 06) and once on Accounting AI; other AI cards read as live 24/7.  
8. **Login** exists but is disabled and unlinked.  
9. Voice is consistent: short, concrete, floor-level, no “Pain / then the fix” labels.

---

*End of audit. Live site: [bitsolution.vercel.app](https://bitsolution.vercel.app).*
