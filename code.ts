// ============================================================================
// UI Make - Design System Generator
// Comprehensive Figma Plugin for generating UI Kit components
// ============================================================================

figma.showUI(__html__, { width: 320, height: 500 });

// ============================================================================
// Constants & Configuration
// ============================================================================

const SECTIONS = [
  "Buttons",
  "Navigation",
  "Forms",
  "Feedback",
  "Layout",
  "Content",
] as const;

// Color conversion helper
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.067, g: 0.067, b: 0.067 };
}

// Default colors (can be overridden)
let THEME_COLORS = {
  text: { r: 0.067, g: 0.067, b: 0.067 }, // #111
  muted: { r: 0.4, g: 0.4, b: 0.4 }, // #666
  border: { r: 0.898, g: 0.902, b: 0.922 }, // #E5E7EB
  primary: { r: 0.235, g: 0.596, b: 0.435 }, // #3C986F
  danger: { r: 0.851, g: 0.176, b: 0.125 }, // #D92D20
  white: { r: 1, g: 1, b: 1 },
  success: { r: 0.063, g: 0.725, b: 0.506 }, // #10B981
  warning: { r: 0.961, g: 0.620, b: 0.043 }, // #F59E0B
  info: { r: 0.231, g: 0.510, b: 0.965 }, // #3B82F6
};

// Get current colors (always returns latest THEME_COLORS)
function getColors() {
  return THEME_COLORS;
}

const SIZES = {
  Small: { height: 32, padding: 8, fontSize: 12, iconSize: 16 },
  Medium: { height: 40, padding: 12, fontSize: 14, iconSize: 20 },
  Large: { height: 48, padding: 16, fontSize: 16, iconSize: 24 },
};

// ============================================================================
// Helper Functions
// ============================================================================

async function ensureFont(
  family: string,
  style: string = "Regular"
): Promise<FontName> {
  try {
    await figma.loadFontAsync({ family, style });
    return { family, style };
  } catch (error) {
    const fallback = family === "Cairo" ? "Inter" : "Inter";
    try {
      await figma.loadFontAsync({ family: fallback, style });
      return { family: fallback, style };
    } catch {
      return { family: "Inter", style: "Regular" };
    }
  }
}

async function getFontForLanguage(lang: string): Promise<FontName> {
  return lang === "ar"
    ? await ensureFont("Cairo", "Regular")
    : await ensureFont("Inter", "Regular");
}

async function createTextNode(
  text: string,
  fontSize: number,
  lang: string
): Promise<TextNode> {
  const textNode = figma.createText();
  const font = await getFontForLanguage(lang);
  textNode.fontName = font;
  textNode.characters = text;
  textNode.fontSize = fontSize;
  textNode.textAlignHorizontal = lang === "ar" ? "RIGHT" : "LEFT";
  return textNode;
}

function safeAppend(parent: ChildrenMixin, child: SceneNode): boolean {
  try {
    if (!parent || !child || (parent as any).removed || (child as any).removed) {
      return false;
    }
    parent.appendChild(child);
    return true;
  } catch (error) {
    console.error(`Failed to append: ${error}`);
    return false;
  }
}

function findByName(parent: ChildrenMixin, name: string): SceneNode | undefined {
  return parent.children.find((node) => node.name === name);
}

// ============================================================================
// Icon Helpers - RemixIcon SVG Paths
// ============================================================================

// RemixIcon SVG paths (24x24 viewBox, scaled to size)
const REMIX_ICONS: Record<string, string> = {
  "ri-home-line": "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  "ri-home-fill": "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  "ri-search-line": "M11 2c4.968 0 9 4.032 9 9s-4.032 9-9 9-9-4.032-9-9 4.032-9 9-9zm0 16c3.867 0 7-3.133 7-7 0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7zm8.485.071l2.829 2.828-1.415 1.415-2.828-2.829z",
  "ri-search-fill": "M11 2c4.968 0 9 4.032 9 9s-4.032 9-9 9-9-4.032-9-9 4.032-9 9-9zm0 16c3.867 0 7-3.133 7-7 0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7zm8.485.071l2.829 2.828-1.415 1.415-2.828-2.829z",
  "ri-user-line": "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  "ri-user-fill": "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  "ri-menu-line": "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z",
  "ri-menu-fill": "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z",
  "ri-close-line": "M13.414 12l5.793-5.793a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 0 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12z",
  "ri-close-fill": "M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z",
  "ri-arrow-right-line": "M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z",
  "ri-arrow-left-line": "M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z",
  "ri-arrow-down-line": "M12 13.172l4.95-4.95 1.414 1.414L12 16l-6.364-6.364 1.414-1.414z",
  "ri-arrow-up-line": "M12 10.828l-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.414 1.414z",
  "ri-check-line": "M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",
  "ri-check-fill": "M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",
  "ri-calendar-line": "M17 3h4a1 1 0 0 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z",
  "ri-calendar-fill": "M17 3h4a1 1 0 0 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z",
  "ri-settings-line": "M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.31zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "ri-settings-fill": "M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.31zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "ri-heart-line": "M12.001 4.529a5.998 5.998 0 0 1 8.242.228 6 6 0 0 1 .236 8.236l-8.48 8.492-8.478-8.492a6 6 0 0 1 8.48-8.464zm6.826 1.641a4 4 0 0 0-5.663 0l-.177.177-.177-.177a4.001 4.001 0 1 0-5.663 5.656l5.658 5.66 5.66-5.66a4 4 0 0 0 0-5.656z",
  "ri-heart-fill": "M12.001 4.529a5.998 5.998 0 0 1 8.242.228 6 6 0 0 1 .236 8.236l-8.48 8.492-8.478-8.492a6 6 0 0 1 8.48-8.464z",
  "ri-star-line": "M12 18.26l-7.053 3.948 1.575-7.928L-3.75 8.88l8.027-.952L12 1.26l3.723 6.668 8.027.952-6.772 6.4 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.192-4.833.573 3.573 3.305-.949 4.773L12 15.968z",
  "ri-star-fill": "M12 18.26l-7.053 3.948 1.575-7.928L-3.75 8.88l8.027-.952L12 1.26l3.723 6.668 8.027.952-6.772 6.4 1.575 7.928L12 18.26z",
  "ri-notification-line": "M5 18h14v-5.019c0-2.837-1.789-5.245-4.243-6.163C15.127 5.69 13.613 4 12 4s-3.127 1.69-3.757 2.818C5.789 7.736 4 10.144 4 12.981V18H2v2h20v-2h-2v-5.019c0-3.458-2.239-6.377-5.293-7.412C13.525 4.171 12.763 2 12 2s-1.525 2.171-1.707 2.569C7.239 5.604 5 8.523 5 11.981V18zm3-10.142C8.485 5.943 9.993 5 12 5s3.515.943 4 2.858V18H8V7.858z",
  "ri-notification-fill": "M5 18h14v-5.019c0-2.837-1.789-5.245-4.243-6.163C15.127 5.69 13.613 4 12 4s-3.127 1.69-3.757 2.818C5.789 7.736 4 10.144 4 12.981V18H2v2h20v-2h-2v-5.019c0-3.458-2.239-6.377-5.293-7.412C13.525 4.171 12.763 2 12 2s-1.525 2.171-1.707 2.569C7.239 5.604 5 8.523 5 11.981V18z",
  "ri-mail-line": "M3 3h18a1 1 0 0 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z",
  "ri-mail-fill": "M3 3h18a1 1 0 0 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9.06 8.683L5.648 6.238 4.353 7.762l7.72 6.555 7.581-6.56-1.308-1.513-6.875 5.683z",
  "ri-phone-line": "M9.366 10.682a10.556 10.556 0 0 0 3.952 3.952l.884-1.238a1 1 0 0 1 1.294-.538 9.829 9.829 0 0 0 4.718 2.348 1 1 0 0 1 .921.997v4.462a1 1 0 0 1-.898.997A15.76 15.76 0 0 1 3.495 4.495 15.76 15.76 0 0 1 2.498.5H7a1 1 0 0 1 .997.921 9.829 9.829 0 0 0 2.348 4.718 1 1 0 0 1-.538 1.294l-1.238.884zm-2.522-.657l1.9-1.357A13.81 13.81 0 0 1 3.5 3.5c0 .5.319.939.82 1.393a13.81 13.81 0 0 1 1.524-1.524zm7.312 0a13.81 13.81 0 0 1 1.524 1.524c.5-.454.82-.893.82-1.393a13.81 13.81 0 0 1-2.344-1.524zM7 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  "ri-phone-fill": "M9.366 10.682a10.556 10.556 0 0 0 3.952 3.952l.884-1.238a1 1 0 0 1 1.294-.538 9.829 9.829 0 0 0 4.718 2.348 1 1 0 0 1 .921.997v4.462a1 1 0 0 1-.898.997A15.76 15.76 0 0 1 3.495 4.495 15.76 15.76 0 0 1 2.498.5H7a1 1 0 0 1 .997.921 9.829 9.829 0 0 0 2.348 4.718 1 1 0 0 1-.538 1.294l-1.238.884zm-2.522-.657l1.9-1.357A13.81 13.81 0 0 1 3.5 3.5c0 .5.319.939.82 1.393a13.81 13.81 0 0 1 1.524-1.524zm7.312 0a13.81 13.81 0 0 1 1.524 1.524c.5-.454.82-.893.82-1.393a13.81 13.81 0 0 1-2.344-1.524zM7 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  "ri-download-line": "M11 15V5h2v10h5l-6 6-6-6h5zM4 19h16v2H4v-2z",
  "ri-download-fill": "M11 15V5h2v10h5l-6 6-6-6h5zM4 19h16v2H4v-2z",
  "ri-upload-line": "M12 16l-6-6h5V4h2v6h5l-6 6zm-8 3h16v2H4v-2z",
  "ri-upload-fill": "M12 16l-6-6h5V4h2v6h5l-6 6zm-8 3h16v2H4v-2z",
  "ri-share-line": "M13.12 17.023l-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .958 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.2 2.29a4 4 0 1 1-.959 1.755zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "ri-share-fill": "M13.12 17.023l-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .958 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.2 2.29a4 4 0 1 1-.959 1.755zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "ri-edit-line": "M6.414 16L16 6.414l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z",
  "ri-edit-fill": "M6.414 16L16 6.414l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z",
  "ri-delete-line": "M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z",
  "ri-delete-fill": "M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z",
  // Additional icons for Icon component
  "ri-message-line": "M6.455 19L2 22.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1v14a1 1 0 0 1-1 1H6.455zm-.692-2H20V5H4v13.385L5.763 17zM8 10h8v2H8v-2z",
  "ri-chat-line": "M10 3h4a8 8 0 1 1 0 16v3.5c-5-2-12-5-12-11.5a8 8 0 0 1 8-8zm2 14h2a6 6 0 1 0 0-12h-4a6 6 0 0 0-6 6c0 3.61 2.462 5.966 8 8.48V17z",
  "ri-send-line": "M3 20V4l19 8-19 8zm2-3l11.533-5L5 7v10z",
  "ri-image-line": "M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z",
  "ri-video-line": "M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a1 1 0 0 1-.993.993H3.993A.993.993 0 0 1 3 20.007V3.993zM5 5v14h14V5H5zm5.622 3.415l4.879 2.252a1 1 0 0 1 0 1.866l-4.879 2.252A1 1 0 0 1 10 14.252V9.748a1 1 0 0 1 1.622-.333z",
  "ri-camera-line": "M9.828 5l-2 2H4v12h16V7h-3.828l-2-2H9.828zM9 3h6l2 2h4a1 1 0 0 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm3 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  "ri-mic-line": "M12 1a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5zM3.055 11H5.07a7.002 7.002 0 0 0 13.858 0h2.016A9.003 9.003 0 0 1 13 18.945V23h-2v-4.055A9.003 9.003 0 0 1 3.055 11z",
  "ri-play-line": "M8 5v14l11-7z",
  "ri-pause-line": "M6 5h4v14H6V5zm8 0h4v14h-4V5z",
  "ri-time-line": "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-12h-2v6h6v-2h-4v-4z",
  "ri-file-line": "M15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992zM13 12v4h-2v-4H8l4-4 4 4h-3z",
  "ri-folder-line": "M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7h2v2h-2v-2zm0-4h2v2h-2V8z",
  "ri-link-line": "M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.353a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.415-1.415a5 5 0 1 0-7.071-7.071l-.354.353a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z",
  "ri-bookmark-line": "M5 2h14a1 1 0 0 1 1v19.143a1 1 0 0 1-1.601.799L12 18.5l-6.399 4.442A1 1 0 0 1 5 22.143V2zm2 2v16.143l4.399-3.055a1 1 0 0 1 1.202 0L17 20.143V4H7z",
  "ri-thumb-up-line": "M2 9h3v10H2a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zm5 0h6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7V9zm0-2V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3h-8zm13-2v10a1 1 0 0 1-1 1h-3V7h3a1 1 0 0 1 1 1z",
  "ri-thumb-down-line": "M22 15h-3V5h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zm-5 0H11V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v11zm0 2v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3h11z",
  "ri-filter-line": "M10 15v4h4v-4h2v-2H8v2h2zm-4-2h12v2H6v-2zm2-5h8v2H8V8zm-2-2h12v2H6V6z",
  // Legacy support
  "search": "M11 2c4.968 0 9 4.032 9 9s-4.032 9-9 9-9-4.032-9-9 4.032-9 9-9zm0 16c3.867 0 7-3.133 7-7 0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7zm8.485.071l2.829 2.828-1.415 1.415-2.828-2.829z",
  "chevron-down": "M7 10l5 5 5-5z",
  "chevron-right": "M10 7l5 5-5 5z",
  "close": "M13.414 12l5.793-5.793a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 0 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12z",
  "menu": "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z",
  "user": "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  "calendar": "M17 3h4a1 1 0 0 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z",
  "check": "M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",
};

