const scriptURL = "https://script.google.com/a/macros/thrivemarket.com/s/AKfycbzJdzGfz-Iwo51Jg_IgDDd6zqZn7Z_RTw7l3ZZpKte1loSHodnv99x0qPGpESs0kxkaPg/exec";
let mode = "Sortie"; // mode par défaut

function setMode(selectedMode) {
  mode = selectedMode;
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  const btn = Array.from(document.querySelectorAll('.tab-button')).find(b => b.textContent === selectedMode);
  if (btn) btn.classList.add('active');

  clearStatus();
  document.getElementById("badgeId").value = "";
  document.getElementById("scannerId").value = "";
  document.getElementById("badgeId").focus();
}

function tryAutoSubmit() {
  const badgeIdInput = document.getElementById("badgeId");
  const scannerIdInput = document.getElementById("scannerId");

  const badgeId = badgeIdInput.value.trim();
  const scannerId = scannerIdInput.value.trim();

  if (badgeId && scannerId) {
    if (!badgeIdInput.dataset.submitting && !scannerIdInput.dataset.submitting) {
      badgeIdInput.dataset.submitting = "true";
      scannerIdInput.dataset.submitting = "true";

      document.querySelector('.scanner-form').dispatchEvent(new Event('submit'));
    }
  }
}

function clearStatus() {
  document.getElementById("statusMessage").textContent = "";
}

function setStatus(msg, isError = false) {
  const status = document.getElementById("statusMessage");
  status.textContent = msg;
  status.style.color = isError ? "#ff5555" : "#00ffc8";
}

function handleSubmit(event) {
  event.preventDefault();

  const badgeIdInput = document.getElementById("badgeId");
  const scannerIdInput = document.getElementById("scannerId");
  const badgeId = badgeIdInput.value.trim();
  const scannerId = scannerIdInput.value.trim();
  const submitBtn = event.target.querySelector("button[type=submit]");

  if (!badgeId || !scannerId) {
    setStatus("Veuillez remplir tous les champs.", true);
    badgeIdInput.dataset.submitting = "";
    scannerIdInput.dataset.submitting = "";
    return;
  }

  submitBtn.disabled = true;
  setStatus("Envoi en cours...");

  fetch(scriptURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeId, scannerId, mode })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      setStatus(data.message || "Enregistré avec succès.");
      event.target.reset();
      refreshLists();
      badgeIdInput.focus();
    } else {
      setStatus(data.message || "Erreur lors de l’enregistrement.", true);
    }
  })
  .catch(err => {
    console.error(err);
    setStatus("Erreur de connexion au serveur.", true);
  })
  .finally(() => {
    submitBtn.disabled = false;
    badgeIdInput.dataset.submitting = "";
    scannerIdInput.dataset.submitting = "";
  });
}

function refreshLists() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      const availableList = document.getElementById("availableList");
      const borrowedList = document.getElementById("borrowedList");

      if (Array.isArray(data.availableScanners)) {
        if (data.availableScanners.length === 0) {
          availableList.innerHTML = "<li>Aucun scanneur disponible</li>";
        } else {
          availableList.innerHTML = data.availableScanners
            .map(sc => `<li>${sc}</li>`).join("");
        }
      } else {
        availableList.innerHTML = "<li>Erreur chargement</li>";
      }

      if (Array.isArray(data.borrowedBadges)) {
        if (data.borrowedBadges.length === 0) {
          borrowedList.innerHTML = "<li>Aucun badge en emprunt</li>";
        } else {
          borrowedList.innerHTML = data.borrowedBadges
            .map(b => `<li>${b.name} (${b.badgeId})</li>`).join("");
        }
      } else {
        borrowedList.innerHTML = "<li>Erreur chargement</li>";
      }
    })
    .catch(err => {
      console.error("Erreur fetch listes", err);
      document.getElementById("availableList").innerHTML = "<li>Erreur chargement</li>";
      document.getElementById("borrowedList").innerHTML = "<li>Erreur chargement</li>";
    });
}

document.getElementById("badgeId").addEventListener("input", () => {
  clearStatus();
  tryAutoSubmit();
});

document.getElementById("scannerId").addEventListener("input", () => {
  clearStatus();
  tryAutoSubmit();
});

document.querySelector(".scanner-form").addEventListener("submit", handleSubmit);

setMode(mode);
refreshLists();
