export type TPokemonData = {
    id: number,
    name: string,
    height: number,
    weight: number,
    base_experience: number,

    types: [
        {
            slot: number,
            type: {
                name: string,
                url: string,
            }
        }
    ],

    abilities: [
        {
            ability: [
                {
                    name: string,
                    url: string
                },
                is_hidden: boolean,
                slot: number
            ]
        }
    ],

    stats: [
        {
            base_stat: number,
            effort: number,
            stat: {
                name: string,
                url: string
            }
        }
    ],
    
    sprites: {
        front_default: string,
        back_default: string
        front_shiny: string,
        back_shiny: string
    }
}

