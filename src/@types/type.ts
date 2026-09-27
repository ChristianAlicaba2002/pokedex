export type TNamedResource = {
    name: string,
    url: string
}

export type TPokemonData = {
    results: TNamedResource[],
    id: number,
    name: string,
    height: number,
    weight: number,
    base_experience: number,

    types: {
        slot: number,
        type: TNamedResource
    }[],

    abilities: {
        ability: TNamedResource,
        is_hidden: boolean,
        slot: number
    }[],

    stats: {
        base_stat: number,
        effort: number,
        stat: TNamedResource
    }[],
    
    sprites: {
        front_default: string,
        back_default: string
        front_shiny: string,
        back_shiny: string
    }
}

export type TPokemon = {
    id: number
    name: string
    sprites: {
        front_default: string
    }
    types: Array<{
        type: {
            name: string
        }
    }>
}

export type TPokedex = {
    id: number,
    name: string,
    pokemon_entries: {
        entry_number: number,
        pokemon_species: TNamedResource
    }[]
}

export type TPokemonSpecies = {
    id: number,
    name: string,
    is_legendary: boolean,
    is_mythical: boolean,
    capture_rate: number,
    habitat: TNamedResource | null,
    generation: TNamedResource,
    evolution_chain: { url: string },
    genera: {
        genus: string,
        language: TNamedResource
    }[],
    flavor_text_entries: {
        flavor_text: string,
        language: TNamedResource,
        version: TNamedResource
    }[]
}

export type TEvolutionNode = {
    species: TNamedResource,
    evolves_to: TEvolutionNode[]
}

export type TEvolutionChain = {
    id: number,
    chain: TEvolutionNode
}
