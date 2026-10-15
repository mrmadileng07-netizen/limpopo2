
"use strict";

// RoadRescue SA — Limpopo Edition
// RoadRescue browser interface.

const STORAGE_KEY = "roadRescueLimpopoDemoRequests";
const LANGUAGE_KEY = "roadRescueLimpopoLanguage";
const ENGLISH_PAGE_TITLE = document.title;
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) === "ns" ? "ns" : "en";
let gpsCoordinates = null;
const serviceFilters = ["Breakdown", "Mechanic", "Towing", "Fuel delivery", "Medical emergency", "Police or fire"];
const requestedServiceFilter = new URLSearchParams(window.location.search).get("service");
let currentServiceFilter = "All";
let adminUnlocked = false;
const ADMIN_PIN = "1504";

// Short, plain Sepedi translations for the site's static interface copy.
const sepedi = {
  "Home": "Gae", "Services": "Ditirelo", "Request help": "Kgopela thušo",
  "Track request": "Latela kgopelo", "RURAL ROADS. LOCAL SOLUTIONS.": "DITSELA TŠA DINAGA. THAROLLO YA KGAUSWI.",
  "Stranded on the road? You don't have to face it alone.": "O šaletše tseleng? Ga se wa swanela go lebeletšana le bothata o nnoši.",
  "A rural-first roadside assistance prototype designed for Limpopo, connecting drivers with local help.": "Tirelo ya thušo tseleng ya dinagamagae ya Limpopo, yeo e kgokaganyago baotledi le thušo ya kgauswi.",
  "Request roadside help": "Kgopela thušo tseleng", "Share my location": "Abelana ka moo ke lego gona",
  "24/7 emergency": "Thušo ya tšhoganyetšo nako efe goba efe", "Help starts with your location": "Thušo e thoma ka moo o lego gona",
  "Can't find a street address? Describe your village, road, clinic or nearest landmark.": "Ga o hwetše aterese ya setarata? Hlaloša motse, tsela, kliniki goba leswao la kgauswi.",
  "Example: Near the clinic in my village": "Mohlala: Kgauswi le kliniki motseng wa gešo",
  "Immediate danger?": "O kotsing ya bjale?", "Contact emergency services directly.": "Ikopanye le ditirelo tša tšhoganyetšo ka go lebanya.",
  "HOW WE CAN HELP": "KAMOO RE KA THUŠAGO KA GONA", "Choose the help you need": "Kgetha thušo yeo o e nyakago",
  "Designed around common roadside problems in rural communities.": "E hlametšwe mathata a tlwaelegilego a dikoloi ditikologong tša dinagamagae.",
  "Vehicle breakdown": "Koloi e senyegile", "My vehicle has stopped": "Koloi ya ka e eme",
  "Mechanic": "Makheneke", "Vehicle repair assistance": "Thušo ya go lokiša koloi",
  "Towing": "Go goga koloi", "Move my broken vehicle": "Šuthiša koloi ya ka ye e senyegilego",
  "Fuel delivery": "Go tlišetšwa peterole", "I've run out of fuel": "Ke feletšwe ke peterole",
  "Medical emergency": "Tšhoganyetšo ya tša maphelo", "Urgent medical assistance": "Thušo ya kalafo ya tšhoganyetšo",
  "Police ": "Maphodisa", "Police or danger": "Maphodisa goba kotsi",
  "Selecting a service fills in the request form. It does not contact that service.": "Ge o kgetha tirelo, foromo ya kgopelo e tla tlatšwa. Tirelo yeo e ka se tsebišwe.",
  "ROADSIDe ASSISTANCE": "THUŠO TSELENG", "ROADSIDE ASSISTANCE": "THUŠO TSELENG",
  "Enter as much location detail as possible as you can.": "Ngwala dintlha tše dintši ka moo o lego ka gona.",
  "Your name": "Leina la gago", "Contact number": "Nomoro ya mogala", "Type of help": "Mohuta wa thušo",
  "Select a service": "Kgetha tirelo", "Municipality or area": "Masepala goba lefelo",
  "Village, road or nearest landmark": "Motse, tsela goba leswao la kgauswi", "Describe the problem": "Hlaloša bothata",
  "Enter your name": "Ngwala leina la gago", "e.g. 0712345678": "mohl. 0712345678", "e.g. Lebowakgomo": "mohl. Lebowakgomo",
  "e.g. Near a school, clinic or filling station": "mohl. Kgauswi le sekolo, kliniki goba seteše sa peterole",
  "Explain what happened and any important details.": "Hlaloša seo se diregilego le dintlha tše bohlokwa.",
  "GPS location (optional)": "Lefelo la GPS (ga se la kgapeletšo)",
  "You can use GPS or enter your location manually above.": "O ka šomiša GPS goba wa ngwala lefelo la gago ka godimo.",
  "Get my GPS": "Hwetša GPS ya ka", "GPS is optional. Your browser may ask for location permission. Manual location details are still required.": "GPS ga se ya kgapeletšo. O sa swanetše go ngwala dintlha tša lefelo la gago.",
  "Save request": "Boloka kgopelo", "REQUEST STATUS": "MAEMO A KGOPelo", "Track your  request": "Latela kgopelo ya gago",
  "Track your request": "Latela kgopelo ya gago", "Enter the reference number shown after you save a request on this device.": "Tsenya nomoro ya tšhupetšo yeo o e filwego ge o boloka kgopelo mo sedirišweng se.",
  "Request reference": "Nomoro ya tšhupetšo ya kgopelo", "e.g. RR-123456": "mohl. RR-123456", "Check status": "Lekola maemo",
  "A CLEARER WAY TO ASK FOR HELP": "TSELA YE BONOLO YA GO KGOPELA THUŠO", "How a request works": "Kamoo kgopelo e šomago ka gona",
  "Share the details you have, then keep your request reference.": "Abelana ka dintlha tše o nago le tšona, gomme o boloke nomoro ya tšhupetšo ya kgopelo.",
  "Share your location": "Abelana ka lefelo la gago", "Use GPS if available, or describe your village, road or a nearby landmark.": "Šomiša GPS ge e hwetšagala, goba o hlaloše motse, tsela goba leswao la kgauswi.",
  "Send the request": "Romela kgopelo", "Choose the help you need, explain what happened and add an incident photo if useful.": "Kgetha thušo ye o e nyakago, o hlaloše seo se diregilego gomme o tsenye seswantšho ge se thuša.",
  "Track the reference": "Latela nomoro ya tšhupetšo", "Enter your reference in Track Request to check the recorded status. Requests also appear in the admin dashboard.": "Tsenya nomoro ya gago ya tšhupetšo go Latela Kgopelo gore o bone maemo ao a bolokilwego. Dikgopelo di bonagala gape letlakaleng la taolo.",
  "Designed for rural roadside assistance": "E hlametšwe thušo ya tseleng dinagamagaeng",
  "Not an emergency dispatch service. For immediate danger, call 112 from a mobile phone or contact the appropriate emergency service directly.": "Ye ga se tirelo ya go romela thušo ya tšhoganyetšo. Ge go na le kotsi ya bjale, leletša 112 ka mogala goba ikopanye le tirelo ya maleba ya tšhoganyetšo.",
  "Admin dashboard": "Letlakala la taolo", "Admin Dashboard | RoadRescue SA": "Letlakala la Taolo | RoadRescue SA",
  "Total requests": "Palomoka ya dikgopelo", "Today": "Lehono", "This week": "Beke ye",
  "This month": "Kgwedi ye", "This year": "Ngwaga wo", "Download PDF": "Laolla PDF",
  "Actions": "Ditiro",
  "Main Admin Dashboard · All Services": "Letlakala la Taolo le Legolo · Ditirelo ka Moka",
  "Breakdown Dashboard": "Letlakala la Dikoloi tše di Senyegilego",
  "Mechanic Dashboard": "Letlakala la Bomakheneke", "Towing Dashboard": "Letlakala la go Goga Dikoloi",
  "Fuel Delivery Dashboard": "Letlakala la go Tlišetša Peterole",
  "Medical Emergency Dashboard": "Letlakala la Tšhoganyetšo ya tša Maphelo",
  "Police Services Dashboard": "Letlakala la Ditirelo tša Maphodisa",
  "ADMIN ACCESS": "GO TSENA TAOLONG", "Choose your department": "Kgetha lefapha la gago",
  "Select the department you work with and enter the admin PIN to open its request dashboard.": "Kgetha lefapha leo o šomago go lona gomme o tsenye PIN ya taolo go bula letlakala la dikgopelo.",
  "Department": "Lefapha", "Admin PIN": "PIN ya taolo", "Open dashboard": "Bula letlakala la taolo",
  "That PIN is not correct. Please try again.": "PIN ye ga se ya maleba. Leka gape.",
  "All services": "Ditirelo ka moka", "All service requests": "Dikgopelo tša ditirelo ka moka",
  "Service admin inboxes": "Mabokoso a dikgopelo tša balaodi ba ditirelo",
  "All inboxes": "Mabokoso ka moka", "All service inboxes": "Mabokoso ka moka a ditirelo",
  "Copy this department dashboard link": "Kopiša kgokagano ya letlakala la lefapha",
  "Dashboard link copied": "Kgokagano ya letlakala e kopišitšwe", "Copy this department dashboard link:": "Kopiša kgokagano ya letlakala la lefapha:",
  "Breakdown inbox": "Lebokoso la dikoloi tše di senyegilego", "Mechanic inbox": "Lebokoso la bomakheneke",
  "Towing inbox": "Lebokoso la go goga dikoloi", "Fuel delivery inbox": "Lebokoso la go tlišetša peterole",
  "Medical emergency inbox": "Lebokoso la tšhoganyetšo ya maphelo", "Police inbox": "Lebokoso la maphodisa",
  "Breakdown": "Koloi e senyegile", "Police / fire": "Maphodisa / mollo",
  "Police or fire": "Maphodisa goba mollo",
  "Service dashboard: ": "Letlakala la tirelo: ",
  "User page": "Letlakala la modiriši", "REQUEST MANAGEMENT": "TAOLO YA DIKGopelo", "Admin dashboard": "Letlakala la taolo",
  "Requests submitted.": "Dikgopelo tše rometšwego.", "Total requests": "Palomoka ya dikgopelo",
  "Reference": "Tšhupetšo", "User and contact": "Modiriši le kgokagano", "Service": "Tirelo", "Location": "Lefelo",
  "Problem": "Bothata", "Status": "Maemo", "Action": "Tiro", "No requests yet.": "Ga go dikgopelo ga bjale.",
  "Delete": "Phumola", "Received ": "E amogetšwe ",
  "Reviewing ": "E a lekolwa ", "Help arranged ": "Thušo e rulagantšwe ", "Completed ": "E phethilwe ", "Cancelled ": "E phimotšwe ",
  "Call 112": "Letšetša 112",
  "User page": "Letlakala la modiriši",
  "Open navigation": "Bula menyu", "Close navigation": "Tswalela menyu",
  "ADMIN DASHBOARD": "LETLAKALA LA TAOLO",
  "LIMPOPO EDITION": "KGATIŠO YA LIMPOPO", "Request administration": "Taolo ya dikgopelo",
  "Reference: ": "Tšhupetšo: ", "Service: ": "Tirelo: ", "Location: ": "Lefelo: ", "Status: ": "Maemo: ",
  "Reference: ": "Tšhupetšo: ", "Service: ": "Tirelo: ", "Location: ": "Lefelo: ",
  "Status: ": "Maemo: ", "Current status: ": "Maemo a bjale: ", "Saved: ": "E bolokilwe: ", "GPS: ": "GPS: ",
  "Unknown": "Ga e tsebje", "RoadRescue SA | Limpopo": "RoadRescue SA | Limpopo",
  "Roadside assistance prototype for Limpopo communities.": "Mohlala wa thušo ya tseleng bakeng sa ditšhaba tša Limpopo.",
  "RoadRescue SA request administration dashboard.": "Letlakala la taolo la dikgopelo la RoadRescue SA.",
  "Please complete all required fields.": "Ka kgopelo tlatša mafelo ka moka ao a nyakegago.",
  "Could not save the request. Check your browser storage settings.": "Ga se gwa kgonega go boloka kgopelo. Lekola dipeakanyo tša polokelo ya sephephediši.",
  "GPS is not available in this browser. Enter your location manually.": "GPS ga e hwetšagale mo sephephedišing se. Ngwala lefelo la gago ka seatla.",
  "Requesting GPS permission…": "Go kgopelwa tumelelo ya GPS…", "Location permission was denied. Enter your location manually.": "Tumelelo ya lefelo e gan editšwe. Ngwala lefelo la gago ka seatla.",
  "GPS position unavailable. Try again or enter your location manually.": "Lefelo la GPS ga le hwetšagale. Leka gape goba o ngwale lefelo la gago ka seatla.",
  "GPS request timed out. Try again or enter your location manually.": "Kgopelo ya GPS e tšere nako ye telele. Leka gape goba o ngwale lefelo la gago ka seatla.",
  "Could not get GPS. Please enter your location manually.": "Ga se gwa kgonega go hwetša GPS. Ka kgopelo ngwala lefelo la gago ka seatla.",
  "GPS is not supported here. Please describe your location manually.": "GPS ga e šome mo. Ka kgopelo hlaloša lefelo la gago ka seatla.",
  "Getting your location…": "Go nyakwa lefelo la gago…", "Location unavailable. Enter your village or nearest landmark manually.": "Lefelo ga le hwetšagale. Ngwala motse goba leswao la kgauswi ka seatla.",
  "Could not get your GPS location. Please enter your location manually.": "Ga se gwa kgonega go hwetša lefelo la GPS. Ka kgopelo ngwala lefelo la gago ka seatla.",
  "Request not found": "Kgopelo ga se ya hwetšwa",
  "Check the reference number and make sure you are using the same browser and device where the request was saved.": "Lekola nomoro ya tšhupetšo gomme o netefatše gore o šomiša sephephediši le sedirišwa sona seo kgopelo e bolokilwego go sona.",
  "Delete request ": "Phumola kgopelo ",
  "Request saved": "Kgopelo e bolokilwe",
};
Object.assign(sepedi, {
  "Local roadside support for Limpopo communities": "Thušo ya tseleng ditšhabeng tša Limpopo",
  "Start with where you are": "Thoma ka go hlaloša moo o lego gona",
  "A nearby clinic, school or familiar local place can help people find you.": "Kliniki, sekolo goba lefelo leo o le tlwaetšego kgauswi le ka thuša batho go go hwetša.",
  "Enter the clearest location details you can.": "Ngwala dintlha tša lefelo la gago ka tsela ye e kwagalago kudu.",
  "PLACE": "LEFELO", "MOBILE": "MOGALA", "SEPEDI": "SEPEDI", "LOCAL HELP": "THUŠO YA KGAUSWI",
  "Photo": "Seswantšho", "SOS · Emergency calls": "SOS · Megala ya tšhoganyetšo",
  "SOS · Call 112": "SOS · Letšetša 112", "Call emergency 112": "Letšetša tšhoganyetšo 112",
  "Police / ambulance options": "Dikgetho tša maphodisa / ambulense", "Menu": "Dikgetho",
  "Select Police or Hospital / ambulance to open your phone's dialler. No alert is sent by the website.": "Kgetha Maphodisa goba Ambulense gore o bule mogala. Webosaete ga e romele temošo.",
  "Call Police": "Letšetša Maphodisa", "Call ambulance": "Letšetša Ambulense",
  "Mobile emergency number: ": "Nomoro ya tšhoganyetšo ya mogala: ", "Close": "Tswalela",
  "Photo of the form or incident (optional)": "Seswantsho sa foromo (ga se sa kgapeletso)",
  "Find nearby medical facilities": "Hwetsha mafelo a kalafo a kgauswi", "Search nearby hospitals": "Nyaka dipetlele tsa kgauswi",
  "I agree to share my GPS coordinates for this search.": "Ke dumela go abelana ka GPS bakeng sa nyako ye.",
  "Choose emergency service": "Kgetha tirelo ya tshoganyetso", "Hospital / ambulance": "Sepetlele / ambulense",
  "View photo": "Bona seswantsho", "No photo": "Ga go seswantsho", "Call facility": "Letsetsa lefelo", "View on map": "Bona mmapeng",
  "Please agree before sharing your location.": "Dumela pele o abelana ka lefelo la gago.", "Get GPS first, or call 10177 / 112 directly.": "Hwetsha GPS pele goba o letsetse 10177 / 112.",
  "No phone number is listed for this facility.": "Ga go nomoro ya mogala yeo e ngwadilwego.",
  "Facility listings can be incomplete. This search does not dispatch help.": "Mananeo a mafelo a ka se felele. Nyako ye ga e romele thuso.",
  "Facility search unavailable. Call 10177 for ambulance service or 112 from a mobile.": "Nyako ga e hwetshagale. Letsetsa 10177 goba 112 ka mogala.",
  "No listed facility found nearby. Call 10177 for an ambulance or 112 from a mobile.": "Ga go lefelo leo le ngwadilwego kgauswi. Letsetsa 10177 goba 112 ka mogala."
  ,"Call 10111": "Letsetsa 10111", "Call ambulance 10177": "Letsetsa ambulense 10177",
  "Photo ready; it will be resized before saving.": "Seswantsho se lokile; se tla fokotshwa pele se bolokwa.",
  "Choose a JPG, PNG or WebP image under 8 MB.": "Kgetha seswantsho sa JPG, PNG goba WebP sa ka tlase ga 8 MB.",
  "Find nearby medical facilities": "Hwetsha mafelo a kalafo a kgauswi", "Search nearby hospitals": "Nyaka dipetlele tsa kgauswi",
  "I agree to share my GPS coordinates for this search.": "Ke dumela go abelana ka GPS bakeng sa nyako ye.",
  "Choose emergency service": "Kgetha tirelo ya tshoganyetso", "Hospital / ambulance": "Sepetlele / ambulense",
  "View photo": "Bona seswantsho", "No photo": "Ga go seswantsho", "Call facility": "Letsetsa lefelo", "View on map": "Bona mmapeng",
  "Please agree before sharing your location.": "Dumela pele o abelana ka lefelo la gago.", "Get GPS first, or call 10177 / 112 directly.": "Hwetsha GPS pele goba o letsetse 10177 / 112.",
  "No phone number is listed for this facility.": "Ga go nomoro ya mogala yeo e ngwadilwego.",
  "Facility listings can be incomplete. This search does not dispatch help.": "Mananeo a mafelo a ka se felele. Nyako ye ga e romele thuso.",
  "Facility search unavailable. Call 10177 for ambulance service or 112 from a mobile.": "Nyako ga e hwetshagale. Letsetsa 10177 goba 112 ka mogala.",
  "No listed facility found nearby. Call 10177 for an ambulance or 112 from a mobile.": "Ga go lefelo leo le ngwadilwego kgauswi. Letsetsa 10177 goba 112 ka mogala."
  ,"Requests will be sent to the shared admin dashboard.": "Dikgopelo di tla romelwa letlakaleng la taolo leo le abelanwago."
  ,"Could not send request to shared storage.": "Ga se gwa kgonega go romela kgopelo polokelong ye e abelanwago."
  ,"Request sent to the shared admin dashboard. No mechanic, ambulance, police officer or other provider has been notified.": "Kgopelo e rometšwe letlakaleng la taolo leo le abelanwago. Ga go makheneke, ambulense, lephodisa goba moabi yo mongwe yo a tsebišitšwego."
});

