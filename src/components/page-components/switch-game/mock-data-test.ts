interface Game {
    id: string;
    name: string;
    variant: string;
    betRange: {
        min: number;
        max: number;
    };
    rtp: number;
    roundCount: number;
    background: string;
    results: ('red' | 'blue')[];
}

// Helper function to generate random results
const generateRandomResults = (count: number = 96): ('red' | 'blue')[] => {
    return Array.from({ length: count }, () =>
        Math.random() > 0.5 ? 'red' : 'blue'
    );
};

export const mockGames: Game[] = [
    // Baccarat Number Games
    {
        id: 'baccarat-1',
        name: 'BACCARAT NUMBER',
        variant: 'Venus',
        betRange: { min: 20, max: 105 },
        rtp: 96.5,
        roundCount: 16,
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
        results: generateRandomResults()
    },
    {
        id: 'baccarat-2',
        name: 'BACCARAT NUMBER',
        variant: 'Jupiter',
        betRange: { min: 20, max: 105 },
        rtp: 96.8,
        roundCount: 16,
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
        results: generateRandomResults()
    },
    {
        id: 'baccarat-3',
        name: 'BACCARAT NUMBER',
        variant: 'Mercury',
        betRange: { min: 20, max: 105 },
        rtp: 97.0,
        roundCount: 16,
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)',
        results: generateRandomResults()
    },

    // Lucky Next Games
    {
        id: 'lucky-next-1',
        name: 'LUCKY NEXT',
        variant: 'Venus',
        betRange: { min: 20, max: 105 },
        rtp: 97.2,
        roundCount: 16,
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
        results: generateRandomResults()
    },
    {
        id: 'lucky-next-2',
        name: 'LUCKY NEXT',
        variant: 'Jupiter',
        betRange: { min: 20, max: 105 },
        rtp: 97.4,
        roundCount: 16,
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
        results: generateRandomResults()
    },
    {
        id: 'lucky-next-3',
        name: 'LUCKY NEXT',
        variant: 'Mercury',
        betRange: { min: 20, max: 105 },
        rtp: 97.6,
        roundCount: 16,
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)',
        results: generateRandomResults()
    },

    // Lucky Three Games
    {
        id: 'lucky-three-1',
        name: 'LUCKY THREE',
        variant: 'Venus',
        betRange: { min: 20, max: 105 },
        rtp: 95.8,
        roundCount: 16,
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
        results: generateRandomResults()
    },
    {
        id: 'lucky-three-2',
        name: 'LUCKY THREE',
        variant: 'Jupiter',
        betRange: { min: 20, max: 105 },
        rtp: 96.0,
        roundCount: 16,
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
        results: generateRandomResults()
    },
    {
        id: 'lucky-three-3',
        name: 'LUCKY THREE',
        variant: 'Mercury',
        betRange: { min: 20, max: 105 },
        rtp: 96.2,
        roundCount: 16,
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)',
        results: generateRandomResults()
    },

    // Sic Ball Games
    {
        id: 'sic-ball-1',
        name: 'SIC BALL',
        variant: 'Venus',
        betRange: { min: 20, max: 105 },
        rtp: 96.8,
        roundCount: 16,
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
        results: generateRandomResults()
    },
    {
        id: 'sic-ball-2',
        name: 'SIC BALL',
        variant: 'Jupiter',
        betRange: { min: 20, max: 105 },
        rtp: 97.0,
        roundCount: 16,
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
        results: generateRandomResults()
    },
    {
        id: 'sic-ball-3',
        name: 'SIC BALL',
        variant: 'Mercury',
        betRange: { min: 20, max: 105 },
        rtp: 97.2,
        roundCount: 16,
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)',
        results: generateRandomResults()
    },

    // Se Ball Games
    {
        id: 'se-ball-1',
        name: 'SE BALL',
        variant: 'Venus',
        betRange: { min: 20, max: 105 },
        rtp: 97.0,
        roundCount: 16,
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
        results: generateRandomResults()
    },
    {
        id: 'se-ball-2',
        name: 'SE BALL',
        variant: 'Jupiter',
        betRange: { min: 20, max: 105 },
        rtp: 97.2,
        roundCount: 16,
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
        results: generateRandomResults()
    },
    {
        id: 'se-ball-3',
        name: 'SE BALL',
        variant: 'Mercury',
        betRange: { min: 20, max: 105 },
        rtp: 97.4,
        roundCount: 16,
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)',
        results: generateRandomResults()
    }
];

// Helper function to get games by category
export const getGamesByCategory = (category: string) => {
    return mockGames.filter(game => game.name === category);
};

// Export recent and favorite games
export const recentGames = mockGames.slice(0, 2);
export const favoriteGames = [mockGames[1]]; 