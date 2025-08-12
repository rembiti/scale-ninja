# scale ninja

An interactive web application for visualizing and learning guitar scales across the entire fretboard. Built with Next.js, React, and TypeScript.

![Guitar Scale Explorer Screenshot](public/screenshot.png)

## Features

- **Multiple Scale Types**:
  - Major (Ionian) and Natural Minor (Aeolian) scales
  - Minor Pentatonic (5 boxes)
  - Minor Hexatonic (Minor Pentatonic + 2nd degree)
- **Multiple Viewing Modes**:
  - 3 Notes Per String (3NPS) - 7 positions
  - Full Neck View - All notes in the scale across the entire fretboard
  - Pentatonic Boxes - 5 classic CAGED-style positions
  - Hexatonic Boxes - 5 pentatonic boxes with added 2nd degree
- **Interactive Controls**:
  - Select any of 12 keys (with enharmonic equivalents)
  - Toggle between sharp/flat notation
  - Switch between note names and scale degrees
  - Responsive design works on mobile, tablet, and desktop
- **Visual Features**:
  - Color-coded note markers
  - Clear fret and string numbering
  - Optimized for all screen sizes

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/guitar-scales.git
   cd guitar-scales
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select a Key**: Choose from all 12 musical keys with enharmonic equivalents
2. **Choose a Scale**: Toggle between Major and Minor scales
3. **Select View Mode**:
   - 3NPS: Shows 3-notes-per-string patterns (7 positions)
   - Full Neck: Displays all notes in the scale across the entire fretboard
   - Pentatonic: Shows 5 pentatonic box positions
   - Hexatonic: Shows pentatonic boxes with added 2nd degree
4. **Customize Display**:
   - Toggle between note names and scale degrees
   - Switch between sharp (#) and flat (♭) notation

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React](https://reactjs.org/) - UI library
- [Vercel](https://vercel.com/) - Deployment platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by various guitar scale visualization tools and music theory resources
- Built with the help of the amazing open-source community

---

Developed with ❤️ by [@engageintellect](https://github.com/engageintellect)
You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
