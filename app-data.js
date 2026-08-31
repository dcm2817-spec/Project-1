// uniVERSE — seed content shown at launch so the app feels active
// before real users generate activity. Replace with live Supabase
// queries once the backend is wired up.

const SEED_FEED = [
  {
    id: "f1",
    type: "material",
    school: "UNIBEN",
    author: "Course Rep — 200L GEE",
    time: "12m",
    text: "200L GEE notes just dropped. Grab them before the CA.",
    meta: "GEE 202 · PDF · 3 pages",
    likes: 41,
    comments: 12,
  },
  {
    id: "f2",
    type: "discussion",
    school: "UNIBEN",
    author: "Anonymous — Geomatics 200L",
    time: "38m",
    text: "Who's in this class? Trying to form a study group before the test.",
    meta: "38 replies",
    likes: 19,
    comments: 38,
  },
  {
    id: "f3",
    type: "event",
    school: "UNIBEN / UBTH",
    author: "ASF UNIBEN/UBTH",
    time: "1h",
    text: "ASF prayer night this Friday. Come through.",
    meta: "120 attending",
    likes: 87,
    comments: 9,
  },
  {
    id: "f4",
    type: "group",
    school: "UNILAG",
    author: "UI/UX Circle",
    time: "2h",
    text: "24 students joined UI/UX Circle this week.",
    meta: "Design · Growing fast",
    likes: 33,
    comments: 4,
  },
  {
    id: "f5",
    type: "material",
    school: "UI",
    author: "Physics Dept Rep",
    time: "3h",
    text: "New PDF uploaded — Thermodynamics, full semester notes.",
    meta: "PHY 204 · PDF · 21 pages",
    likes: 56,
    comments: 15,
  },
];

const SEED_MATERIALS = [
  { id: "m1", title: "GEE 202 — Complete Notes", course: "GEE 202", school: "UNIBEN", downloads: 214 },
  { id: "m2", title: "Thermodynamics Full Semester", course: "PHY 204", school: "UI", downloads: 189 },
  { id: "m3", title: "Intro to Surveying — Past Questions", course: "GMT 201", school: "UNIBEN", downloads: 142 },
  { id: "m4", title: "Organic Chemistry Summary", course: "CHM 201", school: "UNILAG", downloads: 98 },
  { id: "m5", title: "Structured Programming Handout", course: "CSC 201", school: "UNN", downloads: 76 },
];

const SEED_CONNECTIONS = [
  { id: "c1", name: "Chidera O.", school: "UNIBEN", shared: "Web Development, Faith & Ministry" },
  { id: "c2", name: "Tobi A.", school: "UI", shared: "UI/UX Design" },
  { id: "c3", name: "Amaka N.", school: "UNIZIK", shared: "Photography, Study Groups" },
  { id: "c4", name: "Sam E.", school: "UNILAG", shared: "Geomatics, Sports" },
];
