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
    },

    moves: {
        move: TNamedResource,
        version_group_details: {
            level_learned_at: number,
            move_learn_method: TNamedResource,
            version_group: TNamedResource
        }[]
    }[]
}

export type TFavoritePokemon = Pick<TPokemonData, 'id' | 'name' | 'height' | 'weight' | 'types' | 'stats'>

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

export type TEffectEntry = {
    effect: string,
    short_effect: string,
    language: TNamedResource
}

export type TFlavorTextEntry = {
    flavor_text: string,
    language: TNamedResource,
    version_group: TNamedResource
}

export type TAbility = {
    id: number,
    name: string,
    effect_entries: TEffectEntry[],
    flavor_text_entries: TFlavorTextEntry[]
}

export type TMove = {
    id: number,
    name: string,
    accuracy: number | null,
    power: number | null,
    pp: number | null,
    effect_chance: number | null,
    type: TNamedResource,
    damage_class: TNamedResource,
    effect_entries: TEffectEntry[],
    flavor_text_entries: TFlavorTextEntry[]
}