const $ = (id) => document.getElementById(id);
const backendSettings = window.ROADRESCUE_CONFIG || {};
const hasSupabaseSettings = Boolean(backendSettings.supabaseUrl && backendSettings.supabaseAnonKey);
const localServerMode = Boolean(
  backendSettings.localServerMode && !hasSupabaseSettings &&
  /^https?:$/.test(location.protocol) && location.port === "8000"
);
const backendSdkReady = Boolean(window.supabase?.createClient);
const supabaseBackendConfigured = Boolean(
  backendSdkReady && backendSettings.supabaseUrl && backendSettings.supabaseAnonKey
);
const sharedBackendConfigured = localServerMode || supabaseBackendConfigured;
const sharedBackend = sharedBackendConfigured
  ? (supabaseBackendConfigured ? window.supabase.createClient(backendSettings.supabaseUrl, backendSettings.supabaseAnonKey) : null)
  : null;

function toDatabaseRequest(request) {
  return {
    reference: request.reference,
    name: request.name,
    phone: request.phone,
    service: request.service,
    area: request.area,
    landmark: request.landmark,
    details: request.details,
    photo: request.photo,
    gps: request.gps,
    status: request.status,
    created_at: request.createdAt
  };
}

function fromDatabaseRequest(request) {
  return { ...request, createdAt: request.created_at };
}

