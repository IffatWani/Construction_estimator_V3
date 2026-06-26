import type { RoomDimensions, RoomGeometry } from './types'

export function computeGeometry(g: RoomDimensions): RoomGeometry {
  switch (g.shape) {
    case 'Rectangle': {
      const { length: l, width: w, height: h } = g.dims
      const floorArea   = l * w
      const perimeter   = 2 * (l + w)
      const wallArea    = perimeter * h
      const ceilingArea = floorArea
      const volume      = floorArea * h
      return { floorArea, wallArea, ceilingArea, perimeter, volume }
    }
    case 'Square': {
      const { side: s, height: h } = g.dims
      const floorArea   = s * s
      const perimeter   = 4 * s
      const wallArea    = perimeter * h
      const ceilingArea = floorArea
      const volume      = floorArea * h
      return { floorArea, wallArea, ceilingArea, perimeter, volume }
    }
    case 'Circle': {
      const { radius: r, height: h } = g.dims
      const floorArea   = Math.PI * r * r
      const perimeter   = 2 * Math.PI * r
      const wallArea    = perimeter * h
      const ceilingArea = floorArea
      const volume      = floorArea * h
      return { floorArea, wallArea, ceilingArea, perimeter, volume }
    }
    case 'L-Shape': {
      const { l1, w1, l2, w2, height: h } = g.dims
      const floorArea   = l1 * w1 + l2 * w2
      const perimeter   = 2 * (l1 + w1 + l2 + w2) - 2 * Math.min(w1, w2)
      const wallArea    = perimeter * h
      const ceilingArea = floorArea
      const volume      = floorArea * h
      return { floorArea, wallArea, ceilingArea, perimeter, volume }
    }
  }
}

export function defaultGeometry(shape: RoomDimensions['shape']): RoomDimensions {
  switch (shape) {
    case 'Rectangle': return { shape: 'Rectangle', dims: { length: 12, width: 10, height: 10 } }
    case 'Square':    return { shape: 'Square',    dims: { side: 10, height: 10 } }
    case 'Circle':    return { shape: 'Circle',    dims: { radius: 5, height: 10 } }
    case 'L-Shape':   return { shape: 'L-Shape',   dims: { l1: 15, w1: 10, l2: 8, w2: 6, height: 10 } }
  }
}

export function shapeDiagramSVG(shape: RoomDimensions['shape']): string {
  switch (shape) {
    case 'Rectangle': return `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="72" height="52" rx="2" stroke="#C65911" stroke-width="2.5" fill="#fdf3ee"/><text x="40" y="36" text-anchor="middle" fill="#C65911" font-size="9" font-family="Helvetica Neue">L × W</text></svg>`
    case 'Square':    return `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="52" rx="2" stroke="#C65911" stroke-width="2.5" fill="#fdf3ee"/><text x="30" y="34" text-anchor="middle" fill="#C65911" font-size="9" font-family="Helvetica Neue">S × S</text></svg>`
    case 'Circle':    return `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="26" stroke="#C65911" stroke-width="2.5" fill="#fdf3ee"/><text x="30" y="34" text-anchor="middle" fill="#C65911" font-size="9" font-family="Helvetica Neue">πr²</text></svg>`
    case 'L-Shape':   return `<svg viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4 H48 V30 H80 V66 H4 Z" stroke="#C65911" stroke-width="2.5" fill="#fdf3ee" stroke-linejoin="round"/><text x="26" y="40" text-anchor="middle" fill="#C65911" font-size="8" font-family="Helvetica Neue">L-Shape</text></svg>`
  }
}
