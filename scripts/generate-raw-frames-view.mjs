import fs from 'node:fs';

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Raw Frames (Overlay Only)</title>
  <style>
    body { background: #1e293b; color: white; font-family: sans-serif; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card { background: #0f172a; border-radius: 8px; padding: 12px; }
    .checkered {
      width: 100%;
      aspect-ratio: 1;
      background: repeating-conic-gradient(#475569 0% 25%, #1e293b 0% 50%) 50% / 20px 20px;
      position: relative;
    }
    img { width: 100%; height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <h1>Raw Frames: Overlay Assets Only (No Underlay Photo)</h1>
  <p>Checking for embedded candidate portraits vs purely graphic frames.</p>
  <div class="grid">`;

for (let i = 1; i <= 9; i++) {
  const id = `duo-avatar-${String(i).padStart(2, '0')}`;
  html += `
    <div class="card">
      <h3>${id}</h3>
      <div class="checkered">
        <img src="templates/paulinha-emerson/${id}.png" alt="${id}" />
      </div>
    </div>`;
}

html += `
  </div>
</body>
</html>`;

fs.writeFileSync('public/raw-frames.html', html);
console.log('Written public/raw-frames.html');
