import Handlebars from "handlebars";

export function compileHomeTemplate(html: string, data: any): string {
  try {
    if (!html) return "";
    const template = Handlebars.compile(html);
    return template(data);
  } catch (error) {
    console.error("Failed to compile Handlebars template:", error);
    // If the admin made a syntax error in the template, fallback to raw HTML to prevent page crash
    return html;
  }
}
