// Demo content for local development and the examiner walkthrough.
// Every document is tagged `seeded: true` so re-running the seed only replaces demo data.

const img = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const avatar = (path) => `https://randomuser.me/api/portraits/${path}.jpg`;

export const hosts = {
  maya: { name: 'Maya Okafor', email: 'maya.okafor@example.com', photo: avatar('women/44') },
  daniel: { name: 'Daniel Reyes', email: 'daniel.reyes@example.com', photo: avatar('men/32') },
  aiko: { name: 'Aiko Tanaka', email: 'aiko.tanaka@example.com', photo: avatar('women/68') },
  lucas: { name: 'Lucas Moreau', email: 'lucas.moreau@example.com', photo: avatar('men/75') },
  priya: { name: 'Priya Raman', email: 'priya.raman@example.com', photo: avatar('women/90') },
  noah: { name: 'Noah Bennett', email: 'noah.bennett@example.com', photo: avatar('men/46') },
};

export const creators = [
  { name: 'Sofia Lindqvist', email: 'sofia.lindqvist@example.com', photo: avatar('women/12') },
  { name: 'Marcus Hale', email: 'marcus.hale@example.com', photo: avatar('men/52') },
  { name: 'Rafiq Ahmed', email: 'rafiq.ahmed@example.com', photo: avatar('men/22') },
  { name: 'Elena Petrova', email: 'elena.petrova@example.com', photo: avatar('women/33') },
  { name: 'Jamal Carter', email: 'jamal.carter@example.com', photo: avatar('men/64') },
  { name: 'Hana Kim', email: 'hana.kim@example.com', photo: avatar('women/57') },
  { name: 'Tariq Hossain', email: 'tariq.hossain@example.com', photo: avatar('men/85') },
  { name: "Grace O'Neill", email: 'grace.oneill@example.com', photo: avatar('women/79') },
];

export function demoHost(email, name) {
  return { name, email, photo: avatar('men/11') };
}

