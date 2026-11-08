/* Pixel art sprites: setiap karakter = 1 pixel. "." = transparan */
(function (g) {
  "use strict";
  const PAL = {
    K: "#8a3b68",
    R: "#ff5fa2",
    W: "#ffffff",
    H: "#6b4130",
    S: "#ffdcc8",
    P: "#ff9ec4",
    M: "#e0457f",
    B: "#ff7fb5",
    Y: "#fff06a",
  };
  const SPRITES = {
    heart: [
      "..KKK...KKK..",
      ".KRRRK.KRRRK.",
      "KRWRRRKRRRRRK",
      "KRRRRRRRRRRRK",
      ".KRRRRRRRRRK.",
      "..KRRRRRRRK..",
      "...KRRRRRK...",
      "....KRRRK....",
      ".....KRK.....",
      "......K......",
    ],
    mini: [".RR.RR.", "RRRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."],
    star: ["..Y..", "..Y..", "YYWYY", "..Y..", "..Y.."],
    cloud: [
      "......WWWW......",
      "....WWWWWWWW.WW.",
      "..WWWWWWWWWWWWWW",
      ".WWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
    ],
    girl: [
      ".KKKK....KKKK.",
      "KBBBBKKKKBBBBK",
      "KBWBBBKKBBBBBK",
      "....KBBBBK....",
      "....KKKKKK....",
      "..KKHHHHHHKK..",
      ".KHHHHHHHHHHK.",
      "KHHHHHHHHHHHHK",
      "KHHHHSSSSHHHHK",
      "KHHSSSSSSSSHHK",
      "KHHSKSSSSKSHHK",
      "KHHSKSSSSKSHHK",
      "KHHPSSSSSSPHHK",
      "KHHSSSMMSSSHHK",
      ".KHHSSSSSSHHK.",
      "..KKHHHHHHKK..",
      "....KKKKKK....",
    ],
  };

  function svg(name, px, over) {
    const grid = SPRITES[name],
      pal = Object.assign({}, PAL, over || {});
    const w = Math.max.apply(
        null,
        grid.map((r) => r.length),
      ),
      h = grid.length;
    let out = "";
    grid.forEach((row, y) => {
      for (let x = 0; x < row.length; ) {
        const c = row[x];
        if (c === ".") {
          x++;
          continue;
        }
        let e = x;
        while (e + 1 < row.length && row[e + 1] === c) e++;
        out += `<rect x="${x}" y="${y}" width="${e - x + 1}" height="1" fill="${pal[c]}"/>`;
        x = e + 1;
      }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges">${out}</svg>`;
  }
  function draw(ctx, name, x, y, px, over) {
    const pal = Object.assign({}, PAL, over || {});
    SPRITES[name].forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === ".") continue;
        ctx.fillStyle = pal[row[i]];
        ctx.fillRect(x + i * px, y + j * px, px, px);
      }
    });
  }
  g.PixelSprites = {
    draw: draw,
    uri: (n, px, o) =>
      "data:image/svg+xml;utf8," + encodeURIComponent(svg(n, px, o)),
  };
})(window);