function createIcon(iconType: string, size: number, color: RGB): SceneNode {
  // Create icon using simple shapes instead of complex SVG paths
  // Figma Plugin API has limited support for SVG path commands
  
  const container = figma.createFrame();
  container.resize(size, size);
  container.fills = [];
  container.name = "icon";
  
  const strokeWidth = Math.max(1.5, size / 16);
  const halfSize = size / 2;
  
  // Create icon based on type using simple shapes
  if (iconType.includes("arrow-right") || iconType.includes("arrow-right-line")) {
    // Right arrow: triangle pointing right
    const arrow = figma.createPolygon();
    arrow.resize(size * 0.6, size * 0.6);
    arrow.x = size * 0.25;
    arrow.y = size * 0.2;
    arrow.pointCount = 3;
    arrow.rotation = -90;
    arrow.fills = [{ type: "SOLID", color }];
    safeAppend(container, arrow);
  } else if (iconType.includes("arrow-left") || iconType.includes("arrow-left-line")) {
    // Left arrow: triangle pointing left
    const arrow = figma.createPolygon();
    arrow.resize(size * 0.6, size * 0.6);
    arrow.x = size * 0.15;
    arrow.y = size * 0.2;
    arrow.pointCount = 3;
    arrow.rotation = 90;
    arrow.fills = [{ type: "SOLID", color }];
    safeAppend(container, arrow);
  } else if (iconType.includes("arrow-up") || iconType.includes("arrow-up-line")) {
    // Up arrow: triangle pointing up
    const arrow = figma.createPolygon();
    arrow.resize(size * 0.6, size * 0.6);
    arrow.x = size * 0.2;
    arrow.y = size * 0.15;
    arrow.pointCount = 3;
    arrow.rotation = 180;
    arrow.fills = [{ type: "SOLID", color }];
    safeAppend(container, arrow);
  } else if (iconType.includes("arrow-down") || iconType.includes("arrow-down-line")) {
    // Down arrow: triangle pointing down
    const arrow = figma.createPolygon();
    arrow.resize(size * 0.6, size * 0.6);
    arrow.x = size * 0.2;
    arrow.y = size * 0.25;
    arrow.pointCount = 3;
    arrow.rotation = 0;
    arrow.fills = [{ type: "SOLID", color }];
    safeAppend(container, arrow);
  } else if (iconType.includes("close") || iconType.includes("delete")) {
    // X shape: two lines crossing
    const line1 = figma.createLine();
    line1.resize(size * 0.7, 0);
    line1.x = size * 0.15;
    line1.y = size * 0.15;
    line1.rotation = Math.PI / 4;
    line1.strokes = [{ type: "SOLID", color }];
    line1.strokeWeight = strokeWidth;
    safeAppend(container, line1);
    
    const line2 = figma.createLine();
    line2.resize(size * 0.7, 0);
    line2.x = size * 0.15;
    line2.y = size * 0.85;
    line2.rotation = -Math.PI / 4;
    line2.strokes = [{ type: "SOLID", color }];
    line2.strokeWeight = strokeWidth;
    safeAppend(container, line2);
  } else if (iconType.includes("check")) {
    // Check mark: two lines forming a check
    const line1 = figma.createLine();
    line1.resize(size * 0.3, 0);
    line1.x = size * 0.25;
    line1.y = size * 0.5;
    line1.rotation = -Math.PI / 4;
    line1.strokes = [{ type: "SOLID", color }];
    line1.strokeWeight = strokeWidth;
    line1.strokeCap = "ROUND";
    safeAppend(container, line1);
    
    const line2 = figma.createLine();
    line2.resize(size * 0.5, 0);
    line2.x = size * 0.4;
    line2.y = size * 0.65;
    line2.rotation = Math.PI / 4;
    line2.strokes = [{ type: "SOLID", color }];
    line2.strokeWeight = strokeWidth;
    line2.strokeCap = "ROUND";
    safeAppend(container, line2);
  } else if (iconType.includes("search")) {
    // Search: circle with line
    const circle = figma.createEllipse();
    circle.resize(size * 0.6, size * 0.6);
    circle.x = size * 0.15;
    circle.y = size * 0.15;
    circle.strokes = [{ type: "SOLID", color }];
    circle.strokeWeight = strokeWidth;
    circle.fills = [];
    safeAppend(container, circle);
    
    const line = figma.createLine();
    line.resize(size * 0.3, 0);
    line.x = size * 0.6;
    line.y = size * 0.6;
    line.rotation = Math.PI / 4;
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWidth;
    line.strokeCap = "ROUND";
    safeAppend(container, line);
  } else if (iconType.includes("menu")) {
    // Menu: three horizontal lines
    for (let i = 0; i < 3; i++) {
      const line = figma.createLine();
      line.resize(size * 0.7, 0);
      line.x = size * 0.15;
      line.y = size * (0.25 + i * 0.25);
      line.strokes = [{ type: "SOLID", color }];
      line.strokeWeight = strokeWidth;
      safeAppend(container, line);
    }
  } else if (iconType.includes("user")) {
    // User: circle with person shape
    const circle = figma.createEllipse();
    circle.resize(size * 0.5, size * 0.5);
    circle.x = size * 0.25;
    circle.y = size * 0.1;
    circle.fills = [{ type: "SOLID", color }];
    safeAppend(container, circle);
    
    const body = figma.createEllipse();
    body.resize(size * 0.6, size * 0.7);
    body.x = size * 0.2;
    body.y = size * 0.45;
    body.fills = [{ type: "SOLID", color }];
    safeAppend(container, body);
  } else if (iconType.includes("home")) {
    // Home: house shape
    const roof = figma.createPolygon();
    roof.resize(size * 0.7, size * 0.4);
    roof.x = size * 0.15;
    roof.y = size * 0.15;
    roof.pointCount = 3;
    roof.rotation = 180;
    roof.fills = [{ type: "SOLID", color }];
    safeAppend(container, roof);
    
    const base = figma.createRectangle();
    base.resize(size * 0.6, size * 0.5);
    base.x = size * 0.2;
    base.y = size * 0.4;
    base.fills = [{ type: "SOLID", color }];
    safeAppend(container, base);
  } else if (iconType.includes("heart") || iconType.includes("star")) {
    // Heart/Star: simple filled shape
    const shape = figma.createEllipse();
    shape.resize(size * 0.7, size * 0.7);
    shape.x = size * 0.15;
    shape.y = size * 0.15;
    shape.fills = [{ type: "SOLID", color }];
    safeAppend(container, shape);
  } else {
    // Default: simple circle
    const circle = figma.createEllipse();
    circle.resize(size * 0.7, size * 0.7);
    circle.x = size * 0.15;
    circle.y = size * 0.15;
    circle.fills = [{ type: "SOLID", color }];
    safeAppend(container, circle);
  }
  
  return container;
}

