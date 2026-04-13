const { jsPDF } = window.jspdf;

let selectedGhs = [];

// GHS Picker generieren
const ghsPicker = document.getElementById('ghsPicker');
for (let i = 1; i <= 9; i++) {
    const id = i.toString().padStart(3, '0');
    const div = document.createElement('div');
    div.className = "flex justify-center p-2 border-2 rounded cursor-pointer bg-white hover:border-[#064e3b] transition-all";
    div.innerHTML = `<img src="ghs_${id}.png" class="w-8 h-8 object-contain pointer-events-none">`;
    div.onclick = () => {
        if (selectedGhs.includes(id)) {
            selectedGhs = selectedGhs.filter(g => g !== id);
            div.classList.remove('bg-green-100', 'border-green-600');
        } else {
            if (selectedGhs.length >= 5) return; // Maximal 5 auf A6
            selectedGhs.push(id);
            div.classList.add('bg-green-100', 'border-green-600');
        }
        updatePreview();
    };
    ghsPicker.appendChild(div);
}

function updatePreview() {
    const color = document.getElementById('bgColor').value;
    const topText = document.getElementById('topText').value || "NUMMER";
    const signal = document.getElementById('signal').value;
    const botText = document.getElementById('botText').value || "";
    const fontSize = document.getElementById('fontSize').value;
    
    document.getElementById('fontSizeVal').innerText = fontSize;

    const card = document.getElementById('previewCard');
    card.className = `label-box bg-${color}`;
    
    document.getElementById('pTop').innerText = topText;
    document.getElementById('pSignal').innerText = signal;
    document.getElementById('pBot').innerText = botText;

    // Vorschau-Skalierung für A6 (Breite: 148.5mm)
    const previewWidth = card.offsetWidth;
    const scaleFactor = previewWidth / 148.5;
    document.getElementById('pTop').style.fontSize = (fontSize * 0.3527 * scaleFactor) + "px";

    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    selectedGhs.forEach(id => {
        const img = document.createElement('img');
        img.src = `ghs_${id}.png`;
        ghsZone.appendChild(img);
    });
}

document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', updatePreview));

document.getElementById('pdfBtn').onclick = () => {
    try {
        // A4 im Querformat (Landscape)
        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
        
        const color = document.getElementById('bgColor').value;
        const topText = document.getElementById('topText').value;
        const signal = document.getElementById('signal').value;
        const botText = document.getElementById('botText').value;
        const fontSize = parseInt(document.getElementById('fontSize').value);

        // Harte RGB Werte
        const colors = { 
            white:[255,255,255], yellow:[253,224,71], red:[239,68,68], 
            brown:[120,53,15], green:[34,197,94], blue:[59,130,246], violet:[168,85,247] 
        };

        const isDark = ['red', 'blue', 'brown', 'violet'].includes(color);
        const textColor = isDark ? 255 : 0;

        // Wir drucken 4 Schilder (A6) auf das A4 Querformat
        // Schild 0: Oben Links (x=0, y=0)
        // Schild 1: Oben Rechts (x=148.5, y=0)
        // Schild 2: Unten Links (x=0, y=105)
        // Schild 3: Unten Rechts (x=148.5, y=105)
        
        for (let i = 0; i < 4; i++) {
            const x = (i % 2) * 148.5;
            const y = Math.floor(i / 2) * 105;
            const cx = x + 74.25; // Horizontale Mitte des A6 Schildes

            // 1. Hintergrund zeichnen
            doc.setFillColor(...colors[color]);
            doc.rect(x, y, 148.5, 105, 'F');
            
            // Textfarbe setzen
            doc.setTextColor(textColor);
            
            // 2. Text Oben (Nummer/Bezeichnung)
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", "bold");
            // y + 35 -> Etwas oberhalb der Mitte
            doc.text(topText.toUpperCase(), cx, y + 35, { align: 'center', maxWidth: 135 });

            // 3. Mitte (GHS Symbole)
            // Icon-Größe = 18mm, Abstand = 4mm
            const iconSize = 18;
            const gap = 4;
            const totalGhsWidth = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
            const startX = cx - (totalGhsWidth / 2);
            
            selectedGhs.forEach((id, g) => {
                doc.addImage(`ghs_${id}.png`, 'PNG', startX + (g * (iconSize + gap)), y + 45, iconSize, iconSize);
            });

            // 4. Dazwischen (Signalwort)
            if (signal) {
                doc.setFontSize(22);
                doc.setFont("helvetica", "bolditalic");
                doc.text(signal, cx, y + 75, { align: 'center' });
            }

            // 5. Unten (Sonstiges Textfeld)
            if (botText) {
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(botText, cx, y + 90, { align: 'center', maxWidth: 135 });
            }
        }
        
        doc.save("Hobbock_A4_Bogen.pdf");
    } catch (error) {
        alert("Fehler beim Drucken. Bitte prüfe die Konsole.");
        console.error(error);
    }
};

// Initial rendern
updatePreview();
