interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          is_silenced: boolean
          silenced_until: string | null
        }
        Insert: {
          is_silenced?: boolean
          silenced_until?: string | null
        }
        Update: {
          is_silenced?: boolean
          silenced_until?: string | null
        }
      }
    }
  }
} 