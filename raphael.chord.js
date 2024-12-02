(function (Raphael) {
  // Define the Raphael.chord namespace
  Raphael.chord = {
      data: null, // To store loaded chord data
  };

  /**
   * Load chord data from a specific JSON file.
   * @param {string} url - Path to the JSON file.
   * @returns {Promise<void>} - Resolves when data is loaded successfully.
   */
  Raphael.chord.loadData = async function (url) {
      try {
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const jsonData = await response.json();
          Raphael.chord.data = jsonData;
          console.log("Chord data loaded successfully:", jsonData);
      } catch (error) {
          console.error("Failed to load chord data:", error);
          Raphael.chord.data = null; // Clear existing data on failure
      }
  };

  /**
   * Find a chord by instrument, root, type, and variation.
   * @param {string} instrument - Name of the instrument.
   * @param {string} root - Root note of the chord.
   * @param {string} name - Chord type (e.g., maj, min).
   * @param {number} variation - Variation number (1-based index).
   * @returns {Array|undefined} - Chord data array or undefined if not found.
   */
  Raphael.chord.find = function (instrument, root, name, variation) {
      if (!Raphael.chord.data) {
          console.error("Chord data not loaded. Please load data using loadData method.");
          return undefined;
      }

      const instrumentData = Raphael.chord.data.chords;
      if (!instrumentData) {
          console.error(`Instrument data not found.`);
          return undefined;
      }

      const chord = instrumentData.find(c => c.root === root);
      if (!chord) {
          console.error(`Chord root ${root} not found.`);
          return undefined;
      }

      const type = chord.types.find(t => t.name === name);
      if (!type) {
          console.error(`Chord type ${name} not found for root ${root}.`);
          return undefined;
      }

      if (variation > type.variations.length) {
          console.warn(`Variation ${variation} exceeds available variations. Defaulting to last variation.`);
          variation = type.variations.length;
      }

      return type.variations[variation - 1];
  };

  /**
   * Render a chord diagram.
   * @param {HTMLElement} container - DOM element to render the chord in.
   * @param {Array} chordData - Array of fret data for the chord.
   * @param {number} stringCount - Number of strings (default: 6 for guitar).
   */
  Raphael.chord.render = function (container, chordData, stringCount = 6) {
      const paper = Raphael(container, 400, 200);
      const x = 50; // X offset
      const y = 50; // Y offset
      const stringSpacing = 30;
      const fretSpacing = 30;

      // Draw strings
      for (let i = 0; i < stringCount; i++) {
          paper.path(`M${x + i * stringSpacing},${y}V${y + 5 * fretSpacing}`)
              .attr({ stroke: '#000', 'stroke-width': 2 });
      }

      // Draw frets
      for (let i = 0; i <= 5; i++) {
          paper.path(`M${x},${y + i * fretSpacing}H${x + (stringCount - 1) * stringSpacing}`)
              .attr({ stroke: '#000', 'stroke-width': 1 });
      }

      // Draw notes
      for (let i = 0; i < chordData.length; i++) {
          if (chordData[i] !== -1) {
              paper.circle(
                  x + i * stringSpacing,
                  y + chordData[i] * fretSpacing - fretSpacing / 2,
                  10
              ).attr({ fill: '#000' });
          }
      }
  };
})(window.Raphael);
