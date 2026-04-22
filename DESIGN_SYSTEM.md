# LifeOS Design System Documentation

## Overview
The LifeOS design system is crafted to provide a premium, sharp, and opinionated user experience. It is designed for ambitious individuals who value execution and discipline. The system emphasizes clarity, density, and functional motion.

## Design Philosophy
- **Dark-first**: Dark mode is the primary experience, with light mode as a secondary option.
- **Data-centric**: Scores, streaks, and timers are the heroes of the interface.
- **Density**: Information is prioritized over whitespace.
- **Intentionality**: Every element must justify its existence.
- **Functional Motion**: Motion is used for feedback, not flair.

## Typography
### Fonts
- **Display Font**: Syne (700, 800) — Used for hero numbers, area names, and section headers.
- **Mono Font**: DM Mono (400, 500) — Used for data such as scores, time, and streaks.
- **UI Font**: Geist (400, 500, 600) — Used for labels, buttons, and body text.

### Scale
- **Hero**: 48px / 56px (Syne 800)
- **Display**: 32px / 40px (Syne 700)
- **Title**: 20px / 28px (Syne 700)
- **Label**: 13px / 20px (Geist 500)
- **Body**: 14px / 22px (Geist 400)
- **Caption**: 11px / 16px (DM Mono 400)
- **Data**: 16px / 24px (DM Mono 500)

## Color System
### Dark Mode
- **Background**: `#080809`
- **Surface**: `#0F0F11`
- **Surface Hover**: `#141418`
- **Surface Raised**: `#18181F`
- **Border**: `#1C1C22`
- **Border Strong**: `#2A2A35`
- **Text Primary**: `#F0F0F5`
- **Text Secondary**: `#888896`
- **Text Muted**: `#44444F`

### Light Mode
- **Background**: `#F8F8FA`
- **Surface**: `#FFFFFF`
- **Surface Hover**: `#F2F2F6`
- **Surface Raised**: `#FAFAFA`
- **Border**: `#E4E4EC`
- **Border Strong**: `#CDCDD8`
- **Text Primary**: `#0A0A0F`
- **Text Secondary**: `#55555F`
- **Text Muted**: `#AAAABC`

### Accent Colors
- **Primary Green**: `#C8FF57`
- **Blue**: `#4D9CFF`
- **Orange**: `#FF7A45`
- **Purple**: `#9D7AFF`
- **Pink**: `#FF5C8A`
- **Teal**: `#2DDDB4`
- **Red**: `#FF4A6B`

### Area Colors
- **Career**: Blue
- **Health**: Teal
- **Mind**: Purple
- **Finance**: Green
- **Relationships**: Pink
- **Creative**: Orange

## Spacing System
- **Base Grid**: 8px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## Border Radius
- **Small**: 6px
- **Medium**: 10px
- **Large**: 16px
- **Extra Large**: 24px

## Motion
- **Fast**: 150ms ease
- **Base**: 250ms ease-out
- **Spring**: 400ms cubic-bezier(0.34, 1.56, 0.64, 1)

## Core Components
### Buttons
- **Primary**: Accent background, black text, medium radius.
- **Secondary**: Raised surface background, primary text, strong border.
- **Ghost**: Transparent background, secondary text.
- **Destructive**: Red-dim background, red text.

### Input Fields
- **Height**: 40px
- **Background**: Surface
- **Border**: 1px solid border
- **Focus**: Accent border

### Cards
- **Background**: Surface
- **Border**: 1px solid border
- **Radius**: Large

### Tags / Badges
- **Height**: 22px
- **Padding**: 8px
- **Radius**: Small
- **Font**: Geist 500 11px

### Score Ring
- **Outer Ring**: Border
- **Fill Ring**: Area color
- **Center**: Score number

### Progress Bar
- **Height**: 4px
- **Background**: Border
- **Fill**: Area color

### Streak Badge
- **Background**: Orange-dim
- **Color**: Orange

### Timer Display
- **Font**: DM Mono 700
- **Running State**: Accent color
- **Paused State**: Secondary text

## Navigation System
- **Sidebar**: 240px wide, collapsible.
- **Mobile**: Bottom tab bar.

## Layout Grid
- **Desktop**: 1440px max width.
- **Content Area**: 1200px max width.
- **Padding**: 32px horizontal, 24px vertical.

## Iconography
- **Library**: Lucide icons
- **Size**: 16px, 18px, 20px
- **Stroke**: 1.5px

## Empty States
- **Icon**: 40px, muted text color.
- **Heading**: Syne 20px, secondary text.
- **Body**: Geist 14px, muted text.
- **CTA**: Primary button.

## Loading States
- **Skeleton**: Border shimmer.
- **Spinner**: Accent color, 1s linear infinite.

## Dark/Light Toggle
- **Icon-based**: Smooth 300ms transition.
- **Persistence**: LocalStorage.