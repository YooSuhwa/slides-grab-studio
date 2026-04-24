// Figma Sandbox — creates slides from SVG data received via the UI iframe

figma.showUI(__html__, { width: 380, height: 480 });

interface SlideData {
  name: string;
  svg: string;
  notes?: string;
}

// The Figma plugin API does not currently expose write access to a slide's
// presenter notes (feature request open as of 2026-04). We stash the text on
// the slide as pluginData so it survives in the file and surface it in the
// UI log so the presenter can paste it into Figma's native notes field.
const NOTES_PLUGIN_DATA_KEY = 'slidesGrabNotes';

figma.ui.onmessage = async (msg: { type: string; slides?: SlideData[] }) => {
  if (msg.type === 'create-slides' && msg.slides) {
    const { slides } = msg;
    const created: SceneNode[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];

      try {
        // Create a new slide in Figma Slides
        const slideNode = figma.createSlide();

        // Create SVG node and append to slide
        const svgNode = figma.createNodeFromSvg(slide.svg);
        slideNode.appendChild(svgNode);

        // Position SVG at origin
        svgNode.x = 0;
        svgNode.y = 0;

        if (slide.notes && slide.notes.trim()) {
          slideNode.setPluginData(NOTES_PLUGIN_DATA_KEY, slide.notes);
          figma.ui.postMessage({
            type: 'figma-notes',
            name: slide.name,
            notes: slide.notes,
          });
        }

        created.push(slideNode);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        figma.ui.postMessage({
          type: 'figma-error',
          message: `Failed to create slide "${slide.name}": ${errMsg}`,
          index: i,
        });
      }

      figma.ui.postMessage({
        type: 'figma-progress',
        current: i + 1,
        total: slides.length,
      });
    }

    figma.currentPage.selection = created;

    figma.ui.postMessage({
      type: 'figma-done',
      count: created.length,
    });
  }
};