/** `owner` is a key of `hosts` or 'demo' (the examiner account). */
export const studios = [
  {
    key: 'cyc',
    owner: 'maya',
    title: 'Daylight Cyc Wall Studio',
    category: 'Photo Studio',
    hourlyRate: 65,
    securityDeposit: 150,
    maxCapacity: 12,
    location: '48 Wythe Ave, Williamsburg, Brooklyn, NY',
    image: img('1471341971476-ae15ff5dd4ea'),
    gallery: [img('1527011046414-4781f1f94f8c'), img('1554048612-b6a482bc67e5'), img('1516035069371-29a1b244cc32')],
    amenities: ['Infinity Cyc Wall', 'Natural Light', 'Strobe Lighting Kit', 'Seamless Backdrops', 'Makeup Station', 'Changing Room', 'Garment Steamer', 'High-Speed Wi-Fi'],
    overview:
      'A 1,600 sq ft daylight studio with a 20-foot pre-lit white cyc wall and floor-to-ceiling north-facing windows. Blackout blinds let you switch from soft natural light to full strobe control in minutes. The kit includes four Profoto heads, a range of modifiers and a tethering desk, so fashion, e-commerce and portrait crews can roll in and start shooting straight away.',
  },
  {
    key: 'softbox',
    owner: 'demo',
    title: 'Softbox Loft Portrait Studio',
    category: 'Photo Studio',
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 8,
    location: 'House 22, Road 11, Banani, Dhaka',
    image: img('1527011046414-4781f1f94f8c'),
    gallery: [img('1520390138845-fd2d229dd553'), img('1502982720700-bfff97f2ecac'), img('1519710164239-da123dc03ef4')],
    amenities: ['Strobe Lighting Kit', 'Seamless Backdrops', 'Makeup Station', 'Air Conditioning', 'Changing Room', 'High-Speed Wi-Fi', 'Lounge Area'],
    overview:
      'A calm, plant-filled loft built for headshots, product flat-lays and small fashion shoots. Two large softboxes, a beauty dish and five paper backdrops are ready on arrival. A private makeup corner with a lit mirror and a cosy lounge keep talent comfortable between looks.',
  },
  {
    key: 'neon',
    owner: 'daniel',
    title: 'Neon Alley Creative Set',
    category: 'Photo Studio',
    hourlyRate: 55,
    securityDeposit: 120,
    maxCapacity: 10,
    location: '2150 E 7th St, Arts District, Los Angeles, CA',
    image: img('1500462918059-b1a0cb512f1d'),
    gallery: [img('1542038784456-1ea8e935640e'), img('1626379953822-baec19c3accd'), img('1554048612-b6a482bc67e5')],
    amenities: ['RGB LED Lighting', 'Haze Machine', 'Bluetooth Sound System', 'Changing Room', 'Free Parking', 'High-Speed Wi-Fi'],
    overview:
      'A moody, color-saturated set with programmable RGB tubes, a mirrored corridor and a haze machine for atmosphere. It is a favourite for music-video cutaways, album artwork and social campaigns that need a bold, cinematic look without a big build day.',
  },
  {
    key: 'stage9',
    owner: 'lucas',
    title: 'Stage 9 Cinema Sound Stage',
    category: 'Sound Stage',
    hourlyRate: 240,
    securityDeposit: 1000,
    maxCapacity: 60,
    location: '112 Avenue du Président Wilson, Saint-Denis, Paris',
    image: img('1478720568477-152d9b164e26'),
    gallery: [img('1485846234645-a62644f84728'), img('1574717024653-61fd2cf4d44d'), img('1626379953822-baec19c3accd')],
    amenities: ['Soundproofing', 'Lighting Grid', 'Green Screen', 'Loading Dock', 'Production Office', 'Makeup Station', 'Kitchenette', 'Free Parking'],
    overview:
      'An 8,000 sq ft acoustically treated stage with a 9-metre lighting grid, three-wall green screen and a drive-in loading dock. Production offices, a wardrobe room and two makeup stations sit just off the floor. Built for commercials, narrative shorts and branded content that need full control over sound and light.',
  },
  {
    key: 'blackout',
    owner: 'noah',
    title: 'Blackout Live Performance Stage',
    category: 'Sound Stage',
    hourlyRate: 180,
    securityDeposit: 600,
    maxCapacity: 120,
    location: '201 Shoreditch High St, London',
    image: img('1507676184212-d03ab07a01bf'),
    gallery: [img('1598387993441-a364f854c3e1'), img('1551818255-e6e10975bc17'), img('1516280440614-37939bbacd81')],
    amenities: ['PA System', 'Lighting Grid', 'Haze Machine', 'Soundproofing', 'Green Room', 'Loading Dock', 'Wheelchair Access'],
    overview:
      'A black-box performance stage with a 12 kW PA, intelligent moving lights and a raised 8-metre stage. Ideal for live sessions, showcase gigs, rehearsals with full production and multi-camera concert filming. A private green room and step-free access make load-in easy for every crew.',
  },
  {
    key: 'glasshouse',
    owner: 'priya',
    title: 'Glasshouse Loft Production Floor',
    category: 'Sound Stage',
    hourlyRate: 150,
    securityDeposit: 500,
    maxCapacity: 40,
    location: 'Köpenicker Str. 70, Kreuzberg, Berlin',
    image: img('1497366811353-6870744d04b2'),
    gallery: [img('1600508774634-4e11d34730e2'), img('1485846234645-a62644f84728'), img('1574717024653-61fd2cf4d44d')],
    amenities: ['Natural Light', 'Lighting Grid', 'Production Office', 'Kitchenette', 'Freight Elevator', 'High-Speed Wi-Fi', 'Lounge Area'],
    overview:
      'A converted glass-walled factory floor with polished concrete, exposed beams and sweeping city views. Directors use it for interviews, fashion films and lifestyle commercials. A freight elevator, an overhead rigging grid and a separate client lounge make it work for crews of up to forty.',
  },
  {
    key: 'micdrop',
    owner: 'daniel',
    title: 'The Mic Drop Podcast Lounge',
    category: 'Podcast Room',
    hourlyRate: 40,
    securityDeposit: 50,
    maxCapacity: 4,
    location: '3301 Sunset Blvd, Silver Lake, Los Angeles, CA',
    image: img('1581368135153-a506cf13b1e1'),
    gallery: [img('1589903308904-1010c2294adc'), img('1590602847861-f357a9332bbc'), img('1558403194-611308249627')],
    amenities: ['Acoustic Treatment', 'Shure SM7B Mics', 'Rodecaster Pro', '4K Cameras', 'Engineer On Request', 'High-Speed Wi-Fi', 'Coffee Bar'],
    overview:
      'A warm, wood-panelled lounge tuned for natural-sounding conversation. Four SM7B microphones run into a Rodecaster Pro, and three 4K cameras capture video-podcast angles automatically. Walk out with multitrack audio and synced video on a drive, or ask for an on-site engineer to run the session for you.',
  },
  {
    key: 'velvet',
    owner: 'demo',
    title: 'Velvet Booth Interview Studio',
    category: 'Podcast Room',
    hourlyRate: 35,
    securityDeposit: 40,
    maxCapacity: 3,
    location: 'Gulshan Avenue, Gulshan 2, Dhaka',
    image: img('1478737270239-2f02b77fc618'),
    gallery: [img('1511671782779-c97d3d27a1d4'), img('1516280440614-37939bbacd81'), img('1590602847861-f357a9332bbc')],
    amenities: ['Acoustic Treatment', 'Vocal Booth', 'Shure SM7B Mics', 'Air Conditioning', 'High-Speed Wi-Fi'],
    overview:
      'A compact, fully treated booth designed for voice-overs, interviews and solo shows. A floating floor and velvet acoustic panels keep the room completely dead, so every recording comes out clean. Plug-and-play USB-C recording means you can be live in five minutes.',
  },
  {
    key: 'streamline',
    owner: 'aiko',
    title: 'Streamline Video Podcast Suite',
    category: 'Podcast Room',
    hourlyRate: 70,
    securityDeposit: 120,
    maxCapacity: 5,
    location: '1-12-3 Jinnan, Shibuya, Tokyo',
    image: img('1598550476439-6847785fcea6'),
    gallery: [img('1589903308904-1010c2294adc'), img('1558403194-611308249627'), img('1581368135153-a506cf13b1e1')],
    amenities: ['4K Cameras', 'Live Streaming Setup', 'RGB LED Lighting', 'Acoustic Treatment', 'Teleprompter', 'Engineer On Request'],
    overview:
      'A broadcast-ready suite for video podcasts, livestreams and creator interviews. An ATEM switcher, three PTZ cameras and a teleprompter are wired in, and a 1 Gbps line lets you stream to any platform in 4K. Swap the RGB backdrop to match your brand colours in seconds.',
  },
  {
    key: 'analog',
    owner: 'noah',
    title: 'Analog Heart Recording Suite',
    category: 'Music Suite',
    hourlyRate: 95,
    securityDeposit: 250,
    maxCapacity: 8,
    location: '1006 Woodland St, East Nashville, TN',
    image: img('1598488035139-bdbb2231ce04'),
    gallery: [img('1618609378039-b572f64c5b42'), img('1563330232-57114bb0823c'), img('1598653222000-6b7b7a552625')],
    amenities: ['Mixing Console', 'Vocal Booth', 'Backline Instruments', 'Acoustic Treatment', 'Engineer On Request', 'Lounge Area', 'Kitchenette'],
    overview:
      'A tracking and mixing suite built around a vintage 24-channel analog console, with a live room for full bands and an isolated vocal booth. A curated wall of guitars, a tuned upright piano and a vintage drum kit are included. Book with or without one of our in-house engineers.',
  },
  {
    key: 'brickroom',
    owner: 'lucas',
    title: 'Brickroom Drum & Band Rehearsal',
    category: 'Music Suite',
    hourlyRate: 30,
    securityDeposit: 60,
    maxCapacity: 7,
    location: '56 Bogart St, Bushwick, Brooklyn, NY',
    image: img('1514320291840-2e0a9bf2a9ae'),
    gallery: [img('1519892300165-cb5542fb47c7'), img('1511379938547-c1f69419868d'), img('1510915361894-db8b60106cb1')],
    amenities: ['Backline Instruments', 'PA System', 'Soundproofing', 'Air Conditioning', 'Instrument Storage', 'High-Speed Wi-Fi'],
    overview:
      'A loud-and-proud rehearsal room with exposed brick, a full drum kit, two guitar amps, a bass rig and a four-channel PA. Floating walls mean you can play at full volume any time of day. Lockable storage is available for bands that rehearse here every week.',
  },
  {
    key: 'keys',
    owner: 'aiko',
    title: 'Keys & Vinyl Producer Suite',
    category: 'Music Suite',
    hourlyRate: 50,
    securityDeposit: 100,
    maxCapacity: 4,
    location: '788 Queen St W, Toronto, ON',
    image: img('1598653222000-6b7b7a552625'),
    gallery: [img('1563330232-57114bb0823c'), img('1619983081563-430f63602796'), img('1520523839897-bd0b52f945a0')],
    amenities: ['Studio Monitors', 'MIDI Keyboards', 'Vocal Booth', 'Turntables', 'Acoustic Treatment', 'High-Speed Wi-Fi'],
    overview:
      'A producer-first room with Genelec monitors, an 88-key weighted controller, a pair of turntables and a crate of sample-ready vinyl. A small vocal booth sits behind the glass for toplines and ad-libs. Perfect for beat-making, songwriting camps and stem mixing.',
  },
  {
    key: 'pigment',
    owner: 'maya',
    title: 'Pigment & Canvas Painting Atelier',
    category: 'Art Workshop',
    hourlyRate: 28,
    securityDeposit: 40,
    maxCapacity: 15,
    location: 'Rua de São Miguel 18, Alfama, Lisbon',
    image: img('1460661419201-fd4cecdf8a8b'),
    gallery: [img('1513364776144-60967b0f800f'), img('1452802447250-470a88ac82bc'), img('1541961017774-22349e4a1262')],
    amenities: ['Natural Light', 'Easels', 'Utility Sink', 'Art Supplies', 'Drying Racks', 'High-Speed Wi-Fi'],
    overview:
      'A sun-washed atelier with tall windows, twelve studio easels and a deep utility sink. Acrylics, oils and brushes can be added to any booking, and drying racks let multi-day projects stay put. Popular with painting classes, private workshops and artists preparing for a show.',
  },
  {
    key: 'kiln',
    owner: 'demo',
    title: 'Kiln House Ceramics Workshop',
    category: 'Art Workshop',
    hourlyRate: 38,
    securityDeposit: 80,
    maxCapacity: 10,
    location: 'Road 27, Dhanmondi, Dhaka',
    image: img('1565193566173-7a0ee3dbe261'),
    gallery: [img('1610701596007-11502861dcfa'), img('1452860606245-08befc0ff44b'), img('1581291518857-4e27b48ff24e')],
    amenities: ['Pottery Wheels', 'Electric Kiln', 'Utility Sink', 'Art Supplies', 'Air Conditioning', 'Drying Racks'],
    overview:
      'A hands-on ceramics studio with six pottery wheels, a hand-building table and a large electric kiln. Clay, glazes and tools are available on site. Use it for team-building workshops, small classes or focused making days, and we will fire your finished pieces for you.',
  },
  {
    key: 'sketchbook',
    owner: 'priya',
    title: 'Sketchbook Illustration Studio',
    category: 'Art Workshop',
    hourlyRate: 22,
    securityDeposit: 30,
    maxCapacity: 12,
    location: '100 Feet Rd, Indiranagar, Bengaluru',
    image: img('1581092160562-40aa08e78837'),
    gallery: [img('1581291518857-4e27b48ff24e'), img('1452860606245-08befc0ff44b'), img('1515405295579-ba7b45403062')],
    amenities: ['Drafting Tables', 'Natural Light', 'Projector', 'Art Supplies', 'High-Speed Wi-Fi', 'Coffee Bar'],
    overview:
      'A bright, quiet studio fitted with adjustable drafting tables, daylight lamps and a projector for life-drawing references and live demos. Great for illustration meetups, storyboard sessions and comic-art workshops, with a coffee bar to keep the pencils moving.',
  },
];