async function fetchSharedRequests() {
  if (localServerMode) {
    const response = await fetch("/api/requests");
    if (!response.ok) throw new Error("Could not reach the laptop request server.");
    return response.json();
  }
  const { data, error } = await sharedBackend
    .from("road_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromDatabaseRequest);
}

function loadRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const requests = saved ? JSON.parse(saved) : [];
    return Array.isArray(requests) ? requests : [];
  } catch (error) {
    console.error("Could not load requests:", error);
    return [];
  }
}

function saveRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return true;
  } catch (error) {
    alert(tr("Could not save the request. Check your browser storage settings."));
    console.error(error);
    return false;
  }
}

function makeReference() {
  return "RR-" + Date.now().toString().slice(-6) +
    Math.floor(10 + Math.random() * 90);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[character];
  });
}

function tr(value) {
  return currentLanguage === "ns" ? (sepedi[value] || value) : value;
}

function requestMatchesService(request, selectedService) {
  if (selectedService === "All") return true;
  const actual = String(request.service || "").trim().toLowerCase();
  const selected = selectedService.trim().toLowerCase();
  if (selected === "police or fire") return ["police", "police or fire", "police / fire"].includes(actual);
  return actual === selected;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(currentLanguage === "ns" ? "nso-ZA" : "en-ZA");
}

