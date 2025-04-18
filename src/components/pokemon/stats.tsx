import { component$, useStyles$ } from "@builder.io/qwik";
import type { Pokemon } from "~/model";
import { Meter } from "../meter/meter";

interface Props {
  pokemon: Pokemon;
}

export const PokemonStats = component$<Props>(({ pokemon }) => {
  useStyles$(`
  .pokemon-stats {
    flex-direction: column;
    .stats {
      list-style: none;
      margin-block: unset;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      & > li {
        display: grid;
        grid-template-columns: 20% auto 20%;
        align-items: center;
        gap: 8px;
        text-align: center;
      }

      & .meter {
        --meter-value-color: var(--secondary-text);
        --meter-inset-color: oklch(0.2 0.15 var(--hue));
      }
    }
  }
  `);
  return (
    <article class="pokemon-stats">
      <h2>Stats</h2>
      <ul class="stats">
        {Object.entries(pokemon.stats).map(([key, stat]) => (
        <li key={key}>
          <span>{key}</span>
          <Meter max={255} value={stat.value} viewTransitionName={`${key}-stats`} />
          <span>{stat.value}</span>
        </li>
        ))}
      </ul>
    </article>
  )
})