// Review text pools per category; ratings vary so averages look natural.
const reviewPool = {
  'Photo Studio': [
    [5, 'The light in this space is unreal. We shot a 40-look e-commerce day and never once fought with shadows.'],
    [5, 'Host had the strobes set up before we arrived. Tethering desk and steamer saved us so much time.'],
    [4, 'Great backdrops and a comfortable makeup corner. Parking nearby was a little tricky in the afternoon.'],
    [5, 'Booked it for headshots and ended up staying for a product shoot too. Spotless and very well equipped.'],
  ],
  'Sound Stage': [
    [5, 'Completely silent once the doors close. Our boom op was thrilled, and the grid made lighting fast.'],
    [4, 'Huge floor, easy load-in and a helpful stage manager. Wi-Fi in the production office was a bit slow.'],
    [5, 'We filmed a full commercial here in one day. The green screen is evenly lit and the crew areas are great.'],
    [5, 'Booking was smooth and the space matched the photos exactly. Will absolutely bring our next project here.'],
  ],
  'Podcast Room': [
    [5, 'Our first episode sounded professional straight away. Zero echo and the mics are top quality.'],
    [5, 'Camera angles were pre-framed and the audio came out synced. Perfect for our video podcast.'],
    [4, 'Cosy, well treated room. Would love one more headphone amp, but the engineer sorted us out.'],
    [5, 'Walked in, hit record, walked out with clean files. This is how podcast studios should work.'],
  ],
  'Music Suite': [
    [5, 'The console sounds incredible and the live room has such a nice natural reverb. Tracked four songs in a day.'],
    [5, 'Backline was in great shape and the engineer knew exactly how to get the drum sound we wanted.'],
    [4, 'Fantastic room for writing sessions. The lounge is comfortable for long nights.'],
    [5, 'Clean monitoring, tuned piano and a host who clearly cares about musicians. Booking again next month.'],
  ],
  'Art Workshop': [
    [5, 'Ran a 12-person workshop and everyone had plenty of space. The natural light is beautiful for painting.'],
    [4, 'Supplies were well organised and the sink is a lifesaver. A couple more stools would be nice.'],
    [5, 'Our team-building day was a hit. The host walked everyone through the basics and fired our pieces.'],
    [5, 'Quiet, bright and inspiring. Exactly the kind of studio you want for focused making days.'],
  ],
};

