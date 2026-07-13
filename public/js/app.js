document.addEventListener("DOMContentLoaded", () => {

  /* =================================================================
     1. STATE MANAGEMENT & GLOBALS
     ================================================================= */
  let currentTheme = localStorage.getItem("ultron-theme") || "dark";
  const body = document.body;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initialize theme on load from storage
  if (currentTheme === "light") {
    body.classList.add("light-theme");
    body.classList.remove("dark-theme");
    if (themeLabel) themeLabel.textContent = "LIGHT";
  } else {
    body.classList.add("dark-theme");
    body.classList.remove("light-theme");
    if (themeLabel) themeLabel.textContent = "DARK";
  }

  /* =================================================================
     2. THEME SWITCHER
     ================================================================= */
  function toggleTheme() {
    if (currentTheme === "dark") {
      currentTheme = "light";
      body.classList.add("light-theme");
      body.classList.remove("dark-theme");
      if (themeLabel) themeLabel.textContent = "LIGHT";
      localStorage.setItem("ultron-theme", "light");
      logToTerminal(">> SYSTEM THEME SET TO LIGHT MODE // HIGH CONTRAST ACTIVE.");
    } else {
      currentTheme = "dark";
      body.classList.add("dark-theme");
      body.classList.remove("light-theme");
      if (themeLabel) themeLabel.textContent = "DARK";
      localStorage.setItem("ultron-theme", "dark");
      logToTerminal(">> SYSTEM THEME SET TO DARK MODE // BLUEPRINT NAVY ACTIVE.");
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  /* =================================================================
     3. SCROLL-AWARE NAVIGATION HEADER
     ================================================================= */
  const mainNav = document.getElementById("main-nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      mainNav.classList.add("scrolled");
    } else {
      mainNav.classList.remove("scrolled");
    }
  });

  /* =================================================================
     4. MOBILE HAMBURGER MENU DRAWER
     ================================================================= */
  const menuToggle = document.getElementById("menu-toggle");
  const navList = document.getElementById("nav-list");
  const navLinks = document.querySelectorAll(".nav-link");

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      menuToggle.classList.toggle("active");
      navList.classList.toggle("active");
    });

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("active");
        navList.classList.remove("active");
      });
    });
  }

  /* =================================================================
     5. LIVE UTC CLOCK & CORNER DRIFT COORDINATES
     ================================================================= */
  function updateTelemetry() {
    const now = new Date();
    const utcString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    document.querySelectorAll('.telemetry-clock').forEach(el => {
      el.textContent = utcString;
    });

    const baseLat = 37.77490;
    const baseLon = -122.41940;
    const driftFactor = 0.00015;
    const driftLat = baseLat + (Math.sin(now.getTime() * 0.0003) * driftFactor);
    const driftLon = baseLon + (Math.cos(now.getTime() * 0.0002) * driftFactor);

    document.querySelectorAll('.telemetry-coords').forEach(el => {
      el.textContent = `LAT: ${driftLat.toFixed(5)} / LON: ${driftLon.toFixed(5)}`;
    });
  }
  setInterval(updateTelemetry, 1000);
  updateTelemetry();

  /* =================================================================
     6. SCROLL REVEALS (VIEWPORT REVEALS)
     ================================================================= */
  const revealElements = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add("in-view"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -50px 0px"
    });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* =================================================================
     7. STATS COUNT-UP TIMER
     ================================================================= */
  const statCountElements = document.querySelectorAll(".stat-count");
  if (prefersReducedMotion) {
    statCountElements.forEach(el => {
      el.textContent = el.getAttribute("data-target");
    });
  } else {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-target"), 10);
          const duration = 2000;
          let startTimestamp = null;

          function step(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easedProgress = progress * (2 - progress); // Quad Ease-Out
            el.textContent = Math.floor(easedProgress * target).toLocaleString();

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              el.textContent = target.toLocaleString();
            }
          }
          window.requestAnimationFrame(step);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statCountElements.forEach(el => statsObserver.observe(el));
  }

  /* =================================================================
     8. DYNAMIC NAVIGATION HIGHLIGHTING
     ================================================================= */
  const sections = document.querySelectorAll("section[id]");
  const navLinksArr = document.querySelectorAll(".nav-link");

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute("id");
        navLinksArr.forEach(link => {
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: "-25% 0px -40% 0px"
  });
  sections.forEach(sec => navObserver.observe(sec));

  /* =================================================================
     9. CAPABILITIES INTERACTIVE CARDS
     ================================================================= */
  const capCards = document.querySelectorAll(".cap-card");
  capCards.forEach(card => {
    card.addEventListener("click", () => {
      const isExpanded = card.classList.contains("expanded");
      capCards.forEach(c => c.classList.remove("expanded"));
      if (!isExpanded) {
        card.classList.add("expanded");
      }
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* =================================================================
     10. INTERACTIVE TERMINAL LOG SHELL
     ================================================================= */
  const terminalInput = document.getElementById("terminal-input");
  const consoleHistory = document.getElementById("console-history");
  const consoleBody = document.getElementById("console-body");

  // Telemetry logs for automatic idle typing
  const idleLogs = [
    "[SYS_OK] Swarm telemetry transmission aligned.",
    "[MESH] Latency optimized to 0.78ms on 42 transceiver nodes.",
    "[SYS_WARN] Wind speeds near safety geofence threshold: 4.8m/s.",
    "[SYS_OK] LiDAR spatial point-cloud synced.",
    "[GPS] Node Core drift offset: 0.0001m.",
    "[BAT] Core energy capacity: 94.2% stabilized.",
    "[SECURITY] Safety envelope integrity: 100.00% verified."
  ];

  let idleTimer = null;
  let isIdleActive = true;
  let logIntervalTimer = null;

  function logToTerminal(text, type = "cmd-output") {
    if (!consoleHistory) return;
    const line = document.createElement("div");
    line.className = `console-history-line ${type}`;
    line.textContent = text;
    consoleHistory.appendChild(line);

    // Scroll to bottom of terminal
    consoleBody.scrollTop = consoleBody.scrollHeight;

    // Limit log history size to 30 elements
    while (consoleHistory.childNodes.length > 30) {
      consoleHistory.removeChild(consoleHistory.firstChild);
    }
  }

  // Auto-generate logs when user is idle
  function generateIdleLog() {
    if (!isIdleActive) return;
    const randomLog = idleLogs[Math.floor(Math.random() * idleLogs.length)];
    logToTerminal(randomLog);
  }

  function resetIdleTimer() {
    isIdleActive = false;
    clearInterval(logIntervalTimer);
    clearTimeout(idleTimer);

    // Restart idle mode after 8 seconds of inactivity
    idleTimer = setTimeout(() => {
      isIdleActive = true;
      logToTerminal(">> SYSTEM: RETURNING TERMINAL TO READ-ONLY TELEMETRY STREAM...");
      logIntervalTimer = setInterval(generateIdleLog, 5000);
    }, 8000);
  }

  // Pre-load default logs
  logToTerminal("====================================================", "cmd-output");
  logToTerminal("ULTRON COMS RELAY HOST CORE v4.12.0", "cmd-output");
  logToTerminal("TYPE 'help' TO VIEW COMMAND SHELL DIRECTIVES.", "cmd-output");
  logToTerminal("====================================================", "cmd-output");
  logIntervalTimer = setInterval(generateIdleLog, 4000);

  if (terminalInput) {
    terminalInput.addEventListener("focus", () => {
      resetIdleTimer();
    });

    terminalInput.addEventListener("keydown", (e) => {
      resetIdleTimer();

      if (e.key === "Enter") {
        const cmdText = terminalInput.value.trim();
        terminalInput.value = "";

        if (cmdText === "") return;

        // Print entered command
        logToTerminal(`guest@ultron:~$ ${cmdText}`, "cmd-input");

        // Parse command
        const args = cmdText.split(" ");
        const command = args[0].toLowerCase();

        switch (command) {
          case "help":
            logToTerminal(
              "AVAILABLE COMMANDS:\n" +
              "  help        - Displays command shell directory\n" +
              "  status      - Returns drone swarm telemetry diagnostics\n" +
              "  nodes       - Returns active network coordinate mappings\n" +
              "  burst       - Dispatches signal pulse burst through nodes\n" +
              "  theme       - Toggles dark / light display layout themes\n" +
              "  clear       - Resets shell history log console",
              "cmd-output"
            );
            break;

          case "status":
            logToTerminal(
              "FLEET STATUS: OPERATIONAL\n" +
              `ACTIVE UAVs : ${document.getElementById("telemetry-node-count").textContent} platforms\n` +
              "ALTITUDE    : 124m MSL\n" +
              "WIND SHIELD : 3.4m/s ENE\n" +
              "SIGNAL RATIO: 99.98% / Stable",
              "cmd-output"
            );
            break;

          case "nodes":
            logToTerminal(
              `LISTING ACTIVE CORE NODES [Total: ${nodes.length}]:\n` +
              nodes.map(n => `  Node #${n.id.toString().padStart(2, '0')} - Lat/Lon Drift Offset: [${(Math.sin(n.seed) * 0.0001).toFixed(6)}, ${(Math.cos(n.seed) * 0.0001).toFixed(6)}]`).join("\n"),
              "cmd-output"
            );
            break;

          case "burst":
            triggerSignalBurst();
            logToTerminal(">> TELEMETRY: HIGH-FREQUENCY WAVE DISPATCHED SUCCESSFULLY.", "cmd-output");
            break;

          case "theme":
            toggleTheme();
            break;

          case "clear":
            consoleHistory.innerHTML = "";
            logToTerminal("Relay logs cleared.");
            break;

          default:
            logToTerminal(`ERR: Unrecognized directive '${command}'. Type 'help' for options.`, "cmd-output");
        }
      }
    });
  }

  /* =================================================================
     11. RUNTIME SVG NODE NETWORK & DIAGNOSTICS CONTROLS
     ================================================================= */
  const svgNodesContainer = document.getElementById("svg-nodes");
  const svgLinksContainer = document.getElementById("svg-links");
  const svgPulsesContainer = document.getElementById("svg-pulses");

  // Controls Sliders Elements
  const sliderSpeed = document.getElementById("control-speed");
  const sliderPulses = document.getElementById("control-pulses");
  const sliderNodes = document.getElementById("control-nodes");
  
  const valSpeed = document.getElementById("val-speed");
  const valPulses = document.getElementById("val-pulses");
  const valNodes = document.getElementById("val-nodes");
  const btnBurst = document.getElementById("btn-burst");

  const telemetryNodeCount = document.getElementById("telemetry-node-count");
  const footerNodeCount = document.getElementById("footer-node-count");

  // Network Parameters
  const cx = 300;
  const cy = 300;
  let nodes = [];
  let links = [];
  let pulses = [];
  
  // Dynamic settings governed by sliders
  let driftSpeedMultiplier = 0.3; // sliderSpeed (0.3 of default)
  let maxPulseCount = 4; // sliderPulses
  let rotationAngleStep = 0.0006;

  // Re-generate complete connected mesh structure
  function rebuildNetwork(targetNodeCount) {
    nodes = [];
    links = [];

    // 1. Add Core Node
    nodes.push({
      id: 0,
      radius: 0,
      baseAngle: 0,
      x: cx,
      y: cy,
      size: 8,
      color: "var(--accent)",
      driftSpeed: 0,
      driftRange: 0,
      seed: 0
    });

    // Ring 1 (Inner): up to 4 nodes, Radius 80
    const ring1Limit = Math.min(4, targetNodeCount - 1);
    for (let i = 0; i < ring1Limit; i++) {
      nodes.push({
        id: nodes.length,
        radius: 80,
        baseAngle: (i * Math.PI / 2),
        size: 5,
        color: "var(--cyan)",
        driftSpeed: 0.0015,
        driftRange: 6,
        seed: Math.random() * 100
      });
      // Link inner nodes to Center (0)
      links.push({ from: 0, to: nodes.length - 1 });
    }
    // Link inner to inner circularly
    for (let i = 1; i <= ring1Limit; i++) {
      const nextIndex = (i === ring1Limit) ? 1 : i + 1;
      if (nextIndex !== i) links.push({ from: i, to: nextIndex });
    }

    // Ring 2 (Middle): up to 8 nodes, Radius 160
    if (nodes.length < targetNodeCount) {
      const ring2Limit = Math.min(8, targetNodeCount - nodes.length);
      const ring2Offset = nodes.length;
      for (let i = 0; i < ring2Limit; i++) {
        nodes.push({
          id: nodes.length,
          radius: 160,
          baseAngle: (i * Math.PI / (ring2Limit / 2)) + 0.3,
          size: 4,
          color: "var(--muted)",
          driftSpeed: 0.001,
          driftRange: 9,
          seed: Math.random() * 100
        });
        // Link to nearest inner node (if inner nodes exist)
        if (ring1Limit > 0) {
          const closestInner = 1 + (i % ring1Limit);
          links.push({ from: nodes.length - 1, to: closestInner });
        }
      }
      // Link middle circularly
      for (let i = 0; i < ring2Limit; i++) {
        const fromIdx = ring2Offset + i;
        const toIdx = ring2Offset + ((i + 1) % ring2Limit);
        links.push({ from: fromIdx, to: toIdx });
      }
    }

    // Ring 3 (Outer): up to 18 nodes, Radius 240
    if (nodes.length < targetNodeCount) {
      const ring3Limit = targetNodeCount - nodes.length;
      const ring3Offset = nodes.length;
      const ring2Count = ring3Offset - (ring1Limit + 1);
      
      for (let i = 0; i < ring3Limit; i++) {
        nodes.push({
          id: nodes.length,
          radius: 240,
          baseAngle: (i * Math.PI / (ring3Limit / 2)) + 0.7,
          size: 3.5,
          color: "var(--muted)",
          driftSpeed: 0.0008,
          driftRange: 12,
          seed: Math.random() * 100
        });
        // Link to middle nodes (if middle nodes exist)
        if (ring2Count > 0) {
          const closestMiddle = (ring1Limit + 1) + (i % ring2Count);
          links.push({ from: nodes.length - 1, to: closestMiddle });
        }
      }
    }

    // Recreate SVG Line/Circle tags
    if (svgLinksContainer && svgNodesContainer) {
      svgLinksContainer.innerHTML = "";
      svgNodesContainer.innerHTML = "";

      // A. Add lines to DOM
      links.forEach(link => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("stroke", "var(--line)");
        line.setAttribute("stroke-width", "1");
        line.setAttribute("opacity", "0.55");
        svgLinksContainer.appendChild(line);
        link.el = line;
      });

      // B. Add nodes to DOM
      nodes.forEach(node => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Glow layer for Core (0) or Cyan signals
        if (node.id === 0 || node.color === "var(--cyan)") {
          const glowCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          glowCircle.setAttribute("r", node.size * 2);
          glowCircle.setAttribute("fill", node.color);
          glowCircle.setAttribute("opacity", "0.15");
          glowCircle.setAttribute("filter", "url(#svg-glow)");
          group.appendChild(glowCircle);
        }

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", node.size);
        circle.setAttribute("fill", node.color);
        group.appendChild(circle);

        if (node.id === 0) {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.textContent = "CORE_0";
          text.setAttribute("font-family", "var(--font-mono)");
          text.setAttribute("font-size", "9px");
          text.setAttribute("fill", "var(--accent)");
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dy", "-14");
          group.appendChild(text);
        }

        svgNodesContainer.appendChild(group);
        node.el = group;
      });
    }

    // Update displays
    if (telemetryNodeCount) telemetryNodeCount.textContent = targetNodeCount;
    if (footerNodeCount) footerNodeCount.textContent = targetNodeCount;
  }

  // Adjust telemetry pulses count on slider changes
  function updatePulsesQuantity() {
    if (!svgPulsesContainer) return;
    
    // Clear and redraw pulses
    svgPulsesContainer.innerHTML = "";
    pulses = [];

    if (prefersReducedMotion) return;

    for (let i = 0; i < maxPulseCount; i++) {
      if (links.length === 0) break;
      const randomLink = links[Math.floor(Math.random() * links.length)];
      
      const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pulseCircle.setAttribute("r", "3");
      pulseCircle.setAttribute("fill", "var(--cyan)");
      pulseCircle.setAttribute("filter", "url(#svg-glow)");
      svgPulsesContainer.appendChild(pulseCircle);

      pulses.push({
        el: pulseCircle,
        fromNode: randomLink.from,
        toNode: randomLink.to,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.004,
        isBurst: false
      });
    }
  }

  // Launch a temporary burst of 10 rapid signal pulses from Core Node (0)
  function triggerSignalBurst() {
    if (prefersReducedMotion || !svgPulsesContainer) return;

    // Trigger oscilloscope signal burst wave spike
    oscilloscopeBurst = 3.2;

    // Find links that connect to node 0
    const coreLinks = links.filter(l => l.from === 0 || l.to === 0);
    if (coreLinks.length === 0) return;

    for (let i = 0; i < 10; i++) {
      const selectedLink = coreLinks[Math.floor(Math.random() * coreLinks.length)];
      const targetNode = (selectedLink.from === 0) ? selectedLink.to : selectedLink.from;
      
      const burstPulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      // Style burst pulse as orange (accent) to differentiate it
      burstPulseCircle.setAttribute("r", "4");
      burstPulseCircle.setAttribute("fill", "var(--accent)");
      burstPulseCircle.setAttribute("filter", "url(#svg-glow)");
      svgPulsesContainer.appendChild(burstPulseCircle);

      pulses.push({
        el: burstPulseCircle,
        fromNode: 0,
        toNode: targetNode,
        progress: 0,
        speed: 0.015 + Math.random() * 0.01, // Fast pulses
        isBurst: true // Flag to remove after 1 full cycle
      });
    }
  }

  /* Sliders Event Listeners */
  if (sliderSpeed) {
    sliderSpeed.addEventListener("input", (e) => {
      const speedVal = parseInt(e.target.value, 10);
      valSpeed.textContent = `${speedVal}%`;
      // Map to values
      driftSpeedMultiplier = speedVal / 100;
      rotationAngleStep = 0.002 * (speedVal / 100);
    });
  }

  if (sliderPulses) {
    sliderPulses.addEventListener("input", (e) => {
      const pulseVal = parseInt(e.target.value, 10);
      valPulses.textContent = pulseVal;
      maxPulseCount = pulseVal;
      updatePulsesQuantity();
    });
  }

  if (sliderNodes) {
    sliderNodes.addEventListener("input", (e) => {
      const nodeVal = parseInt(e.target.value, 10);
      valNodes.textContent = nodeVal;
      rebuildNetwork(nodeVal);
      updatePulsesQuantity();
    });
  }

  if (btnBurst) {
    btnBurst.addEventListener("click", () => {
      triggerSignalBurst();
      logToTerminal(">> TELEMETRY: DISPATCHING DYNAMIC SIGNAL PULSE BURST...");
    });
  }

  // SVG network animation frame loop
  let rotationAngle = 0;

  function animate() {
    const time = Date.now();
    rotationAngle += rotationAngleStep;

    // A. Drift nodes position based on orbit rotation + offset
    nodes.forEach(node => {
      if (node.id === 0) return; // Core node is absolute center (300, 300)

      const angle = node.baseAngle + rotationAngle;
      const driftX = Math.sin(time * node.driftSpeed * driftSpeedMultiplier + node.seed) * node.driftRange;
      const driftY = Math.cos(time * node.driftSpeed * driftSpeedMultiplier + node.seed) * node.driftRange;

      node.x = cx + node.radius * Math.cos(angle) + driftX;
      node.y = cy + node.radius * Math.sin(angle) + driftY;
    });

    // B. Draw lines mapped to updated node coords
    links.forEach(lineItem => {
      const fromNodeObj = nodes.find(n => n.id === lineItem.from);
      const toNodeObj = nodes.find(n => n.id === lineItem.to);
      if (fromNodeObj && toNodeObj && lineItem.el) {
        lineItem.el.setAttribute("x1", fromNodeObj.x);
        lineItem.el.setAttribute("y1", fromNodeObj.y);
        lineItem.el.setAttribute("x2", toNodeObj.x);
        lineItem.el.setAttribute("y2", toNodeObj.y);
      }
    });

    // C. Translate node circle groups
    nodes.forEach(node => {
      if (node.el) {
        node.el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      }
    });

    // D. Animate active signal pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.progress += pulse.speed;

      if (pulse.progress >= 1) {
        if (pulse.isBurst) {
          // Burst pulses are deleted once they complete their path
          if (pulse.el && pulse.el.parentNode) {
            pulse.el.parentNode.removeChild(pulse.el);
          }
          pulses.splice(i, 1);
          continue;
        } else {
          // Normal loop pulses choose a new connected path from their toNode
          pulse.progress = 0;
          pulse.fromNode = pulse.toNode;
          
          const nextLinks = links.filter(l => l.from === pulse.fromNode || l.to === pulse.fromNode);
          if (nextLinks.length > 0) {
            const selectedLink = nextLinks[Math.floor(Math.random() * nextLinks.length)];
            pulse.toNode = (selectedLink.from === pulse.fromNode) ? selectedLink.to : selectedLink.from;
          } else {
            pulse.toNode = 0; // fallback to core
          }
          pulse.speed = 0.006 + Math.random() * 0.005;
        }
      }

      const start = nodes.find(n => n.id === pulse.fromNode);
      const end = nodes.find(n => n.id === pulse.toNode);
      if (start && end) {
        const px = (1 - pulse.progress) * start.x + pulse.progress * end.x;
        const py = (1 - pulse.progress) * start.y + pulse.progress * end.y;
        pulse.el.setAttribute("cx", px);
        pulse.el.setAttribute("cy", py);
      }
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    } else {
      // Draw static positions on reduced motion and stop requestAnimationFrame
      nodes.forEach(node => {
        if (node.id === 0) return;
        node.x = cx + node.radius * Math.cos(node.baseAngle);
        node.y = cy + node.radius * Math.sin(node.baseAngle);
      });
      links.forEach(lineItem => {
        const from = nodes.find(n => n.id === lineItem.from);
        const to = nodes.find(n => n.id === lineItem.to);
        if (from && to && lineItem.el) {
          lineItem.el.setAttribute("x1", from.x);
          lineItem.el.setAttribute("y1", from.y);
          lineItem.el.setAttribute("x2", to.x);
          lineItem.el.setAttribute("y2", to.y);
        }
      });
      nodes.forEach(node => {
        if (node.el) node.el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      });
      if (svgPulsesContainer) svgPulsesContainer.style.display = "none";
    }
  }

  // Initialize network elements with 17 default nodes
  rebuildNetwork(17);
  updatePulsesQuantity();
  animate();

  // Initialize Swarm Diagnostics canvas animations
  initSwarmDiagnostics();

  /* =================================================================
     12. SWARM DIAGNOSTICS & SCIENTIFIC ANIMATIONS
     ================================================================= */
  let oscilloscopeBurst = 1.0;

  function initSwarmDiagnostics() {
    // -------------------------------------------------------------
    // A. Sonar Radar Visualizer
    // -------------------------------------------------------------
    const radarCanvas = document.getElementById("radar-canvas");
    if (radarCanvas) {
      const ctx = radarCanvas.getContext("2d");
      const width = radarCanvas.width;
      const height = radarCanvas.height;
      const rcx = width / 2;
      const rcy = height / 2;
      const maxRadius = Math.min(width, height) * 0.45;
      
      let sweepAngle = 0;
      let sweepSpeed = 0.015;

      const blips = [
        { angle: 0.5, distance: maxRadius * 0.4, intensity: 0 },
        { angle: 1.8, distance: maxRadius * 0.75, intensity: 0 },
        { angle: 3.2, distance: maxRadius * 0.55, intensity: 0 },
        { angle: 4.5, distance: maxRadius * 0.9, intensity: 0 },
        { angle: 5.7, distance: maxRadius * 0.65, intensity: 0 }
      ];

      const txtRadarAngle = document.getElementById("txt-radar-angle");
      const txtRadarTargets = document.getElementById("txt-radar-targets");

      function drawRadar() {
        if (prefersReducedMotion) return;

        ctx.fillStyle = currentTheme === "light" ? "rgba(244, 246, 249, 0.15)" : "rgba(10, 13, 18, 0.15)";
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = currentTheme === "light" ? "rgba(20, 184, 166, 0.18)" : "rgba(20, 184, 166, 0.12)";
        
        ctx.beginPath();
        ctx.arc(rcx, rcy, maxRadius * 0.33, 0, Math.PI * 2);
        ctx.arc(rcx, rcy, maxRadius * 0.66, 0, Math.PI * 2);
        ctx.arc(rcx, rcy, maxRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rcx - maxRadius, rcy);
        ctx.lineTo(rcx + maxRadius, rcy);
        ctx.moveTo(rcx, rcy - maxRadius);
        ctx.lineTo(rcx, rcy + maxRadius);
        ctx.stroke();

        sweepAngle = (sweepAngle + sweepSpeed) % (Math.PI * 2);
        if (txtRadarAngle) {
          txtRadarAngle.textContent = `${(sweepAngle * 180 / Math.PI).toFixed(1)}°`;
        }

        ctx.lineWidth = 2;
        const trailSteps = 25;
        for (let i = 0; i < trailSteps; i++) {
          const alpha = (trailSteps - i) / trailSteps * 0.32;
          ctx.strokeStyle = currentTheme === "light" ? `rgba(20, 184, 166, ${alpha})` : `rgba(20, 184, 166, ${alpha})`;
          const a = sweepAngle - (i * 0.012);
          ctx.beginPath();
          ctx.moveTo(rcx, rcy);
          ctx.lineTo(rcx + maxRadius * Math.cos(a), rcy + maxRadius * Math.sin(a));
          ctx.stroke();
        }

        let loggedCount = 0;
        blips.forEach(blip => {
          const angleDiff = Math.abs(sweepAngle - blip.angle);
          if (angleDiff < 0.05) {
            blip.intensity = 1.0;
          }

          if (blip.intensity > 0) {
            loggedCount++;
            const bx = rcx + blip.distance * Math.cos(blip.angle);
            const by = rcy + blip.distance * Math.sin(blip.angle);

            ctx.fillStyle = currentTheme === "light" ? `rgba(255, 90, 35, ${blip.intensity})` : `rgba(255, 106, 57, ${blip.intensity})`;
            ctx.beginPath();
            ctx.arc(bx, by, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = currentTheme === "light" ? `rgba(255, 90, 35, ${blip.intensity * 0.3})` : `rgba(255, 106, 57, ${blip.intensity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bx, by, 12 - blip.intensity * 6, 0, Math.PI * 2);
            ctx.stroke();

            blip.intensity -= 0.006;
          }
        });

        if (txtRadarTargets) {
          txtRadarTargets.textContent = loggedCount;
        }

        requestAnimationFrame(drawRadar);
      }
      drawRadar();
    }

    // -------------------------------------------------------------
    // B. Oscilloscope Waveform Visualizer
    // -------------------------------------------------------------
    const signalCanvas = document.getElementById("signal-canvas");
    if (signalCanvas) {
      const ctx = signalCanvas.getContext("2d");
      const width = signalCanvas.width;
      const height = signalCanvas.height;
      
      let waveOffset = 0;
      const txtSignalJitter = document.getElementById("txt-signal-jitter");
      const txtSignalFrequency = document.getElementById("txt-signal-frequency");

      function drawOscilloscope() {
        if (prefersReducedMotion) return;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = currentTheme === "light" ? "rgba(20, 184, 166, 0.08)" : "rgba(20, 184, 166, 0.05)";
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let x = 40; x < width; x += 40) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 30; y < height; y += 30) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        ctx.strokeStyle = currentTheme === "light" ? "rgba(20, 184, 166, 0.2)" : "rgba(20, 184, 166, 0.1)";
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        if (txtSignalJitter && Math.random() < 0.1) {
          const jitterVal = 0.02 + Math.random() * 0.03 * oscilloscopeBurst;
          txtSignalJitter.textContent = `${jitterVal.toFixed(3)} ms`;
        }
        if (txtSignalFrequency && Math.random() < 0.05) {
          const freqVal = 4.80 + Math.random() * 0.05;
          txtSignalFrequency.textContent = `${freqVal.toFixed(2)} GHz`;
        }

        waveOffset += 0.04 * (1.0 + (oscilloscopeBurst - 1.0) * 0.5);
        oscilloscopeBurst += (1.0 - oscilloscopeBurst) * 0.04;

        ctx.strokeStyle = "var(--cyan)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const freq1 = 0.025;
          const freq2 = 0.008;
          const amplitude1 = (18 + Math.sin(x * 0.01) * 6) * oscilloscopeBurst;
          const amplitude2 = 8 * Math.sin(x * 0.005) * oscilloscopeBurst;
          
          const y = height / 2 
            + Math.sin(x * freq1 - waveOffset) * amplitude1 
            + Math.sin(x * freq2 + waveOffset * 0.5) * amplitude2
            + (Math.random() - 0.5) * 1.5;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        requestAnimationFrame(drawOscilloscope);
      }
      drawOscilloscope();
    }

    // -------------------------------------------------------------
    // C. System Diagnostic Matrix Grid
    // -------------------------------------------------------------
    const matrixGrid = document.getElementById("status-matrix-grid");
    const txtMatrixHealthy = document.getElementById("txt-matrix-healthy");
    const txtMatrixFlops = document.getElementById("txt-matrix-flops");

    if (matrixGrid) {
      const cells = [];
      const totalCells = 100;
      
      for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        matrixGrid.appendChild(cell);
        
        cells.push({
          el: cell,
          state: 1,
          timer: 0
        });
      }

      function updateMatrix() {
        let healthyCount = 0;

        cells.forEach(cell => {
          if (cell.state !== 1) {
            cell.timer--;
            if (cell.timer <= 0) {
              cell.state = 1;
              cell.el.className = "matrix-cell";
            }
          } else {
            healthyCount++;
          }
        });

        if (txtMatrixHealthy) txtMatrixHealthy.textContent = healthyCount;
        if (txtMatrixFlops) {
          const flops = 12.42 + (Math.random() - 0.5) * 0.08;
          txtMatrixFlops.textContent = `${flops.toFixed(2)} TFLOPs`;
        }

        if (Math.random() < 0.35) {
          const randomIndex = Math.floor(Math.random() * totalCells);
          const cell = cells[randomIndex];

          if (cell.state === 1) {
            const type = Math.random() < 0.75 ? 0 : -1;
            cell.state = type;
            cell.timer = Math.floor(5 + Math.random() * 8);
            
            if (type === 0) {
              cell.el.className = "matrix-cell status-sync";
            } else {
              cell.el.className = "matrix-cell status-repair";
            }
          }
        }
      }

      setInterval(updateMatrix, 800);
      updateMatrix();
    }
  }

});
