import { Generated } from 'kysely'

// Define types for the database schema
export interface Database {
  assembly: AssemblyTable
  political_party: PoliticalPartyTable
  elected_official: ElectedOfficialTable
  decision: DecisionTable
  individual_vote: IndividualVoteTable
}

// Define the structure of each table
export interface AssemblyTable {
  id: Generated<string>
  name: string
  created_at: Date
  updated_at: Date
}

export interface PoliticalPartyTable {
  id: Generated<string>
  name: string
  acronym: string
  color: string
  created_at: Date
  updated_at: Date
}

export interface ElectedOfficialTable {
  id: Generated<string>
  first_name: string
  last_name: string
  party_id: string
  constituency: string
  mandate_start: Date
  mandate_end: Date | null
  assembly_id: string
  created_at: Date
  updated_at: Date
}

export interface DecisionTable {
  id: Generated<string>
  title: string
  summary: string
  full_text: string | null
  date: Date
  source: string
  assembly_id: string
  in_favor: number
  against: number
  abstention: number
  absent: number
  total_voters: number
  is_passed: boolean
  created_at: Date
  updated_at: Date
}

export interface IndividualVoteTable {
  id: Generated<string>
  decision_id: string
  elected_official_id: string
  vote_value: 'IN_FAVOR' | 'AGAINST' | 'ABSTENTION' | 'ABSENT'
  created_at: Date
  updated_at: Date
}
