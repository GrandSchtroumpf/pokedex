import { component$, useStyles$ } from "@builder.io/qwik";
import styles from './meter.scss?inline';

interface MeterProps {
  value: number;
  min?: number;
  max?: number;
}
export const Meter = component$((props: MeterProps) => {
  useStyles$(styles);
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const value = props.value;
  const percent = Math.round(100 * value / (max - min))
  return <div style={`--percent: ${percent}%`}
    class="meter"
    role="meter"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
  ></div>
})