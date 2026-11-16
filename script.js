/* =========================================================
   Remboursement+ : script.js
   Maquette pédagogique (sensibilisation au phishing).

   RÈGLES DE SÉCURITÉ RESPECTÉES DANS CE FICHIER :
   - Aucune lecture de valeur de champ bancaire (numéro, expiration,
     CVC, titulaire). Ces champs n'ont pas d'attribut "name" et ne
     sont jamais référencés ici.
   - Aucun FormData, aucun accès .value sur les champs sensibles.
   - Aucun appel réseau : pas de fetch, XMLHttpRequest, WebSocket,
     sendBeacon, EventSource, etc.
   - Aucun stockage : pas de localStorage, sessionStorage, cookie.
   - Le JavaScript sert uniquement à l'expérience visuelle.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Panneau d'aide ---------- */
  var helpBtn = document.getElementById("helpBtn");
  var helpPanel = document.getElementById("helpPanel");
  var helpClose = document.getElementById("helpClose");

  function openHelp() {
    helpPanel.hidden = false;
    helpBtn.setAttribute("aria-expanded", "true");
  }
  function closeHelp() {
    helpPanel.hidden = true;
    helpBtn.setAttribute("aria-expanded", "false");
  }
  if (helpBtn && helpPanel) {
    helpBtn.addEventListener("click", function () {
      helpPanel.hidden ? openHelp() : closeHelp();
    });
  }
  if (helpClose) helpClose.addEventListener("click", closeHelp);

  // Fermer l'aide en cliquant à l'extérieur ou avec Échap
  document.addEventListener("click", function (e) {
    if (
      helpPanel &&
      !helpPanel.hidden &&
      !helpPanel.contains(e.target) &&
      e.target !== helpBtn &&
      !helpBtn.contains(e.target)
    ) {
      closeHelp();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && helpPanel && !helpPanel.hidden) closeHelp();
  });

  /* ---------- Validation visuelle de la case d'acceptation ---------- */
  var consent = document.getElementById("consent");
  var submitBtn = document.getElementById("submitBtn");

  /* ---------- Notifications (toasts) ---------- */
  var toastZone = document.getElementById("toastZone");

  function showToast(message, success) {
    if (!toastZone) return;

    var toast = document.createElement("div");
    toast.className = "toast";

    if (success) {
      var ico = document.createElement("span");
      ico.className = "toast-ico";
      ico.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4 4 10-10" ' +
        'fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" ' +
        'stroke-linejoin="round"/></svg>';
      toast.appendChild(ico);
    }

    var text = document.createElement("span");
    text.textContent = message; // texte fixe : aucune valeur de champ utilisée
    toast.appendChild(text);

    toastZone.appendChild(toast);

    // Disparition automatique avec animation de sortie
    window.setTimeout(function () {
      toast.classList.add("is-leaving");
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 240);
    }, 4200);
  }

  /* ---------- Overlay : traitement puis confirmation ---------- */
  var overlay = document.getElementById("processOverlay");
  var stageLoading = document.getElementById("stageLoading");
  var stageSuccess = document.getElementById("stageSuccess");
  var processClose = document.getElementById("processClose");
  var trackRef = document.getElementById("trackRef");
  var processTimer = null;

  // Génère une référence de suivi purement décorative.
  // Elle repose uniquement sur l'horloge et le hasard : AUCUNE valeur
  // de champ (bancaire ou autre) n'est lue pour la construire.
  function makeRef() {
    var raw = (Date.now().toString(36) + Math.random().toString(36).slice(2));
    var out = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    return "RB-" + out;
  }

  function openProcess() {
    if (!overlay) return;
    // Toujours (ré)afficher d'abord l'étape de chargement.
    if (stageSuccess) stageSuccess.hidden = true;
    if (stageLoading) stageLoading.hidden = false;
    overlay.hidden = false;
    document.body.style.overflow = "hidden"; // verrouille le défilement

    // Après un court instant, bascule vers la confirmation.
    processTimer = window.setTimeout(function () {
      if (trackRef) trackRef.textContent = makeRef();
      if (stageLoading) stageLoading.hidden = true;
      if (stageSuccess) stageSuccess.hidden = false;
    }, 2400);
  }

  function closeProcess() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (processTimer) {
      window.clearTimeout(processTimer);
      processTimer = null;
    }
  }

  if (processClose) processClose.addEventListener("click", closeProcess);

  /* ---------- Soumission du formulaire ---------- */
  var form = document.getElementById("refundForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      // Empêche toute navigation / envoi réseau par défaut.
     

      // Exige la case d'acceptation, uniquement pour l'ergonomie.
      if (consent && !consent.checked) {
        showToast(
          "Veuillez cocher la case pour poursuivre la démonstration.",
          false
        );
        // Mise en évidence visuelle de la case
        var box = consent.nextElementSibling;
        if (box) {
          box.style.borderColor = "#b4341f";
          window.setTimeout(function () {
            box.style.borderColor = "";
          }, 1200);
        }
        return;
      }

      // Lance l'animation « veuillez patienter » puis l'écran de confirmation.
      // Aucune valeur de champ n'est lue, copiée ni transmise.
      openProcess();
    });
  }

  /* ---------- Fenêtre « Suivre ma demande » ---------- */
  var trackBtn = document.getElementById("trackBtn");
  var trackModal = document.getElementById("trackModal");
  var trackClose = document.getElementById("trackClose");
  var trackStageForm = document.getElementById("trackStageForm");
  var trackStageResult = document.getElementById("trackStageResult");
  var trackInput = document.getElementById("trackInput");
  var trackError = document.getElementById("trackError");
  var trackSearch = document.getElementById("trackSearch");
  var trackBack = document.getElementById("trackBack");
  var trackResultRef = document.getElementById("trackResultRef");

  function openTrackModal() {
    if (!trackModal) return;
    if (trackStageResult) trackStageResult.hidden = true;
    if (trackStageForm) trackStageForm.hidden = false;
    if (trackError) trackError.hidden = true;
    trackModal.hidden = false;
    document.body.style.overflow = "hidden";
    if (trackInput) {
      window.setTimeout(function () { trackInput.focus(); }, 60);
    }
  }
  function closeTrackModal() {
    if (!trackModal) return;
    trackModal.hidden = true;
    document.body.style.overflow = "";
  }

  // Recherche : affiche l'état correspondant au numéro saisi.
  // Le numéro de demande n'est pas une donnée sensible ; il sert
  // uniquement à être réaffiché dans le récapitulatif de suivi.
  function runTrackSearch() {
    var ref = trackInput ? trackInput.value.trim() : "";
    if (!ref) {
      if (trackError) trackError.hidden = false;
      if (trackInput) trackInput.focus();
      return;
    }
    if (trackError) trackError.hidden = true;
    if (trackResultRef) trackResultRef.textContent = ref.toUpperCase();
    if (trackStageForm) trackStageForm.hidden = true;
    if (trackStageResult) trackStageResult.hidden = false;
  }

  if (trackBtn) {
    trackBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openTrackModal();
    });
  }
  if (trackClose) trackClose.addEventListener("click", closeTrackModal);
  if (trackSearch) trackSearch.addEventListener("click", runTrackSearch);
  if (trackInput) {
    trackInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); runTrackSearch(); }
      if (trackError && !trackError.hidden) trackError.hidden = true;
    });
  }
  if (trackBack) {
    trackBack.addEventListener("click", function () {
      if (trackStageResult) trackStageResult.hidden = true;
      if (trackStageForm) trackStageForm.hidden = false;
      if (trackInput) { trackInput.value = ""; trackInput.focus(); }
    });
  }
  // Fermer avec Échap ou en cliquant sur le fond.
  if (trackModal) {
    trackModal.addEventListener("click", function (e) {
      if (e.target === trackModal) closeTrackModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && trackModal && !trackModal.hidden) closeTrackModal();
  });

  /* ---------- Bouton « Contacter le support » (démo) ---------- */
  var supportBtn = document.getElementById("supportBtn");
  if (supportBtn) {
    supportBtn.addEventListener("click", function () {
      showToast(
        "Support (démonstration) : ceci est une maquette locale, aucun service n'est contacté.",
        false
      );
    });
  }
})();