function getDateRange(period, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) };
  }
  if (period === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: monthStart, end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  }
  if (period === "year") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return { start: yearStart, end: new Date(now.getFullYear() + 1, 0, 1) };
  }
  return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1) };
}

function countRequestsInPeriod(requests, period) {
  const { start, end } = getDateRange(period);
  return requests.filter((request) => {
    const created = new Date(request.createdAt || request.created_at);
    return !Number.isNaN(created.getTime()) && created >= start && created < end;
  }).length;
}

function pdfAscii(value) {
  return String(value ?? "Not provided")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Not provided";
}

function wrapPdfField(label, value, maxLength = 86) {
  const prefix = `${pdfAscii(label)}: `;
  const words = pdfAscii(value).split(" ");
  const lines = [];
  let line = prefix;
  for (const word of words) {
    if (line.length > prefix.length && line.length + word.length + 1 > maxLength) {
      lines.push(line);
      line = "  ";
    }
    let remaining = word;
    while (line.length + remaining.length > maxLength) {
      const available = Math.max(1, maxLength - line.length);
      lines.push(line + remaining.slice(0, available));
      remaining = remaining.slice(available);
      line = "  ";
    }
    line += `${line.trimEnd().endsWith(":") ? "" : line === "  " ? "" : " "}${remaining}`;
  }
  if (line.trim()) lines.push(line);
  return lines;
}

function escapePdfText(value) {
  return value.replace(/([\\()])/g, "\\$1");
}

function decodeRequestJpeg(photoDataUrl) {
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/i.exec(photoDataUrl || "");
  if (!match) return null;
  const binary = atob(match[1]);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  let width = 0;
  let height = 0;
  const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  for (let offset = 2; offset < bytes.length;) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) continue;
    if (offset + 3 >= bytes.length) break;
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (frameMarkers.has(marker) && segmentLength >= 7) {
      height = (bytes[offset + 3] << 8) | bytes[offset + 4];
      width = (bytes[offset + 5] << 8) | bytes[offset + 6];
      break;
    }
    if (segmentLength < 2) break;
    offset += segmentLength;
  }
  return width && height ? { bytes, width, height } : null;
}

