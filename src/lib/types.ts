export type AnimalStatus = 'active' | 'alert' | 'blocked' | 'for_sale'

export interface Animal {
  id: string
  tag_id: string
  name: string
  species: string
  breed: string
  weight_kg: number
  status: AnimalStatus
  lat: number
  lng: number
  rada_licence: string
  created_at: string
}

export interface TheftReport {
  id: string
  animal_id: string
  tag_id: string
  description: string
  police_case: string
  created_at: string
}
