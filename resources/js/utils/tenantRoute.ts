import {route, Config } from 'ziggy-js'
import { usePage } from '@inertiajs/react'

declare global {
  interface Window {
    Ziggy: Config
  }
}

export function useTenantRoute() {
  const { props } = usePage()
  const tenantId = (props as any).currentBusiness?.id || 'default'
    
  return (
    name: keyof typeof window.Ziggy['routes'],
    params: Record<string, any> = {},
    absolute: boolean = true,
    config: Config = window.Ziggy
  ) => {
    return route(name as string, { tenant: tenantId, ...params }, absolute, config)
  }
}