function makeRequestPdf(request) {
  const photo = decodeRequestJpeg(request.photo);
  const fields = [
    ["Reference", request.reference],
    ["Date submitted", formatDate(request.createdAt || request.created_at)],
    ["Name", request.name],
    ["Contact number", request.phone],
    ["Service", request.service],
    ["Municipality or area", request.area],
    ["Village, road or landmark", request.landmark],
    ["Problem details", request.details],
    ["GPS coordinates", request.gps ? `${request.gps.latitude}, ${request.gps.longitude}` : "Not provided"],
    ["Incident photo", photo ? "Attached - included on the final PDF page" : request.photo ? "Attached - view it in the admin dashboard" : "Not attached"],
    ["Status", String(request.status || "Received").replace(/\s*\(demo\)/i, "")]
  ];
  const lines = fields.flatMap(([label, value]) => wrapPdfField(label, value));
  const linesPerPage = 49;
  const pageLines = [];
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pageLines.push(lines.slice(index, index + linesPerPage));
  }
  const pageSpecs = pageLines.map((lines) => ({ type: "details", lines }));
  if (photo) pageSpecs.push({ type: "photo", photo });
  const pageIds = pageSpecs.map((_, index) => 3 + index * 2);
  const fontId = 3 + pageSpecs.length * 2;
  const imageId = photo ? fontId + 1 : null;
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  pageSpecs.forEach((page, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    const heading = page.type === "photo" ? "Uploaded Incident Photo"
      : index === 0 ? "RoadRescue SA - Request Form" : "RoadRescue SA - Request Form (continued)";
    let stream;
    if (page.type === "photo") {
      const scale = Math.min(520 / page.photo.width, 690 / page.photo.height);
      const imageWidth = page.photo.width * scale;
      const imageHeight = page.photo.height * scale;
      const imageX = (595 - imageWidth) / 2;
      const imageY = 55 + (690 - imageHeight) / 2;
      stream = `BT /F1 16 Tf 48 802 Td (${heading}) Tj ET\nq ${imageWidth.toFixed(2)} 0 0 ${imageHeight.toFixed(2)} ${imageX.toFixed(2)} ${imageY.toFixed(2)} cm /Im1 Do Q\nBT /F1 9 Tf 48 25 Td (Reference: ${escapePdfText(pdfAscii(request.reference))}) Tj ET`;
    } else {
      const body = page.lines.map((line) => `(${escapePdfText(line)}) Tj T*`).join("\n");
      stream = `BT /F1 16 Tf 48 802 Td (${heading}) Tj ET\nBT /F1 10 Tf 48 775 Td 14 TL\n${body}\nET`;
    }
    const xObjectResource = page.type === "photo" ? ` /XObject << /Im1 ${imageId} 0 R >>` : "";
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >>${xObjectResource} >> /Contents ${contentId} 0 R >>`;
    stream += `\nBT /F1 9 Tf 500 25 Td (Page ${index + 1} of ${pageSpecs.length}) Tj ET`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  if (photo) {
    let imageHex = "";
    for (const byte of photo.bytes) imageHex += byte.toString(16).padStart(2, "0");
    imageHex += ">";
    objects[imageId] = `<< /Type /XObject /Subtype /Image /Width ${photo.width} /Height ${photo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${imageHex.length} >>\nstream\n${imageHex}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

async function downloadRequestPdf(reference) {
  try {
    const requests = sharedBackendConfigured ? await fetchSharedRequests() : loadRequests();
    const request = requests.find((item) => String(item.reference) === reference);
    if (!request) throw new Error("Request could not be found.");
    const url = URL.createObjectURL(makeRequestPdf(request));
    const link = document.createElement("a");
    link.href = url;
    link.download = `RoadRescue-${pdfAscii(request.reference).replace(/[^A-Za-z0-9_-]/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (error) {
    alert(error.message || "Could not create the request PDF.");
  }
}

async function renderDashboard() {
  const table = $("requestsTable");
  if (!table || !adminUnlocked) return;

  let requests;
  try {
    requests = sharedBackendConfigured ? await fetchSharedRequests() : loadRequests();
  } catch (error) {
    table.innerHTML = `<tr><td colspan="8">${escapeHTML(error.message || "Could not load shared requests.")}</td></tr>`;
    return;
  }

  document.querySelectorAll("[data-service-count]").forEach((badge) => {
    const category = badge.dataset.serviceCount;
    badge.textContent = category === "All"
      ? requests.length
      : requests.filter((request) => requestMatchesService(request, category)).length;
  });
  const titleKey = currentServiceFilter === "All" ? "All service inboxes" : currentServiceFilter === "Police or fire" ? "Police inbox" : `${currentServiceFilter} inbox`;
  $("serviceDashboardTitle").textContent = tr(titleKey);
  const departmentHeading = currentServiceFilter === "All"
    ? "Main Admin Dashboard · All Services"
    : currentServiceFilter === "Police or fire"
      ? "Police Services Dashboard"
      : `${currentServiceFilter} Dashboard`;
  $("departmentDashboardHeading").textContent = tr(departmentHeading);
  if ($("serviceDashboards")) $("serviceDashboards").hidden = currentServiceFilter !== "All";
  if ($("departmentDashboardActions")) $("departmentDashboardActions").hidden = currentServiceFilter === "All";
  const visibleRequests = currentServiceFilter === "All"
    ? requests
    : requests.filter((request) => requestMatchesService(request, currentServiceFilter));
  $("totalRequests").textContent = visibleRequests.length;
  $("dailyRequests").textContent = countRequestsInPeriod(visibleRequests, "day");
  $("weeklyRequests").textContent = countRequestsInPeriod(visibleRequests, "week");
  $("monthlyRequests").textContent = countRequestsInPeriod(visibleRequests, "month");
  $("yearlyRequests").textContent = countRequestsInPeriod(visibleRequests, "year");

  if (visibleRequests.length === 0) {
    table.innerHTML = "";
    return;
  }

  table.innerHTML = visibleRequests.slice().reverse().map((request) => {
    const reference = escapeHTML(request.reference);
    const name = escapeHTML(request.name);
    const phone = escapeHTML(request.phone);
    const service = escapeHTML(request.service);
    const area = escapeHTML(request.area);
    const landmark = escapeHTML(request.landmark);
    const details = escapeHTML(request.details);
    const status = escapeHTML(request.status.replace(/\s*\(demo\)/i, ""));
    const gps = request.gps
      ? `${request.gps.latitude}, ${request.gps.longitude}`
      : "Not provided";

    return `
      <tr>
        <td>
          <strong>${reference}</strong>
          <br><small>${escapeHTML(formatDate(request.createdAt))}</small>
        </td>
        <td>${name}<br><a href="tel:${escapeHTML(request.phone)}">${phone}</a></td>
        <td>${service}</td>
        <td>${area}<br><small>${landmark}</small><br><small>GPS: ${escapeHTML(gps)}</small></td>
        <td>${details}</td>
        <td>${request.photo ? `<a class="photo-preview-link" href="${escapeHTML(request.photo)}" target="_blank" rel="noopener noreferrer"><img class="admin-photo-thumb" src="${escapeHTML(request.photo)}" alt="Uploaded request photo" loading="lazy"><span>${tr("View photo")}</span></a>` : tr("No photo")}</td>
        <td>
          <label class="sr-only" for="status-${reference}">
            Status for ${reference}
          </label>
          <select class="status-select"
            id="status-${reference}"
            data-reference="${reference}"
            aria-label="Update status for ${reference}">
            ${[
              "Received ",
              "Reviewing ",
              "Help arranged ",
              "Completed ",
              "Cancelled "
            ].map((option) => `
            <option value="${option}"
                ${request.status === option ? "selected" : ""}>
                ${escapeHTML(tr(option))}
              </option>
            `).join("")}
          </select>
        </td>
        <td>
          <button class="pdf-action" type="button" data-download-pdf="${reference}">
            ${tr("Download PDF")}
          </button>
          <button class="table-action"
            type="button"
            data-delete="${reference}">
            ${tr("Delete")}
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function showResult(element, title, lines) {
  element.hidden = false;
  element.innerHTML = `
    <h3>${escapeHTML(title)}</h3>
    ${lines.map((line) => {
      let translated = line;
      const match = line.match(/^([^:]+: )(.*)$/);
      if (match) {
        const value = match[1].trim() === "Service:" ? tr(match[2])
          : match[1].trim() === "Status:" || match[1].trim() === "Current status:"
            ? tr(match[2]) : match[2];
        translated = `${tr(match[1])}${value}`;
      }
      return `<p>${escapeHTML(translated)}</p>`;
    }).join("")}
  `;
  setLanguage(currentLanguage);
}

function setLocationStatus(message) {
  const status = $("locationStatus");
  if (!status) return;
  status.textContent = tr(message);
  if (status.firstChild) status.firstChild.__roadRescueEnglish = message;
}

function getGPSLocation() {
  if (!("geolocation" in navigator)) {
    setLocationStatus(
      "GPS is not available in this browser. Enter your location manually."
    );
    return;
  }

  setLocationStatus("Requesting GPS permission…");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      gpsCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy)
      };

      setLocationStatus(
        `GPS captured: ${gpsCoordinates.latitude.toFixed(5)}, ` +
        `${gpsCoordinates.longitude.toFixed(5)} ` +
        `(accuracy about ${gpsCoordinates.accuracy} metres).`
      );
    },
    (error) => {
      gpsCoordinates = null;

      const messages = {
        1: "Location permission was denied. Enter your location manually.",
        2: "GPS position unavailable. Try again or enter your location manually.",
        3: "GPS request timed out. Try again or enter your location manually."
      };

      setLocationStatus(
        messages[error.code] ||
        "Could not get GPS. Please enter your location manually."
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    }
  );
}

// Request a GPS position and open a map link if supported.
function shareMyLocation() {
  if (!navigator.geolocation) {
    alert(tr("GPS is not supported here. Please describe your location manually."));
    return;
  }

  if (gpsCoordinates) {
    openMapForCoordinates(gpsCoordinates.latitude, gpsCoordinates.longitude);
    return;
  }

  setLocationStatus("Getting your location…");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      gpsCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy)
      };

      setLocationStatus(
        `GPS captured: ${gpsCoordinates.latitude.toFixed(5)}, ` +
        `${gpsCoordinates.longitude.toFixed(5)}.`
      );

      openMapForCoordinates(
        gpsCoordinates.latitude,
        gpsCoordinates.longitude
      );
    },
    () => {
      setLocationStatus(
        "Location unavailable. Enter your village or nearest landmark manually."
      );
      alert(tr("Could not get your GPS location. Please enter your location manually."));
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
}

