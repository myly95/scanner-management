<script>
  const scriptURL = "https://script.google.com/a/macros/thrivemarket.com/s/AKfycbyMy2GI0mY2kJ--5uhpNRv_EaP76jwJvFTgTjqe6_6F0WwOCtY3tSXfw1H43Agr0gtxwg/exec";

  let mode = "Sortie";

  function setMode(selectedMode) {
    mode = selectedMode;
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => {
      if (btn.textContent === selectedMode) btn.classList.add('active');
    });
    clearStatus();
    resetForm();
  }

  function clearStatus() {
    const status = document.getElementById("statusMessage");
    status.textContent = "";
    status.classList.remove("error");
  }

  function setStatus(message, isError = false) {
    const status = document.getElementById("statusMessage");
    status.textContent = message;
    if (isError) status.classList.add("error");
    else status.classList.remove("error");
  }

  function resetForm() {
    document.getElementById("badgeId").value = "";
    document.getElementById("scannerId").value = "";
    document.getElementById("badgeId").focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const badgeInput = document.getElementById("badgeId");
    const scannerInput = document.getElementById("scannerId");
    const badgeId = badgeInput.value.trim();
    const scannerId = scannerInput.value.trim();

    if (!badgeId || !scannerId) {
      setStatus("Veuillez scanner le badge et le scanneur.", true);
      return;
    }

    setStatus("Envoi en cours...");
    e.target.querySelector("button").disabled = true;
    
fetch("https://script.google.com/a/macros/thrivemarket.com/s/AKfycbyMy2GI0mY2kJ--5uhpNRv_EaP76jwJvFTgTjqe6_6F0WwOCtY3tSXfw1H43Agr0gtxwg/exec", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    badgeId: "B123",
    scannerId: "S456",
    mode: "Sortie"
  })
})
.then(res => res.json())
.then(data => {
  console.log("Réponse:", data);
})
.catch(err => {
  console.error("Erreur:", err);
});

    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId, scannerId, mode }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.message || "Action enregistrée avec succès.");
        resetForm();
        refreshLists();
      } else {
        setStatus(data.message || "Erreur lors de l'enregistrement.", true);
      }
    } catch (error) {
      setStatus("Erreur de communication avec le serveur.", true);
      console.error(error);
    }

    e.target.querySelector("button").disabled = false;
  }

  async function refreshLists() {
    try {
      const res = await fetch(scriptURL);
      const data = await res.json();

      const availableList = document.getElementById("availableList");
      const borrowedList = document.getElementById("borrowedList");

      if (Array.isArray(data.availableScanners) && data.availableScanners.length) {
        availableList.innerHTML = data.availableScanners.map(sc => `<li>${sc}</li>`).join('');
      } else {
        availableList.innerHTML = "<li>Aucun scanneur disponible</li>";
      }

      if (Array.isArray(data.borrowedBadges) && data.borrowedBadges.length) {
        borrowedList.innerHTML = data.borrowedBadges
          .map(b => `<li>${b.name} (${b.badgeId}) - Scanneur #${b.scannerId || '?'}</li>`)
          .join('');
      } else {
        borrowedList.innerHTML = "<li>Aucun badge en emprunt</li>";
      }
    } catch (err) {
      console.error("Erreur chargement listes:", err);
    }
  }

  window.addEventListener('load', () => {
    setMode("Sortie");
    refreshLists();

    const form = document.getElementById("borrowForm");
    form.addEventListener("submit", handleSubmit);
  });
</script>

