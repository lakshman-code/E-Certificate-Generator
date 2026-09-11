/**
 * ADHIPARASAKTHI ENGINEERING COLLEGE - E-CERTIFICATE GENERATOR
 * Logic: Real-time Canvas Rendering, Dynamic Typography, PDF/PNG Export & Print
 */

(function () {
  'use strict';

  // Base dimensions of the certificate template (1.501 aspect ratio matching reference)
  const BASE_WIDTH = 1024;
  const BASE_HEIGHT = 682;
  const INK_COLOR = '#0e1d46'; // Sampled exact deep navy academic ink color

  let imagesLoaded = false;
  let zoomLevel = 1.0;

  // Preload Images
  const baseImg1x = new Image();
  const baseImg3x = new Image();

  // DOM Elements
  const form = document.getElementById('certForm');
  const btnTypeWinning = document.getElementById('btnTypeWinning');
  const btnTypeParticipation = document.getElementById('btnTypeParticipation');
  const titleSelect = document.getElementById('titleSelect');
  const nameInput = document.getElementById('nameInput');
  const btnClearName = document.getElementById('btnClearName');
  const yearInput = document.getElementById('yearInput');
  const prizeGroup = document.getElementById('prizeGroup');
  const prizeInput = document.getElementById('prizeInput');
  const eventInput = document.getElementById('eventInput');
  const dateInput = document.getElementById('dateInput');
  const deptInput = document.getElementById('deptInput');
  const locInput = document.getElementById('locInput');
  const collegeLineInput = document.getElementById('collegeLineInput');
  const exportScaleSelect = document.getElementById('exportScale');
  const chkShowUnderline = document.getElementById('chkShowUnderline');

  const btnGenerate = document.getElementById('btnGenerate');
  const btnDownloadPng = document.getElementById('btnDownloadPng');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnPrint = document.getElementById('btnPrint');
  const btnReset = document.getElementById('btnReset');
  const btnQuickSample = document.getElementById('btnQuickSample');

  const certCanvas = document.getElementById('certCanvas');
  const certWrapper = document.getElementById('certificateWrapper');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomFit = document.getElementById('btnZoomFit');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const zoomLevelText = document.getElementById('zoomLevelText');
  const toastContainer = document.getElementById('toastContainer');

  const quickChips = document.querySelectorAll('.prize-chips .chip, .chip');
  const yearChips = document.querySelectorAll('.chip-year');
  const presetItems = document.querySelectorAll('.preset-item');

  // State object
  const state = {
    certType: 'winning', // 'winning' or 'participation'
    title: 'MR/MRS',
    name: 'LAKSHMANAN G',
    year: 'III YEAR',
    prize: 'First Prize',
    event: 'WebGit',
    date: '12/09/2026',
    department: 'Department of Information Technology',
    location: 'Melmaruvathur',
    collegeLine: 'B.TECH-IT, ADHIPARASAKTHI ENGINEERING COLLEGE',
    showUnderline: true,
    arrangeMode: 'center',
    scale: 3
  };

  // Image loading initialization with bulletproof fallbacks
  function initImages() {
    baseImg1x.crossOrigin = 'anonymous';
    baseImg3x.crossOrigin = 'anonymous';

    baseImg1x.onload = () => {
      imagesLoaded = true;
      syncFormFromState();
      drawCertificate();
    };

    baseImg1x.onerror = () => {
      console.warn('baseImg1x failed to load data URI, falling back to assets/certificate_clean_base.png');
      if (!baseImg1x.src.endsWith('assets/certificate_clean_base.png')) {
        baseImg1x.src = 'assets/certificate_clean_base.png';
      }
    };

    baseImg3x.onload = () => {
      // 3X image ready
    };

    baseImg3x.onerror = () => {
      if (!baseImg3x.src.endsWith('assets/certificate_clean_base_300dpi.png')) {
        baseImg3x.src = 'assets/certificate_clean_base_300dpi.png';
      }
    };

    // Attach sources
    baseImg1x.src = (window.CERT_BASE_1X) ? window.CERT_BASE_1X : 'assets/certificate_clean_base.png';
    baseImg3x.src = (window.CERT_BASE_3X) ? window.CERT_BASE_3X : 'assets/certificate_clean_base_300dpi.png';

    // Synchronous complete check (happens immediately if cached or base64 data URI)
    if (baseImg1x.complete && baseImg1x.naturalWidth > 0) {
      imagesLoaded = true;
      syncFormFromState();
      drawCertificate();
    }
  }

  function syncFormFromState() {
    if (btnTypeWinning && btnTypeParticipation) {
      if (state.certType === 'participation') {
        btnTypeParticipation.classList.add('active');
        btnTypeWinning.classList.remove('active');
        if (prizeGroup) prizeGroup.style.display = 'none';
      } else {
        btnTypeWinning.classList.add('active');
        btnTypeParticipation.classList.remove('active');
        if (prizeGroup) prizeGroup.style.display = 'flex';
      }
    }

    if (titleSelect) titleSelect.value = state.title;
    if (nameInput) nameInput.value = state.name;
    if (yearInput) yearInput.value = state.year;
    if (prizeInput) prizeInput.value = state.prize;
    if (eventInput) eventInput.value = state.event;
    if (dateInput) dateInput.value = state.date;
    if (deptInput) deptInput.value = state.department;
    if (locInput) locInput.value = state.location;
    if (collegeLineInput) collegeLineInput.value = state.collegeLine;
    if (chkShowUnderline) chkShowUnderline.checked = state.showUnderline;

    updateActivePrizeChip(state.prize);
    updateActiveYearChip(state.year);
    updateActiveDateChip(state.date);
    updateActiveArrangeBtn(state.arrangeMode);
  }

  function readStateFromForm() {
    if (titleSelect) state.title = titleSelect.value;
    if (nameInput) state.name = nameInput.value.trim();
    if (yearInput) state.year = yearInput.value.trim();
    if (prizeInput) state.prize = prizeInput.value.trim();
    if (eventInput) state.event = eventInput.value.trim() || 'WebGit';
    if (dateInput) state.date = dateInput.value.trim() || '12/09/2026';
    if (deptInput) state.department = deptInput.value.trim() || 'Department of Information Technology';
    if (locInput) state.location = locInput.value.trim() || 'Melmaruvathur';
    if (collegeLineInput) state.collegeLine = collegeLineInput.value.trim() || 'B.TECH-IT, ADHIPARASAKTHI ENGINEERING COLLEGE';
    if (chkShowUnderline) state.showUnderline = chkShowUnderline.checked;
    if (exportScaleSelect) state.scale = parseInt(exportScaleSelect.value, 10) || 3;
  }

  // =========================================================================
  // Canvas Rendering Pipeline
  // =========================================================================
  function drawCertificate(targetCanvas = certCanvas, scale = 1, useHighResImg = false) {
    if (!targetCanvas) return;

    const bg = (useHighResImg && baseImg3x.complete && baseImg3x.naturalWidth > 0) ? baseImg3x : baseImg1x;
    const isReady = imagesLoaded || (bg.complete && bg.naturalWidth > 0);

    const ctx = targetCanvas.getContext('2d');
    const w = BASE_WIDTH * scale;
    const h = BASE_HEIGHT * scale;

    targetCanvas.width = w;
    targetCanvas.height = h;

    // If template image is ready, draw it; otherwise draw background fill
    if (isReady) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#fbf7ee';
      ctx.fillRect(0, 0, w, h);
    }

    // Coordinate scalers
    const s = scale;
    const leftMargin = 48 * s;
    const rightMargin = 976 * s;
    const ink = INK_COLOR;

    // Base font sizes
    let fontSize = 27 * s;
    const regularFont = (size) => `${size}px "Times New Roman", Times, Georgia, serif`;
    const boldFont = (size) => `bold ${size}px "Times New Roman", Times, Georgia, serif`;
    const italicBoldFont = (size) => `bold italic ${size}px "Times New Roman", Times, Georgia, serif`;

    // -----------------------------------------------------------------------
    // Header Title: Draw "OF PARTICIPATION" if Certificate Type is Participant
    // -----------------------------------------------------------------------
    if (state.certType === 'participation') {
      const patchY = 246 * s;
      const patchH = 44 * s;
      const patchW = 560 * s;
      const patchX = (w - patchW) / 2;

      ctx.save();
      // Seamless parchment background blend
      const patchGrad = ctx.createLinearGradient(patchX, patchY, patchX + patchW, patchY + patchH);
      patchGrad.addColorStop(0, '#fdfaf3');
      patchGrad.addColorStop(0.5, '#fefdfb');
      patchGrad.addColorStop(1, '#fdfaf3');
      ctx.fillStyle = patchGrad;
      ctx.fillRect(patchX, patchY, patchW, patchH);

      // Render "OF PARTICIPATION" in matching lustrous gold typography
      const goldGrad = ctx.createLinearGradient(0, patchY, 0, patchY + patchH);
      goldGrad.addColorStop(0, '#d49b27');
      goldGrad.addColorStop(0.45, '#c58b16');
      goldGrad.addColorStop(1, '#9e6a04');

      ctx.fillStyle = goldGrad;
      ctx.font = `bold ${31 * s}px "Cinzel", "Playfair Display", "Times New Roman", serif`;
      ctx.textAlign = 'center';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${2 * s}px`;
      }
      ctx.fillText('OF PARTICIPATION', w / 2, 278 * s);
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = '0px';
      }
      ctx.restore();
    }

    // =======================================================================
    // LINE RENDERING PIPELINE (Supports Centered, Left, and Justified Modes)
    // =======================================================================
    const mode = state.arrangeMode || 'center';
    ctx.textAlign = 'left';

    // -----------------------------------------------------------------------
    // Line 1: This is to certify that MR/MRS [NAME] of
    // -----------------------------------------------------------------------
    const y1 = 342 * s;
    const introText = 'This is to certify that  ';
    let prefix = (state.title !== 'NONE') ? (state.title + ' ') : '';
    const ofText = ' of';

    ctx.fillStyle = ink;
    ctx.font = regularFont(fontSize);
    const introWidth = ctx.measureText(introText).width;
    const ofWidth = ctx.measureText(ofText).width;

    if (state.name.length > 0) {
      const fullPerson = (prefix + state.name).toUpperCase();
      
      let nameFontSize = fontSize;
      ctx.font = boldFont(nameFontSize);
      let nameWidth = ctx.measureText(fullPerson).width;

      const maxLine1Width = (rightMargin - leftMargin) - introWidth - ofWidth - (20 * s);
      while (nameWidth > maxLine1Width && nameFontSize > 15 * s) {
        nameFontSize -= 1 * s;
        ctx.font = boldFont(nameFontSize);
        nameWidth = ctx.measureText(fullPerson).width;
      }

      const totalL1Width = introWidth + nameWidth + ofWidth;
      let startL1X = leftMargin;
      if (mode === 'center') {
        startL1X = (w - totalL1Width) / 2;
      }

      // Draw Intro
      ctx.font = regularFont(fontSize);
      ctx.fillText(introText, startL1X, y1);

      // Draw Name
      ctx.font = boldFont(nameFontSize);
      ctx.fillText(fullPerson, startL1X + introWidth, y1);

      // Draw ' of'
      ctx.font = regularFont(fontSize);
      ctx.fillText(ofText, startL1X + introWidth + nameWidth, y1);

    } else {
      // Empty Name State (Template Underline)
      const blankPrefix = prefix || 'MR/MRS ';
      ctx.font = boldFont(fontSize);
      const prefixW = ctx.measureText(blankPrefix).width;

      if (mode === 'center') {
        const dummyNameW = 260 * s;
        const totalL1W = introWidth + prefixW + dummyNameW + ofWidth;
        const startX = (w - totalL1W) / 2;

        ctx.font = regularFont(fontSize);
        ctx.fillText(introText, startX, y1);

        ctx.font = boldFont(fontSize);
        ctx.fillText(blankPrefix, startX + introWidth, y1);

        if (state.showUnderline) {
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.moveTo(startX + introWidth + prefixW + (4 * s), y1 + (2 * s));
          ctx.lineTo(startX + introWidth + prefixW + dummyNameW - (4 * s), y1 + (2 * s));
          ctx.stroke();
        }

        ctx.font = regularFont(fontSize);
        ctx.fillText(ofText, startX + introWidth + prefixW + dummyNameW, y1);
      } else {
        ctx.font = regularFont(fontSize);
        ctx.fillText(introText, leftMargin, y1);

        ctx.font = boldFont(fontSize);
        ctx.fillText(blankPrefix, leftMargin + introWidth, y1);

        const ofX = rightMargin - ofWidth;
        if (state.showUnderline) {
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.moveTo(leftMargin + introWidth + prefixW + (4 * s), y1 + (2 * s));
          ctx.lineTo(ofX - (6 * s), y1 + (2 * s));
          ctx.stroke();
        }

        ctx.font = regularFont(fontSize);
        ctx.fillText(ofText, ofX, y1);
      }
    }

    // -----------------------------------------------------------------------
    // Line 2: [YEAR] B.TECH-IT, ADHIPARASAKTHI ENGINEERING COLLEGE has won [PRIZE] / has participated
    // -----------------------------------------------------------------------
    const y2 = 384 * s;
    const yearPrefix = (state.year && state.year.trim()) ? (state.year.trim() + ' ') : '';
    const collText = yearPrefix + state.collegeLine;
    
    let actionText = '';
    let prizeText = '';
    const isParticipation = (state.certType === 'participation');

    if (isParticipation) {
      actionText = ' has participated';
      prizeText = '';
    } else {
      actionText = ' has won';
      if (state.prize && state.prize.trim()) {
        prizeText = ` ${state.prize.trim()}`;
      }
    }

    // Measure widths and auto-scale font if Line 2 exceeds bounds
    let line2FontSize = fontSize;
    ctx.font = boldFont(line2FontSize);
    let collWidth = ctx.measureText(collText).width;
    ctx.font = regularFont(line2FontSize);
    let actionWidth = ctx.measureText(actionText).width;
    ctx.font = boldFont(line2FontSize);
    let prizeWidth = prizeText ? ctx.measureText(prizeText).width : 0;

    const maxLine2Width = (rightMargin - leftMargin) - (10 * s);
    while ((collWidth + actionWidth + prizeWidth) > maxLine2Width && line2FontSize > 15 * s) {
      line2FontSize -= 0.5 * s;
      ctx.font = boldFont(line2FontSize);
      collWidth = ctx.measureText(collText).width;
      ctx.font = regularFont(line2FontSize);
      actionWidth = ctx.measureText(actionText).width;
      ctx.font = boldFont(line2FontSize);
      prizeWidth = prizeText ? ctx.measureText(prizeText).width : 0;
    }

    const totalL2Width = collWidth + actionWidth + prizeWidth;
    let startL2X = leftMargin;
    if (mode === 'center') {
      startL2X = (w - totalL2Width) / 2;
    }

    ctx.fillStyle = ink;
    ctx.font = boldFont(line2FontSize);
    ctx.fillText(collText, startL2X, y2);

    ctx.font = regularFont(line2FontSize);
    ctx.fillText(actionText, startL2X + collWidth, y2);

    if (prizeText) {
      ctx.font = boldFont(line2FontSize);
      ctx.fillText(prizeText, startL2X + collWidth + actionWidth, y2);
    }

    // -----------------------------------------------------------------------
    // Line 3: in the WebGit conducted by the Department of Information
    // -----------------------------------------------------------------------
    const y3 = 426 * s;
    const inTheText = 'in the  ';
    const eventVal = state.event || 'WebGit';
    const eventFontSize = Math.round(fontSize * 1.15);
    const conductedText = ` conducted by the ${state.department}`;

    ctx.font = regularFont(fontSize);
    const inTheWidth = ctx.measureText(inTheText).width;
    ctx.font = italicBoldFont(eventFontSize);
    const eventWidth = ctx.measureText(eventVal).width;
    ctx.font = regularFont(fontSize);
    const conductedWidth = ctx.measureText(conductedText).width;

    const totalL3Width = inTheWidth + eventWidth + (4 * s) + conductedWidth;
    let startL3X = leftMargin;
    if (mode === 'center') {
      startL3X = (w - totalL3Width) / 2;
    }

    ctx.font = regularFont(fontSize);
    ctx.fillText(inTheText, startL3X, y3);

    ctx.font = italicBoldFont(eventFontSize);
    ctx.fillText(eventVal, startL3X + inTheWidth, y3);

    ctx.font = regularFont(fontSize);
    ctx.fillText(conductedText, startL3X + inTheWidth + eventWidth + (4 * s), y3);

    // -----------------------------------------------------------------------
    // Line 4: Technology, Melmaruvathur on 12/09/2026.
    // -----------------------------------------------------------------------
    const y4 = 468 * s;
    const line4Text = `Technology, ${state.location} on ${state.date}.`;

    ctx.font = regularFont(fontSize);
    const line4Width = ctx.measureText(line4Text).width;
    let startL4X = leftMargin;
    if (mode === 'center') {
      startL4X = (w - line4Width) / 2;
    }

    ctx.fillText(line4Text, startL4X, y4);
  }

  // =========================================================================
  // Real-time Event Handlers
  // =========================================================================
  function handleInputChange() {
    readStateFromForm();
    drawCertificate();
  }

  [titleSelect, nameInput, yearInput, prizeInput, eventInput, dateInput, deptInput, locInput, collegeLineInput, chkShowUnderline].forEach(el => {
    if (el) {
      el.addEventListener('input', handleInputChange);
      el.addEventListener('change', handleInputChange);
    }
  });

  // Certificate Type Toggle (Winner vs Participant)
  if (btnTypeWinning) {
    btnTypeWinning.addEventListener('click', () => {
      state.certType = 'winning';
      btnTypeWinning.classList.add('active');
      btnTypeParticipation.classList.remove('active');
      if (prizeGroup) prizeGroup.style.display = 'flex';
      drawCertificate();
      showToast('Switched to Winner Certificate format.');
    });
  }

  if (btnTypeParticipation) {
    btnTypeParticipation.addEventListener('click', () => {
      state.certType = 'participation';
      btnTypeParticipation.classList.add('active');
      btnTypeWinning.classList.remove('active');
      if (prizeGroup) prizeGroup.style.display = 'none';
      drawCertificate();
      showToast('Switched to Participant Certificate format.');
    });
  }

  // Date Picker & Date Quick Selection Handlers
  const datePicker = document.getElementById('datePicker');
  const btnTodayDate = document.getElementById('btnTodayDate');
  const dateChips = document.querySelectorAll('.chip-date');

  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      const val = e.target.value; // YYYY-MM-DD
      if (val) {
        const parts = val.split('-');
        if (parts.length === 3) {
          const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
          dateInput.value = formatted;
          handleInputChange();
          updateActiveDateChip(formatted);
          showToast(`Date changed to: ${formatted}`);
        }
      }
    });
  }

  if (btnTodayDate) {
    btnTodayDate.addEventListener('click', () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const todayFormatted = `${dd}/${mm}/${yyyy}`;
      dateInput.value = todayFormatted;
      handleInputChange();
      updateActiveDateChip(todayFormatted);
      showToast(`Date changed to Today: ${todayFormatted}`);
    });
  }

  dateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const d = chip.getAttribute('data-date');
      if (d) {
        dateInput.value = d;
        handleInputChange();
        updateActiveDateChip(d);
        showToast(`Date changed to: ${d}`);
      }
    });
  });

  function updateActiveDateChip(currentDate) {
    dateChips.forEach(c => {
      if (c.getAttribute('data-date') === currentDate) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  // Text Arrangement Buttons & Auto-Arrange
  const arrangeButtons = document.querySelectorAll('.btn-arrange');
  const btnAutoArrangeNow = document.getElementById('btnAutoArrangeNow');

  arrangeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.getAttribute('data-mode');
      state.arrangeMode = m;
      updateActiveArrangeBtn(m);
      drawCertificate();
      showToast(`Text arrangement set to: ${m.toUpperCase()}`);
    });
  });

  function updateActiveArrangeBtn(mode) {
    if (!arrangeButtons) return;
    arrangeButtons.forEach(b => {
      if (b.getAttribute('data-mode') === mode) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  if (btnAutoArrangeNow) {
    btnAutoArrangeNow.addEventListener('click', () => {
      state.arrangeMode = 'center';
      updateActiveArrangeBtn('center');
      drawCertificate();
      showToast('Text automatically arranged & centered!');
    });
  }

  if (btnClearName) {
    btnClearName.addEventListener('click', () => {
      nameInput.value = '';
      handleInputChange();
      nameInput.focus();
    });
  }

  // Year Chips Handler
  yearChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const y = chip.getAttribute('data-year');
      if (yearInput) {
        yearInput.value = y;
        state.year = y;
        updateActiveYearChip(y);
        handleInputChange();
        showToast(y ? `Selected Year: ${y}` : 'Cleared Year mention');
      }
    });
  });

  function updateActiveYearChip(val) {
    yearChips.forEach(chip => {
      if (chip.getAttribute('data-year') === (val || '')) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Prize Quick Chips Handler
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      if (val !== null && prizeInput) {
        prizeInput.value = val;
        updateActivePrizeChip(val);
        handleInputChange();
        showToast(`Selected Prize: ${val}`);
      }
    });
  });

  function updateActivePrizeChip(val) {
    quickChips.forEach(chip => {
      if (chip.getAttribute('data-val') === val) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Preset Participants
  presetItems.forEach(item => {
    item.addEventListener('click', () => {
      state.certType = item.getAttribute('data-type') || 'winning';
      state.title = item.getAttribute('data-title') || 'MR';
      state.name = item.getAttribute('data-name') || '';
      state.year = item.getAttribute('data-year') || '';
      state.prize = item.getAttribute('data-prize') || '';
      syncFormFromState();
      drawCertificate();
      showToast(`Loaded preset for ${state.name} (${state.certType === 'participation' ? 'Participant' : 'Winner'})`);
    });
  });

  if (btnQuickSample) {
    btnQuickSample.addEventListener('click', () => {
      state.certType = 'winning';
      state.title = 'MR';
      state.name = 'LAKSHMANAN G';
      state.year = 'III YEAR';
      state.prize = 'First Prize';
      state.event = 'WebGit';
      state.date = '12/09/2026';
      syncFormFromState();
      drawCertificate();
      showToast('Applied sample participant data!');
    });
  }

  // [Generate Certificate] button
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      readStateFromForm();
      if (!state.name) {
        showToast('Please enter a participant name.', 'error');
        nameInput.focus();
        return;
      }
      if (state.certType === 'winning' && !state.prize) {
        showToast('Please enter a prize or rank.', 'error');
        prizeInput.focus();
        return;
      }

      drawCertificate();
      showToast('Certificate generated successfully!', 'success');
    });
  }

  // =========================================================================
  // Bulletproof File Downloader Helper
  // =========================================================================
  function downloadFile(dataUrlOrBlob, filename) {
    const isBlob = dataUrlOrBlob instanceof Blob;
    const url = isBlob ? URL.createObjectURL(dataUrlOrBlob) : dataUrlOrBlob;

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      if (isBlob) {
        URL.revokeObjectURL(url);
      }
    }, 10000);
  }

  // =========================================================================
  // Download PNG Export
  // =========================================================================
  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', () => {
      readStateFromForm();
      if (!state.name) {
        showToast('Please enter participant name before downloading.', 'error');
        nameInput.focus();
        return;
      }

      try {
        showToast('Preparing high-resolution PNG...', 'info');
        const scale = state.scale || 2;
        const exportCanvas = document.getElementById('exportCanvas');
        drawCertificate(exportCanvas, scale, true);

        const safeName = sanitizeFilename(state.name);
        const safeYear = sanitizeFilename(state.year);
        const typeLabel = (state.certType === 'participation') ? 'Participant' : sanitizeFilename(state.prize);
        const filename = `WebGit_Certificate_${safeName}_${safeYear}_${typeLabel}.png`;

        try {
          const dataUrl = exportCanvas.toDataURL('image/png');
          downloadFile(dataUrl, filename);
          showToast(`Downloaded PNG: ${filename}`, 'success');
        } catch (e1) {
          exportCanvas.toBlob((blob) => {
            if (blob) {
              downloadFile(blob, filename);
              showToast(`Downloaded PNG: ${filename}`, 'success');
            } else {
              throw new Error('Canvas export failed');
            }
          }, 'image/png');
        }
      } catch (err) {
        console.error('PNG Download error:', err);
        showToast('PNG download failed: ' + err.message, 'error');
      }
    });
  }

  // =========================================================================
  // Download PDF Export (A4 Landscape)
  // =========================================================================
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      readStateFromForm();
      if (!state.name) {
        showToast('Please enter participant name before downloading.', 'error');
        nameInput.focus();
        return;
      }

      const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!jsPDFConstructor) {
        showToast('jsPDF library not detected. Opening Print to PDF...', 'error');
        setTimeout(() => window.print(), 300);
        return;
      }

      try {
        showToast('Generating A4 Landscape PDF...', 'info');
        const scale = 2; // 2048x1364 resolution is ideal for PDF rendering
        const exportCanvas = document.getElementById('exportCanvas');
        drawCertificate(exportCanvas, scale, true);

        const imgData = exportCanvas.toDataURL('image/jpeg', 0.98);

        const doc = new jsPDFConstructor({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        const safeName = sanitizeFilename(state.name);
        const safeYear = sanitizeFilename(state.year);
        const typeLabel = (state.certType === 'participation') ? 'Participant' : sanitizeFilename(state.prize);
        const filename = `WebGit_Certificate_${safeName}_${safeYear}_${typeLabel}.pdf`;

        doc.save(filename);
        showToast(`Downloaded PDF: ${filename}`, 'success');
      } catch (err) {
        console.error('PDF export error:', err);
        showToast('PDF download failed: ' + err.message, 'error');
      }
    });
  }

  // =========================================================================
  // Print Handler
  // =========================================================================
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      readStateFromForm();
      drawCertificate(certCanvas, 1, false);
      setTimeout(() => {
        window.print();
      }, 150);
    });
  }

  // =========================================================================
  // Reset Form
  // =========================================================================
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.certType = 'winning';
      state.title = 'MR/MRS';
      state.name = '';
      state.year = 'III YEAR';
      state.prize = 'First Prize';
      state.event = 'WebGit';
      state.date = '12/09/2026';
      state.department = 'Department of Information Technology';
      state.location = 'Melmaruvathur';
      state.collegeLine = 'B.TECH-IT, ADHIPARASAKTHI ENGINEERING COLLEGE';
      state.showUnderline = true;
      syncFormFromState();
      drawCertificate();
      showToast('Form reset to default certificate template.');
    });
  }

  // =========================================================================
  // Zoom & Preview Controls
  // =========================================================================
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      setZoom(Math.min(zoomLevel + 0.15, 2.0));
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      setZoom(Math.max(zoomLevel - 0.15, 0.5));
    });
  }

  if (btnZoomFit) {
    btnZoomFit.addEventListener('click', () => {
      setZoom(1.0);
    });
  }

  function setZoom(val) {
    zoomLevel = val;
    if (certWrapper) {
      certWrapper.style.transform = `scale(${zoomLevel})`;
    }
    if (zoomLevelText) {
      zoomLevelText.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      const vp = document.getElementById('previewViewport');
      if (!document.fullscreenElement) {
        vp.requestFullscreen().catch(err => {
          showToast('Fullscreen not supported: ' + err.message, 'error');
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  // =========================================================================
  // Toast Notification System
  // =========================================================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    if (type === 'success') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    }

    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function sanitizeFilename(str) {
    return (str || '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'Participant';
  }

  // Initialize
  initImages();

  // Also hook into window onload and DOMContentLoaded for extra reliability
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncFormFromState();
      drawCertificate();
    });
  } else {
    syncFormFromState();
    drawCertificate();
  }

  window.addEventListener('load', () => {
    syncFormFromState();
    drawCertificate();
  });

})();
