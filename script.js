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

  // AI Alignment & Overlap Detection DOM Elements
  const overlapAlert = document.getElementById('overlapAlert');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');
  const btnQuickFix = document.getElementById('btnQuickFix');

  const btnAiAlign = document.getElementById('btnAiAlign');
  const btnAutoArrange = document.getElementById('btnAutoArrange');
  const btnAutoFix = document.getElementById('btnAutoFix');
  const btnResetAlign = document.getElementById('btnResetAlign');

  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const btnToggleBold = document.getElementById('btnToggleBold');
  const btnToggleItalic = document.getElementById('btnToggleItalic');

  const sliderFontSize = document.getElementById('sliderFontSize');
  const badgeFontSize = document.getElementById('badgeFontSize');
  const sliderLineSpacing = document.getElementById('sliderLineSpacing');
  const badgeLineSpacing = document.getElementById('badgeLineSpacing');
  const sliderLetterSpacing = document.getElementById('sliderLetterSpacing');
  const badgeLetterSpacing = document.getElementById('badgeLetterSpacing');
  const sliderOffsetX = document.getElementById('sliderOffsetX');
  const badgeOffsetX = document.getElementById('badgeOffsetX');
  const sliderOffsetY = document.getElementById('sliderOffsetY');
  const badgeOffsetY = document.getElementById('badgeOffsetY');
  const chkShowBounds = document.getElementById('chkShowBounds');

  const inputTemplateUpload = document.getElementById('inputTemplateUpload');
  const btnBrowseTemplate = document.getElementById('btnBrowseTemplate');
  const btnRestoreOfficialTemplate = document.getElementById('btnRestoreOfficialTemplate');
  const templateDropzone = document.getElementById('templateDropzone');

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
    scale: 3,

    // AI & Typography Engine state
    fontSize: 27,
    fontFamily: '"Times New Roman", Times, Georgia, serif',
    isBold: true,
    isItalic: true,
    lineSpacing: 44,
    letterSpacing: 0,
    offsetX: 0,
    offsetY: 0,
    showBounds: false,
    customTemplateImg: null,
    hasOverlap: false,
    overlapDetails: ''
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

    syncTypographyControls();
    updateActivePrizeChip(state.prize);
    updateActiveYearChip(state.year);
    updateActiveDateChip(state.date);
    updateActiveArrangeBtn(state.arrangeMode);
  }

  function syncTypographyControls() {
    if (fontFamilySelect) fontFamilySelect.value = state.fontFamily;
    if (btnToggleBold) {
      btnToggleBold.classList.toggle('active', !!state.isBold);
    }
    if (btnToggleItalic) {
      btnToggleItalic.classList.toggle('active', !!state.isItalic);
    }
    if (sliderFontSize) sliderFontSize.value = state.fontSize;
    if (badgeFontSize) badgeFontSize.textContent = `${state.fontSize} px`;

    if (sliderLineSpacing) sliderLineSpacing.value = state.lineSpacing;
    if (badgeLineSpacing) badgeLineSpacing.textContent = `${state.lineSpacing} px`;

    if (sliderLetterSpacing) sliderLetterSpacing.value = state.letterSpacing;
    if (badgeLetterSpacing) badgeLetterSpacing.textContent = `${state.letterSpacing} px`;

    if (sliderOffsetX) sliderOffsetX.value = state.offsetX;
    if (badgeOffsetX) badgeOffsetX.textContent = `${state.offsetX} px`;

    if (sliderOffsetY) sliderOffsetY.value = state.offsetY;
    if (badgeOffsetY) badgeOffsetY.textContent = `${state.offsetY} px`;

    if (chkShowBounds) chkShowBounds.checked = !!state.showBounds;
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

    if (fontFamilySelect) state.fontFamily = fontFamilySelect.value;
    if (sliderFontSize) state.fontSize = parseFloat(sliderFontSize.value) || 27;
    if (sliderLineSpacing) state.lineSpacing = parseFloat(sliderLineSpacing.value) || 42;
    if (sliderLetterSpacing) state.letterSpacing = parseFloat(sliderLetterSpacing.value) || 0;
    if (sliderOffsetX) state.offsetX = parseFloat(sliderOffsetX.value) || 0;
    if (sliderOffsetY) state.offsetY = parseFloat(sliderOffsetY.value) || 0;
    if (chkShowBounds) state.showBounds = chkShowBounds.checked;
  }

  // =========================================================================
  // Safe Bounds & Collision Detection System
  // =========================================================================
  function getTemplateSafeBounds() {
    if (state.customTemplateImg) {
      return {
        top: Math.round(BASE_HEIGHT * 0.44),
        bottom: Math.round(BASE_HEIGHT * 0.77),
        left: Math.round(BASE_WIDTH * 0.05),
        right: Math.round(BASE_WIDTH * 0.95),
        safeWidth: Math.round(BASE_WIDTH * 0.90),
        safeHeight: Math.round(BASE_HEIGHT * 0.33)
      };
    }
    // Official Certificate safe bounds (1024x682)
    // Text area: below diamond divider (~y=350) to above signatures (~y=538)
    return {
      top: 350,
      bottom: 538,
      left: 30,
      right: 994,
      safeWidth: 964,
      safeHeight: 188
    };
  }

  function evaluateCollisions(boxes, safeBounds, s) {
    const collisions = [];
    
    // 1. Line-to-line vertical collision
    for (let i = 0; i < boxes.length - 1; i++) {
      const curr = boxes[i];
      const next = boxes[i + 1];
      if (curr.bottom > next.top - (2 * s)) {
        collisions.push(`${curr.label} overlaps with ${next.label}`);
      }
    }

    // 2. Top boundary collision (below title/crest)
    if (boxes.length > 0 && boxes[0].top < safeBounds.top * s) {
      collisions.push('Text intrudes into top certificate header / title area');
    }

    // 3. Bottom boundary collision (above signatures)
    if (boxes.length > 0 && boxes[boxes.length - 1].bottom > safeBounds.bottom * s) {
      collisions.push('Text intrudes into bottom signatures / authority zone');
    }

    // 4. Lateral boundary overflow (beyond border)
    for (const b of boxes) {
      if (b.left < safeBounds.left * s || b.right > safeBounds.right * s) {
        collisions.push(`${b.label} exceeds certificate safe margin`);
        break;
      }
    }

    return collisions;
  }

  function updateOverlapUI(collisions) {
    if (!overlapAlert) return;
    if (collisions.length > 0) {
      state.hasOverlap = true;
      state.overlapDetails = collisions.join('; ');
      overlapAlert.classList.remove('status-optimal');
      overlapAlert.classList.add('status-warning');
      if (statusIcon) statusIcon.textContent = '⚠️';
      if (statusTitle) statusTitle.textContent = 'Text Overlap Detected';
      if (statusDesc) statusDesc.textContent = collisions[0];
      if (btnQuickFix) btnQuickFix.classList.remove('hidden');
    } else {
      state.hasOverlap = false;
      state.overlapDetails = '';
      overlapAlert.classList.remove('status-warning');
      overlapAlert.classList.add('status-optimal');
      if (statusIcon) statusIcon.textContent = '✨';
      if (statusTitle) statusTitle.textContent = 'Optimal AI Alignment';
      if (statusDesc) statusDesc.textContent = 'No collisions or overlapping text detected.';
      if (btnQuickFix) btnQuickFix.classList.add('hidden');
    }
  }

  function drawBoundingBoxes(ctx, boxes, safeBounds, s, isWarning) {
    ctx.save();
    // Draw Safe Zone Boundary (Gold / Cyan dashed line)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.strokeRect(
      safeBounds.left * s,
      safeBounds.top * s,
      safeBounds.safeWidth * s,
      safeBounds.safeHeight * s
    );

    // Draw individual line boxes
    boxes.forEach(b => {
      ctx.strokeStyle = isWarning ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.45)';
      ctx.fillStyle = isWarning ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.03)';
      ctx.lineWidth = 1 * s;
      ctx.setLineDash([2 * s, 2 * s]);
      const w = b.right - b.left;
      const h = b.bottom - b.top;
      ctx.fillRect(b.left, b.top, w, h);
      ctx.strokeRect(b.left, b.top, w, h);
    });
    ctx.restore();
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

    // Draw background image or custom template
    if (state.customTemplateImg) {
      ctx.drawImage(state.customTemplateImg, 0, 0, w, h);
    } else if (isReady) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#fbf7ee';
      ctx.fillRect(0, 0, w, h);
    }

    const s = scale;
    const ink = INK_COLOR;
    const safeBounds = getTemplateSafeBounds();
    const safeLeft = safeBounds.left * s;
    const safeRight = safeBounds.right * s;
    const safeTop = safeBounds.top * s;
    const safeBottom = safeBounds.bottom * s;

    // Base typography helpers
    const fontFam = state.fontFamily || '"Times New Roman", Times, Georgia, serif';
    const regularFont = (size) => `${size}px ${fontFam}`;
    const boldFont = (size) => (state.isBold ? `bold ${size}px ${fontFam}` : `${size}px ${fontFam}`);
    const italicBoldFont = (size) => {
      let style = '';
      if (state.isBold) style += 'bold ';
      if (state.isItalic) style += 'italic ';
      return `${style}${size}px ${fontFam}`.trim();
    };

    let fontSize = state.fontSize * s;

    // -----------------------------------------------------------------------
    // Header Subtitle Override: Only needed for "OF PARTICIPATION" type.
    // The new base template already has "OF WINNING" perfectly rendered.
    // For participation, cover "OF WINNING" and draw "OF PARTICIPATION".
    // -----------------------------------------------------------------------
    if (state.certType === 'participation' && !state.customTemplateImg) {
      ctx.save();

      // Cover the base image's "OF WINNING" with matching cream background
      const patchY = 238 * s;
      const patchH = 68 * s;
      const patchW = w * 0.72;
      const patchX = (w - patchW) / 2;

      ctx.fillStyle = '#fdfcf4';
      ctx.fillRect(patchX, patchY, patchW, patchH);

      // Gold gradient for "OF PARTICIPATION" text
      const goldGrad = ctx.createLinearGradient(0, patchY, 0, patchY + patchH);
      goldGrad.addColorStop(0, '#d9a830');
      goldGrad.addColorStop(0.5, '#b8850f');
      goldGrad.addColorStop(1, '#9e6a04');

      ctx.fillStyle = goldGrad;
      ctx.font = `bold ${30 * s}px "Cinzel", "Playfair Display", "Times New Roman", serif`;
      ctx.textAlign = 'center';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${2 * s}px`;
      }
      ctx.fillText('OF PARTICIPATION', w / 2, 282 * s);

      // Diamond dot decoration (matches reference design)
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.font = `bold ${10 * s}px serif`;
      ctx.fillText('\u25C6', w / 2, 296 * s);

      ctx.restore();
    }

    // Set Global Letter Spacing if supported
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${state.letterSpacing * s}px`;
    }

    // -----------------------------------------------------------------------
    // Vertical Line Positioning with Line Spacing & Y Offset
    // -----------------------------------------------------------------------
    const mode = state.arrangeMode || 'center';
    ctx.textAlign = 'left';

    const lineGap = state.lineSpacing * s;
    const startY = (378 + state.offsetY) * s;
    const y1 = startY;
    const y2 = startY + lineGap;
    const y3 = startY + (lineGap * 2);
    const y4 = startY + (lineGap * 3);

    // -----------------------------------------------------------------------
    // Line 1: This is to certify that MR/MRS [NAME] of
    // -----------------------------------------------------------------------
    const introText = 'This is to certify that  ';
    let prefix = (state.title !== 'NONE') ? (state.title + ' ') : '';
    const ofText = ' of';

    ctx.fillStyle = ink;
    ctx.font = regularFont(fontSize);
    const introWidth = ctx.measureText(introText).width;
    const ofWidth = ctx.measureText(ofText).width;

    let totalL1Width = 0;
    let startL1X = safeLeft + (state.offsetX * s);
    let nameFontSize = fontSize;

    if (state.name.length > 0) {
      // Deduplicate: If participant name already includes the title prefix, don't duplicate it
      let rawName = state.name.trim();
      if (state.title !== 'NONE' && rawName.toUpperCase().startsWith(state.title.toUpperCase() + ' ')) {
        prefix = '';
      }
      const fullPerson = (prefix + rawName).toUpperCase();
      
      ctx.font = boldFont(nameFontSize);
      let nameWidth = ctx.measureText(fullPerson).width;

      // Smart Name Fitting: gradually scale name font down to fit within available width
      const maxLine1Width = (safeRight - safeLeft) - introWidth - ofWidth - (16 * s);
      while (nameWidth > maxLine1Width && nameFontSize > 12 * s) {
        nameFontSize -= 0.5 * s;
        ctx.font = boldFont(nameFontSize);
        nameWidth = ctx.measureText(fullPerson).width;
      }

      totalL1Width = introWidth + nameWidth + ofWidth;
      if (mode === 'center') {
        startL1X = ((w - totalL1Width) / 2) + (state.offsetX * s);
      } else if (mode === 'right') {
        startL1X = safeRight - totalL1Width + (state.offsetX * s);
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
      const dummyNameW = 260 * s;
      totalL1Width = introWidth + prefixW + dummyNameW + ofWidth;

      if (mode === 'center') {
        startL1X = ((w - totalL1Width) / 2) + (state.offsetX * s);
      } else if (mode === 'right') {
        startL1X = safeRight - totalL1Width + (state.offsetX * s);
      }

      ctx.font = regularFont(fontSize);
      ctx.fillText(introText, startL1X, y1);

      ctx.font = boldFont(fontSize);
      ctx.fillText(blankPrefix, startL1X + introWidth, y1);

      if (state.showUnderline) {
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(startL1X + introWidth + prefixW + (4 * s), y1 + (2 * s));
        ctx.lineTo(startL1X + introWidth + prefixW + dummyNameW - (4 * s), y1 + (2 * s));
        ctx.stroke();
      }

      ctx.font = regularFont(fontSize);
      ctx.fillText(ofText, startL1X + introWidth + prefixW + dummyNameW, y1);
    }

    // -----------------------------------------------------------------------
    // Line 2: [YEAR] B.TECH-IT, ADHIPARASAKTHI ENGINEERING COLLEGE has won [PRIZE] / has participated
    // -----------------------------------------------------------------------
    let collText = state.collegeLine || 'B.TECH-IT, ADHIPARASAKTHI ENGINEERING COLLEGE';
    // Deduplicate: Don't repeat year if already present in collegeLine
    if (state.year && state.year.trim()) {
      const yTrim = state.year.trim();
      if (!collText.toUpperCase().startsWith(yTrim.toUpperCase())) {
        collText = yTrim + ' ' + collText;
      }
    }
    
    let actionText = '';
    let prizeText = '';
    const isParticipation = (state.certType === 'participation');

    if (isParticipation) {
      actionText = ' has participated';
      prizeText = '';
    } else {
      actionText = ' has won';
      if (state.prize && state.prize.trim()) {
        let pTrim = state.prize.trim();
        // Deduplicate: If prize already starts with 'has won', don't repeat
        if (pTrim.toLowerCase().startsWith('has won ')) {
          pTrim = pTrim.substring(8).trim();
        }
        prizeText = ` ${pTrim}`;
      }
    }

    let line2FontSize = fontSize;
    ctx.font = boldFont(line2FontSize);
    let collWidth = ctx.measureText(collText).width;
    ctx.font = regularFont(line2FontSize);
    let actionWidth = ctx.measureText(actionText).width;
    ctx.font = boldFont(line2FontSize);
    let prizeWidth = prizeText ? ctx.measureText(prizeText).width : 0;

    const maxLine2Width = (safeRight - safeLeft) - (10 * s);
    while ((collWidth + actionWidth + prizeWidth) > maxLine2Width && line2FontSize > 13 * s) {
      line2FontSize -= 0.5 * s;
      ctx.font = boldFont(line2FontSize);
      collWidth = ctx.measureText(collText).width;
      ctx.font = regularFont(line2FontSize);
      actionWidth = ctx.measureText(actionText).width;
      ctx.font = boldFont(line2FontSize);
      prizeWidth = prizeText ? ctx.measureText(prizeText).width : 0;
    }

    const totalL2Width = collWidth + actionWidth + prizeWidth;
    let startL2X = safeLeft + (state.offsetX * s);
    if (mode === 'center') {
      startL2X = ((w - totalL2Width) / 2) + (state.offsetX * s);
    } else if (mode === 'right') {
      startL2X = safeRight - totalL2Width + (state.offsetX * s);
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
    // Line 3: in the [Event] conducted by the Department of Information
    // (Split dept name: "Department of Information" on line 3,
    //  last word "Technology" wraps to start of line 4 — matches reference)
    // -----------------------------------------------------------------------
    const inTheText = 'in the  ';
    let eventVal = (state.event || 'WebGit').trim();
    // Deduplicate: Don't repeat "in the" if user typed it into event field
    if (eventVal.toLowerCase().startsWith('in the ')) {
      eventVal = eventVal.substring(7).trim();
    }

    // Split department to end line 3 before the last word ("Technology")
    const deptWords = state.department.trim().split(/\s+/);
    const lastDeptWord = deptWords.length > 1 ? deptWords[deptWords.length - 1] : '';
    const deptFirstPart = deptWords.length > 1 ? deptWords.slice(0, -1).join(' ') : state.department;
    const conductedText = ` conducted by the ${deptFirstPart}`;

    let line3FontSize = fontSize;
    ctx.font = regularFont(line3FontSize);
    let inTheWidth = ctx.measureText(inTheText).width;
    ctx.font = italicBoldFont(Math.round(line3FontSize * 1.12));
    let eventWidth = ctx.measureText(eventVal).width;
    ctx.font = regularFont(line3FontSize);
    let conductedWidth = ctx.measureText(conductedText).width;

    // Smart shrink if line 3 is too wide
    const maxLine3Width = (safeRight - safeLeft) - (10 * s);
    while ((inTheWidth + eventWidth + (4 * s) + conductedWidth) > maxLine3Width && line3FontSize > 13 * s) {
      line3FontSize -= 0.5 * s;
      ctx.font = regularFont(line3FontSize);
      inTheWidth = ctx.measureText(inTheText).width;
      ctx.font = italicBoldFont(Math.round(line3FontSize * 1.12));
      eventWidth = ctx.measureText(eventVal).width;
      ctx.font = regularFont(line3FontSize);
      conductedWidth = ctx.measureText(conductedText).width;
    }

    const totalL3Width = inTheWidth + eventWidth + (4 * s) + conductedWidth;
    let startL3X = safeLeft + (state.offsetX * s);
    if (mode === 'center') {
      startL3X = ((w - totalL3Width) / 2) + (state.offsetX * s);
    } else if (mode === 'right') {
      startL3X = safeRight - totalL3Width + (state.offsetX * s);
    }

    ctx.font = regularFont(line3FontSize);
    ctx.fillText(inTheText, startL3X, y3);

    ctx.font = italicBoldFont(Math.round(line3FontSize * 1.12));
    ctx.fillText(eventVal, startL3X + inTheWidth, y3);

    ctx.font = regularFont(line3FontSize);
    ctx.fillText(conductedText, startL3X + inTheWidth + eventWidth + (4 * s), y3);

    // -----------------------------------------------------------------------
    // Line 4: Technology, [Location] on [Date].
    // (Continues from line 3 — "Technology" is the last word of department)
    // -----------------------------------------------------------------------
    let locClean = (state.location || 'Melmaruvathur').trim();
    // Deduplicate: If location input already starts with lastDeptWord (e.g. "Technology, Melmaruvathur"), strip it
    if (lastDeptWord && locClean.toUpperCase().startsWith(lastDeptWord.toUpperCase())) {
      locClean = locClean.substring(lastDeptWord.length).replace(/^[\s,]+/, '');
    }

    const line4Text = lastDeptWord
      ? `${lastDeptWord}, ${locClean} on ${state.date}.`
      : `${locClean} on ${state.date}.`;

    ctx.font = regularFont(fontSize);
    const line4Width = ctx.measureText(line4Text).width;
    let startL4X = safeLeft + (state.offsetX * s);
    if (mode === 'center') {
      startL4X = ((w - line4Width) / 2) + (state.offsetX * s);
    } else if (mode === 'right') {
      startL4X = safeRight - line4Width + (state.offsetX * s);
    }

    ctx.fillText(line4Text, startL4X, y4);

    // -----------------------------------------------------------------------
    // Bounding Box Calculation & Real-time Collision Detection
    // -----------------------------------------------------------------------
    const boxes = [
      {
        label: 'Line 1 (Participant Name)',
        left: startL1X,
        right: startL1X + totalL1Width,
        top: y1 - (nameFontSize * 0.85),
        bottom: y1 + (4 * s)
      },
      {
        label: 'Line 2 (Degree & Prize)',
        left: startL2X,
        right: startL2X + totalL2Width,
        top: y2 - (line2FontSize * 0.85),
        bottom: y2 + (4 * s)
      },
      {
        label: 'Line 3 (Event & Dept)',
        left: startL3X,
        right: startL3X + totalL3Width,
        top: y3 - (line3FontSize * 1.12 * 0.85),
        bottom: y3 + (4 * s)
      },
      {
        label: 'Line 4 (Location & Date)',
        left: startL4X,
        right: startL4X + line4Width,
        top: y4 - (fontSize * 0.85),
        bottom: y4 + (4 * s)
      }
    ];

    const collisions = evaluateCollisions(boxes, safeBounds, s);
    if (targetCanvas === certCanvas) {
      updateOverlapUI(collisions);
      if (state.showBounds || collisions.length > 0) {
        drawBoundingBoxes(ctx, boxes, safeBounds, s, collisions.length > 0);
      }
    }
  }

  // =========================================================================
  // Official College Header Rendering (High-Definition Vector Typography)
  // =========================================================================
  function drawOfficialHeader(ctx, w, s) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // 1. Seamless parchment patch over center header region
    const patchX = 176 * s;
    const patchY = 12 * s;
    const patchW = 672 * s;
    const patchH = 168 * s;
    
    // Smooth natural parchment gradient fill
    const pGrad = ctx.createLinearGradient(patchX, patchY, patchX, patchY + patchH);
    pGrad.addColorStop(0, '#fefef9');
    pGrad.addColorStop(0.5, '#fefdf6');
    pGrad.addColorStop(1, '#fefcf3');
    ctx.fillStyle = pGrad;
    ctx.fillRect(patchX, patchY, patchW, patchH);

    const centerX = w / 2;
    const serifFont = (size, weight = 'bold') => `${weight} ${size}px "Times New Roman", Times, "Playfair Display", Georgia, serif`;
    const HEADER_RED = '#C00000'; // Official deep institutional red

    // Line 1: Om Sakthi (Centered traditional invocation)
    ctx.fillStyle = HEADER_RED;
    ctx.font = serifFont(13 * s, 'bold');
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${0.6 * s}px`;
    }
    ctx.fillText('Om Sakthi', centerX, 26 * s);

    // Line 2: College Name (ADHIPARASAKTHI ENGINEERING COLLEGE, - Bold, Dominant)
    ctx.font = serifFont(23 * s, 'bold');
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${0.5 * s}px`;
    }
    ctx.fillText('ADHIPARASAKTHI ENGINEERING COLLEGE,', centerX, 48 * s);

    // Line 3: MELMARUVATHUR
    ctx.font = serifFont(19 * s, 'bold');
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${0.5 * s}px`;
    }
    ctx.fillText('MELMARUVATHUR', centerX, 69 * s);

    // Line 4: (An Autonomous Institution)
    ctx.font = serifFont(13.5 * s, 'bold');
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${0.25 * s}px`;
    }
    ctx.fillText('(An Autonomous Institution)', centerX, 86 * s);

    // Line 5: Approved by AICTE, New Delhi and Affiliated to Anna University, Chennai
    ctx.font = serifFont(11.5 * s, 'bold');
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${0.15 * s}px`;
    }
    ctx.fillText('Approved by AICTE, New Delhi and Affiliated to Anna University, Chennai', centerX, 102 * s);

    // Line 6: Accredited by NAAC with ‘A’ Grade, An ISO 9001:2015 Certified Institution
    ctx.fillText('Accredited by NAAC with ‘A’ Grade, An ISO 9001:2015 Certified Institution', centerX, 117 * s);

    // Line 7: Recognised by UGC under section 2(f) and 12(B)
    ctx.fillText('Recognised by UGC under section 2(f) and 12(B)', centerX, 132 * s);

    // Line 8: MELMARUVATHUR – 603 319, CHENGALPATTU DISTRICT, TAMIL NADU, INDIA
    ctx.font = serifFont(11 * s, 'bold');
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${0.3 * s}px`;
    }
    ctx.fillText('MELMARUVATHUR – 603 319, CHENGALPATTU DISTRICT, TAMIL NADU, INDIA', centerX, 147 * s);

    // Line 9: www.apec.edu.in (Institutional Red, Underlined Link)
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = '0px';
    }
    const webText = 'www.apec.edu.in';
    ctx.font = serifFont(12.5 * s, 'bold');
    const webWidth = ctx.measureText(webText).width;
    const webY = 164 * s;
    ctx.fillText(webText, centerX, webY);

    // Precise vector underline for website URL in matching red
    ctx.strokeStyle = HEADER_RED;
    ctx.lineWidth = 1.25 * s;
    ctx.beginPath();
    ctx.moveTo(centerX - (webWidth / 2), webY + (2.2 * s));
    ctx.lineTo(centerX + (webWidth / 2), webY + (2.2 * s));
    ctx.stroke();

    ctx.restore();
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

  // =========================================================================
  // AI Alignment & Layout Functions
  // =========================================================================
  function runAiTextAlignment() {
    const safe = getTemplateSafeBounds();

    // 1. Center align
    state.arrangeMode = 'center';
    updateActiveArrangeBtn('center');

    // 2. Reset fine-tuning shifts
    state.offsetX = 0;
    state.offsetY = 0;
    state.letterSpacing = 0;

    // 3. Detect available vertical space and determine optimal line spacing
    const idealSpacing = Math.round(safe.safeHeight / 4.5);
    state.lineSpacing = Math.max(36, Math.min(idealSpacing, 45));

    // 4. Smart Font Sizing based on name and text length
    const fullName = ((state.title !== 'NONE' ? state.title + ' ' : '') + state.name).toUpperCase();
    if (fullName.length > 32) {
      state.fontSize = 24;
    } else if (fullName.length > 25) {
      state.fontSize = 26;
    } else {
      state.fontSize = 27;
    }

    syncTypographyControls();
    drawCertificate();

    // 5. If any collisions still persist, iteratively optimize
    let attempts = 0;
    while (state.hasOverlap && attempts < 15) {
      if (state.fontSize > 18) state.fontSize -= 0.5;
      if (state.lineSpacing > 34) state.lineSpacing -= 0.5;
      drawCertificate();
      attempts++;
    }

    syncTypographyControls();
    drawCertificate();
    showToast('✨ AI Text Alignment applied! Layout and spacing optimized.', 'success');
  }

  function autoArrangeText() {
    state.arrangeMode = 'center';
    updateActiveArrangeBtn('center');

    state.offsetX = 0;
    state.offsetY = 0;
    state.letterSpacing = 0;
    state.lineSpacing = 44;

    const nameLen = state.name.length;
    if (nameLen > 30) {
      state.fontSize = 24;
    } else if (nameLen > 22) {
      state.fontSize = 26;
    } else {
      state.fontSize = 27;
    }

    syncTypographyControls();
    drawCertificate();
    showToast('🤖 Auto Arrange: Balanced academic typography & hierarchy.', 'info');
  }

  function autoFixOverlap() {
    if (!state.hasOverlap) {
      showToast('No overlap detected. Layout is already optimal!', 'info');
      return;
    }

    let iterations = 0;
    while (state.hasOverlap && iterations < 25) {
      if (state.overlapDetails.includes('signature zone') || state.overlapDetails.includes('header')) {
        state.lineSpacing = Math.max(34, state.lineSpacing - 1);
        state.fontSize = Math.max(18, state.fontSize - 0.5);
        state.offsetY = Math.max(-15, Math.min(15, state.offsetY * 0.5));
      } else if (state.overlapDetails.includes('overlaps with')) {
        state.lineSpacing = Math.min(52, state.lineSpacing + 1);
        state.fontSize = Math.max(18, state.fontSize - 0.5);
      } else if (state.overlapDetails.includes('margin')) {
        state.fontSize = Math.max(18, state.fontSize - 1);
        state.offsetX = 0;
      } else {
        state.fontSize = Math.max(18, state.fontSize - 1);
      }

      drawCertificate();
      iterations++;
    }

    syncTypographyControls();
    drawCertificate();

    if (!state.hasOverlap) {
      showToast('🔧 Auto Fix: All text overlaps successfully resolved!', 'success');
    } else {
      showToast('🔧 Auto Fix: Scaled text down to minimize collisions.', 'info');
    }
  }

  function resetAlignment() {
    state.arrangeMode = 'center';
    updateActiveArrangeBtn('center');
    state.fontSize = 27;
    state.fontFamily = '"Times New Roman", Times, Georgia, serif';
    state.isBold = true;
    state.isItalic = true;
    state.lineSpacing = 42;
    state.letterSpacing = 0;
    state.offsetX = 0;
    state.offsetY = 0;
    state.showBounds = false;

    syncTypographyControls();
    drawCertificate();
    showToast('↩ Alignment reset to standard academic layout.', 'info');
  }

  // AI Buttons Wiring
  if (btnAiAlign) {
    btnAiAlign.addEventListener('click', runAiTextAlignment);
  }

  if (btnAutoArrange) {
    btnAutoArrange.addEventListener('click', autoArrangeText);
  }

  if (btnAutoFix) {
    btnAutoFix.addEventListener('click', autoFixOverlap);
  }

  if (btnQuickFix) {
    btnQuickFix.addEventListener('click', autoFixOverlap);
  }

  if (btnResetAlign) {
    btnResetAlign.addEventListener('click', resetAlignment);
  }

  // Typography Controls Event Handlers
  if (fontFamilySelect) {
    fontFamilySelect.addEventListener('change', (e) => {
      state.fontFamily = e.target.value;
      drawCertificate();
      showToast('Font family updated.');
    });
  }

  if (btnToggleBold) {
    btnToggleBold.addEventListener('click', () => {
      state.isBold = !state.isBold;
      btnToggleBold.classList.toggle('active', state.isBold);
      drawCertificate();
    });
  }

  if (btnToggleItalic) {
    btnToggleItalic.addEventListener('click', () => {
      state.isItalic = !state.isItalic;
      btnToggleItalic.classList.toggle('active', state.isItalic);
      drawCertificate();
    });
  }

  if (sliderFontSize) {
    sliderFontSize.addEventListener('input', (e) => {
      state.fontSize = parseFloat(e.target.value);
      if (badgeFontSize) badgeFontSize.textContent = `${state.fontSize} px`;
      drawCertificate();
    });
  }

  if (sliderLineSpacing) {
    sliderLineSpacing.addEventListener('input', (e) => {
      state.lineSpacing = parseFloat(e.target.value);
      if (badgeLineSpacing) badgeLineSpacing.textContent = `${state.lineSpacing} px`;
      drawCertificate();
    });
  }

  if (sliderLetterSpacing) {
    sliderLetterSpacing.addEventListener('input', (e) => {
      state.letterSpacing = parseFloat(e.target.value);
      if (badgeLetterSpacing) badgeLetterSpacing.textContent = `${state.letterSpacing} px`;
      drawCertificate();
    });
  }

  if (sliderOffsetX) {
    sliderOffsetX.addEventListener('input', (e) => {
      state.offsetX = parseFloat(e.target.value);
      if (badgeOffsetX) badgeOffsetX.textContent = `${state.offsetX} px`;
      drawCertificate();
    });
  }

  if (sliderOffsetY) {
    sliderOffsetY.addEventListener('input', (e) => {
      state.offsetY = parseFloat(e.target.value);
      if (badgeOffsetY) badgeOffsetY.textContent = `${state.offsetY} px`;
      drawCertificate();
    });
  }

  if (chkShowBounds) {
    chkShowBounds.addEventListener('change', (e) => {
      state.showBounds = e.target.checked;
      drawCertificate();
    });
  }

  // Custom Template Upload Handlers
  if (btnBrowseTemplate && inputTemplateUpload) {
    btnBrowseTemplate.addEventListener('click', () => {
      inputTemplateUpload.click();
    });

    inputTemplateUpload.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          state.customTemplateImg = img;
          if (btnRestoreOfficialTemplate) {
            btnRestoreOfficialTemplate.style.display = 'inline-flex';
          }
          runAiTextAlignment();
          showToast(`Custom template loaded (${img.naturalWidth}×${img.naturalHeight}px)! AI aligned text.`, 'success');
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnRestoreOfficialTemplate) {
    btnRestoreOfficialTemplate.addEventListener('click', () => {
      state.customTemplateImg = null;
      btnRestoreOfficialTemplate.style.display = 'none';
      if (inputTemplateUpload) inputTemplateUpload.value = '';
      runAiTextAlignment();
      showToast('Restored official APEC certificate template.', 'info');
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
      state.fontSize = 27;
      state.fontFamily = '"Times New Roman", Times, Georgia, serif';
      state.isBold = true;
      state.isItalic = true;
      state.lineSpacing = 42;
      state.letterSpacing = 0;
      state.offsetX = 0;
      state.offsetY = 0;
      state.showBounds = false;
      state.customTemplateImg = null;
      if (btnRestoreOfficialTemplate) btnRestoreOfficialTemplate.style.display = 'none';
      if (inputTemplateUpload) inputTemplateUpload.value = '';
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
