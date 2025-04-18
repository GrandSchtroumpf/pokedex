import type { PropsOf } from "@builder.io/qwik";
import { component$, useStyles$ } from "@builder.io/qwik"

export const Logo = component$<PropsOf<'svg'>>((props) => {
  useStyles$(`
    #app-logo {
      view-transition-name: main-logo;
    }
    #app-logo .light, #app-logo .center {
      transition: filter 300ms, fill 100ms;
    }
    #app-logo .light {
      filter: drop-shadow(0 0 0px #101b3b);
    }
    #app-logo .center {
      filter: drop-shadow(0 0 0px #eee3e1);
    }
    #app-logo .loading:hover .light,
    #app-logo .pokeball:hover .center {
      transition: filter 100ms, fill 300ms;
      filter: drop-shadow(0 0 5px #eee3e1);
      fill: white;
    }

  `)
  return (
    <svg id="app-logo" viewBox="0 0 100 100" {...props}>
      <style>
      </style>
      <defs>
        <linearGradient id="gradient-blue" gradientTransform="rotate(80)">
          <stop offset="80%" stop-color="#101b3b" />      
          <stop offset="100%" stop-color="#020521" />
        </linearGradient>
        <linearGradient id="gradient-red" gradientTransform="rotate(45)">
          <stop offset="0%" stop-color="#ff4b55" />
          <stop offset="100%" stop-color="#462f6b" />
        </linearGradient>
        <linearGradient id="gradient-white" gradientTransform="rotate(45)">
          <stop offset="0%" stop-color="#eee3e1" />
          <stop offset="100%" stop-color="#67a0c2" />
        </linearGradient>
        <filter id="shadow-neon">
          <feDropShadow dx="0" dy="0" stdDeviation="0.4" flood-color="#eee3e1" />
        </filter>
      </defs>

      <rect x="0" y="0" width="100" height="100" rx="14" fill="url(#gradient-blue)" />

      <g class="loading" transform="translate(10, 8)">
        <rect class="light" x="0" y="0" width="16" height="3" rx="1.5" fill="#8ca1af" />
      </g>

      <g class="loading" transform="translate(80, 10)">
        <circle class="light" cx="0" cy="0" r="2" fill="#8ca1af" />
        <circle cx="0" cy="6" r="2" fill="#8ca1af" />
        <circle cx="6" cy="0" r="2" fill="#8ca1af" />
        <circle class="light" cx="6" cy="6" r="2" fill="#8ca1af" />
        <circle class="light" cx="6" cy="12" r="2" fill="#8ca1af" />
      </g>

      <g class="pokeball" transform="translate(50, 60), scale(1.3)">
        <path class="top" d="M 25,0 A 1 1 0 0 0 -25,0" fill="url(#gradient-red)" />
        <path class="down" d="M -25,0 A 1 1 0 0 0 25,0" fill="url(#gradient-white)" />
        <rect x="-30" y="-3" width="60" height="6" fill="#101b3b"/>
        <circle cx="0" cy="0" r="10" fill="url(#gradient-white)" stroke="#101b3b" stroke-width="3" />
        <circle class="center" cx="0" cy="0" r="5" fill="url(#gradient-white)" stroke="#101b3b"/>
      </g>
    </svg>
  )
})