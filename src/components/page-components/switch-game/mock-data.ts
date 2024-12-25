// Helper function to generate random results
const generateRandomResults = (min: number, max: number, count: number): number[] => {
    return Array.from({ length: count }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
};

export const mockGames = [
    // Baccarat Number Games
    {
        id: 'baccarat-1',
        name: 'Baccarat Number 1',
        imageUrl: '/games/baccarat-1.jpg',
        scoreBoard: {
            results: generateRandomResults(75, 98, 102),
            average: 87.7
        },
        rtp: 96.5,
        bettingLimit: { min: 1, max: 1000 },
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)'  // Dark yellow
    },
    {
        id: 'baccarat-2',
        name: 'Baccarat Number 2',
        imageUrl: '/games/baccarat-2.jpg',
        scoreBoard: {
            results: generateRandomResults(75, 98, 102),
            average: 88.2
        },
        rtp: 96.8,
        bettingLimit: { min: 2, max: 2000 },
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)'  // Dark green
    },
    {
        id: 'baccarat-3',
        name: 'Baccarat Number 3',
        imageUrl: '/games/baccarat-3.jpg',
        scoreBoard: {
            results: generateRandomResults(75, 98, 102),
            average: 88.5
        },
        rtp: 97.0,
        bettingLimit: { min: 5, max: 5000 },
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)'  // Dark blue
    },

    // Lucky Next Games
    {
        id: 'lucky-next-1',
        name: 'Lucky Next 1',
        imageUrl: '/games/lucky-next-1.jpg',
        scoreBoard: {
            results: generateRandomResults(80, 99, 102),
            average: 89.4
        },
        rtp: 97.2,
        bettingLimit: { min: 1, max: 1500 },
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)'  // Dark yellow
    },
    {
        id: 'lucky-next-2',
        name: 'Lucky Next 2',
        imageUrl: '/games/lucky-next-2.jpg',
        scoreBoard: {
            results: generateRandomResults(80, 99, 102),
            average: 89.6
        },
        rtp: 97.4,
        bettingLimit: { min: 2, max: 2500 },
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)'  // Dark green
    },
    {
        id: 'lucky-next-3',
        name: 'Lucky Next 3',
        imageUrl: '/games/lucky-next-3.jpg',
        scoreBoard: {
            results: generateRandomResults(80, 99, 102),
            average: 89.8
        },
        rtp: 97.6,
        bettingLimit: { min: 5, max: 5000 },
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)'  // Dark blue
    },

    // Lucky Three Games
    {
        id: 'lucky-three-1',
        name: 'Lucky Three 1',
        imageUrl: '/games/lucky-three-1.jpg',
        scoreBoard: {
            results: generateRandomResults(70, 95, 102),
            average: 86.5
        },
        rtp: 95.8,
        bettingLimit: { min: 1, max: 1000 },
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)'  // Dark yellow
    },
    {
        id: 'lucky-three-2',
        name: 'Lucky Three 2',
        imageUrl: '/games/lucky-three-2.jpg',
        scoreBoard: {
            results: generateRandomResults(70, 95, 102),
            average: 86.8
        },
        rtp: 96.0,
        bettingLimit: { min: 2, max: 2000 },
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)'  // Dark green
    },
    {
        id: 'lucky-three-3',
        name: 'Lucky Three 3',
        imageUrl: '/games/lucky-three-3.jpg',
        scoreBoard: {
            results: generateRandomResults(70, 95, 102),
            average: 87.0
        },
        rtp: 96.2,
        bettingLimit: { min: 5, max: 5000 },
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)'  // Dark blue
    },

    // Sic Ball Games
    {
        id: 'sic-ball-1',
        name: 'Sic Ball 1',
        imageUrl: '/games/sic-ball-1.jpg',
        scoreBoard: {
            results: generateRandomResults(72, 96, 102),
            average: 88.2
        },
        rtp: 96.8,
        bettingLimit: { min: 1, max: 1200 },
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)'  // Dark yellow
    },
    {
        id: 'sic-ball-2',
        name: 'Sic Ball 2',
        imageUrl: '/games/sic-ball-2.jpg',
        scoreBoard: {
            results: generateRandomResults(72, 96, 102),
            average: 88.4
        },
        rtp: 97.0,
        bettingLimit: { min: 2, max: 2400 },
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)'  // Dark green
    },
    {
        id: 'sic-ball-3',
        name: 'Sic Ball 3',
        imageUrl: '/games/sic-ball-3.jpg',
        scoreBoard: {
            results: generateRandomResults(72, 96, 102),
            average: 88.6
        },
        rtp: 97.2,
        bettingLimit: { min: 5, max: 5000 },
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)'  // Dark blue
    },

    // Se Ball Games
    {
        id: 'se-ball-1',
        name: 'Se Ball 1',
        imageUrl: '/games/se-ball-1.jpg',
        scoreBoard: {
            results: generateRandomResults(78, 97, 102),
            average: 88.9
        },
        rtp: 97.0,
        bettingLimit: { min: 1, max: 1000 },
        background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)'  // Dark yellow
    },
    {
        id: 'se-ball-2',
        name: 'Se Ball 2',
        imageUrl: '/games/se-ball-2.jpg',
        scoreBoard: {
            results: generateRandomResults(78, 97, 102),
            average: 89.1
        },
        rtp: 97.2,
        bettingLimit: { min: 2, max: 2000 },
        background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)'  // Dark green
    },
    {
        id: 'se-ball-3',
        name: 'Se Ball 3',
        imageUrl: '/games/se-ball-3.jpg',
        scoreBoard: {
            results: generateRandomResults(78, 97, 102),
            average: 89.3
        },
        rtp: 97.4,
        bettingLimit: { min: 5, max: 5000 },
        background: 'linear-gradient(135deg, #00008B 0%, #000066 100%)'  // Dark blue
    }
];

// Calculate actual average for each game
mockGames.forEach(game => {
    game.scoreBoard.average = Number(
        (game.scoreBoard.results.reduce((a, b) => a + b, 0) / game.scoreBoard.results.length)
            .toFixed(1)
    );
});

// Helper function to get games by category
export const getGamesByCategory = (category: string) => {
    return mockGames.filter(game => game.name.startsWith(category));
};

// Simulated recent and favorite games
export const recentGames = mockGames.slice(0, 2);
export const favoriteGames = [mockGames[1]]; 