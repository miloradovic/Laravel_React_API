import { useEffect, useRef, useState } from 'react';
import { healthCheck } from '../services/healthService';

export type CircuitState = 'closed' | 'half-open' | 'open';

/**
 * Number of consecutive health-check failures before the circuit opens
 * and quotation requests are blocked.
 */
const FAILURE_THRESHOLD = 2;

/** How often to poll /health when everything is fine (ms). */
const POLL_INTERVAL_CLOSED_MS = 30_000;

/** Initial retry delay after the first failure (ms). */
const BACKOFF_INITIAL_MS = 5_000;

/** Maximum retry delay cap (ms). */
const BACKOFF_MAX_MS = 60_000;

export interface CircuitBreakerState {
  /** Fine-grained circuit state. */
  circuitState: CircuitState;
  /** Shorthand: true only when the circuit is fully open and requests are blocked. */
  isOpen: boolean;
  /** Seconds until the next health-check retry; null when in normal closed polling. */
  nextRetryIn: number | null;
}

/**
 * Polls /health with exponential back-off on failures.
 *
 * States:
 *  closed    – backend healthy; requests allowed; polls every 30 s
 *  half-open – 1 consecutive failure; shows a warning; polls with back-off
 *  open      – ≥2 consecutive failures; requests blocked; polls with back-off
 */
export const useCircuitBreaker = (): CircuitBreakerState => {
  const [circuitState, setCircuitState] = useState<CircuitState>('closed');
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);

  // Refs avoid stale-closure issues inside setTimeout / setInterval callbacks.
  const circuitStateRef = useRef<CircuitState>('closed');
  const failureCountRef = useRef(0);
  const backoffRef = useRef(BACKOFF_INITIAL_MS);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);

  // doCheckRef breaks the mutual-recursion between scheduleCheck() - performCheck()
  const doCheckRef = useRef<() => Promise<void>>();

  useEffect(() => {
    mountedRef.current = true;

    const clearCountdown = () => {
      if (countdownTimerRef.current !== null) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };

    const startCountdown = (ms: number) => {
      clearCountdown();
      let remaining = Math.ceil(ms / 1_000);
      setNextRetryIn(remaining);
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (mountedRef.current) setNextRetryIn(Math.max(0, remaining));
        if (remaining <= 0) clearCountdown();
      }, 1_000);
    };

    const scheduleCheck = (delayMs: number) => {
      if (checkTimerRef.current !== null) clearTimeout(checkTimerRef.current);

      if (circuitStateRef.current !== 'closed') {
        startCountdown(delayMs);
      } else {
        clearCountdown();
        setNextRetryIn(null);
      }

      checkTimerRef.current = setTimeout(() => doCheckRef.current?.(), delayMs);
    };

    doCheckRef.current = async () => {
      if (!mountedRef.current) return;

      try {
        const response = (await healthCheck()) as { status: string };
        if (!mountedRef.current) return;

        if (response?.status === 'healthy') {
          // Recovery – reset all counters and close the circuit.
          failureCountRef.current = 0;
          backoffRef.current = BACKOFF_INITIAL_MS;
          circuitStateRef.current = 'closed';
          setCircuitState('closed');
          clearCountdown();
          setNextRetryIn(null);
          scheduleCheck(POLL_INTERVAL_CLOSED_MS);
        } else {
          throw new Error(`Unexpected health status: ${String(response?.status)}`);
        }
      } catch {
        if (!mountedRef.current) return;

        failureCountRef.current += 1;
        const newState: CircuitState =
          failureCountRef.current >= FAILURE_THRESHOLD ? 'open' : 'half-open';

        circuitStateRef.current = newState;
        setCircuitState(newState);

        // Exponential back-off: 5s, 10s, 20s, 40s, 60s (capped).
        const delay = Math.min(backoffRef.current, BACKOFF_MAX_MS);
        backoffRef.current = Math.min(backoffRef.current * 2, BACKOFF_MAX_MS);
        scheduleCheck(delay);
      }
    };

    // Run the first check immediately on mount.
    void doCheckRef.current();

    return () => {
      mountedRef.current = false;
      if (checkTimerRef.current !== null) clearTimeout(checkTimerRef.current);
      clearCountdown();
    };
  }, []);

  return {
    circuitState,
    isOpen: circuitState === 'open',
    nextRetryIn,
  };
};
