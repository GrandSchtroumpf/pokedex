import { component$, useStyles$ } from "@qwik.dev/core";
import styles from './meter.scss?inline';

interface MeterProps {
  value: number;
  min?: number;
  max?: number;
  viewTransitionName?: string;
}
export const Meter = component$((props: MeterProps) => {
  useStyles$(styles);
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const value = props.value;
  const percent = Math.round(100 * value / (max - min))
  return <div
    style={{
      '--percent': `${percent}%`,
      '--view-transition-meter': props.viewTransitionName + '-meter',
      '--view-transition-percent': props.viewTransitionName + '-percent'
    }}
    class="meter"
    role="meter"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
  ></div>
})