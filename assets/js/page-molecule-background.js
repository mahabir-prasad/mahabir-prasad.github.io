/**
 * assets/js/page-molecule-background.js
 *
 * Fetches and parses an .xyz coordinate file, then renders it as a small
 * ball-and-stick 3D molecule sitting fixed behind every page's content.
 * The molecule slowly auto-rotates and tilts further toward wherever the
 * mouse is, anywhere on the page — since the canvas itself has
 * pointer-events: none, this never blocks clicks on real content, but
 * mouse position is still tracked globally via `window`, so it works
 * everywhere, not just when hovering the canvas.
 *
 * Configured from _config.yml (see the `page_background_*` keys) via the
 * `window.pageBackground` object set in _includes/scripts.liquid.
 */
(function () {
  var config = window.pageBackground;
  if (!config || !config.moleculeUrl || typeof THREE === "undefined") return;

  // Rough CPK-style element colors and covalent radii (Å), used for both
  // atom sizing and for deciding which pairs of atoms are bonded.
  var ELEMENT_COLORS = {
    H: 0xcccccc, C: 0x444444, N: 0x3050f8, O: 0xff0d0d, F: 0x90e050,
    P: 0xff8000, S: 0xffff30, CL: 0x1ff01f, BR: 0xa62929, I: 0x940094,
  };
  var COVALENT_RADII = {
    H: 0.31, C: 0.76, N: 0.71, O: 0.66, F: 0.57,
    P: 1.07, S: 1.05, CL: 1.02, BR: 1.2, I: 1.39,
  };

  function elementColor(el) {
    return ELEMENT_COLORS[(el || "").toUpperCase()] || 0xff69b4;
  }
  function covalentRadius(el) {
    return COVALENT_RADII[(el || "").toUpperCase()] || 0.75;
  }

  // Standard .xyz format: atom count, a comment line, then one
  // "Element x y z" line per atom.
  function parseXYZ(text) {
    var lines = text.trim().split(/\r?\n/);
    var count = parseInt(lines[0].trim(), 10);
    var atoms = [];
    for (var i = 2; i < 2 + count && i < lines.length; i++) {
      var parts = lines[i].trim().split(/\s+/);
      if (parts.length < 4) continue;
      atoms.push({
        element: parts[0],
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
        z: parseFloat(parts[3]),
      });
    }
    return atoms;
  }

  // Two atoms are considered bonded if they're closer than ~1.3x the sum
  // of their covalent radii — a common, simple heuristic.
  function findBonds(atoms) {
    var bonds = [];
    for (var i = 0; i < atoms.length; i++) {
      for (var j = i + 1; j < atoms.length; j++) {
        var a = atoms[i], b = atoms[j];
        var dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        var threshold = (covalentRadius(a.element) + covalentRadius(b.element)) * 1.3;
        if (dist > 0.01 && dist < threshold) bonds.push([i, j]);
      }
    }
    return bonds;
  }

  // Recenter the molecule on its own centroid and scale it so its
  // furthest atom sits at `targetRadius` — keeps any molecule, large or
  // small, comfortably framed in view. Returns the scale factor used.
  function centerAndScale(atoms, targetRadius) {
    var cx = 0, cy = 0, cz = 0;
    atoms.forEach(function (a) { cx += a.x; cy += a.y; cz += a.z; });
    cx /= atoms.length; cy /= atoms.length; cz /= atoms.length;

    var maxDist = 0;
    atoms.forEach(function (a) {
      a.x -= cx; a.y -= cy; a.z -= cz;
      var d = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      if (d > maxDist) maxDist = d;
    });

    var scale = maxDist > 0 ? targetRadius / maxDist : 1;
    atoms.forEach(function (a) { a.x *= scale; a.y *= scale; a.z *= scale; });
    return scale;
  }

  function init(atoms) {
    // Bond detection uses real (unscaled) inter-atomic distances, since
    // the covalent radii table is in Ångströms — do this before scaling.
    var bonds = findBonds(atoms);
    var scale = centerAndScale(atoms, 5);

    var canvas = document.createElement("canvas");
    canvas.id = "page-background";
    document.body.insertBefore(canvas, document.body.firstChild);

    var style = document.createElement("style");
    style.textContent =
      "#page-background {" +
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%;" +
      "filter: blur(" + config.blur + "px);" +
      "opacity: " + config.opacity + ";" +
      "pointer-events: none;" +
      "}";
    document.head.appendChild(style);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 14;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    var moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    // Reuse one sphere geometry for every atom (just scaled per-atom) and
    // one cylinder geometry for every bond — cheap on memory/perf even
    // for a few hundred atoms.
    var sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    atoms.forEach(function (a) {
      var mesh = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({ color: elementColor(a.element) }));
      var r = covalentRadius(a.element) * scale * 0.5;
      mesh.scale.set(r, r, r);
      mesh.position.set(a.x, a.y, a.z);
      moleculeGroup.add(mesh);
    });

    var bondGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 8);
    var bondMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    var up = new THREE.Vector3(0, 1, 0);
    bonds.forEach(function (pair) {
      var a = atoms[pair[0]], b = atoms[pair[1]];
      var start = new THREE.Vector3(a.x, a.y, a.z);
      var end = new THREE.Vector3(b.x, b.y, b.z);
      var dir = new THREE.Vector3().subVectors(end, start);
      var length = dir.length();

      var mesh = new THREE.Mesh(bondGeo, bondMaterial);
      mesh.scale.set(1, length, 1);
      mesh.position.copy(start).addScaledVector(dir, 0.5);
      mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      moleculeGroup.add(mesh);
    });

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse tracking is global (window-level), not canvas-level, so it
    // keeps working no matter what element is under the cursor — the
    // canvas's pointer-events: none only stops it from blocking clicks,
    // it doesn't stop us from reading the cursor position.
    var targetRotX = 0, targetRotY = 0;
    if (!reduceMotion) {
      window.addEventListener(
        "mousemove",
        function (e) {
          var nx = (e.clientX / window.innerWidth) * 2 - 1;
          var ny = (e.clientY / window.innerHeight) * 2 - 1;
          targetRotY = nx * config.mouseStrength;
          targetRotX = ny * config.mouseStrength;
        },
        { passive: true }
      );
    }

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var autoRotateSpeed = reduceMotion ? 0 : 0.0015;

    function animate() {
      requestAnimationFrame(animate);
      moleculeGroup.rotation.y += autoRotateSpeed;
      if (!reduceMotion) {
        moleculeGroup.rotation.x += (targetRotX - moleculeGroup.rotation.x) * 0.05;
        moleculeGroup.rotation.y += (targetRotY - moleculeGroup.rotation.y) * 0.05;
      }
      renderer.render(scene, camera);
    }
    animate();
  }

  fetch(config.moleculeUrl)
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var atoms = parseXYZ(text);
      if (atoms.length === 0) {
        console.warn("page-molecule-background: no atoms parsed from", config.moleculeUrl);
        return;
      }
      init(atoms);
    })
    .catch(function (err) {
      console.warn("page-molecule-background: failed to load/parse xyz file", err);
    });
})();
