# madebyjoe

<div align="center">

![Made by Joe](https://img.shields.io/badge/Made%20by-Joe-red?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-madebyjoe.co-orange?style=for-the-badge)](https://madebyjoe.co)
[![Performance](https://img.shields.io/badge/Performance-Optimized-green?style=for-the-badge)](https://pagespeed.web.dev/report?url=https://madebyjoe.co)

---

**A minimalist, animated personal portfolio website featuring a typewriter effect that introduces Joe and showcases his various projects and services.**

[Visit Live Site](https://madebyjoe.co) • [Performance Report](https://pagespeed.web.dev/report?url=https://madebyjoe.co) • [Report Bug](https://github.com/madebyjoe/madebyjoe/issues)

</div>

## Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| **Animated Typewriter Effect** | Smooth word-by-word animation with customizable speed | Active |
| **Responsive Design** | Optimized for desktop, tablet, and mobile devices | Active |
| **Modern UI** | Clean, dark theme with orange accent colors | Active |
| **Interactive Links** | Hover effects and smooth transitions | Active |
| **Social Media Integration** | LinkedIn, Instagram, GitHub, and Discord links | Active |
| **Performance Optimized** | Efficient CSS animations and caching strategies | Active |
| **Security Headers** | Comprehensive security and privacy headers | Active |

</div>

## Technologies Used

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Google Fonts](https://img.shields.io/badge/Google%20Fonts-4285F4?style=flat-square&logo=google&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-D22128?style=flat-square&logo=apache&logoColor=white)

</div>

### Core Technologies

| Technology | Purpose | Implementation |
|------------|---------|----------------|
| **HTML5** | Semantic markup structure | Clean, accessible markup |
| **CSS3** | Styling and animations | Custom properties, keyframes, flexbox |
| **JavaScript** | Interactive functionality | Vanilla JS for menu and animations |
| **Google Fonts** | Typography | Montserrat font family with preloading |
| **Apache .htaccess** | Server optimization | Caching, compression, security headers |

### CSS3 Features

- **Custom Properties (CSS Variables)** for animation control
- **Keyframe Animations** for typewriter effect
- **Flexbox** for responsive layout
- **Media Queries** for mobile optimization
- **CSS Grid** for advanced layouts
- **Transforms & Transitions** for smooth interactions

## Project Structure

```
madebyjoe/
├── index.html              # Main portfolio page with typewriter effect
├── img/                    # Images and assets
│   ├── j.jpg                  # Favicon and profile image
│   └── OG.jpg                 # Open Graph image
├── archive/                # Alternative versions
│   └── index_script_typewriter.html  # JavaScript-based typewriter
├── .htaccess              # Apache server optimization config
├── .cursorignore          # Cursor IDE ignore patterns
└── README.md              # This documentation
```

<div align="center">

![Project Structure](https://img.shields.io/badge/Files-5-blue?style=flat-square)
![Lines of Code](https://img.shields.io/badge/LOC-1000+-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

## Customization

### Animation Speed Control

The animation speed can be easily adjusted by modifying the CSS custom property in `index.html`:

```css
:root {
    --global-speed: 2; /* Change this value to control all animation speeds */
}
```

<div align="center">

| Speed Value | Animation Feel | Use Case |
|-------------|----------------|----------|
| `0.5` | Very Slow | Demo/Showcase |
| `1` | Slow | Relaxed browsing |
| `2` | Normal | Default (current) |
| `3` | Fast | Quick interactions |
| `4+` | Very Fast | Power users |

</div>

### Color Scheme

<div align="center">

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Background | Dark Gray | `#191919` | Main background |
| Primary Text | White | `#ffffff` | Headlines and important text |
| Secondary Text | Light Gray | `#cccccc` | Supporting text |
| Tertiary Text | Medium Gray | `#999999` | Less important text |
| Accent | Orange | `#f74f14` | Links and highlights |
| Hover | Light Orange | `#ff6b35` | Interactive states |

</div>

## Responsive Design

<div align="center">

![Desktop](https://img.shields.io/badge/Desktop-1200px+-blue?style=flat-square)
![Tablet](https://img.shields.io/badge/Tablet-768px%20--%201199px-green?style=flat-square)
![Mobile](https://img.shields.io/badge/Mobile-<768px-orange?style=flat-square)

</div>

The website is fully responsive and optimized for all device types:

| Device Type | Screen Size | Optimizations |
|-------------|-------------|---------------|
| **Desktop** | 1200px+ | Full layout with hover effects |
| **Tablet** | 768px - 1199px | Adjusted spacing and typography |
| **Mobile** | < 768px | Touch-friendly interface, reduced font size |

## Local Development

<div align="center">

![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)

</div>

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/madebyjoe/madebyjoe.git
   cd madebyjoe
   ```

2. **Choose your development server**:

<div align="center">

| Method | Command | Port | Best For |
|--------|---------|------|----------|
| **Direct** | Open `index.html` in browser | - | Quick preview |
| **Python** | `python -m http.server 8000` | 8000 | Full development |
| **Node.js** | `npx http-server` | 8080 | Advanced features |

</div>

3. **View the site**:
   - Navigate to `http://localhost:8000` (or the port shown in your terminal)

## Content

<div align="center">

![Portfolio](https://img.shields.io/badge/Portfolio-5%20Projects-blue?style=flat-square)
![Services](https://img.shields.io/badge/Services-Full%20Stack-green?style=flat-square)

</div>

The portfolio showcases Joe's work across multiple domains:

| Domain | Project | Description | Link |
|--------|---------|-------------|------|
| **Graphics** | joe.graphics | Design work and graphics | [Visit](https://joe.graphics) |
| **Digital Assets** | fromtheroot.studio | 3D animation and digital assets | [Visit](https://fromtheroot.studio) |
| **AI Research** | syntheticlabs.xyz | AI tools and research | [Visit](https://syntheticlabs.xyz) |
| **Infrastructure** | cerebral.studio | Compute and infrastructure services | [Visit](https://cerebral.studio) |
| **Automation** | automatedigital.ai | Templated and bespoke automation solutions | [Visit](https://automatedigital.ai) |

## Contact

<div align="center">

[![Email](https://img.shields.io/badge/Email-hello@madebyjoe.co-red?style=for-the-badge&logo=gmail)](mailto:hello@madebyjoe.co)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-joeconstanti-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/joeconstanti/)
[![Instagram](https://img.shields.io/badge/Instagram-ftr.studio-pink?style=for-the-badge&logo=instagram)](https://www.instagram.com/ftr.studio/)
[![GitHub](https://img.shields.io/badge/GitHub-fromtheroot-black?style=for-the-badge&logo=github)](https://github.com/fromtheroot/)

</div>

### Connect with Joe

| Platform | Handle | Purpose |
|----------|--------|---------|
| **Email** | hello@madebyjoe.co | Business inquiries |
| **LinkedIn** | joeconstanti | Professional networking |
| **Instagram** | ftr.studio | Visual portfolio updates |
| **GitHub** | fromtheroot | Code and projects |

## License

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green?style=for-the-badge)](https://github.com/madebyjoe/madebyjoe)

</div>

This project is open source and available under the **MIT License**. Feel free to use it for your own projects!

## Contributing

<div align="center">

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)
![Issues](https://img.shields.io/badge/Issues-Welcome-red?style=for-the-badge)
![PRs](https://img.shields.io/badge/PRs-Welcome-blue?style=for-the-badge)

</div>

While this is a personal portfolio, suggestions and improvements are welcome! Here's how you can contribute:

### How to Contribute

| Step | Action | Description |
|------|--------|-------------|
| 1 | **Fork** | Fork the repository to your GitHub account |
| 2 | **Branch** | Create a feature branch (`git checkout -b feature/amazing-feature`) |
| 3 | **Code** | Make your changes and improvements |
| 4 | **Commit** | Commit your changes (`git commit -m 'Add amazing feature'`) |
| 5 | **Push** | Push to your branch (`git push origin feature/amazing-feature`) |
| 6 | **PR** | Open a Pull Request with a clear description |

### What We're Looking For

- **Bug fixes** and improvements
- **Design enhancements** and UI/UX improvements
- **Performance optimizations**
- **Mobile responsiveness** improvements
- **Accessibility** enhancements
- **Documentation** improvements

## Acknowledgments

<div align="center">

![Inspiration](https://img.shields.io/badge/Inspired%20By-Minimalist%20Design-purple?style=flat-square)
![Standards](https://img.shields.io/badge/Built%20With-Modern%20Web%20Standards-blue?style=flat-square)
![Performance](https://img.shields.io/badge/Optimized%20For-Performance%20%26%20Accessibility-green?style=flat-square)

</div>

### Credits

- **Design**: Inspired by minimalist design principles
- **Standards**: Built with modern web standards (HTML5, CSS3, ES6+)
- **Performance**: Optimized for Core Web Vitals and accessibility
- **Tools**: Enhanced with Apache server optimizations
- **Community**: Thanks to all contributors and feedback

---

<div align="center">

## Star this repo if you found it helpful!

[![GitHub stars](https://img.shields.io/github/stars/madebyjoe/madebyjoe?style=social)](https://github.com/madebyjoe/madebyjoe/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/madebyjoe/madebyjoe?style=social)](https://github.com/madebyjoe/madebyjoe/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/madebyjoe/madebyjoe?style=social)](https://github.com/madebyjoe/madebyjoe/watchers)

**Made by [Joe](https://madebyjoe.co)**

[Visit Portfolio](https://madebyjoe.co) • [Get in Touch](mailto:hello@madebyjoe.co) • [LinkedIn](https://www.linkedin.com/in/joeconstanti/)

</div>

## PageSpeed optimisation (23 October 2026)

The complete page renders before optional animation libraries load. The branded
loading overlay counts font/poster readiness, then fades out; it does not wait for
video, and has a 1.2-second timeout plus a CSS fallback. A small static
ordered-dither hero and WebP video posters provide the first view. Pointer, touch,
keyboard or scroll interaction loads motion; reduced-motion users keep the static
version. Analytics runs on page entry through the vendored Partytown 1.0.2 worker
(`js/vendor/partytown-1.0.2/`, MIT license), with normal-script fallback in browsers
without worker support. The document CSP stays separate from the worker sandbox
policy. Verify a GA4 `page_view` collection request after changes; a successful
transport request does not prove dashboard attribution. The animated hero renders at half CSS
resolution, at up to 24 fps, and stops when offscreen or the tab is hidden.

Edit `css/main.css`, then run `node scripts/sync-styles.mjs` to update the inline
stylesheet, font subsets, bootstrap and loader in `index.html`. Inlining removes
the extra first-view font and loader requests. After copy changes run
`python3 scripts/subset-fonts.py` (requires fonttools and brotli), then sync again
so the embedded fonts include every character in the updated copy. Keep the original
font files as the subset source.

Validate using a local server and Lighthouse (repeat against the deployed URL after
publication; local results do not establish production PageSpeed scores):

```sh
python3 -m http.server 8000
npx lighthouse http://localhost:8000 --chrome-flags='--headless' --output=html --output=json --output-path=/tmp/madebyjoe-mobile
npx lighthouse http://localhost:8000 --preset=desktop --chrome-flags='--headless' --output=html --output=json --output-path=/tmp/madebyjoe-desktop
```

Local Lighthouse 13 runs with the overlay and worker-based Analytics scored 100 in
Performance, Accessibility, Best Practices and SEO on both profiles. The mobile run
with the production CSP applied had FCP 1.2 s, LCP 1.7 s and TBT 0 ms, with no
console errors and a successful GA4 page-view request. Repeat against production:
local results do not establish deployed PageSpeed scores. Scores vary with server,
network and test conditions. Python's standard server does not apply `.htaccess`.
