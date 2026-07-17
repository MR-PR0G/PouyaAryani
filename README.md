# 🌌 Modular Portfolio & Interactive Showcase

A highly performant, modular, and responsive personal portfolio website. Designed with a clean, extensible architecture, this project offers three distinct visual modes, multilingual support, and a hidden easter egg minigame.

> ⚡ **AI Redesigned & Optimized**  
> This project has been refined with **AI-driven architectural design**, focusing on high-performance rendering (CSS Hardware Acceleration), sleek glassmorphism aesthetics, and a modular configuration system for seamless updates.

<div align="center" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
  <img src="/Demos/1.png" width="45%" style="min-width: 250px; border-radius: 10px; margin-bottom: 10px;">
  <img src="/Demos/2.png" width="45%" style="min-width: 250px; border-radius: 10px; margin-bottom: 10px;">
  <img src="/Demos/3.png" width="45%" style="min-width: 250px; border-radius: 10px;">
  <img src="/Demos/4.png" width="45%" style="min-width: 250px; border-radius: 10px;">
</div>

## 🎨 Core Features

*   **Three Visual Modes:**
    *   **Modern:** A sleek, glassmorphic UI with fluid animations.
    *   **Islands:** A custom, mobile-optimized experience with floating interactive components.
    *   **Classic:** A nostalgic 90s Windows-inspired retro aesthetic.
*   **Dynamic Themes:** Toggle between **Dark Neon**, **Glass Light**, and **Sunrise Glow**.
*   **Multilingual Architecture:** Easily extendable support for English, Persian (RTL), and more.
*   **JSON-Driven Content:** Manage your bio, projects, skills, and links through simple JSON configuration files—**no HTML knowledge required for daily updates.**
*   **Hidden Minigame:** Access an integrated mini-game by clicking the profile logo three times.
## 🚀 Getting Started
#### 1. Cloning the Project
Get started by cloning the repository to your local machine:
```
git clone https://github.com/MR-PR0G/PouyaAryani.git
cd PouyaAryani
```
#### 2. Customizing (Configuration)
All site content is managed inside the `config/` directory. You do not need to modify the HTML or JavaScript files to update your personal information. Simply edit the JSON files, and the site will load the new data automatically.
#### 3. Running Locally
Because this project uses ES Modules and local `fetch()` calls for JSON files, you must serve the files through a web server:
 * VS Code: Install the "Live Server" extension and click "Go Live".
 * Node.js: Run `npx serve` . in the terminal.
 * Python: Run `python3 -m http.server 8000` and visit `http://localhost:8000`
## 📂 Project Structure
```
.
├── config/              # 👈 Centralized content management (JSON)
│   ├── about/           # Bio, skills, and social links
│   ├── achievements/    # Certifications and milestones
│   ├── contact/         # Contact information
│   ├── home/            # Hero section settings
│   ├── projects/        # Portfolio items
│   └── skills/          # Technical skills
├── css/                 # Modular CSS styles
├── js/                  # Modular JavaScript logic
├── minigame/
├── font/
└── index.html           # Main Application entry
```
## 📝 Configuration Examples
#### Example 1: Updating the Hero Section (config/home/hero.json)
Modify this file to update the main title and subtitle of your website:
```
{
  "tag": "SYSTEMS & BACKEND ENGINEER",
  "name": "Pouya Aryani",
  "subtitle": "Full-Stack & Systems Engineer"
}
```
#### Example 2: Adding a New Project (config/projects/)
 1- Create a new JSON file (e.g., my-project.json) in the config/projects/ folder:
 ```
 {
  // The URL of your project's preview image (hosted on GitHub or elsewhere)
  "image": "https://github.com/MR-PR0G/YOUR-REPO/raw/main/image.png",

  // Category tag for filtering (provide both English and Persian)
  "tag": {
    "en": "System", 
    "fa": "سیستم"
  },

  // The title of your project
  "title": {
    "en": "Project Name",
    "fa": "نام پروژه"
  },

  // A brief description of the project (keep it concise)
  "desc": {
    "en": "Brief English description.",
    "fa": "توضیحات کوتاه فارسی."
  },

  // Technologies used in this project
  "stack": ["C", "GTK", "Cairo"],

  // The direct URL to your project repository or live demo
  "link": "https://github.com/MR-PR0G/YOUR-REPO"
}
```
2- Add the filename (`"my-project.json"`) to the array in `config/projects/manifest.json`.
## 🌍 Adding New Languages
To support a new language (e.g., German):
 1. Update `js/translations.js`: Add a new key (e.g., `de`) to the `translations` object following the structure of the existing languages.
 2. Translate Config Files: Go through the JSON files in the `config/` directory and add the new language keys to the fields (e.g.,`"name": {"en": "...", "fa": "...", "de": "..."}`).
 3. Add Flag: Add the corresponding flag icon to the `.lang-switch-row` in `index.html`.

## 💡 Golden Rules for JSON Configuration

To ensure your project remains stable and performant, please follow these guidelines when editing or adding new configuration files:

| Guideline | Description |
| :--- | :--- |
| **Standard Structure** | Always include both `en` and `fa` fields for every text-based entry. Missing a field in one language can lead to broken UI or empty text blocks. |
| **Validate Syntax** | Always validate your code using [JSONLint](https://jsonlint.com/) before saving. A single missing comma or bracket will break `configLoader.js`. |
| **Optimize Images** | Keep the site lightweight by compressing all project images using [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/) before uploading. |

---

### 🙏 Support & Appreciation 

**Thank you for your support!** 

Building and maintaining open-source projects takes time and dedication. If you find this portfolio template useful for your own projects, please consider **starring** ⭐ this repository. Your support helps me keep improving this template and adding more cool features. Thank you for being part of the open-source community!