export function reviewsFor(studio, index) {
  const pool = reviewPool[studio.category];
  const count = 2 + (index % 3); // 2–4 reviews each
  const reviewers = creators.filter((c) => c.email !== studio.ownerEmail);
  return Array.from({ length: count }, (_, i) => {
    const [rating, comment] = pool[(index + i) % pool.length];
    const reviewer = reviewers[(index * 3 + i) % reviewers.length];
    const daysAgo = 5 + i * 9 + index;
    return { rating, comment, reviewer, daysAgo };
  });
}

export const dayOffset = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Bookings that make every dashboard state visible:
 * the examiner sees each status as a guest and has requests to act on as a host,
 * including a pending request that overlaps a confirmed one (to demo conflict checks).
 */
export const bookingPlan = [
  { studio: 'analog', guest: 'demo', day: 5, start: '14:00', end: '18:00', guests: 4, status: 'Pending', notes: 'Tracking drums and bass for two songs.' },
  { studio: 'cyc', guest: 'demo', day: 2, start: '10:00', end: '14:00', guests: 6, status: 'Confirmed', notes: 'Spring lookbook shoot, 12 looks.' },
  { studio: 'micdrop', guest: 'demo', day: -6, start: '09:00', end: '12:00', guests: 3, status: 'Completed', notes: 'Pilot episode recording.' },
  { studio: 'stage9', guest: 'demo', day: -2, start: '08:00', end: '12:00', guests: 20, status: 'Cancelled', notes: 'Commercial test day.' },
  { studio: 'softbox', guest: 2, day: 3, start: '15:00', end: '18:00', guests: 3, status: 'Pending', notes: 'Corporate headshots for a small team.' },
  { studio: 'velvet', guest: 5, day: 4, start: '10:00', end: '12:00', guests: 2, status: 'Pending', notes: 'Interview episode with a guest author.' },
  { studio: 'kiln', guest: 1, day: 6, start: '13:00', end: '16:00', guests: 8, status: 'Confirmed', notes: 'Team pottery afternoon.' },
  { studio: 'kiln', guest: 3, day: 6, start: '14:00', end: '17:00', guests: 5, status: 'Pending', notes: 'Hand-building class for beginners.' },
  { studio: 'softbox', guest: 7, day: -10, start: '11:00', end: '13:00', guests: 2, status: 'Completed', notes: 'Product flat-lays.' },
  { studio: 'neon', guest: 4, day: 1, start: '12:00', end: '16:00', guests: 6, status: 'Confirmed', notes: 'Music video cutaways.' },
];

export const wishlistPlan = ['analog', 'streamline', 'pigment'];
