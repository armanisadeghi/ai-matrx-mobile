/**
 * AI Matrx Mobile - Agent Catalog Host
 *
 * Mounts the ONE agent picker's provider once, at the app root, and binds this
 * app's brand colours to the package's token contract (C26 — the package ships
 * every default value; the host supplies its own).
 *
 * The only behaviour bound here is `navigate`: the package refuses to pretend
 * it navigated, so an unbound port would report through the errorSink on every
 * agent-door press. Expo Router is that port.
 */

import { AgentCatalogProvider } from '@ai-matrx/agents/catalog/native';
import { router } from 'expo-router';
import React, { useMemo } from 'react';

import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAgentCatalog } from '@/lib/agent-catalog';

export function AgentCatalogHost({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const catalog = getAgentCatalog();

  const theme = useMemo(
    () => ({
      colors: {
        background: colors.background,
        surface: colors.surface,
        surfacePressed: colors.surfaceElevated,
        text: colors.text,
        textMuted: colors.textSecondary,
        textFaint: colors.textTertiary,
        border: colors.border,
        primary: colors.primary,
        primaryForeground: colors.primaryForeground,
        primarySoft: colors.primary + '20',
        favorite: colors.warning,
        // The drift banner must follow the app's theme too — leaving these at
        // the package's dark defaults printed a dark banner in light mode.
        driftBackground: colors.warning + '20',
        driftForeground: colors.warning,
        driftBorder: colors.warning + '55',
      },
    }),
    [colors],
  );

  return (
    <AgentCatalogProvider
      catalog={catalog}
      theme={theme}
      navigate={(href) => router.push(href as never)}
    >
      {children}
    </AgentCatalogProvider>
  );
}
