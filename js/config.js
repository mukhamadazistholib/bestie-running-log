const CONFIG = {
  ENDPOINT_URL:
    "https://script.google.com/macros/s/AKfycbz-0G84z4YsZUQL_SV9E66qfQG2oOcJBGLuGUebAdsRiR0eXVtHkv3i8TzQ81cKDT1vag/exec",
  PROFILE: {
    name: "Bestie",
    bio: "Take it one step at a time and keep smiling 🌸",
    photo: "", // empty = default pixel avatar; enter a photo URL if desired
  },
  TICKER: [
    "RUN STRONG, BESTIE",
    "YOU CAN DO IT",
    "ONE STEP AT A TIME",
    "STAY HYDRATED",
    "PROUD OF YOU",
  ],
  SPOTIFY: "", // kode embed iframe / link playlist Spotify. Kosong = tombol piringan hitam disembunyikan
  BUBBLE_INTERVAL_MS: 3500,
  BUBBLE_DURATION_S: 12,
};

const _d = (n, h = 6, m = 30) => {
  const d = new Date(Date.now() + n * 864e5);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const MOCK_DATA = {
  events: [
    {
      id: 1,
      icon: "🏃‍♀️",
      title: "Fun Run 5K",
      description: "A relaxed run with your bestie",
      time: _d(-12),
      status: "done",
    },
    {
      id: 2,
      icon: "🌷",
      title: "Sunday Morning Jog",
      description: "A lap around the park with your favorite music",
      time: _d(-3),
      status: "done",
    },
    {
      id: 3,
      icon: "🎀",
      title: "Pink Run Jakarta",
      description: "Don't forget your ribbon and pink shirt!",
      time: _d(4),
      status: "pending",
    },
    {
      id: 4,
      icon: "🧁",
      title: "Half Marathon 10K",
      description: "The reward is a cupcake 🧁",
      time: _d(15),
      status: "pending",
    },
    {
      id: 5,
      icon: "⭐",
      title: "Bromo Sunrise Run",
      description: "Strike your best pose",
      time: _d(40),
      status: "pending",
    },
  ],
  semangat: [
    { name: "Dinda", message: "Keep going, bestie—you've got this! 💗" },
    { name: "Anonymous", message: "Almost at the finish line—keep going!! ✨" },
    { name: "Bagas", message: "You're going to crush that new PR 💪" },
  ],
};