// ============================================================================
// Frame Management
// ============================================================================

function getOrCreateKitFrame(): FrameNode {
  let kitFrame = figma.currentPage.children.find(
    (node) => node.type === "FRAME" && node.name === "UI Make Kit"
  ) as FrameNode | undefined;

  if (!kitFrame) {
    kitFrame = figma.createFrame();
    kitFrame.name = "UI Make Kit";
    kitFrame.layoutMode = "VERTICAL";
    kitFrame.paddingTop = 24;
    kitFrame.paddingBottom = 24;
    kitFrame.paddingLeft = 24;
    kitFrame.paddingRight = 24;
    kitFrame.itemSpacing = 24;
    kitFrame.fills = [{ type: "SOLID", color: getColors().white }];
    safeAppend(figma.currentPage, kitFrame);
  }

  return kitFrame;
}

async function getOrCreateSection(kitFrame: FrameNode, sectionName: string): Promise<FrameNode> {
  let section = findByName(kitFrame, sectionName) as FrameNode | undefined;

  if (!section || section.type !== "FRAME") {
    section = figma.createFrame();
    section.name = sectionName;
    section.layoutMode = "VERTICAL";
    section.paddingTop = 24;
    section.paddingBottom = 24;
    section.paddingLeft = 24;
    section.paddingRight = 24;
    section.itemSpacing = 16;
    section.fills = [{ type: "SOLID", color: getColors().white }];

    // Add section title - load font first
    const title = figma.createText();
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      title.fontName = { family: "Inter", style: "Bold" };
    } catch {
      // Fallback to Regular if Bold not available
      await ensureFont("Inter", "Regular");
      title.fontName = { family: "Inter", style: "Regular" };
    }
    title.characters = sectionName;
    title.fontSize = 20;
    title.fills = [{ type: "SOLID", color: getColors().text }];
    safeAppend(section, title);

    safeAppend(kitFrame, section);
  }

  return section;
}

function getSectionForComponent(component: string): string {
  const mapping: Record<string, string> = {
    button: "Buttons",
    "icon-button": "Buttons",
    navbar: "Navigation",
    "sidebar-item": "Navigation",
    tab: "Navigation",
    breadcrumbs: "Navigation",
    pagination: "Navigation",
    "text-input": "Forms",
    "search-input": "Forms",
    select: "Forms",
    checkbox: "Forms",
    toggle: "Forms",
    "date-picker": "Forms",
    stepper: "Forms",
    alert: "Feedback",
    toast: "Feedback",
    "loading-spinner": "Feedback",
    "progress-bar": "Feedback",
    tooltip: "Feedback",
    card: "Layout",
    modal: "Layout",
    divider: "Layout",
    dropdown: "Layout",
    faq: "Content",
    footer: "Content",
    avatar: "Content",
    badge: "Content",
    icon: "Content",
  };
  return mapping[component] || "Content";
}

// ============================================================================
// Component Name Builder
// ============================================================================

function buildComponentName(
  base: string,
  props: {
    type?: string;
    size?: string;
    state?: string;
    shape?: string;
    icon?: string;
    lang?: string;
  }
): string {
  const parts = [base];
  if (props.type) parts.push(props.type);
  if (props.size) parts.push(props.size);
  if (props.state) parts.push(props.state);
  if (props.shape) parts.push(props.shape);
  if (props.icon) parts.push(props.icon);
  if (props.lang) parts.push(props.lang);
  return parts.join(" / ");
}

// ============================================================================
// Button Components
// ============================================================================

