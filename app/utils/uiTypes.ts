/**
 * UI コンポーネント間で共有する小さな型。
 * `<script setup>` は ES モジュール export を持てないため、型はここへ置く。
 */

export interface SwipeActionItem {
  id: string
  label: string
  icon: string
  tone?: 'primary' | 'success' | 'danger' | 'neutral'
}

export interface FabAction {
  id: string
  label: string
  icon: string
  tone?: 'primary' | 'success' | 'danger' | 'neutral'
}

export interface FilterChipOption {
  id: string
  label: string
  icon?: string
  count?: number
}

export interface SelectionAction {
  id: string
  label: string
  icon: string
  tone?: 'primary' | 'danger' | 'neutral'
}

export interface TimelineItem {
  id: string
  title: string
  description?: string
  time: string
  icon?: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  tone?: 'primary' | 'danger' | 'success' | 'neutral'
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  danger?: boolean
  separatorBefore?: boolean
}
