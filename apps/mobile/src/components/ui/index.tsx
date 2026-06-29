import React from 'react'
import {
  TouchableOpacity, Text, View, TextInput, ActivityIndicator,
  StyleSheet, useColorScheme, type TextInputProps, type ViewStyle,
} from 'react-native'
import { lightTheme, darkTheme, colors, spacing, radius, typography, shadows } from '@lib/theme'

function useTheme() {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkTheme : lightTheme
}

// ── Button ─────────────────────────────────────────────────────────────────────
interface ButtonProps {
  children:   React.ReactNode
  onPress?:   () => void
  variant?:   'primary' | 'outline' | 'ghost' | 'destructive'
  size?:      'sm' | 'md' | 'lg'
  disabled?:  boolean
  loading?:   boolean
  style?:     ViewStyle
  fullWidth?: boolean
}

export function Button({
  children, onPress, variant = 'primary', size = 'md',
  disabled, loading, style, fullWidth,
}: ButtonProps) {
  const theme = useTheme()
  const isDisabled = disabled || loading

  const bgColor = {
    primary:     theme.primary,
    outline:     'transparent',
    ghost:       'transparent',
    destructive: colors.error,
  }[variant]

  const textColor = {
    primary:     theme.primaryFg,
    outline:     theme.primary,
    ghost:       theme.textSecondary,
    destructive: '#fff',
  }[variant]

  const borderColor = variant === 'outline' ? theme.primary : 'transparent'

  const paddingV = { sm: spacing[2], md: spacing[3], lg: spacing[4] }[size]
  const paddingH = { sm: spacing[4], md: spacing[6], lg: spacing[8] }[size]
  const fontSize = { sm: typography.sm.fontSize, md: typography.base.fontSize, lg: typography.lg.fontSize }[size]

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth:     variant === 'outline' ? 1.5 : 0,
          borderRadius:    radius.lg,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          alignItems:      'center',
          justifyContent:  'center',
          flexDirection:   'row',
          gap:             spacing[2],
          opacity:         isDisabled ? 0.55 : 1,
          width:           fullWidth ? '100%' : undefined,
        },
        variant === 'primary' && !isDisabled && (shadows.sm as ViewStyle),
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={textColor} />}
      {typeof children === 'string' ? (
        <Text style={{ color: textColor, fontSize, fontWeight: '600' }}>{children}</Text>
      ) : children}
    </TouchableOpacity>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────────
interface CardProps {
  children:  React.ReactNode
  style?:    ViewStyle
  onPress?:  () => void
  padding?:  number
}

export function Card({ children, style, onPress, padding = spacing[4] }: CardProps) {
  const theme = useTheme()
  const inner = (
    <View style={[
      {
        backgroundColor: theme.card,
        borderRadius:    radius.xl,
        padding,
        borderWidth:     1,
        borderColor:     theme.border,
      },
      shadows.sm as ViewStyle,
      style,
    ]}>
      {children}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    )
  }
  return inner
}

// ── Input ──────────────────────────────────────────────────────────────────────
interface InputProps extends TextInputProps {
  label?:       string
  error?:       string
  leftIcon?:    React.ReactNode
  containerStyle?: ViewStyle
}

export function Input({ label, error, leftIcon, containerStyle, style, ...props }: InputProps) {
  const theme = useTheme()

  return (
    <View style={[{ gap: spacing[1] }, containerStyle]}>
      {label && (
        <Text style={{ fontSize: typography.sm.fontSize, fontWeight: '500', color: theme.text }}>
          {label}
        </Text>
      )}
      <View style={{
        flexDirection:   'row',
        alignItems:      'center',
        backgroundColor: theme.inputBg,
        borderRadius:    radius.md,
        borderWidth:     1,
        borderColor:     error ? colors.error : theme.border,
        paddingHorizontal: spacing[3],
        height:          48,
        gap:             spacing[2],
      }}>
        {leftIcon}
        <TextInput
          style={[{
            flex:       1,
            color:      theme.text,
            fontSize:   typography.base.fontSize,
            height:     '100%',
          }, style]}
          placeholderTextColor={theme.placeholder}
          {...props}
        />
      </View>
      {error && (
        <Text style={{ fontSize: typography.xs.fontSize, color: colors.error }}>{error}</Text>
      )}
    </View>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?:    'sm' | 'md'
}

const badgeColors = {
  default: { bg: colors.gray100,     text: colors.gray700 },
  success: { bg: colors.successLight,text: colors.success },
  warning: { bg: colors.warningLight,text: '#b45309' },
  error:   { bg: colors.errorLight,  text: colors.error },
  info:    { bg: colors.infoLight,   text: '#1d4ed8' },
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const cfg = badgeColors[variant]
  return (
    <View style={{
      backgroundColor:  cfg.bg,
      borderRadius:     radius.full,
      paddingVertical:  size === 'sm' ? 2 : 4,
      paddingHorizontal:size === 'sm' ? 8 : 10,
      alignSelf:        'flex-start',
    }}>
      <Text style={{ fontSize: size === 'sm' ? 10 : 12, fontWeight: '600', color: cfg.text }}>
        {children}
      </Text>
    </View>
  )
}

// ── ProgressBar ────────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value:     number   // 0–100
  color?:    string
  height?:   number
  style?:    ViewStyle
}

export function ProgressBar({ value, color, height = 6, style }: ProgressBarProps) {
  const theme = useTheme()
  return (
    <View style={[{ height, backgroundColor: theme.border, borderRadius: radius.full, overflow: 'hidden' }, style]}>
      <View style={{
        width:         `${Math.min(100, Math.max(0, value))}%`,
        height:        '100%',
        backgroundColor: color ?? theme.primary,
        borderRadius:  radius.full,
      }} />
    </View>
  )
}

// ── Divider ────────────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  const theme = useTheme()
  return <View style={[{ height: 1, backgroundColor: theme.border }, style]} />
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width, height, borderRadius = radius.md, style }: {
  width?: number | string; height: number; borderRadius?: number; style?: ViewStyle
}) {
  const theme = useTheme()
  return (
    <View style={[{
      width,
      height,
      borderRadius,
      backgroundColor: theme.border,
    }, style]} />
  )
}