async function createButtonVariant(config: {
  type: "Primary" | "Secondary" | "Ghost" | "Danger";
  size: "Small" | "Medium" | "Large";
  state: "Default" | "Hover" | "Disabled" | "Loading";
  shape: "Default" | "Capsule";
  icon: string; // RemixIcon name or "None"
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { type, size, state, shape, icon, lang } = config;
  const sizeConfig = SIZES[size];
  const isCapsule = shape === "Capsule";
  const radius = isCapsule ? 999 : 12;

  const component = figma.createComponent();
    component.name = buildComponentName("Button", {
    type,
    size,
    state,
    shape: isCapsule ? "Capsule" : undefined,
    icon: icon !== "None" ? icon.replace("ri-", "").replace("-line", "").replace("-fill", "") : undefined,
    lang,
  });

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "FIXED";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.paddingLeft = sizeConfig.padding;
  component.paddingRight = sizeConfig.padding;
  component.paddingTop = sizeConfig.padding;
  component.paddingBottom = sizeConfig.padding;
  component.resize(100, sizeConfig.height);
  component.cornerRadius = radius;

  // Colors - use getColors() to get latest theme colors
  const colors = getColors();
  let fillColor = colors.primary;
  let textColor = colors.white;
  let strokeColor: SolidPaint | undefined;

  if (type === "Secondary") {
    fillColor = colors.white;
    textColor = colors.primary;
    strokeColor = { type: "SOLID", color: colors.primary };
  } else if (type === "Ghost") {
    fillColor = colors.white;
    textColor = colors.primary;
  } else if (type === "Danger") {
    fillColor = colors.danger;
    textColor = colors.white;
  }

  if (state === "Hover" && type !== "Ghost") {
    fillColor = {
      r: Math.max(0, fillColor.r - 0.1),
      g: Math.max(0, fillColor.g - 0.1),
      b: Math.max(0, fillColor.b - 0.1),
    };
  } else if (state === "Hover" && type === "Ghost") {
    fillColor = { r: 0.95, g: 0.95, b: 0.95 };
  }

  component.fills = [{ type: "SOLID", color: fillColor }];
  if (strokeColor) {
    component.strokes = [strokeColor];
    component.strokeWeight = 1;
  }
  component.opacity = state === "Disabled" ? 0.5 : 1;

  // Text
  let text = lang === "ar" ? "زر" : "Button";
  if (type === "Danger") {
    text = lang === "ar" ? "تسجيل الخروج" : "Logout";
  }
  if (state === "Loading") {
    text = lang === "ar" ? "جاري التحميل" : "Loading";
  }

  const textNode = await createTextNode(text, sizeConfig.fontSize, lang);
  textNode.fills = [{ type: "SOLID", color: textColor }];

  // Icon from RemixIcon
  if (icon !== "None") {
    const iconNode = createIcon(icon, sizeConfig.iconSize, textColor);
    
    // Determine icon position based on icon name or default to left
    const isRightIcon = icon.includes("arrow-right") || icon.includes("chevron-right");
    
    if (isRightIcon) {
      safeAppend(component, textNode);
      safeAppend(component, iconNode);
    } else {
      safeAppend(component, iconNode);
      safeAppend(component, textNode);
    }
  } else {
    safeAppend(component, textNode);
  }

  // Loading spinner placeholder
  if (state === "Loading") {
    const spinner = figma.createEllipse();
    spinner.resize(sizeConfig.iconSize, sizeConfig.iconSize);
    spinner.strokes = [{ type: "SOLID", color: textColor }];
    spinner.strokeWeight = 2;
    spinner.fills = [];
    
    // Remove existing icon if present
    if (icon !== "None") {
      const iconIndex = component.children.findIndex(
        (child) => child.type === "VECTOR"
      );
      if (iconIndex !== -1) {
        component.children[iconIndex].remove();
      }
    } else {
      // Remove text if no icon
      if (component.children.length > 0) {
        component.children[0].remove();
      }
    }
    
    // Add spinner and text
    const isRightIcon = icon.includes("arrow-right") || icon.includes("chevron-right");
    if (isRightIcon) {
      safeAppend(component, textNode);
      safeAppend(component, spinner);
    } else {
      safeAppend(component, spinner);
      safeAppend(component, textNode);
    }
  }

  return component;
}

async function createButtonComponent(
  lang: "ar" | "en",
  buttonType: "Primary" | "Secondary" | "Ghost" | "Danger",
  size: "Small" | "Medium" | "Large",
  state: "Default" | "Hover" | "Disabled" | "Loading",
  shape: "Default" | "Capsule",
  icon: string // RemixIcon name or "None"
): Promise<ComponentNode> {
  // Generate single button with specified properties
  const variant = await createButtonVariant({
    type: buttonType,
    size,
    state,
    shape,
    icon,
    lang,
  });
  
  return variant;
}

async function createIconButtonVariant(config: {
  type: "Primary" | "Secondary" | "Ghost" | "Danger";
  size: "Small" | "Medium" | "Large";
  state: "Default" | "Hover" | "Disabled";
}): Promise<ComponentNode> {
  const { type, size, state } = config;
  const sizeConfig = SIZES[size];

  const component = figma.createComponent();
  component.name = buildComponentName("Icon Button", { type, size, state });

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.resize(sizeConfig.height, sizeConfig.height);
  component.cornerRadius = 12;

  let fillColor = getColors().primary;
  let iconColor = getColors().white;

  if (type === "Secondary") {
    fillColor = getColors().white;
    iconColor = getColors().primary;
  } else if (type === "Ghost") {
    fillColor = getColors().white;
    iconColor = getColors().primary;
  } else if (type === "Danger") {
    fillColor = getColors().danger;
    iconColor = getColors().white;
  }

  if (state === "Hover") {
    fillColor = {
      r: Math.max(0, fillColor.r - 0.1),
      g: Math.max(0, fillColor.g - 0.1),
      b: Math.max(0, fillColor.b - 0.1),
    };
  }

  component.fills = [{ type: "SOLID", color: fillColor }];
  component.opacity = state === "Disabled" ? 0.5 : 1;

  // Icon from RemixIcon (menu icon)
  const iconNode = createIcon("ri-menu-line", sizeConfig.iconSize, iconColor);
  safeAppend(component, iconNode);
  return component;
}

async function createIconButtonComponentSet(): Promise<ComponentSetNode> {
  const types: Array<"Primary" | "Secondary" | "Ghost" | "Danger"> = [
    "Primary",
    "Secondary",
    "Ghost",
    "Danger",
  ];
  const sizes: Array<"Small" | "Medium" | "Large"> = ["Small", "Medium", "Large"];
  const states: Array<"Default" | "Hover" | "Disabled"> = [
    "Default",
    "Hover",
    "Disabled",
  ];

  const variants: ComponentNode[] = [];

  for (const type of types) {
    for (const size of sizes) {
      for (const state of states) {
        const variant = await createIconButtonVariant({ type, size, state });
        safeAppend(figma.currentPage, variant);
        variants.push(variant);
      }
    }
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = "Icon Button";

  return componentSet;
}

// ============================================================================
// Navigation Components
// ============================================================================

async function createNavbar(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Navbar", { lang });
  component.layoutMode = "HORIZONTAL";
  component.resize(1200, 64);
  component.paddingLeft = 24;
  component.paddingRight = 24;
  component.paddingTop = 16;
  component.paddingBottom = 16;
  component.itemSpacing = 16;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [{ type: "SOLID", color: getColors().border }];
  component.strokeWeight = 1;

  const brand = await createTextNode(
    lang === "ar" ? "العلامة التجارية" : "Brand",
    20,
    lang
  );
  brand.fills = [{ type: "SOLID", color: getColors().text }];

  const menuFrame = figma.createFrame();
  menuFrame.layoutMode = "HORIZONTAL";
  menuFrame.itemSpacing = 16;

  const menuItems = lang === "ar"
    ? ["الرئيسية", "المميزات", "الأسعار"]
    : ["Home", "Features", "Pricing"];

  for (const item of menuItems) {
    const menuItem = await createTextNode(item, 14, lang);
    menuItem.fills = [{ type: "SOLID", color: getColors().text }];
    safeAppend(menuFrame, menuItem);
  }

  if (lang === "ar") {
    safeAppend(component, menuFrame);
    safeAppend(component, brand);
    component.primaryAxisAlignItems = "MAX";
  } else {
    safeAppend(component, brand);
    safeAppend(component, menuFrame);
    component.primaryAxisAlignItems = "MIN";
  }

  return component;
}

async function createSidebarItemVariant(config: {
  state: "Default" | "Active" | "Disabled";
  icon: "On" | "Off";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, icon, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Sidebar Item", { state, icon, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(200, 40);
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 8;
  component.paddingBottom = 8;
  component.itemSpacing = 12;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.opacity = state === "Disabled" ? 0.5 : 1;

  if (state === "Active") {
    const border = figma.createRectangle();
    border.resize(3, 40);
    border.fills = [{ type: "SOLID", color: getColors().primary }];
    border.x = lang === "ar" ? 197 : 0;
    safeAppend(component, border);
  }

  if (icon === "On") {
    const iconNode = createIcon("ri-menu-line", 20, getColors().muted);
    safeAppend(component, iconNode);
  }

  const label = await createTextNode(
    lang === "ar" ? "عنصر القائمة" : "Menu Item",
    14,
    lang
  );
  label.fills = [{ type: "SOLID", color: getColors().text }];
  safeAppend(component, label);

  return component;
}

async function createSidebarItemComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Default" | "Active" | "Disabled"> = [
    "Default",
    "Active",
    "Disabled",
  ];
  const icons: Array<"On" | "Off"> = ["On", "Off"];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    for (const icon of icons) {
      const variant = await createSidebarItemVariant({ state, icon, lang });
      safeAppend(figma.currentPage, variant);
      variants.push(variant);
    }
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Sidebar Item / ${lang}`;

  return componentSet;
}

async function createTabVariant(config: {
  state: "Default" | "Active" | "Disabled";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Tab", { state, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(100, 40);
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 8;
  component.paddingBottom = 8;
  component.primaryAxisAlignItems = "CENTER";
  component.cornerRadius = 8;

  if (state === "Active") {
    component.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
  } else {
    component.fills = [{ type: "SOLID", color: getColors().white }];
  }

  component.opacity = state === "Disabled" ? 0.5 : 1;

  const label = await createTextNode(
    lang === "ar" ? "تبويب" : "Tab",
    14,
    lang
  );
  label.fills = [
    {
      type: "SOLID",
      color: state === "Active" ? getColors().primary : getColors().text,
    },
  ];
  safeAppend(component, label);

  if (state === "Active") {
    const underline = figma.createRectangle();
    underline.resize(80, 2);
    underline.fills = [{ type: "SOLID", color: getColors().primary }];
    underline.y = 38;
    safeAppend(component, underline);
  }

  return component;
}

async function createTabComponentSet(lang: "ar" | "en"): Promise<ComponentSetNode> {
  const states: Array<"Default" | "Active" | "Disabled"> = [
    "Default",
    "Active",
    "Disabled",
  ];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createTabVariant({ state, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Tab / ${lang}`;

  return componentSet;
}

// ============================================================================
// Form Components
// ============================================================================

async function createTextInputVariant(config: {
  state: "Default" | "Focus" | "Error" | "Disabled";
  size: "Small" | "Medium" | "Large";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, size, lang } = config;
  const sizeConfig = SIZES[size];
  const component = figma.createComponent();
  component.name = buildComponentName("Text Input", { state, size, lang });

  component.layoutMode = "VERTICAL";
  component.resize(300, sizeConfig.height + 40);
  component.itemSpacing = 8;
  component.paddingTop = 0;
  component.paddingBottom = 0;
  component.paddingLeft = 0;
  component.paddingRight = 0;

  const label = await createTextNode(
    lang === "ar" ? "عنوان" : "Label",
    12,
    lang
  );
  label.fills = [{ type: "SOLID", color: getColors().text }];
  safeAppend(component, label);

  const inputFrame = figma.createFrame();
  inputFrame.resize(300, sizeConfig.height);
  inputFrame.layoutMode = "HORIZONTAL";
  inputFrame.paddingLeft = 12;
  inputFrame.paddingRight = 12;
  inputFrame.cornerRadius = 8;
  inputFrame.fills = [{ type: "SOLID", color: getColors().white }];
  inputFrame.strokes = [
    {
      type: "SOLID",
      color:
        state === "Error"
          ? getColors().danger
          : state === "Focus"
          ? getColors().primary
          : getColors().border,
    },
  ];
  inputFrame.strokeWeight = state === "Focus" ? 2 : 1;
  inputFrame.opacity = state === "Disabled" ? 0.5 : 1;

  const placeholder = await createTextNode(
    lang === "ar" ? "اكتب هنا" : "Type here",
    sizeConfig.fontSize,
    lang
  );
  placeholder.fills = [{ type: "SOLID", color: getColors().muted }];
  safeAppend(inputFrame, placeholder);
  safeAppend(component, inputFrame);

  if (state === "Error") {
    const errorText = await createTextNode(
      lang === "ar" ? "مطلوب" : "Required",
      12,
      lang
    );
    errorText.fills = [{ type: "SOLID", color: getColors().danger }];
    safeAppend(component, errorText);
  }

  return component;
}

async function createTextInputComponentSet(
  size: "Small" | "Medium" | "Large",
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Default" | "Focus" | "Error" | "Disabled"> = [
    "Default",
    "Focus",
    "Error",
    "Disabled",
  ];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createTextInputVariant({ state, size, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Text Input / ${size} / ${lang}`;

  return componentSet;
}

async function createSelectVariant(config: {
  state: "Default" | "Focus" | "Error" | "Disabled";
  size: "Small" | "Medium" | "Large";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, size, lang } = config;
  const sizeConfig = SIZES[size];
  const component = figma.createComponent();
  component.name = buildComponentName("Select", { state, size, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(300, sizeConfig.height);
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.cornerRadius = 8;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [
    {
      type: "SOLID",
      color:
        state === "Error"
          ? getColors().danger
          : state === "Focus"
          ? getColors().primary
          : getColors().border,
    },
  ];
  component.strokeWeight = state === "Focus" ? 2 : 1;
  component.opacity = state === "Disabled" ? 0.5 : 1;
  component.primaryAxisAlignItems = "SPACE_BETWEEN";

  const text = await createTextNode(
    lang === "ar" ? "اختر" : "Select option",
    sizeConfig.fontSize,
    lang
  );
  text.fills = [{ type: "SOLID", color: getColors().muted }];
  safeAppend(component, text);

  // Chevron icon from RemixIcon
  const chevronIcon = lang === "ar" ? "ri-arrow-left-line" : "ri-arrow-down-line";
  const chevron = createIcon(chevronIcon, 16, getColors().muted);
  if (lang === "ar") {
    const children = [...component.children];
    component.children.forEach((c) => c.remove());
    safeAppend(component, chevron);
    children.forEach((c) => safeAppend(component, c));
  } else {
    safeAppend(component, chevron);
  }

  return component;
}

async function createSelectComponentSet(
  size: "Small" | "Medium" | "Large",
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Default" | "Focus" | "Error" | "Disabled"> = [
    "Default",
    "Focus",
    "Error",
    "Disabled",
  ];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createSelectVariant({ state, size, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Select / ${size} / ${lang}`;

  return componentSet;
}

async function createCheckboxVariant(config: {
  state: "Unchecked" | "Checked" | "Disabled";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Checkbox", { state, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(120, 20);
  component.itemSpacing = 8;
  component.primaryAxisAlignItems = lang === "ar" ? "MAX" : "MIN";

  const checkbox = figma.createFrame();
  checkbox.resize(20, 20);
  checkbox.cornerRadius = 4;
  checkbox.fills = [{ type: "SOLID", color: getColors().white }];
  checkbox.strokes = [{ type: "SOLID", color: getColors().border }];
  checkbox.strokeWeight = 1;
  checkbox.opacity = state === "Disabled" ? 0.5 : 1;

  if (state === "Checked") {
    const check = figma.createVector();
    check.vectorPaths = [
      {
        windingRule: "NONZERO",
        data: "M 4 10 L 8 14 L 16 6",
      },
    ];
    check.strokes = [{ type: "SOLID", color: getColors().primary }];
    check.strokeWeight = 2;
    check.resize(20, 20);
    safeAppend(checkbox, check);
  }

  const label = await createTextNode(
    lang === "ar" ? "خيار" : "Option",
    14,
    lang
  );
  label.fills = [{ type: "SOLID", color: getColors().text }];
  label.opacity = state === "Disabled" ? 0.5 : 1;

  if (lang === "ar") {
    safeAppend(component, label);
    safeAppend(component, checkbox);
  } else {
    safeAppend(component, checkbox);
    safeAppend(component, label);
  }

  return component;
}

async function createCheckboxComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Unchecked" | "Checked" | "Disabled"> = [
    "Unchecked",
    "Checked",
    "Disabled",
  ];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createCheckboxVariant({ state, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Checkbox / ${lang}`;


  return componentSet;
}

async function createToggleVariant(config: {
  state: "Off" | "On" | "Disabled";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Toggle", { state, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(60, 24);
  component.itemSpacing = 8;
  component.primaryAxisAlignItems = lang === "ar" ? "MAX" : "MIN";

  const toggle = figma.createFrame();
  toggle.resize(44, 24);
  toggle.cornerRadius = 12;
  toggle.fills = [
    {
      type: "SOLID",
      color: state === "On" ? getColors().primary : { r: 0.8, g: 0.8, b: 0.8 },
    },
  ];
  toggle.opacity = state === "Disabled" ? 0.5 : 1;

  const thumb = figma.createEllipse();
  thumb.resize(18, 18);
  thumb.fills = [{ type: "SOLID", color: getColors().white }];
  thumb.x = state === "On" ? 23 : 3;
  thumb.y = 3;
  safeAppend(toggle, thumb);

  const label = await createTextNode(
    lang === "ar" ? "تبديل" : "Toggle",
    14,
    lang
  );
  label.fills = [{ type: "SOLID", color: getColors().text }];
  label.opacity = state === "Disabled" ? 0.5 : 1;

  if (lang === "ar") {
    safeAppend(component, label);
    safeAppend(component, toggle);
  } else {
    safeAppend(component, toggle);
    safeAppend(component, label);
  }

  return component;
}

async function createToggleComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Off" | "On" | "Disabled"> = ["Off", "On", "Disabled"];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createToggleVariant({ state, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Toggle / ${lang}`;


  return componentSet;
}

// ============================================================================
// Feedback Components
// ============================================================================

async function createAlertVariant(config: {
  type: "Success" | "Error" | "Warning" | "Info";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { type, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Alert", { type, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(400, 60);
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 12;
  component.paddingBottom = 12;
  component.itemSpacing = 12;
  component.cornerRadius = 8;
  component.primaryAxisAlignItems = lang === "ar" ? "MAX" : "MIN";

  let bgColor = getColors().success;
  if (type === "Error") bgColor = getColors().danger;
  else if (type === "Warning") bgColor = getColors().warning;
  else if (type === "Info") bgColor = getColors().info;

  component.fills = [{ type: "SOLID", color: { r: bgColor.r * 0.1, g: bgColor.g * 0.1, b: bgColor.b * 0.1 } }];
  component.strokes = [{ type: "SOLID", color: bgColor }];
  component.strokeWeight = 1;

  const titles: Record<string, { en: string; ar: string }> = {
    Success: { en: "Success", ar: "تم بنجاح" },
    Error: { en: "Error", ar: "خطأ" },
    Warning: { en: "Warning", ar: "تحذير" },
    Info: { en: "Info", ar: "معلومة" },
  };

  const title = await createTextNode(
    lang === "ar" ? titles[type].ar : titles[type].en,
    14,
    lang
  );
  title.fills = [{ type: "SOLID", color: bgColor }];
  safeAppend(component, title);

  return component;
}

async function createAlertComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const types: Array<"Success" | "Error" | "Warning" | "Info"> = [
    "Success",
    "Error",
    "Warning",
    "Info",
  ];

  const variants: ComponentNode[] = [];

  for (const type of types) {
    const variant = await createAlertVariant({ type, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Alert / ${lang}`;


  return componentSet;
}

async function createToastVariant(config: {
  type: "Success" | "Error" | "Info";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { type, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Toast", { type, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(300, 48);
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 12;
  component.paddingBottom = 12;
  component.cornerRadius = 8;
  component.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];

  const text = await createTextNode(
    lang === "ar" ? "رسالة" : "Message",
    14,
    lang
  );
  text.fills = [{ type: "SOLID", color: getColors().white }];
  safeAppend(component, text);

  return component;
}

async function createToastComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const types: Array<"Success" | "Error" | "Info"> = ["Success", "Error", "Info"];

  const variants: ComponentNode[] = [];

  for (const type of types) {
    const variant = await createToastVariant({ type, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Toast / ${lang}`;


  return componentSet;
}

async function createLoadingSpinnerVariant(
  size: "Small" | "Medium" | "Large"
): Promise<ComponentNode> {
  const sizeConfig = SIZES[size];
  const component = figma.createComponent();
  component.name = buildComponentName("Loading Spinner", { size });

  component.resize(sizeConfig.iconSize, sizeConfig.iconSize);
  const spinner = figma.createEllipse();
  spinner.resize(sizeConfig.iconSize, sizeConfig.iconSize);
  spinner.strokes = [{ type: "SOLID", color: getColors().primary }];
  spinner.strokeWeight = 2;
  spinner.fills = [];
  safeAppend(component, spinner);

  return component;
}

async function createLoadingSpinnerComponentSet(): Promise<ComponentSetNode> {
  const sizes: Array<"Small" | "Medium" | "Large"> = ["Small", "Medium", "Large"];

  const variants: ComponentNode[] = [];

  for (const size of sizes) {
    const variant = await createLoadingSpinnerVariant(size);
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = "Loading Spinner";


  return componentSet;
}

// ============================================================================
// Layout Components
// ============================================================================

async function createCardVariant(config: {
  type: "Default" | "Elevated";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { type, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Card", { type, lang });

  component.layoutMode = "VERTICAL";
  component.resize(300, 200);
  component.paddingTop = 24;
  component.paddingBottom = 24;
  component.paddingLeft = 24;
  component.paddingRight = 24;
  component.itemSpacing = 12;
  component.cornerRadius = 12;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [{ type: "SOLID", color: getColors().border }];
  component.strokeWeight = 1;

  if (type === "Elevated") {
    component.effects = [
      {
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 4 },
        radius: 8,
        visible: true,
        blendMode: "NORMAL",
      },
    ];
  }

  const title = await createTextNode(
    lang === "ar" ? "عنوان" : "Title",
    18,
    lang
  );
  title.fills = [{ type: "SOLID", color: getColors().text }];
  safeAppend(component, title);

  const body = await createTextNode(
    lang === "ar" ? "نص المحتوى" : "Body text",
    14,
    lang
  );
  body.fills = [{ type: "SOLID", color: getColors().muted }];
  safeAppend(component, body);

  return component;
}

async function createCardComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const types: Array<"Default" | "Elevated"> = ["Default", "Elevated"];

  const variants: ComponentNode[] = [];

  for (const type of types) {
    const variant = await createCardVariant({ type, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Card / ${lang}`;


  return componentSet;
}

async function createModalVariant(config: {
  size: "Small" | "Medium" | "Large";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { size, lang } = config;
  const widths = { Small: 400, Medium: 600, Large: 800 };
  const component = figma.createComponent();
  component.name = buildComponentName("Modal", { size, lang });

  component.layoutMode = "VERTICAL";
  component.resize(widths[size], 400);
  component.paddingTop = 0;
  component.paddingBottom = 0;
  component.paddingLeft = 0;
  component.paddingRight = 0;
  component.cornerRadius = 12;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [{ type: "SOLID", color: getColors().border }];
  component.strokeWeight = 1;

  // Header
  const header = figma.createFrame();
  header.layoutMode = "HORIZONTAL";
  header.resize(widths[size], 56);
  header.paddingLeft = 24;
  header.paddingRight = 24;
  header.paddingTop = 16;
  header.paddingBottom = 16;
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.fills = [{ type: "SOLID", color: getColors().white }];

  const title = await createTextNode(
    lang === "ar" ? "عنوان" : "Title",
    18,
    lang
  );
  title.fills = [{ type: "SOLID", color: getColors().text }];
  safeAppend(header, title);

  const closeIcon = figma.createFrame();
  closeIcon.resize(24, 24);
  closeIcon.fills = [];
  const x1 = figma.createLine();
  x1.strokes = [{ type: "SOLID", color: getColors().text }];
  x1.strokeWeight = 2;
  safeAppend(closeIcon, x1);
  safeAppend(header, closeIcon);

  safeAppend(component, header);

  // Body
  const body = figma.createFrame();
  body.layoutMode = "VERTICAL";
  body.resize(widths[size], 300);
  body.paddingLeft = 24;
  body.paddingRight = 24;
  body.paddingTop = 16;
  body.paddingBottom = 16;
  body.fills = [{ type: "SOLID", color: getColors().white }];

  const bodyText = await createTextNode(
    lang === "ar" ? "محتوى النافذة" : "Modal content",
    14,
    lang
  );
  bodyText.fills = [{ type: "SOLID", color: getColors().muted }];
  safeAppend(body, bodyText);
  safeAppend(component, body);

  // Footer
  const footer = figma.createFrame();
  footer.layoutMode = "HORIZONTAL";
  footer.resize(widths[size], 56);
  footer.paddingLeft = 24;
  footer.paddingRight = 24;
  footer.paddingTop = 12;
  footer.paddingBottom = 12;
  footer.itemSpacing = 12;
  footer.primaryAxisAlignItems = lang === "ar" ? "MAX" : "MIN";
  footer.fills = [{ type: "SOLID", color: getColors().white }];

  const cancelBtn = await createTextNode(
    lang === "ar" ? "إلغاء" : "Cancel",
    14,
    lang
  );
  cancelBtn.fills = [{ type: "SOLID", color: getColors().text }];
  safeAppend(footer, cancelBtn);

  const confirmBtn = await createTextNode(
    lang === "ar" ? "تأكيد" : "Confirm",
    14,
    lang
  );
  confirmBtn.fills = [{ type: "SOLID", color: getColors().primary }];
  safeAppend(footer, confirmBtn);

  safeAppend(component, footer);

  return component;
}

async function createModalComponentSet(
  size: "Small" | "Medium" | "Large",
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const sizes: Array<"Small" | "Medium" | "Large"> = ["Small", "Medium", "Large"];

  const variants: ComponentNode[] = [];

  for (const s of sizes) {
    const variant = await createModalVariant({ size: s, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Modal / ${lang}`;


  return componentSet;
}

async function createDividerVariant(
  type: "Horizontal" | "Vertical"
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Divider", { type });

  if (type === "Horizontal") {
    component.resize(400, 1);
    const line = figma.createRectangle();
    line.resize(400, 1);
    line.fills = [{ type: "SOLID", color: getColors().border }];
    safeAppend(component, line);
  } else {
    component.resize(1, 200);
    const line = figma.createRectangle();
    line.resize(1, 200);
    line.fills = [{ type: "SOLID", color: getColors().border }];
    safeAppend(component, line);
  }

  return component;
}

async function createDividerComponentSet(): Promise<ComponentSetNode> {
  const types: Array<"Horizontal" | "Vertical"> = ["Horizontal", "Vertical"];

  const variants: ComponentNode[] = [];

  for (const type of types) {
    const variant = await createDividerVariant(type);
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = "Divider";


  return componentSet;
}

// ============================================================================
// Content Components
// ============================================================================

async function createFAQVariant(config: {
  state: "Collapsed" | "Expanded";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("FAQ", { state, lang });

  component.layoutMode = "VERTICAL";
  component.resize(500, state === "Expanded" ? 150 : 60);
  component.paddingTop = 16;
  component.paddingBottom = 16;
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.itemSpacing = 8;
  component.cornerRadius = 8;
  component.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];

  const question = await createTextNode(
    lang === "ar" ? "ما هو هذا المنتج؟" : "What is this product?",
    16,
    lang
  );
  question.fills = [{ type: "SOLID", color: getColors().text }];
  safeAppend(component, question);

  if (state === "Expanded") {
    const answer = await createTextNode(
      lang === "ar"
        ? "هذا المنتج يساعدك على..."
        : "This product helps you...",
      14,
      lang
    );
    answer.fills = [{ type: "SOLID", color: getColors().muted }];
    safeAppend(component, answer);
  }

  return component;
}

async function createFAQComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Collapsed" | "Expanded"> = ["Collapsed", "Expanded"];

  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createFAQVariant({ state, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `FAQ / ${lang}`;


  return componentSet;
}

async function createFooter(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Footer", { lang });

  component.layoutMode = "VERTICAL";
  component.resize(1200, 200);
  component.paddingTop = 40;
  component.paddingBottom = 24;
  component.paddingLeft = 40;
  component.paddingRight = 40;
  component.itemSpacing = 24;
  component.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];

  // Top row
  const topRow = figma.createFrame();
  topRow.layoutMode = "HORIZONTAL";
  topRow.itemSpacing = 32;
  topRow.primaryAxisAlignItems = lang === "ar" ? "MAX" : "MIN";

  const brand = await createTextNode(
    lang === "ar" ? "العلامة التجارية" : "Brand Name",
    24,
    lang
  );
  brand.fills = [{ type: "SOLID", color: getColors().white }];

  const linksFrame = figma.createFrame();
  linksFrame.layoutMode = "HORIZONTAL";
  linksFrame.itemSpacing = 24;

  const links = lang === "ar"
    ? ["من نحن", "الدعم", "تواصل معنا"]
    : ["About", "Support", "Contact"];

  for (const link of links) {
    const linkText = await createTextNode(link, 14, lang);
    linkText.fills = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
    safeAppend(linksFrame, linkText);
  }

  if (lang === "ar") {
    safeAppend(topRow, linksFrame);
    safeAppend(topRow, brand);
  } else {
    safeAppend(topRow, brand);
    safeAppend(topRow, linksFrame);
  }

  safeAppend(component, topRow);

  // Divider
  const divider = figma.createRectangle();
  divider.resize(1120, 1);
  divider.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
  safeAppend(component, divider);

  // Copyright
  const copyright = await createTextNode(
    lang === "ar" ? "© 2024 جميع الحقوق محفوظة" : "© 2024 All rights reserved",
    12,
    lang
  );
  copyright.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
  safeAppend(component, copyright);

  return component;
}

// ============================================================================
// New Components: Avatar, Badge, Progress Bar, Breadcrumbs, Pagination, etc.
// ============================================================================

async function createAvatarVariant(
  size: "Small" | "Medium" | "Large"
): Promise<ComponentNode> {
  const sizeConfig = SIZES[size];
  const component = figma.createComponent();
  component.name = buildComponentName("Avatar", { size });

  component.resize(sizeConfig.height, sizeConfig.height);
  component.cornerRadius = sizeConfig.height / 2;
  component.fills = [{ type: "SOLID", color: getColors().primary }];

  const icon = createIcon("ri-user-line", sizeConfig.iconSize, getColors().white);
  icon.x = (sizeConfig.height - sizeConfig.iconSize) / 2;
  icon.y = (sizeConfig.height - sizeConfig.iconSize) / 2;
  safeAppend(component, icon);

  return component;
}

async function createAvatarComponentSet(): Promise<ComponentSetNode> {
  const sizes: Array<"Small" | "Medium" | "Large"> = ["Small", "Medium", "Large"];
  const variants: ComponentNode[] = [];

  for (const size of sizes) {
    const variant = await createAvatarVariant(size);
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = "Avatar";
  return componentSet;
}

// ============================================================================
// Icon Component (Quick Access)
// ============================================================================

async function createIconComponent(
  iconType: string,
  size: number
): Promise<ComponentNode> {
  const component = figma.createComponent();
  const iconName = iconType.replace("ri-", "").replace("-line", "").replace("-fill", "");
  component.name = `Icon / ${iconName} / ${size}px`;
  component.resize(size, size);
  
  // Create icon using createIcon helper
  const iconColor = getColors().text;
  const iconNode = createIcon(iconType, size, iconColor);
  safeAppend(component, iconNode);
  
  return component;
}

async function createBadgeVariant(config: {
  type: "Default" | "Success" | "Warning" | "Error" | "Info";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { type, lang } = config;
  const component = figma.createComponent();
  component.name = buildComponentName("Badge", { type, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(60, 24);
  component.paddingLeft = 8;
  component.paddingRight = 8;
  component.paddingTop = 4;
  component.paddingBottom = 4;
  component.cornerRadius = 12;
  component.primaryAxisAlignItems = "CENTER";

  let bgColor = getColors().primary;
  if (type === "Success") bgColor = getColors().success;
  else if (type === "Warning") bgColor = getColors().warning;
  else if (type === "Error") bgColor = getColors().danger;
  else if (type === "Info") bgColor = getColors().info;

  component.fills = [{ type: "SOLID", color: bgColor }];

  const text = await createTextNode(
    lang === "ar" ? "شارة" : "Badge",
    12,
    lang
  );
  text.fills = [{ type: "SOLID", color: getColors().white }];
  safeAppend(component, text);

  return component;
}

async function createBadgeComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const types: Array<"Default" | "Success" | "Warning" | "Error" | "Info"> = [
    "Default",
    "Success",
    "Warning",
    "Error",
    "Info",
  ];
  const variants: ComponentNode[] = [];

  for (const type of types) {
    const variant = await createBadgeVariant({ type, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Badge / ${lang}`;
  return componentSet;
}

async function createProgressBarVariant(
  size: "Small" | "Medium" | "Large",
  progress: number
): Promise<ComponentNode> {
  const sizeConfig = SIZES[size];
  const component = figma.createComponent();
  component.name = `Progress Bar / ${size} / ${progress}%`;

  component.resize(200, sizeConfig.height / 2);
  component.cornerRadius = sizeConfig.height / 4;
  component.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];

  const fill = figma.createRectangle();
  fill.resize((200 * progress) / 100, sizeConfig.height / 2);
  fill.cornerRadius = sizeConfig.height / 4;
  fill.fills = [{ type: "SOLID", color: getColors().primary }];
  safeAppend(component, fill);

  return component;
}

async function createProgressBarComponentSet(): Promise<ComponentSetNode> {
  const sizes: Array<"Small" | "Medium" | "Large"> = ["Small", "Medium", "Large"];
  const progressValues = [25, 50, 75, 100];
  const variants: ComponentNode[] = [];

  for (const size of sizes) {
    for (const progress of progressValues) {
      const variant = await createProgressBarVariant(size, progress);
      safeAppend(figma.currentPage, variant);
      variants.push(variant);
    }
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = "Progress Bar";
  return componentSet;
}

async function createBreadcrumbs(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Breadcrumbs", { lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(300, 24);
  component.itemSpacing = 8;
  component.primaryAxisAlignItems = "CENTER";

  const items = lang === "ar" ? ["الرئيسية", "الصفحة", "الحالية"] : ["Home", "Page", "Current"];

  items.forEach((item, index) => {
    const text = figma.createText();
    text.fontName = { family: "Inter", style: "Regular" };
    try {
      figma.loadFontAsync({ family: "Inter", style: "Regular" });
    } catch {}
    text.characters = item;
    text.fontSize = 14;
    text.fills = [
      {
        type: "SOLID",
        color: index === items.length - 1 ? getColors().text : getColors().muted,
      },
    ];
    safeAppend(component, text);

    if (index < items.length - 1) {
      const separatorIcon = lang === "ar" ? "ri-arrow-left-line" : "ri-arrow-right-line";
      const separator = createIcon(separatorIcon, 16, getColors().muted);
      safeAppend(component, separator);
    }
  });

  return component;
}

async function createPagination(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Pagination", { lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(300, 40);
  component.itemSpacing = 4;
  component.primaryAxisAlignItems = "CENTER";

  const pages = ["1", "2", "3", "4", "5"];
  pages.forEach((page, index) => {
    const pageBtn = figma.createFrame();
    pageBtn.resize(32, 32);
    pageBtn.cornerRadius = 6;
    pageBtn.fills = [
      {
        type: "SOLID",
        color: index === 0 ? getColors().primary : getColors().white,
      },
    ];
    if (index === 0) {
      pageBtn.strokes = [{ type: "SOLID", color: getColors().primary }];
      pageBtn.strokeWeight = 1;
    }

    const text = figma.createText();
    text.fontName = { family: "Inter", style: "Regular" };
    try {
      figma.loadFontAsync({ family: "Inter", style: "Regular" });
    } catch {}
    text.characters = page;
    text.fontSize = 14;
    text.fills = [
      {
        type: "SOLID",
        color: index === 0 ? getColors().white : getColors().text,
      },
    ];
    text.x = 8;
    text.y = 6;
    safeAppend(pageBtn, text);
    safeAppend(component, pageBtn);
  });

  return component;
}

async function createTooltip(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Tooltip", { lang });

  component.layoutMode = "VERTICAL";
  component.resize(120, 60);
  component.paddingTop = 8;
  component.paddingBottom = 8;
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.cornerRadius = 6;
  component.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];

  const text = await createTextNode(
    lang === "ar" ? "تلميح" : "Tooltip text",
    12,
    lang
  );
  text.fills = [{ type: "SOLID", color: getColors().white }];
  safeAppend(component, text);

  return component;
}

async function createDropdownMenu(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Dropdown Menu", { lang });

  component.layoutMode = "VERTICAL";
  component.resize(200, 160);
  component.paddingTop = 4;
  component.paddingBottom = 4;
  component.itemSpacing = 0;
  component.cornerRadius = 8;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [{ type: "SOLID", color: getColors().border }];
  component.strokeWeight = 1;

  const items = lang === "ar"
    ? ["خيار 1", "خيار 2", "خيار 3", "خيار 4"]
    : ["Option 1", "Option 2", "Option 3", "Option 4"];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const itemFrame = figma.createFrame();
    itemFrame.layoutMode = "HORIZONTAL";
    itemFrame.resize(200, 36);
    itemFrame.paddingLeft = 12;
    itemFrame.paddingRight = 12;
    itemFrame.paddingTop = 8;
    itemFrame.paddingBottom = 8;
    itemFrame.fills = [
      {
        type: "SOLID",
        color: index === 0 ? { r: 0.95, g: 0.95, b: 0.95 } : getColors().white,
      },
    ];

    const text = await createTextNode(item, 14, lang);
    text.fills = [{ type: "SOLID", color: getColors().text }];
    safeAppend(itemFrame, text);
    safeAppend(component, itemFrame);
  }

  return component;
}

async function createSearchInputVariant(config: {
  state: "Default" | "Focus";
  size: "Small" | "Medium" | "Large";
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { state, size, lang } = config;
  const sizeConfig = SIZES[size];
  const component = figma.createComponent();
  component.name = buildComponentName("Search Input", { state, size, lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(300, sizeConfig.height);
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.cornerRadius = 8;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [
    {
      type: "SOLID",
      color: state === "Focus" ? getColors().primary : getColors().border,
    },
  ];
  component.strokeWeight = state === "Focus" ? 2 : 1;
  component.itemSpacing = 8;
  component.primaryAxisAlignItems = lang === "ar" ? "MAX" : "MIN";

  const searchIcon = createIcon(
    "ri-search-line",
    sizeConfig.iconSize,
    getColors().muted
  );
  const placeholder = await createTextNode(
    lang === "ar" ? "ابحث..." : "Search...",
    sizeConfig.fontSize,
    lang
  );
  placeholder.fills = [{ type: "SOLID", color: getColors().muted }];

  if (lang === "ar") {
    safeAppend(component, placeholder);
    safeAppend(component, searchIcon);
  } else {
    safeAppend(component, searchIcon);
    safeAppend(component, placeholder);
  }

  return component;
}

async function createSearchInputComponentSet(
  size: "Small" | "Medium" | "Large",
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const states: Array<"Default" | "Focus"> = ["Default", "Focus"];
  const variants: ComponentNode[] = [];

  for (const state of states) {
    const variant = await createSearchInputVariant({ state, size, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Search Input / ${size} / ${lang}`;
  return componentSet;
}

async function createDatePicker(lang: "ar" | "en"): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = buildComponentName("Date Picker", { lang });

  component.layoutMode = "HORIZONTAL";
  component.resize(200, 40);
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.cornerRadius = 8;
  component.fills = [{ type: "SOLID", color: getColors().white }];
  component.strokes = [{ type: "SOLID", color: getColors().border }];
  component.strokeWeight = 1;
  component.itemSpacing = 8;
  component.primaryAxisAlignItems = "SPACE_BETWEEN";

  const dateText = await createTextNode(
    lang === "ar" ? "اختر التاريخ" : "Select date",
    14,
    lang
  );
  dateText.fills = [{ type: "SOLID", color: getColors().muted }];
  safeAppend(component, dateText);

  const calendarIcon = createIcon("ri-calendar-line", 20, getColors().muted);
  safeAppend(component, calendarIcon);

  return component;
}

async function createStepperVariant(config: {
  step: number;
  total: number;
  lang: "ar" | "en";
}): Promise<ComponentNode> {
  const { step, total, lang } = config;
  const component = figma.createComponent();
  component.name = `Stepper / ${step}/${total} / ${lang}`;

  component.layoutMode = "HORIZONTAL";
  component.resize(400, 40);
  component.itemSpacing = 8;
  component.primaryAxisAlignItems = "CENTER";

  for (let i = 1; i <= total; i++) {
    const stepCircle = figma.createEllipse();
    stepCircle.resize(32, 32);
    stepCircle.fills = [
      {
        type: "SOLID",
        color: i <= step ? getColors().primary : { r: 0.9, g: 0.9, b: 0.9 },
      },
    ];
    stepCircle.strokes = [
      {
        type: "SOLID",
        color: i <= step ? getColors().primary : getColors().border,
      },
    ];
    stepCircle.strokeWeight = 2;

    const stepText = figma.createText();
    stepText.fontName = { family: "Inter", style: "Regular" };
    try {
      figma.loadFontAsync({ family: "Inter", style: "Regular" });
    } catch {}
    stepText.characters = String(i);
    stepText.fontSize = 14;
    stepText.fills = [
      {
        type: "SOLID",
        color: i <= step ? getColors().white : getColors().muted,
      },
    ];
    stepText.x = 8;
    stepText.y = 6;
    // Use frame to contain circle and text
    const stepFrame = figma.createFrame();
    stepFrame.resize(32, 32);
    stepFrame.fills = [];
    stepFrame.appendChild(stepCircle);
    stepFrame.appendChild(stepText);
    stepCircle.x = 0;
    stepCircle.y = 0;
    stepText.x = 8;
    stepText.y = 6;
    safeAppend(component, stepFrame);

    if (i < total) {
      const line = figma.createRectangle();
      line.resize(40, 2);
      line.fills = [
        {
          type: "SOLID",
          color: i < step ? getColors().primary : getColors().border,
        },
      ];
      safeAppend(component, line);
    }
  }

  return component;
}

async function createStepperComponentSet(
  lang: "ar" | "en"
): Promise<ComponentSetNode> {
  const steps = [1, 2, 3, 4];
  const variants: ComponentNode[] = [];

  for (let step = 1; step <= 4; step++) {
    const variant = await createStepperVariant({ step, total: 4, lang });
    safeAppend(figma.currentPage, variant);
    variants.push(variant);
  }

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = `Stepper / ${lang}`;
  return componentSet;
}

// ============================================================================
// Main Message Handler
// ============================================================================

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "CANCEL") {
      figma.closePlugin();
      return;
    }

    if (msg.type === "GENERATE_COMPONENT") {
      const {
        component,
        lang,
        size,
        createAsComponents,
        stackVertically,
        colors,
      } = msg.payload;

      // Update theme colors if provided
      if (colors) {
        THEME_COLORS.primary = hexToRgb(colors.primary);
        THEME_COLORS.danger = hexToRgb(colors.danger);
        THEME_COLORS.warning = hexToRgb(colors.warning);
        THEME_COLORS.success = hexToRgb(colors.success);
        THEME_COLORS.info = hexToRgb(colors.info);
        THEME_COLORS.text = hexToRgb(colors.text);
        THEME_COLORS.muted = hexToRgb(colors.muted);
        THEME_COLORS.border = hexToRgb(colors.border);
      }

      const kitFrame = getOrCreateKitFrame();
      const sectionName = getSectionForComponent(component);
      const section = await getOrCreateSection(kitFrame, sectionName);

      let componentSet: ComponentSetNode | ComponentNode;

      try {
        switch (component) {
          // Buttons
          case "button":
            const buttonType = (msg.payload.buttonType || "Primary") as "Primary" | "Secondary" | "Ghost" | "Danger";
            const buttonSize = (size || "Medium") as "Small" | "Medium" | "Large";
            const buttonState = (msg.payload.buttonState || "Default") as "Default" | "Hover" | "Disabled" | "Loading";
            const buttonShape = (msg.payload.buttonShape || "Default") as "Default" | "Capsule";
            const buttonIcon = (msg.payload.buttonIcon || "None") as "None" | "Left" | "Right";
            componentSet = await createButtonComponent(lang, buttonType, buttonSize, buttonState, buttonShape, buttonIcon);
            break;
          case "icon-button":
            componentSet = await createIconButtonComponentSet();
            break;

          // Navigation
          case "navbar":
            componentSet = await createNavbar(lang);
            break;
          case "sidebar-item":
            componentSet = await createSidebarItemComponentSet(lang);
            break;
          case "tab":
            componentSet = await createTabComponentSet(lang);
            break;
          case "breadcrumbs":
            componentSet = await createBreadcrumbs(lang);
            break;
          case "pagination":
            componentSet = await createPagination(lang);
            break;

          // Forms
          case "text-input":
            componentSet = await createTextInputComponentSet(size, lang);
            break;
          case "search-input":
            componentSet = await createSearchInputComponentSet(size, lang);
            break;
          case "select":
            componentSet = await createSelectComponentSet(size, lang);
            break;
          case "checkbox":
            componentSet = await createCheckboxComponentSet(lang);
            break;
          case "toggle":
            componentSet = await createToggleComponentSet(lang);
            break;
          case "date-picker":
            componentSet = await createDatePicker(lang);
            break;
          case "stepper":
            componentSet = await createStepperComponentSet(lang);
            break;

          // Feedback
          case "alert":
            componentSet = await createAlertComponentSet(lang);
            break;
          case "toast":
            componentSet = await createToastComponentSet(lang);
            break;
          case "loading-spinner":
            componentSet = await createLoadingSpinnerComponentSet();
            break;
          case "progress-bar":
            componentSet = await createProgressBarComponentSet();
            break;
          case "tooltip":
            componentSet = await createTooltip(lang);
            break;

          // Layout
          case "card":
            componentSet = await createCardComponentSet(lang);
            break;
          case "modal":
            componentSet = await createModalComponentSet(size, lang);
            break;
          case "divider":
            componentSet = await createDividerComponentSet();
            break;
          case "dropdown":
            componentSet = await createDropdownMenu(lang);
            break;

          // Content
          case "faq":
            componentSet = await createFAQComponentSet(lang);
            break;
          case "footer":
            componentSet = await createFooter(lang);
            break;
          case "avatar":
            componentSet = await createAvatarComponentSet();
            break;
          case "badge":
            componentSet = await createBadgeComponentSet(lang);
            break;

          // Icons
          case "icon":
            const iconType = msg.payload.iconOption || "ri-home-line";
            const iconSize = msg.payload.iconSize || 24;
            componentSet = await createIconComponent(iconType, iconSize);
            break;

          default:
            figma.ui.postMessage({
              type: "ERROR",
              error: `Component "${component}" not found`,
            });
            return;
        }

        safeAppend(section, componentSet);
        figma.viewport.scrollAndZoomIntoView([kitFrame]);
        figma.notify(`Created ${component}`);
        figma.ui.postMessage({
          type: "SUCCESS",
          message: `Created ${component} successfully!`,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        console.error("Component creation error:", error);
        figma.ui.postMessage({ type: "ERROR", error: errorMsg });
        figma.notify(`Error: ${errorMsg}`, { error: true });
      }
    }

    if (msg.type === "GENERATE_TOKENS") {
      const { colors, text, effects, spacing, colorValues } = msg.payload;

      try {
        const kitFrame = getOrCreateKitFrame();
        let tokensFrame = findByName(kitFrame, "Design Tokens") as
          | FrameNode
          | undefined;

        if (!tokensFrame || tokensFrame.type !== "FRAME") {
          tokensFrame = figma.createFrame();
          tokensFrame.name = "Design Tokens";
          tokensFrame.layoutMode = "VERTICAL";
          tokensFrame.paddingTop = 24;
          tokensFrame.paddingBottom = 24;
          tokensFrame.paddingLeft = 24;
          tokensFrame.paddingRight = 24;
          tokensFrame.itemSpacing = 16;
          tokensFrame.fills = [{ type: "SOLID", color: getColors().white }];
          safeAppend(kitFrame, tokensFrame);
        }

        if (colors && colorValues) {
          // Create color styles
          const colorFrame = figma.createFrame();
          colorFrame.name = "Color Styles";
          colorFrame.layoutMode = "VERTICAL";
          colorFrame.itemSpacing = 8;

          const colorMap: Record<string, string> = {
            primary: colorValues.primary,
            danger: colorValues.danger,
            warning: colorValues.warning,
            success: colorValues.success,
            info: colorValues.info,
            text: colorValues.text,
            muted: colorValues.muted,
            border: colorValues.border,
          };

          const colorNames = Object.keys(colorMap);
          for (const name of colorNames) {
            const hex = colorMap[name];
            const colorRect = figma.createRectangle();
            colorRect.resize(60, 40);
            colorRect.fills = [{ type: "SOLID", color: hexToRgb(hex) }];
            colorRect.name = `Color/${name}`;
            safeAppend(colorFrame, colorRect);
          }

          safeAppend(tokensFrame, colorFrame);
        }

        if (text) {
          // Create text styles
          const textFrame = figma.createFrame();
          textFrame.name = "Text Styles";
          textFrame.layoutMode = "VERTICAL";
          textFrame.itemSpacing = 8;

          const textSizes = [12, 14, 16, 18, 20, 24, 28, 32];
          for (const fontSize of textSizes) {
            const textNode = await createTextNode(
              `Text ${fontSize}px`,
              fontSize,
              "en"
            );
            textNode.name = `Text/${fontSize}px`;
            safeAppend(textFrame, textNode);
          }

          safeAppend(tokensFrame, textFrame);
        }

        if (effects) {
          // Create effect styles (shadows)
          const effectFrame = figma.createFrame();
          effectFrame.name = "Effect Styles";
          effectFrame.layoutMode = "VERTICAL";
          effectFrame.itemSpacing = 8;

          const shadowRect = figma.createRectangle();
          shadowRect.resize(100, 60);
          shadowRect.fills = [{ type: "SOLID", color: getColors().white }];
          shadowRect.effects = [
            {
              type: "DROP_SHADOW",
              color: { r: 0, g: 0, b: 0, a: 0.1 },
              offset: { x: 0, y: 4 },
              radius: 8,
              visible: true,
              blendMode: "NORMAL",
            },
          ];
          shadowRect.name = "Effect/Shadow/Default";
          safeAppend(effectFrame, shadowRect);

          safeAppend(tokensFrame, effectFrame);
        }

        if (spacing) {
          // Create spacing variables
          const spacingFrame = figma.createFrame();
          spacingFrame.name = "Spacing";
          spacingFrame.layoutMode = "VERTICAL";
          spacingFrame.itemSpacing = 8;

          const spacingValues = [4, 8, 12, 16, 24, 32, 40, 48];
          for (const value of spacingValues) {
            const spacer = figma.createFrame();
            spacer.resize(value, value);
            spacer.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
            spacer.name = `Spacing/${value}px`;
            safeAppend(spacingFrame, spacer);
          }

          safeAppend(tokensFrame, spacingFrame);
        }

        figma.viewport.scrollAndZoomIntoView([kitFrame]);
        figma.notify("Design Tokens created!");
        figma.ui.postMessage({
          type: "SUCCESS",
          message: "Design Tokens generated successfully!",
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        figma.ui.postMessage({ type: "ERROR", error: errorMsg });
        figma.notify(`Error: ${errorMsg}`, { error: true });
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Plugin error:", error);
    figma.ui.postMessage({ type: "ERROR", error: errorMsg });
    figma.notify(`Error: ${errorMsg}`, { error: true });
  }
};