function openMapForCoordinates(latitude, longitude) {
  const mapURL = "https://www.google.com/maps?q=" +
    encodeURIComponent(`${latitude},${longitude}`);

  window.open(mapURL, "_blank", "noopener,noreferrer");
}

function handleRequestSubmit(event) {
  event.preventDefault();
  saveRequestWithPhoto();
}

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) return reject(new Error("Choose a JPG, PNG or WebP image under 8 MB."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not open this image."));
      image.onload = () => {
        const maxDataUrlLength = 1_200_000;
        let scale = Math.min(1, 1280 / image.width, 1280 / image.height);
        const qualities = [0.72, 0.62, 0.52, 0.42, 0.34];
        for (const quality of qualities) {
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          if (!context) return reject(new Error("Could not process this image."));
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const resizedPhoto = canvas.toDataURL("image/jpeg", quality);
          if (resizedPhoto.length <= maxDataUrlLength) return resolve(resizedPhoto);
          scale *= 0.8;
        }
        reject(new Error("This picture is too detailed to save. Please choose a smaller image."));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function saveRequestWithPhoto() {

  if (hasSupabaseSettings && !supabaseBackendConfigured) {
    alert(tr("Cloud database could not load. Check your internet connection and refresh."));
    return;
  }

  const name = $("userName").value.trim();
  const phone = $("phone").value.trim();
  const service = $("serviceType").value;
  const area = $("area").value.trim();
  const landmark = $("landmark").value.trim();
  const details = $("details").value.trim();
  let photo = null;

  if (!name || !phone || !service || !area || !landmark || !details) {
    alert(tr("Please complete all required fields."));
    return;
  }

  try { photo = await resizePhoto($("evidencePhoto")?.files[0]); }
  catch (error) { alert(tr(error.message)); return; }

  const request = {
    reference: makeReference(),
    name,
    phone,
    service,
    area,
    landmark,
    details,
    photo,
    gps: gpsCoordinates,
    status: "Received (demo)",
    createdAt: new Date().toISOString()
  };

  if (sharedBackendConfigured) {
    if (localServerMode) {
      try {
        const response = await fetch("/api/requests", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request)
        });
        if (!response.ok) { alert(tr("Could not send request to shared storage.")); return; }
      } catch (_) {
        alert("Could not reach the laptop server. Make sure run-server.bat is running and both devices use the same Wi-Fi.");
        return;
      }
    } else {
      const { error } = await sharedBackend.from("road_requests").insert(toDatabaseRequest(request));
      if (error) { alert(`${tr("Could not send request to shared storage.")} ${error.message}`); return; }
    }
  } else {
    const requests = loadRequests();
    requests.push(request);
    if (!saveRequests(requests)) return;
  }

  showResult($("requestResult"), "Request saved", [
    `Reference: ${request.reference}`,
    `Service: ${request.service}`,
    `Location: ${request.area} — ${request.landmark}`,
    `Status: ${request.status.replace(/\s*\(demo\)/i, "")}`
  ]);

  $("referenceInput").value = request.reference;
  $("requestForm").reset();
  if ($("evidencePreview")) { $("evidencePreview").hidden = true; $("evidencePreview").removeAttribute("src"); }
  if ($("photoStatus")) $("photoStatus").textContent = "";
  if ($("medicalFinder")) $("medicalFinder").hidden = true;
  if ($("medicalResult")) $("medicalResult").textContent = "";

  gpsCoordinates = null;
  setLocationStatus(
    "You can use GPS or enter your location manually above."
  );

  renderDashboard();
  $("requestResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function distanceKm(origin, point) {
  const rad = n => n * Math.PI / 180, dLat = rad(point.lat - origin.latitude), dLon = rad(point.lon - origin.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(origin.latitude)) * Math.cos(rad(point.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findMedicalFacilities() {
  const result = $("medicalResult");
  if (!$('medicalConsent').checked) { result.textContent = tr("Please agree before sharing your location."); return; }
  if (!gpsCoordinates) { result.textContent = tr("Get GPS first, or call 10177 / 112 directly."); return; }
  result.textContent = tr("Searching OpenStreetMap facilities…");
  const { latitude, longitude } = gpsCoordinates;
  const query = `[out:json][timeout:20];(node(around:30000,${latitude},${longitude})[amenity~"^(hospital|clinic|doctors)$"];way(around:30000,${latitude},${longitude})[amenity~"^(hospital|clinic|doctors)$"];relation(around:30000,${latitude},${longitude})[amenity~"^(hospital|clinic|doctors)$"];);out center tags;`;
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: "data=" + encodeURIComponent(query) });
    if (!response.ok) throw new Error("network");
    const data = await response.json();
    const facilities = (data.elements || []).map(item => {
      const tags = item.tags || {}, point = item.lat ? { lat: item.lat, lon: item.lon } : item.center;
      return point && { name: tags.name || tags["name:en"] || "Unnamed medical facility", phone: tags.phone || tags["contact:phone"], lat: point.lat, lon: point.lon, distance: distanceKm(gpsCoordinates, point) };
    }).filter(Boolean).sort((a, b) => a.distance - b.distance);
    if (!facilities.length) { result.textContent = tr("No listed facility found nearby. Call 10177 for an ambulance or 112 from a mobile."); return; }
    const item = facilities[0];
    result.innerHTML = `<p><strong>${escapeHTML(item.name)}</strong> · ${item.distance.toFixed(1)} km</p>${item.phone ? `<a class="button button-primary" href="tel:${escapeHTML(item.phone.replace(/[^+0-9]/g, ""))}">${tr("Call facility")} ${escapeHTML(item.phone)}</a>` : `<p>${tr("No phone number is listed for this facility.")}</p>`}<p><a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=15/${item.lat}/${item.lon}">${tr("View on map")}</a></p><small>${tr("Facility listings can be incomplete. This search does not dispatch help.")} © OpenStreetMap contributors</small>`;
  } catch (_) { result.textContent = tr("Facility search unavailable. Call 10177 for ambulance service or 112 from a mobile."); }
}

async function handleTrackSubmit(event) {
  event.preventDefault();

  const reference = $("referenceInput").value.trim().toUpperCase();
  let request;
  if (sharedBackendConfigured) {
    if (localServerMode) {
      const response = await fetch(`/api/requests/${encodeURIComponent(reference)}`);
      request = response.ok ? await response.json() : null;
    } else {
      const { data, error } = await sharedBackend.rpc("track_road_request", { p_reference: reference });
      if (error) { showResult($("trackResult"), "Request not found", [error.message]); return; }
      const tracked = Array.isArray(data) ? data[0] : data;
      request = tracked ? { ...tracked, createdAt: tracked.created_at } : null;
    }
  } else {
    request = loadRequests().find((item) => String(item.reference).toUpperCase() === reference);
  }

  if (!request) {
    showResult($("trackResult"), "Request not found", [
      "Check the reference number and make sure you are using the same browser and device where the request was saved."
    ]);
    return;
  }

  showResult($("trackResult"), "request status", [
    `Reference: ${request.reference}`,
    `Service: ${request.service}`,
    `Location: ${request.area} — ${request.landmark}`,
    `Current status: ${request.status.replace(/\s*\(demo\)/i, "")}`,
    `Saved: ${formatDate(request.createdAt)}`,
    
  ]);
}

function handleDashboardChange(event) {
  const select = event.target.closest(".status-select");
  if (!select) return;

  const reference = select.dataset.reference;
  if (localServerMode) {
    fetch(`/api/requests/${encodeURIComponent(reference)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: select.value })
    }).then((response) => response.ok ? renderDashboard() : alert("Could not update request status."));
    return;
  }
  if (sharedBackendConfigured && !localServerMode) {
    sharedBackend.from("road_requests").update({ status: select.value }).eq("reference", reference)
      .then(({ error }) => error ? alert(error.message) : renderDashboard());
    return;
  }
  const requests = loadRequests();
  const request = requests.find((item) => item.reference === reference);

  if (!request) return;

  request.status = select.value;

  if (!saveRequests(requests)) {
    renderDashboard();
    return;
  }

  renderDashboard();

  const referenceInput = $("referenceInput");
  const currentReference = referenceInput?.value.trim().toUpperCase();
  if (currentReference === reference.toUpperCase()) {
    handleTrackSubmit(new Event("submit", { cancelable: true }));
  }
}

function handleDashboardClick(event) {
  const pdfButton = event.target.closest("[data-download-pdf]");
  if (pdfButton) {
    downloadRequestPdf(pdfButton.dataset.downloadPdf);
    return;
  }

  const button = event.target.closest("[data-delete]");
  if (!button) return;

  const reference = button.dataset.delete;

  if (!confirm(`${tr("Delete request ")}${reference}?`)) return;

  if (localServerMode) {
    fetch(`/api/requests/${encodeURIComponent(reference)}`, { method: "DELETE" })
      .then((response) => response.ok ? renderDashboard() : alert("Could not delete request."));
    return;
  }
  if (sharedBackendConfigured && !localServerMode) {
    sharedBackend.from("road_requests").delete().eq("reference", reference)
      .then(({ error }) => error ? alert(error.message) : renderDashboard());
    return;
  }

  const requests = loadRequests().filter(
    (request) => request.reference !== reference
  );

  if (!saveRequests(requests)) return;

  renderDashboard();
  if ($("trackResult")) $("trackResult").hidden = true;
  if ($("requestResult")) $("requestResult").hidden = true;
}

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem(LANGUAGE_KEY, language);

  document.querySelectorAll("[data-en][data-ns]").forEach((element) => {
    element.textContent =
      language === "ns" ? element.dataset.ns : element.dataset.en;
  });

  // Translate all other authored text nodes while preserving their spacing and markup.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) {
    if (!textNode.__roadRescueEnglish) {
      textNode.__roadRescueEnglish = textNode.nodeValue;
    }
    const original = textNode.__roadRescueEnglish;
    const key = original.trim();
    const leading = original.match(/^\s*/)[0];
    const trailing = original.match(/\s*$/)[0];
    textNode.nodeValue = language === "ns" && sepedi[key]
      ? `${leading}${sepedi[key]}${trailing}`
      : original;
  }

  // Keep the original placeholder and accessible label so switching back restores it.
  document.querySelectorAll("input, textarea, button, a, [aria-label]").forEach((element) => {
    ["placeholder", "aria-label"].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const cacheName = `__roadRescueEnglish_${attribute}`;
      if (!element[cacheName]) element[cacheName] = element.getAttribute(attribute);
      const original = element[cacheName];
      element.setAttribute(attribute, language === "ns" ? tr(original) : original);
    });
  });

  if ($("languageToggle")) {
    $("languageToggle").textContent = language === "en" ? "Sepedi" : "English";
  }

  document.documentElement.lang = language === "en" ? "en" : "nso";
  document.title = language === "ns" ? tr(ENGLISH_PAGE_TITLE) : ENGLISH_PAGE_TITLE;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    if (!description.dataset.english) description.dataset.english = description.content;
    description.content = language === "ns" ? tr(description.dataset.english) : description.dataset.english;
  }
  renderDashboard();
}

// Navigation and service buttons
$("menuToggle")?.addEventListener("click", () => {
  const nav = $("mainNav");
  const isOpen = nav.classList.toggle("open");

  $("menuToggle").setAttribute("aria-expanded", String(isOpen));
  $("menuToggle").setAttribute(
    "aria-label",
    tr(isOpen ? "Close navigation" : "Open navigation")
  );
});

document.querySelectorAll("#mainNav a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

function closeMobileMenu() {
  const nav = $("mainNav");
  const toggle = $("menuToggle");
  nav?.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", tr("Open navigation"));
}

document.addEventListener("click", (event) => {
  if (!$("mainNav")?.classList.contains("open")) return;
  if (event.target.closest(".topbar")) return;
  closeMobileMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileMenu();
});

document.querySelectorAll(".service-card").forEach((button) => {
  button.addEventListener("click", () => {
    $("serviceType").value = button.dataset.service;
    if ($("medicalFinder")) $("medicalFinder").hidden = button.dataset.service !== "Medical emergency";
    $("request").scrollIntoView({ behavior: "smooth" });
    $("userName").focus({ preventScroll: true });
  });
});

$("serviceType")?.addEventListener("change", event => {
  if ($("medicalFinder")) $("medicalFinder").hidden = event.target.value !== "Medical emergency";
});
$("findMedicalBtn")?.addEventListener("click", findMedicalFacilities);
$("evidencePhoto")?.addEventListener("change", async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const photo = await resizePhoto(file);
    $("evidencePreview").src = photo; $("evidencePreview").hidden = false;
    $("photoStatus").textContent = tr("Photo ready; it will be resized before saving.");
  } catch (error) { event.target.value = ""; $("photoStatus").textContent = tr(error.message); }
});
const sosDialog = $("sosDialog");
$("sosOpen")?.addEventListener("click", () => {
  if (!sosDialog) return;
  if (typeof sosDialog.showModal === "function") sosDialog.showModal();
  else sosDialog.setAttribute("open", "");
});
$("sosClose")?.addEventListener("click", () => {
  if (!sosDialog) return;
  if (typeof sosDialog.close === "function") sosDialog.close();
  else sosDialog.removeAttribute("open");
});

$("languageToggle")?.addEventListener("click", () => {
  setLanguage(currentLanguage === "en" ? "ns" : "en");
  closeMobileMenu();
});

setLanguage(currentLanguage);

if ($("supabaseAdminCredentials")) {
  $("supabaseAdminCredentials").hidden = !hasSupabaseSettings;
  if ($("cloudAdminEmail")) $("cloudAdminEmail").value = backendSettings.adminEmail || "";
  if ($("cloudAdminPassword")) $("cloudAdminPassword").required = hasSupabaseSettings;
}

if (serviceFilters.includes(requestedServiceFilter) && $("departmentSelect")) {
  $("departmentSelect").value = requestedServiceFilter;
}

$("departmentAccessForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pinInput = $("adminPin");
  const accessError = $("departmentAccessError");
  if (hasSupabaseSettings && !supabaseBackendConfigured) {
    accessError.textContent = tr("Cloud database could not load. Check your internet connection and refresh.");
    accessError.hidden = false;
    return;
  }
  if (pinInput.value.trim() !== ADMIN_PIN) {
    accessError.textContent = tr("That PIN is not correct. Please try again.");
    accessError.hidden = false;
    pinInput.select();
    return;
  }

  if (supabaseBackendConfigured) {
    const { data, error } = await sharedBackend.auth.signInWithPassword({
      email: $("cloudAdminEmail").value.trim(),
      password: $("cloudAdminPassword").value
    });
    const signedInEmail = data?.user?.email?.toLowerCase();
    if (error || signedInEmail !== String(backendSettings.adminEmail || "").toLowerCase()) {
      await sharedBackend.auth.signOut();
      accessError.textContent = tr("Cloud sign-in failed. Check the admin account email and password.");
      accessError.hidden = false;
      return;
    }
  }

  accessError.hidden = true;
  adminUnlocked = true;
  currentServiceFilter = $("departmentSelect").value;
  const nextUrl = new URL(window.location.href);
  if (currentServiceFilter === "All") nextUrl.searchParams.delete("service");
  else nextUrl.searchParams.set("service", currentServiceFilter);
  window.history.replaceState({}, "", nextUrl);
  $("departmentAccess").hidden = true;
  $("adminDashboard").hidden = false;
  document.querySelectorAll("[data-service-filter]").forEach((tab) => {
    const active = tab.dataset.serviceFilter === currentServiceFilter;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  pinInput.value = "";
  if ($("cloudAdminPassword")) $("cloudAdminPassword").value = "";
  renderDashboard();
});

$("requestForm")?.addEventListener("submit", handleRequestSubmit);
$("trackForm")?.addEventListener("submit", handleTrackSubmit);
$("getLocationBtn")?.addEventListener("click", getGPSLocation);
$("shareLocationBtn")?.addEventListener("click", shareMyLocation);
$("requestsTable")?.addEventListener("change", handleDashboardChange);
$("requestsTable")?.addEventListener("click", handleDashboardClick);
$("serviceDashboards")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-service-filter]");
  if (!button) return;
  currentServiceFilter = button.dataset.serviceFilter;
  const nextUrl = new URL(window.location.href);
  if (currentServiceFilter === "All") nextUrl.searchParams.delete("service");
  else nextUrl.searchParams.set("service", currentServiceFilter);
  window.history.replaceState({}, "", nextUrl);
  document.querySelectorAll("[data-service-filter]").forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  renderDashboard();
});
$("copyDepartmentLink")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    $("copyDepartmentLink").textContent = "Dashboard link copied";
    window.setTimeout(() => { $("copyDepartmentLink").textContent = "Copy this department dashboard link"; }, 2200);
  } catch {
    window.prompt("Copy this department dashboard link:", window.location.href);
  }
});
if ($("year")) $("year").textContent = new Date().getFullYear();
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) renderDashboard();
});
renderDashboard();
if ((localServerMode || supabaseBackendConfigured) && $("requestsTable")) {
  window.setInterval(() => renderDashboard(), 5000);
}
