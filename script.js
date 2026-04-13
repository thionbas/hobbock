const { jsPDF } = window.jspdf;

let selectedGhs = [];

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
            if (selectedGhs.length >= 5) return;
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
        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
        
        const color = document.getElementById('bgColor').value;
        const topText = document.getElementById('topText').value;
        const signal = document.getElementById('signal').value;
        const botText = document.getElementById('botText').value;
        const fontSize = parseInt(document.getElementById('fontSize').value);

        const colors = { 
            white:[255,255,255], yellow:[253,224,71], red:[239,68,68], 
            brown:[120,53,15], green:[34,197,94], blue:[59,130,246], violet:[168,85,247] 
        };

        const isDark = ['red', 'blue', 'brown', 'violet'].includes(color);
        const textColor = isDark ? 255 : 0;
        
        for (let i = 0; i < 4; i++) {
            const x = (i % 2) * 148.5;
            const y = Math.floor(i / 2) * 105;
            const cx = x + 74.25; 

            // 1. Hintergrund
            doc.setFillColor(...colors[color]);
            doc.rect(x, y, 148.5, 105, 'F');
            
            doc.setTextColor(textColor);
            
            // 2. Text Oben
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", "bold");
            doc.text(topText.toUpperCase(), cx, y + 35, { align: 'center', maxWidth: 135 });

            // 3. Mitte (GHS Symbole)
            // HIER: Icon-Größe von 18 auf 12 reduziert
            const iconSize = 12;
            const gap = 4;
            const totalGhsWidth = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
            const startX = cx - (totalGhsWidth / 2);
            
            selectedGhs.forEach((id, g) => {
                // y-Position leicht nach unten korrigiert (y + 48), um den gewonnenen Platz auszugleichen
                doc.addImage(`ghs_${id}.png`, 'PNG', startX + (g * (iconSize + gap)), y + 48, iconSize, iconSize);
            });

            // 4. Signalwort
            if (signal) {
                doc.setFontSize(22);
                doc.setFont("helvetica", "bolditalic");
                doc.text(signal, cx, y + 75, { align: 'center' });
            }

            // 5. Unten (Sonstiges)
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

updatePreview();
