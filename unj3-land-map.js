(function () {
  "use strict";

  var UNJ3_BLOCKS = [
    { blockCode: "C1", blockName: "C1 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 62.76, yPercent: 28.43 },
    { blockCode: "C2", blockName: "C2 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 48.15, yPercent: 9.05 },
    { blockCode: "C3", blockName: "C3 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 32.44, yPercent: 56.38 },
    { blockCode: "C4", blockName: "C4 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 39.97, yPercent: 79.04 },
    { blockCode: "C5", blockName: "C5 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 32.40, yPercent: 88.25 },
    { blockCode: "C6", blockName: "C6 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 22.53, yPercent: 84.33 },
    { blockCode: "C7", blockName: "C7 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 20.42, yPercent: 83.01 },
    { blockCode: "C8", blockName: "C8 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 20.13, yPercent: 78.88 },
    { blockCode: "C9", blockName: "C9 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 25.12, yPercent: 65.38 },
    { blockCode: "C10", blockName: "C10 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 15.97, yPercent: 66.54 },
    { blockCode: "C11", blockName: "C11 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 10.91, yPercent: 62.63 },
    { blockCode: "C12", blockName: "C12 블록", landType: "점포겸용 단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 8.07, yPercent: 59.71 },
    { blockCode: "C13", blockName: "C13 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 11.91, yPercent: 52.83 },
    { blockCode: "C14", blockName: "C14 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 24.79, yPercent: 40.60 },
    { blockCode: "C15", blockName: "C15 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 27.05, yPercent: 30.39 },
    { blockCode: "C16", blockName: "C16 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 24.72, yPercent: 28.37 },
    { blockCode: "C17", blockName: "C17 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 21.71, yPercent: 34.99 },
    { blockCode: "C18", blockName: "C18 블록", landType: "단독주택용지", publicListingCount: 0, internalListingCount: 0, detailMapUrl: "", status: "preparing", xPercent: 34.66, yPercent: 26.20 }
  ];

  var DEMO_BLOCK_CODE = "C12";
  var BASE_WIDTH = 1600;
  var BASE_HEIGHT = BASE_WIDTH * (1889 / 2787);
  var MAX_SCALE = 6;

  var viewport = document.getElementById("unj3Viewport");
  var stage = document.getElementById("unj3Stage");
  var imageWrap = document.getElementById("unj3ImageWrap");
  var mapImage = document.getElementById("unj3MapImage");
  var imageError = document.getElementById("unj3ImageError");
  var badgesLayer = document.getElementById("unj3Badges");
  var infoPanel = document.getElementById("unj3InfoPanel");
  var blockSelect = document.getElementById("unj3BlockSelect");
  var modalOverlay = document.getElementById("unj3ModalOverlay");
  var modalMessage = document.getElementById("unj3ModalMessage");
  var modalClose = document.getElementById("unj3ModalClose");

  var state = {
    scale: 1,
    tx: 0,
    ty: 0,
    minScale: 0.3,
    fitScale: 1,
    selected: null
  };

  var badgeEls = {};
  var lastFocusedBeforeModal = null;

  function blockByCode(code) {
    for (var i = 0; i < UNJ3_BLOCKS.length; i++) {
      if (UNJ3_BLOCKS[i].blockCode === code) return UNJ3_BLOCKS[i];
    }
    return null;
  }

  imageWrap.style.width = BASE_WIDTH + "px";

  function applyTransform(animate) {
    if (animate) {
      stage.classList.add("unj3-anim");
    } else {
      stage.classList.remove("unj3-anim");
    }
    stage.style.transform = "translate(" + state.tx + "px, " + state.ty + "px) scale(" + state.scale + ")";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampPosition() {
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    var contentW = BASE_WIDTH * state.scale;
    var contentH = BASE_HEIGHT * state.scale;
    var slackX = vw * 0.5;
    var slackY = vh * 0.5;

    if (contentW <= vw) {
      state.tx = (vw - contentW) / 2;
    } else {
      state.tx = clamp(state.tx, vw - contentW - slackX, slackX);
    }

    if (contentH <= vh) {
      state.ty = (vh - contentH) / 2;
    } else {
      state.ty = clamp(state.ty, vh - contentH - slackY, slackY);
    }
  }

  function computeFitScale() {
    var vw = viewport.clientWidth || 800;
    var vh = viewport.clientHeight || 600;
    return Math.min(vw / BASE_WIDTH, vh / BASE_HEIGHT);
  }

  function fitToView(animate) {
    var fit = computeFitScale();
    state.fitScale = fit;
    state.minScale = fit * 0.6;
    state.scale = fit;
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    state.tx = (vw - BASE_WIDTH * fit) / 2;
    state.ty = (vh - BASE_HEIGHT * fit) / 2;
    applyTransform(animate);
  }

  function setScaleAtPoint(newScale, pointX, pointY, animate) {
    newScale = clamp(newScale, state.minScale, MAX_SCALE);
    var localX = (pointX - state.tx) / state.scale;
    var localY = (pointY - state.ty) / state.scale;
    state.tx = pointX - localX * newScale;
    state.ty = pointY - localY * newScale;
    state.scale = newScale;
    clampPosition();
    applyTransform(animate);
  }

  function zoomStep(factor) {
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    setScaleAtPoint(state.scale * factor, vw / 2, vh / 2, true);
  }

  function centerOnBlock(block) {
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    var localX = (block.xPercent / 100) * BASE_WIDTH;
    var localY = (block.yPercent / 100) * BASE_HEIGHT;
    var targetScale = Math.max(state.scale, state.fitScale * 1.4);
    targetScale = clamp(targetScale, state.minScale, MAX_SCALE);
    state.scale = targetScale;
    state.tx = vw / 2 - localX * targetScale;
    state.ty = vh / 2 - localY * targetScale;
    clampPosition();
    applyTransform(true);
  }

  function buildBadges() {
    badgesLayer.innerHTML = "";
    badgeEls = {};
    UNJ3_BLOCKS.forEach(function (block) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "unj3-block-badge";
      btn.textContent = block.blockCode;
      btn.style.left = block.xPercent + "%";
      btn.style.top = block.yPercent + "%";
      btn.setAttribute("aria-label", block.blockName + " 선택");
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        selectBlock(block.blockCode, true);
      });
      badgesLayer.appendChild(btn);
      badgeEls[block.blockCode] = btn;
    });
  }

  function buildSelectOptions() {
    UNJ3_BLOCKS.forEach(function (block) {
      var opt = document.createElement("option");
      opt.value = block.blockCode;
      opt.textContent = block.blockName;
      blockSelect.appendChild(opt);
    });
  }

  function renderInfoPanel() {
    var block = state.selected ? blockByCode(state.selected) : null;

    if (!block) {
      infoPanel.innerHTML =
        '<h2>블록 정보</h2>' +
        '<p class="unj3-info-placeholder">지도를 확대하거나 이동한 뒤, 원하는 블록 배지를 클릭하면 상세 정보가 표시됩니다.</p>' +
        '<p class="unj3-info-hint">먼저 <strong>' + DEMO_BLOCK_CODE + ' 블록</strong>을 클릭해보세요.</p>';
      return;
    }

    var html = "";
    html += "<h2>" + block.blockName + "</h2>";
    html += '<dl class="unj3-info-list">';
    html += "<div><dt>블록 유형</dt><dd>" + block.landType + "</dd></div>";
    html += "<div><dt>공개 매물</dt><dd>현재 등록된 공개 매물 " + block.publicListingCount + "건</dd></div>";
    html += "<div><dt>상태</dt><dd>" + block.blockCode + " 블록 상세지도 준비 중</dd></div>";
    html += "</dl>";
    html += '<p class="unj3-info-note">추후 필지별 상세 정보와 실제 매물 데이터가 연동될 예정입니다.</p>';

    if (block.blockCode === DEMO_BLOCK_CODE) {
      html += '<button type="button" class="unj3-btn-gold" id="unj3DetailBtn">' + block.blockCode + " 상세지도 보기</button>";
    }

    infoPanel.innerHTML = html;

    var detailBtn = document.getElementById("unj3DetailBtn");
    if (detailBtn) {
      detailBtn.addEventListener("click", function () {
        openModal(block);
      });
    }
  }

  function selectBlock(code, shouldCenter) {
    state.selected = code;

    Object.keys(badgeEls).forEach(function (c) {
      var isActive = c === code;
      badgeEls[c].classList.toggle("is-active", isActive);
      badgeEls[c].setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    blockSelect.value = code || "";
    renderInfoPanel();

    if (code && shouldCenter) {
      var block = blockByCode(code);
      if (block) centerOnBlock(block);
    }
  }

  function deselectBlock() {
    selectBlock(null, false);
  }

  function openModal(block) {
    lastFocusedBeforeModal = document.activeElement;
    modalMessage.textContent = block.blockCode + " 블록 상세 필지도는 다음 단계에서 연결됩니다.";
    modalOverlay.hidden = false;
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });

  document.getElementById("unj3ZoomIn").addEventListener("click", function () {
    zoomStep(1.3);
  });
  document.getElementById("unj3ZoomOut").addEventListener("click", function () {
    zoomStep(1 / 1.3);
  });
  document.getElementById("unj3ZoomReset").addEventListener("click", function () {
    fitToView(true);
  });
  document.getElementById("unj3ZoomFit").addEventListener("click", function () {
    fitToView(true);
  });
  document.getElementById("unj3Deselect").addEventListener("click", deselectBlock);

  blockSelect.addEventListener("change", function () {
    if (blockSelect.value) {
      selectBlock(blockSelect.value, true);
    } else {
      deselectBlock();
    }
  });

  // ── 드래그 이동 (마우스 + 터치, Pointer Events) ──
  var pointers = {};
  var dragState = null;
  var pinchState = null;

  function getDistance(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getMidpoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }

  viewport.addEventListener("pointerdown", function (e) {
    viewport.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);

    if (ids.length === 1) {
      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        startTx: state.tx,
        startTy: state.ty
      };
      viewport.classList.add("is-dragging");
    } else if (ids.length === 2) {
      dragState = null;
      var p1 = pointers[ids[0]];
      var p2 = pointers[ids[1]];
      pinchState = {
        startDist: getDistance(p1, p2),
        startScale: state.scale,
        midpoint: getMidpoint(p1, p2)
      };
    }
  });

  viewport.addEventListener("pointermove", function (e) {
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);

    if (ids.length === 2 && pinchState) {
      var p1 = pointers[ids[0]];
      var p2 = pointers[ids[1]];
      var dist = getDistance(p1, p2);
      var ratio = dist / pinchState.startDist;
      var newScale = clamp(pinchState.startScale * ratio, state.minScale, MAX_SCALE);
      var rect = viewport.getBoundingClientRect();
      var mid = getMidpoint(p1, p2);
      setScaleAtPoint(newScale, mid.x - rect.left, mid.y - rect.top, false);
    } else if (dragState) {
      state.tx = dragState.startTx + (e.clientX - dragState.startX);
      state.ty = dragState.startTy + (e.clientY - dragState.startY);
      clampPosition();
      applyTransform(false);
    }
  });

  function endPointer(e) {
    delete pointers[e.pointerId];
    var ids = Object.keys(pointers);
    if (ids.length < 2) pinchState = null;
    if (ids.length === 0) {
      dragState = null;
      viewport.classList.remove("is-dragging");
      clampPosition();
      applyTransform(true);
    }
  }

  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);
  viewport.addEventListener("pointerleave", function (e) {
    if (Object.keys(pointers).length <= 1) endPointer(e);
  });

  viewport.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      var rect = viewport.getBoundingClientRect();
      var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setScaleAtPoint(state.scale * factor, e.clientX - rect.left, e.clientY - rect.top, false);
    },
    { passive: false }
  );

  window.addEventListener("resize", function () {
    state.fitScale = computeFitScale();
    state.minScale = state.fitScale * 0.6;
    clampPosition();
    applyTransform(false);
  });

  mapImage.addEventListener("error", function () {
    mapImage.hidden = true;
    imageError.hidden = false;
  });

  function init() {
    buildBadges();
    buildSelectOptions();
    renderInfoPanel();
    fitToView(false);
  }

  if (mapImage.complete && mapImage.naturalWidth > 0) {
    init();
  } else {
    mapImage.addEventListener("load", init, { once: true });
    mapImage.addEventListener(
      "error",
      function () {
        buildBadges();
        buildSelectOptions();
        renderInfoPanel();
        fitToView(false);
      },
      { once: true }
    );
  }
})();
