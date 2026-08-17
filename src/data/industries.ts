export type PillarKey = "software" | "hardware" | "ai" | "security";

export type IndustryPillar = {
  key: PillarKey;
  title: string;
  to: "/software" | "/hardware" | "/ai" | "/security";
  pain: string;
  solve: string;
  image: string;
  imageAlt: string;
};

export type Industry = {
  slug: string;
  name: string;
  line: string;
  compliance: string[];
  complianceNote: string;
  govern: string;
  image: string;
  imageAlt: string;
  tools: string[];
  pillars: IndustryPillar[];
};

function pillars(
  slug: string,
  software: [string, string, string],
  hardware: [string, string, string],
  ai: [string, string, string],
  security: [string, string, string],
): IndustryPillar[] {
  return [
    {
      key: "software",
      title: "Software",
      to: "/software",
      pain: software[0],
      solve: software[1],
      image: `/images/industries/${slug}-software.jpg`,
      imageAlt: software[2],
    },
    {
      key: "hardware",
      title: "Hardware",
      to: "/hardware",
      pain: hardware[0],
      solve: hardware[1],
      image: `/images/industries/${slug}-hardware.jpg`,
      imageAlt: hardware[2],
    },
    {
      key: "ai",
      title: "AI",
      to: "/ai",
      pain: ai[0],
      solve: ai[1],
      image: `/images/industries/${slug}-ai.jpg`,
      imageAlt: ai[2],
    },
    {
      key: "security",
      title: "Security",
      to: "/security",
      pain: security[0],
      solve: security[1],
      image: `/images/industries/${slug}-security.jpg`,
      imageAlt: security[2],
    },
  ];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "transportation",
    name: "Transportation",
    line: "The 401 does not wait on a frozen dispatcher.",
    compliance: ["PIPEDA", "MTO / CVOR"],
    complianceNote: "Personal information plus hours, ELD, and driver records when the system supports the fleet.",
    govern:
      "BIT governs the yard and the road as one map — dispatch, trackers, cameras, and a private server back at the shop. A driver should not also be the IT desk.",
    image: "/images/industries/transportation.jpg",
    imageAlt: "Ontario highway with a clean white tractor-trailer at dawn",
    tools: ["Samsara", "Motive", "Geotab", "Verizon Connect"],
    pillars: pillars(
      "transportation",
      [
        "Loads, hours, and the shop live in three apps and a group chat. Nobody trusts the live truck.",
        "Samsara, Motive, Geotab, Verizon Connect — fleet desks we already run. Or a custom board in 1 if your lanes will not fit a box.",
        "Dispatch desk buried in printouts, radios, and three fleet apps that do not agree",
      ],
      [
        "Trackers that die. Yard cameras nobody watches. The dispatcher on a leftover laptop.",
        "Tracking devices, yard cameras, dispatch machines, and a private server that holds the day.",
        "Worn GPS tracker and a dead laptop on a dispatch counter",
      ],
      [
        "A reefer alarm at 2 a.m. sits in voicemail. A late truck sits longer.",
        "24/7 intake that knows the unit, the load, and when to wake a person.",
        "Empty night dispatch room with a blinking reefer alarm on the board",
      ],
      [
        "Driver files and bills of lading on the shop wifi. A guest saw the board.",
        "Split the yard, lock the files, and write down who opened the gate.",
        "Open shop wifi board next to driver files anyone can read",
      ],
    ),
  },
  {
    slug: "construction",
    name: "Construction",
    line: "The job site moves. The office has to keep up.",
    compliance: ["PIPEDA", "Construction Act"],
    complianceNote: "Personal information on the job, and payment / holdback rules when we work for a construction client.",
    govern:
      "BIT runs the yard and the trailer as one system — schedules, cameras, private servers, and a lock on who sees what. We govern the stack so a superintendent is not also the IT department.",
    image: "/images/industries/construction.jpg",
    imageAlt: "Construction office desk with laptop, plans, and a site camera",
    tools: ["Procore", "Autodesk Construction Cloud", "Buildertrend", "Sage 300 CRE"],
    pillars: pillars(
      "construction",
      [
        "Crews, change orders, and drawings live in five tools. Nobody trusts the live number.",
        "Procore, Autodesk Construction Cloud, Buildertrend, Sage 300 CRE — we keep the job file honest, or custom-build it in 1.",
        "Site trailer desk with rolled drawings, change-order paper, and a laptop nobody trusts",
      ],
      [
        "Trailers die on weak wifi. Cameras go in and never get watched. Laptops walk off.",
        "Site cameras first, then a private server back at the shop, then the rugged machines and network that hold the day together.",
        "Muddy site trailer with a dying consumer router and an unwatched camera",
      ],
      [
        "After hours, a pump alarm or a locked gate sits in voicemail until morning.",
        "24/7 intake that reads the ticket, flags the site, and hands a human the rest.",
        "Dark job site gate at night with a silenced phone on the trailer desk",
      ],
      [
        "Subs on the wifi. Cameras with default passwords. Drawings on a shared drive.",
        "The layer that ties the other three — access, cameras, and an audit of who touched the job file.",
        "Open job-file share and a default-password camera sticker in a trailer",
      ],
    ),
  },
  {
    slug: "accounting",
    name: "Accounting",
    line: "Client files are the business. They cannot live everywhere.",
    compliance: ["PIPEDA"],
    complianceNote: "Client files are personal information. They stay under PIPEDA.",
    govern:
      "BIT governs the books office the same way we govern a clinic: one place for the work, machines that stay on, help that answers at midnight in tax season, and a lock that would hold up in a review.",
    image: "/images/industries/accounting.jpg",
    imageAlt: "Quiet accounting desk with ledgers and a laptop",
    tools: ["QuickBooks", "Xero", "Sage 50", "TaxCycle"],
    pillars: pillars(
      "accounting",
      [
        "Tax season is a pile of portals. Staff copy files onto desktops to finish faster.",
        "QuickBooks, Xero, Sage 50, TaxCycle — we tidy the firm’s desk, or edit what you have. Ready in 1.",
        "Tax-season desk with USB sticks, printed returns, and three client portals open",
      ],
      [
        "Cloud-only feels fast until a file is gone. Old towers under desks are worse.",
        "Private servers for the books, workstations that don’t fight you, and a network that doesn’t drop a return at 11 p.m.",
        "Old tower under an accountant’s desk beside a stack of client binders",
      ],
      [
        "Inboxes fill with PDFs. Someone sorts them by hand.",
        "AI that takes the pile, labels it, and opens a ticket a person can finish.",
        "Overflowing inbox of unmarked PDF returns on a late-night monitor",
      ],
      [
        "Client money data on personal drives. No trail when something leaves.",
        "Who can open a file, who copied it, and a quiet alarm if that pattern looks wrong.",
        "Client folders copied onto a personal USB on an unlocked desk",
      ],
    ),
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    line: "The floor cannot wait on a frozen screen.",
    compliance: ["PHIPA", "PIPEDA"],
    complianceNote: "PHIPA is mandatory for personal health information. We sign a written agent agreement and follow those rules.",
    govern:
      "BIT governs the clinic like a practice, not a hobby shop. Appointments and charts in software we already run. Machines that stay up. After-hours help. A privacy layer that is not a poster in the break room.",
    image: "/images/industries/healthcare.jpg",
    imageAlt: "Clean clinic reception desk with tablet and privacy glass",
    tools: ["Jane", "Accuro", "OSCAR", "TELUS PS Suite"],
    pillars: pillars(
      "healthcare",
      [
        "Jane, Accuro, OSCAR, TELUS PS Suite — fine until they freeze, or until the specialty outgrows the box.",
        "Clinic software built for the floor. We keep Jane-class and EMR desks running — plus custom when the specialty does not fit.",
        "Clinic reception with a frozen booking screen and a paper overflow list",
      ],
      [
        "Front desk PCs freeze. Imaging has nowhere private to land. Cameras cover the lot, not the door you care about.",
        "Workstations, private servers for images, waiting-room cameras, and phones that actually ring the right room.",
        "Aging clinic PC next to an imaging cart with nowhere private to save",
      ],
      [
        "After hours, patients leave voicemails. Staff spend the morning calling back.",
        "24/7 intake that books, answers the simple thing, and escalates the rest to a person.",
        "After-hours clinic phone blinking with unplayed patient voicemails",
      ],
      [
        "Charts on a USB stick. Shared logins at the front desk.",
        "Access that follows the role, an audit, and privacy handled like it would be read back to you.",
        "Shared front-desk login sticky note beside a chart on a USB stick",
      ],
    ),
  },
  {
    slug: "legal",
    name: "Legal",
    line: "Privilege is a system, not a feeling.",
    compliance: ["PIPEDA", "LSO Rules"],
    complianceNote: "Client confidentiality and technology competence under the Law Society of Ontario, plus PIPEDA.",
    govern:
      "BIT governs the firm so matter files, time, and access sit in one stack. We do not put your clients on a public drive and call it modern.",
    image: "/images/industries/legal.jpg",
    imageAlt: "Law office desk with closed folder, pen, and laptop",
    tools: ["Clio", "PracticePanther", "CosmoLex", "PCLaw"],
    pillars: pillars(
      "legal",
      [
        "Matters live in email. Time is reconstructed on Friday. Conflicts are a spreadsheet.",
        "Clio, PracticePanther, CosmoLex, PCLaw — a modern matter and time desk, or a custom build that matches how the firm already works.",
        "Law desk with matters in printed email and a handwritten time sheet",
      ],
      [
        "Laptops go home with the whole practice on them. The server is a leftover tower.",
        "Private servers, locked rooms, workstations, and cameras on the spaces that actually hold files.",
        "Leftover tower server in a law-office closet beside take-home laptops",
      ],
      [
        "Intake sits in a general inbox. Someone reads it when they can.",
        "AI that takes the new matter, tags it, and opens the right person’s list. Human when privilege is in play.",
        "Unsorted intake inbox on a dark law-office monitor after hours",
      ],
      [
        "A departed associate still has the share. Clients would not like that sentence.",
        "Access that dies with the role, encryption on the private side, and a trail you can show a bench.",
        "Old staff account still pinned to a shared client-matter drive",
      ],
    ),
  },
  {
    slug: "schools",
    name: "Schools",
    line: "Kids, staff, and a building that has to stay open.",
    compliance: ["MFIPPA / FIPPA"],
    complianceNote: "Public-sector access and privacy rules for student and staff records.",
    govern:
      "BIT governs the school as a small city: labs that work, cameras that cover the right doors, help for the office, and student data that does not leak into a class share.",
    image: "/images/industries/schools.jpg",
    imageAlt: "School admin desk with books, laptop, and a camera on the shelf",
    tools: ["PowerSchool", "Edsby", "Google Classroom"],
    pillars: pillars(
      "schools",
      [
        "Attendance, notes, and the office still run on three logins and a binder.",
        "PowerSchool, Edsby, Google Classroom — simple systems the office will actually use, or we custom-fit what you already bought.",
        "School office counter with an attendance binder beside three logins",
      ],
      [
        "Lab machines are a lottery. Wifi dies in the gym. Cameras were installed in 2014.",
        "PCs, network, phones, and new cameras — started on the doors, then the halls.",
        "Aging school lab PCs and a 2014-era hallway camera",
      ],
      [
        "A printer jam at 8:10 becomes a line at the office.",
        "24/7 help for staff tickets. A human when a child or a parent is in the request.",
        "Morning office line forming at a jammed staff printer",
      ],
      [
        "Student records on an open share. Guest wifi on the same box as the office.",
        "Split networks, locked records, and cameras that are watched — not just installed.",
        "Staff records folder sitting on the same wifi box as the guest network",
      ],
    ),
  },
  {
    slug: "colleges",
    name: "Colleges",
    line: "A campus is a town. It needs one stack.",
    compliance: ["MFIPPA / FIPPA"],
    complianceNote: "Public-sector access and privacy rules for the campus.",
    govern:
      "BIT governs the campus with college ERP we already run, plus the machines and the lock around it. Students, faculty, and the plant do not share a password.",
    image: "/images/industries/colleges.jpg",
    imageAlt: "College admin desk with a glass campus model and laptop",
    tools: ["Ellucian Banner", "PeopleSoft", "Colleague"],
    pillars: pillars(
      "colleges",
      [
        "Registrar, finance, and housing still do not agree on a student.",
        "Ellucian Banner, PeopleSoft, Colleague — college ERP ready now. Custom modules in 1 if the campus does something the box will not.",
        "Registrar counter with three systems that disagree on the same student file",
      ],
      [
        "Labs, residence wifi, cameras, and a server room that is also a closet.",
        "Campus network, private servers, cameras, and the PCs the offices actually sit at.",
        "Campus server closet shared with storage boxes and a lab cart",
      ],
      [
        "IT tickets sit until a person is back from class support.",
        "24/7 AI intake for staff and students. Escalation when the ticket is a person in trouble, not a password.",
        "Unattended campus IT ticket screen after the help desk has closed",
      ],
      [
        "Research shares, student records, and guest wifi on the same flat network.",
        "The layer that splits them, logs them, and keeps the ERP off the open side.",
        "One network rack labelled for guests, records, and research together",
      ],
    ),
  },
  {
    slug: "city-councils",
    name: "City councils",
    line: "The chamber is public. The files are not all public.",
    compliance: ["MFIPPA / FIPPA"],
    complianceNote: "Municipal access and privacy rules for the chamber and the files that are not public.",
    govern:
      "BIT governs the municipality so the meeting can be seen and the closed session cannot. Records, cameras, and resident help sit under one team.",
    image: "/images/industries/city-councils.jpg",
    imageAlt: "Council chamber desk with gavel and laptop",
    tools: ["Laserfiche", "CivicPlus", "eScribe"],
    pillars: pillars(
      "city-councils",
      [
        "Agendas, permits, and resident mail live in inboxes named after people who left.",
        "Laserfiche, CivicPlus, eScribe — a records and request desk the clerk will use. Custom if the town already has a half-fit.",
        "Clerk’s desk with agendas in a departed staffer’s inbox",
      ],
      [
        "Chamber AV fails on camera night. The town hall wifi is the same as the public gallery.",
        "Chamber cameras and sound, a private server for records, and a network that splits public from staff.",
        "Council chamber with failing AV cables and a shared public wifi sign",
      ],
      [
        "A pothole report waits in a form nobody opens on weekends.",
        "24/7 intake that files the request and tells the resident it landed. A person when it is a safety call.",
        "Weekend town-hall inbox with an unopened resident service request",
      ],
      [
        "Closed-session notes on a laptop that goes home. Cameras with no retention plan.",
        "Access by role, an audit, and cameras that keep what the by-law says they should keep.",
        "Closed-session folder on a laptop packed into a home bag",
      ],
    ),
  },
  {
    slug: "dental",
    name: "Dental",
    line: "The chair cannot wait on a frozen chart.",
    compliance: ["PHIPA", "PIPEDA"],
    complianceNote: "PHIPA is mandatory for the chart. We sign a written agent agreement and follow those rules.",
    govern:
      "BIT runs the operatory and the front desk as one stack — charts, cameras, private servers, and a lock on who sees a patient file. Think the clinic software you already know, built to the chair.",
    image: "/images/industries/dental.jpg",
    imageAlt: "Quiet dental operatory with a screen and a ceiling camera",
    tools: ["Dentrix", "Eaglesoft", "Open Dental", "AbelDent", "ClearDent"],
    pillars: pillars(
      "dental",
      [
        "Charts, billing, and the chair do not agree. Staff keep a paper side list.",
        "Dentrix, Eaglesoft, Open Dental, AbelDent, ClearDent — clinic desks we already run. Or a custom build in 1 if the chair will not fit a box.",
        "Dental front desk with a paper side list beside a frozen chart screen",
      ],
      [
        "Sensors on leftover PCs. Cameras in the hall that never get watched. The server in a closet by the compressor.",
        "Workstations at the chair, cameras, phones, and a private server that holds the night.",
        "Intraoral sensor plugged into an aging PC beside a compressor closet",
      ],
      [
        "A patient texts after hours. It sits. An autoclave alarm sits longer.",
        "24/7 intake for the desk and the chairs. A person when it is a patient or a leak.",
        "After-hours dental reception with a blinking phone and an autoclave light",
      ],
      [
        "Patient files and card numbers on the same wifi as the waiting room.",
        "Guest net stays guest. Charts stay locked. We know who opened the record.",
        "Waiting-room chairs facing a front-desk screen with a guest wifi sign",
      ],
    ),
  },
  {
    slug: "public-private",
    name: "Public–private projects",
    line: "Two owners. One floor. It still has to be clear.",
    compliance: ["PIPEDA", "MFIPPA / FIPPA"],
    complianceNote: "Private-side personal information and public-side access rules on the same floor.",
    govern:
      "BIT governs the shared project so each side keeps its files, both sides see the work, and nobody “just uses the other wifi.” We sit above the stack, not inside one partner’s IT ticket.",
    image: "/images/industries/public-private.jpg",
    imageAlt: "Two desks sharing a glass wall and a server rack",
    tools: ["Procore", "SharePoint", "Autodesk"],
    pillars: pillars(
      "public-private",
      [
        "Each partner brought a system. The project lives in email between them.",
        "Procore, SharePoint, Autodesk — a shared project layer, or a custom build both sides can open without giving away the rest of the shop.",
        "Two partner laptops and a project that only exists in forwarded email",
      ],
      [
        "Site office is a mash of leftover PCs and a camera nobody owns.",
        "One set of cameras, one private server, named owners, named spare parts.",
        "Shared site office with leftover PCs and an unowned camera",
      ],
      [
        "A fault at 2 a.m. pages the wrong partner.",
        "AI intake that knows the site, the contract hours, and who is on call. Human when it is a public-safety call.",
        "Night site office phone ringing the wrong partner’s on-call list",
      ],
      [
        "Access was granted “for the project” and never taken back.",
        "Time-boxed access, an audit both sides can read, and a lock that outlives the groundbreaking photo.",
        "Old project badge still opening a door after the partner has left",
      ],
    ),
  },
  {
    slug: "airports",
    name: "Airports",
    line: "The building never closes. The stack cannot either.",
    compliance: ["PIPEDA"],
    complianceNote: "Personal information at the counter and in ops stays under PIPEDA.",
    govern:
      "BIT governs the air side and the land side as one operation: cameras, access, the network under the counters, and help that does not wait for Monday.",
    image: "/images/industries/airports.jpg",
    imageAlt: "Quiet terminal corridor with cameras and an operations desk",
    tools: ["Amadeus", "SITA", "Veoci"],
    pillars: pillars(
      "airports",
      [
        "Ops, tenants, and maintenance each have a tool. The live picture is a radio.",
        "Amadeus, SITA, Veoci — a single ops view we build to the airport. Custom in 1 if the box will not do the gate.",
        "Airport ops desk with three tenant tools and a radio as the live picture",
      ],
      [
        "Cameras from three eras. Counters on consumer wifi. A server room that is also storage.",
        "Cameras first, then private servers, then the network and the machines at every desk.",
        "Mixed-era cameras above a counter running on a consumer router",
      ],
      [
        "A reader fails at 4 a.m. The night shift leaves a note.",
        "24/7 intake, remote diagnostics, and a human when the floor cannot wait.",
        "4 a.m. access reader with a handwritten night-shift note taped on",
      ],
      [
        "Tenants on the same vlan as ops. Access cards that still open last year’s door.",
        "Split networks, living access lists, and a trail that would hold in a review.",
        "Tenant and ops network ports on the same unmarked switch",
      ],
    ),
  },
  {
    slug: "retail",
    name: "Retail",
    line: "The floor sells. The back room has to hold.",
    compliance: ["PIPEDA", "PCI DSS"],
    complianceNote: "Customer information under PIPEDA. Card data only if we touch the payment path — then PCI DSS.",
    govern:
      "BIT governs the shop so the till, the cameras, and the back office are one team’s problem — not the manager’s night job.",
    image: "/images/industries/retail.jpg",
    imageAlt: "Minimal boutique checkout with a tablet and ceiling camera",
    tools: ["Lightspeed", "Square", "Shopify POS"],
    pillars: pillars(
      "retail",
      [
        "POS, stock, and staff hours live in three logins. Monday is a rebuild.",
        "Lightspeed, Square, Shopify POS — a modern floor desk, or we custom-fit the one you already paid for.",
        "Retail back office with POS, stock, and hours in three separate logins",
      ],
      [
        "Cameras point at the door and nobody watches. The office PC is a leftover home tower.",
        "Cameras, a private server for footage and stock, workstations, and phones that reach the right till.",
        "Home tower under a shop desk and a camera aimed at the wrong door",
      ],
      [
        "After close, a fridge alarm or a smash-and-grab sits until open.",
        "24/7 watch on the ticket. A person when it is a store, not a printer.",
        "Closed shop at night with a cooler alarm light and an unread phone",
      ],
      [
        "Card data and camera footage on the same open wifi the guests use.",
        "Split the floor from the guests. Lock the footage. Know who opened the back door.",
        "Guest wifi sign next to a till screen and a camera recorder",
      ],
    ),
  },
  {
    slug: "warehouses",
    name: "Warehouses",
    line: "If the aisle is dark to the system, the truck waits.",
    compliance: ["PIPEDA"],
    complianceNote: "Staff, contractor, and customer information under PIPEDA.",
    govern:
      "BIT governs the shed as a live floor: cameras, scanners, the private server, and fleet when the dock has trucks. One team. One picture.",
    image: "/images/industries/warehouses.jpg",
    imageAlt: "Clean warehouse aisle with scanner and dome camera",
    tools: ["NetSuite WMS", "Manhattan", "SAP EWM"],
    pillars: pillars(
      "warehouses",
      [
        "Inventory is a count you hope is true. Dispatch is a whiteboard.",
        "NetSuite WMS, Manhattan, SAP EWM — warehouse and fleet software ready now. Custom if your dock does something odd.",
        "Warehouse shipping desk with a whiteboard inventory and a waiting truck",
      ],
      [
        "Dead zones in the racks. Cameras on the office, not the door. Scanners that drop.",
        "Aisle cameras, private servers, network that reaches the last bay, and the PCs at shipping.",
        "Far warehouse aisle with no signal and a scanner that has dropped",
      ],
      [
        "A missed pick at 9 p.m. becomes a morning apology.",
        "AI that flags the miss, opens the ticket, and wakes a person when the truck is loading.",
        "Night loading dock with a missed-pick ticket sitting unopened",
      ],
      [
        "Contractors on the floor wifi. Footage nobody can find after a claim.",
        "Access by shift, footage you can pull, and a lock between the office and the guests.",
        "Contractor laptop on floor wifi beside a camera recorder nobody can search",
      ],
    ),
  },
  {
    slug: "industrial",
    name: "Industrial",
    line: "The plant cannot pause for a reboot speech.",
    compliance: ["PIPEDA"],
    complianceNote: "Staff and vendor information under PIPEDA.",
    govern:
      "BIT governs the plant floor and the office as one map: the machines people sit at, the cameras on the line, the private server, and a lock between IT and the rest of the building.",
    image: "/images/industries/industrial.jpg",
    imageAlt: "Plant office looking onto a clean factory floor",
    tools: ["SAP", "Ignition", "FactoryTalk"],
    pillars: pillars(
      "industrial",
      [
        "Production numbers live on a PC next to the line. The office has a different story.",
        "SAP, Ignition, FactoryTalk — a modern ops layer, or a custom build that talks to what you already run. In 1.",
        "Line-side PC with production numbers the office screen does not match",
      ],
      [
        "Line PCs are ten years old. Cameras miss the dock. The “server” is in a hot closet.",
        "Workstations, cameras, private servers, and a network we can walk with you.",
        "Ten-year-old line PC and a hot closet sold as the plant server",
      ],
      [
        "A line stop pages nobody until first shift.",
        "24/7 intake that knows the cell, the vendor, and when to wake a human.",
        "Quiet night plant cell with a line-stop light and no one paged",
      ],
      [
        "A vendor laptop on the plant net. No record of what it saw.",
        "The layer that splits office, line, and guests — and writes down who crossed.",
        "Vendor laptop plugged straight into a plant-floor switch",
      ],
    ),
  },
  {
    slug: "auto-dealerships",
    name: "Auto dealerships",
    line: "The lot, the desk, and the bay are one business.",
    compliance: ["PIPEDA", "PCI DSS"],
    complianceNote: "Customer and finance files under PIPEDA. Card data only if we touch the payment path — then PCI DSS.",
    govern:
      "BIT governs the rooftop: showroom, service, and the lot cameras as one stack. Sales should not be the IT person. Service should not wait on a frozen writer.",
    image: "/images/industries/auto-dealerships.jpg",
    imageAlt: "White showroom with a single car, sales desk, and ceiling camera",
    tools: ["CDK Global", "Reynolds & Reynolds", "Dealertrack"],
    pillars: pillars(
      "auto-dealerships",
      [
        "DMS, service, and the lot do not agree on a car. Staff keep a group chat.",
        "CDK Global, Reynolds & Reynolds, Dealertrack — a modern desk and service layer. Custom if your rooftop will not fit a box.",
        "Service writer desk with a DMS that disagrees with the lot board",
      ],
      [
        "Lot cameras from a flyer. Writers on leftover PCs. The server is in the parts cage.",
        "Lot and shop cameras, private servers, workstations, phones, and a network that reaches the far stall.",
        "Parts-cage server and a leftover PC at the service writer desk",
      ],
      [
        "A customer texts at 8 p.m. It sits. A bay door alarm sits longer.",
        "24/7 intake for service and the lot. A person when it is a customer or a missing car.",
        "Closed dealership service desk with an unread evening customer text",
      ],
      [
        "Customer IDs, finance files, and lot footage on the guest wifi.",
        "Split the floor. Lock the files. Know who opened the cage and when the lot camera blinked.",
        "Finance folder on a desk next to a guest-wifi card in the showroom",
      ],
    ),
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    line: "The desk, the kitchen, and the room have to agree.",
    compliance: ["PIPEDA", "PCI DSS"],
    complianceNote: "Guest information under PIPEDA. Card data only if we touch the payment path — then PCI DSS.",
    govern:
      "BIT runs the front desk, the floor, and the back office as one stack — POS, cameras, guest wifi, and a lock between visitors and the books.",
    image: "/images/industries/hospitality.jpg",
    imageAlt: "Quiet hotel lobby desk with a laptop and a ceiling camera",
    tools: ["Oracle Opera", "Toast", "Lightspeed", "Cloudbeds"],
    pillars: pillars(
      "hospitality",
      [
        "Rooms, the kitchen, and payroll do not agree. Staff keep a paper side list.",
        "Oracle Opera, Toast, Lightspeed, Cloudbeds — a modern desk and floor layer, or a custom build in 1 if the property will not fit a box.",
        "Hotel desk with a paper room list that does not match the kitchen ticket",
      ],
      [
        "POS on a dying terminal. Cameras in the lobby that never get watched. Guest wifi that takes the office with it.",
        "Workstations, cameras, phones, and a private server that holds the night audit.",
        "Dying POS terminal beside an unwatched lobby camera",
      ],
      [
        "A guest texts at 11 p.m. It sits. A cooler alarm sits longer.",
        "24/7 intake for the desk and the floor. A person when it is a guest or a walk-in.",
        "Night lobby desk with an unread guest text and a cooler alarm light",
      ],
      [
        "Cards, passports, and camera footage on the same wifi as the lobby.",
        "Guest net stays guest. Files stay locked. We know who opened the back office.",
        "Lobby guest wifi sign next to a passport and a night-audit screen",
      ],
    ),
  },
];

export function getIndustry(slug: string) {
  return INDUSTRIES.find((item) => item.slug === slug);
}
